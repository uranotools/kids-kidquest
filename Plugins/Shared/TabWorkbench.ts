import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { PluginCore } from '@core/PluginCore';
import { Router } from '@core/Router';

export type UiSpec = { root: { type: string; props?: Record<string, any>; children?: any[] } };

type ListedTab = { tabId: string; title?: string; isVisible?: boolean };

function normalizeTitle(t: string) {
    return String(t || '')
        .replace(/^[\p{Emoji_Presentation}\p{Emoji}\uFE0F\s]+/u, '')
        .trim();
}

function listedTabs(res: any): ListedTab[] {
    const raw = res?.data?.tabs || res?.tabs || [];
    return Array.isArray(raw) ? raw : [];
}

export class TabWorkbench {
    private registry = new Map<string, string>();
    private store = new Map<string, Record<string, any>>();
    private queues = new Map<string, Promise<any>>();

    constructor(private stateName: string) {
        this.load();
    }

    key(label: string, sessionId: string) {
        return `${label}:${sessionId}`;
    }

    enqueue<T>(sessionId: string, fn: () => Promise<T>): Promise<T> {
        const sid = sessionId || 'default';
        const queue = this.queues.get(sid) || Promise.resolve();
        const next = queue.then(fn);
        this.queues.set(sid, next.catch(() => undefined));
        return next;
    }

    async launchOrFocus(opts: {
        sessionId: string;
        label: string;
        uiSpec: UiSpec;
        badgeIcon?: string;
        badgeColor?: 'default' | 'info' | 'success' | 'warning' | 'error';
        systemPrompt?: string;
    }) {
        const sid = opts.sessionId || '';
        const key = this.key(opts.label, sid);
        let tabId = await this.getValidTabId(key);
        if (!tabId) tabId = await this.findLiveByLabel(opts.label);

        if (!tabId) {
            await this.ensureWindowSlot(opts.label);
            tabId = await this.findLiveByLabel(opts.label);
        }

        if (!tabId) {
            const launched = await PluginCore.launchUI({
                sessionId: sid,
                label: opts.label,
                uiSpec: opts.uiSpec,
                systemPrompt: opts.systemPrompt,
                badgeIcon: opts.badgeIcon,
                badgeColor: opts.badgeColor || 'info',
            });
            tabId = this.realTabId(launched?.tabId) || (await this.findLiveByLabel(opts.label));
        }

        if (!tabId) {
            await this.ensureWindowSlot(opts.label);
            const retry = await PluginCore.launchUI({
                sessionId: sid,
                label: opts.label,
                uiSpec: opts.uiSpec,
                systemPrompt: opts.systemPrompt,
                badgeIcon: opts.badgeIcon,
                badgeColor: opts.badgeColor || 'info',
            });
            tabId = this.realTabId(retry?.tabId) || (await this.findLiveByLabel(opts.label));
        }

        if (!tabId) {
            const n = (await this.listTabs()).length;
            return {
                success: false,
                isNew: false,
                patched: false,
                message: `Hay ${n} pestañas Multiverse (máximo 6). Cierra una ventana y vuelve a pedir el bosque.`,
            };
        }

        this.registry.set(key, tabId);
        this.dropOtherKeysForLabel(opts.label, key, tabId);
        this.store.set(key, { ...(opts.uiSpec.root.props || {}) });
        this.save();
        await this.paint(tabId, opts.uiSpec, opts.label);
        await PluginCore.focusTab(tabId);
        return { success: true, tabId, isNew: false, patched: true };
    }

    async patchProps(opts: {
        sessionId: string;
        label: string;
        props: Record<string, any>;
        purpose?: string;
        uiSpecIfRestore?: UiSpec;
        badgeIcon?: string;
    }) {
        const sid = opts.sessionId || '';
        const key = this.key(opts.label, sid);
        const merged = { ...(this.store.get(key) || {}), ...opts.props };
        this.store.set(key, merged);
        this.save();

        let tabId = await this.getValidTabId(key);
        if (!tabId) tabId = await this.findLiveByLabel(opts.label);
        if (!tabId && opts.uiSpecIfRestore) {
            return this.launchOrFocus({
                sessionId: sid,
                label: opts.label,
                uiSpec: { root: { type: opts.uiSpecIfRestore.root.type, props: merged } },
                badgeIcon: opts.badgeIcon,
            });
        }
        if (!tabId) {
            return { success: false, needsLaunch: true, props: merged };
        }

        this.registry.set(key, tabId);
        this.save();
        const spec = opts.uiSpecIfRestore
            ? { root: { type: opts.uiSpecIfRestore.root.type, props: merged } }
            : { root: { type: 'kidquest.QuestBoard', props: merged } };
        await this.paint(tabId, spec, opts.purpose || opts.label);
        return { success: true, tabId, patched: true, props: merged };
    }

    getProps(label: string, sessionId: string) {
        return this.store.get(this.key(label, sessionId)) || {};
    }

