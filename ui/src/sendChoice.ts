function realTabId(id?: string) {
    const s = String(id || '');
    if (!s || s.startsWith('bubble')) return undefined;
    return s;
}

async function post(route: string, data: Record<string, unknown>) {
    const electron = (window as any).electronAPI;
    if (!electron?.apiRequest) return { ok: false, error: 'Sin electronAPI.apiRequest' };
    try {
        const res = await electron.apiRequest({ route, method: 'POST', data });
        const body = res?.data || res;
        if (res?.success === false && !body?.success) {
            return { ok: false, error: String(res?.message || body?.message || route) };
        }
        if (body?.success === false) return { ok: false, error: String(body.message || 'error') };
        return { ok: true };
    } catch (e: any) {
        return { ok: false, error: e?.message || route };
    }
}

export async function sendChoice(data: {
    tabId?: string;
    questTabId?: string;
    chatSessionId?: string;
    choiceId: string;
    answer?: string;
    label?: string;
}): Promise<{ ok: boolean; error?: string }> {
    const questTabId = realTabId(data.questTabId) || realTabId(data.tabId);
    return post('/module/urano-kidquest/plugins/Quest/send_choice', {
        choiceId: data.choiceId,
        answer: data.answer,
        label: data.label,
        questTabId,
        tabId: questTabId,
        chatSessionId: data.chatSessionId && !String(data.chatSessionId).startsWith('bubble') ? data.chatSessionId : undefined,
    });
}

export async function guideReady(data: { questTabId?: string; tabId?: string; chatSessionId?: string; force?: boolean }) {
    const questTabId = realTabId(data.questTabId) || realTabId(data.tabId);
    return post('/module/urano-kidquest/plugins/Quest/guide_ready', {
        questTabId,
        tabId: questTabId,
        chatSessionId: data.chatSessionId && !String(data.chatSessionId).startsWith('bubble') ? data.chatSessionId : undefined,
        force: data.force,
    });
}