    peekTabId(label: string, sessionId: string) {
        return this.registry.get(this.key(label, sessionId)) || null;
    }

    private async paint(tabId: string, uiSpec: UiSpec, purpose: string) {
        const gen = await Router.executeLocalAction({
            route: '/module/MultiverseTabs/plugins/Tabs/generateDynamicUI',
            method: 'POST',
            data: { tabId, purpose, uiSpec, force: true },
        });
        if (gen?.success) return;
        await PluginCore.updateUI({
            tabId,
            patch: { root: { props: uiSpec.root.props || {} } },
            purpose,
        });
    }

    private async listTabs(): Promise<ListedTab[]> {
        try {
            const res = await Router.executeLocalAction({
                route: '/module/MultiverseTabs/plugins/Tabs/listTabs',
                method: 'POST',
                data: {},
            });
            if (!res?.success) return [];
            return listedTabs(res);
        } catch {
            return [];
        }
    }

    private realTabId(id?: string | null) {
        const s = String(id || '');
        if (!s || s.startsWith('bubble')) return null;
        return s;
    }

    private async closeOne(tabId: string) {
        try {
            await Router.executeLocalAction({
                route: '/module/MultiverseTabs/plugins/Tabs/closeTab',
                method: 'POST',
                data: { tabId },
            });
        } catch {
            /* ignore */
        }
    }

    private async ensureWindowSlot(label: string) {
        const MAX = 6;
        let tabs = await this.listTabs();
        const bubbles = tabs.filter((t) => String(t.tabId).startsWith('bubble'));
        for (const b of bubbles) {
            if (tabs.length < MAX) break;
            await this.closeOne(b.tabId);
            tabs = await this.listTabs();
        }
        const want = normalizeTitle(label);
        const ours = tabs.filter(
            (t) =>
                !String(t.tabId).startsWith('bubble') &&
                (normalizeTitle(t.title || '') === want || String(t.title || '').includes(label))
        );
        const keep = ours[0]?.tabId;
        for (const t of ours) {
            if (t.tabId === keep) continue;
            await this.closeOne(t.tabId);
        }
        tabs = await this.listTabs();
        if (tabs.length >= MAX && !keep) {
            const idle = tabs.filter((t) => !String(t.tabId).startsWith('bubble') && String(t.title || '') === 'Chat Bubble');
            for (const t of idle) {
                if (tabs.length < MAX) break;
                await this.closeOne(t.tabId);
                tabs = await this.listTabs();
            }
        }
        for (const [k, id] of [...this.registry.entries()]) {
            if (!k.startsWith(`${label}:`)) continue;
            if (keep && id === keep) continue;
            this.registry.delete(k);
        }
        this.save();
    }

    private async findLiveByLabel(label: string): Promise<string | null> {
        const want = normalizeTitle(label);
        const tabs = (await this.listTabs()).filter((t) => this.realTabId(t.tabId));
        const hit =
            tabs.find((t) => normalizeTitle(t.title || '') === want) ||
            tabs.find((t) => String(t.title || '').includes(label));
        return hit?.tabId || null;
    }

    private dropOtherKeysForLabel(label: string, keepKey: string, tabId: string) {
        for (const [k, id] of [...this.registry.entries()]) {
            if (k === keepKey) continue;
            if (k.startsWith(`${label}:`) || id === tabId) this.registry.delete(k);
        }
    }

    private async getValidTabId(key: string): Promise<string | null> {
        const tabId = this.realTabId(this.registry.get(key) || null);
        if (!tabId) {
            if (this.registry.has(key)) {
                this.registry.delete(key);
                this.save();
            }
            return null;
        }
        try {
            const status = await Router.executeLocalAction({
                route: '/module/MultiverseTabs/plugins/Tabs/getTabState',
                method: 'GET',
                data: { tabId },
            });
            const liveId = status?.data?.tabId || status?.data?.data?.tabId;
            if (status?.success && liveId) return tabId;
            this.registry.delete(key);
            this.save();
            return null;
        } catch {
            this.registry.delete(key);
            this.save();
            return null;
        }
    }

    private statePath() {
        return path.join(os.homedir(), '.urano', this.stateName);
    }

    private load() {
        try {
            const p = this.statePath();
            if (!fs.existsSync(p)) return;
            const data = JSON.parse(fs.readFileSync(p, 'utf8'));
            if (data.registry) this.registry = new Map(Object.entries(data.registry));
            if (data.store) this.store = new Map(Object.entries(data.store));
        } catch {
            /* ignore */
        }
    }

    private save() {
        try {
            const dir = path.dirname(this.statePath());
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(
                this.statePath(),
                JSON.stringify(
                    {
                        registry: Object.fromEntries(this.registry),
                        store: Object.fromEntries(this.store),
                    },
                    null,
                    2
                )
            );
        } catch {
            /* ignore */
        }
    }
}

export const kidquestBench = new TabWorkbench('kidquest_state.json');
