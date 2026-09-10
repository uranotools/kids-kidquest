import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { PluginCore } from '@core/PluginCore';
import { CoreFactory } from '@core/CoreFactory';
import { Router } from '@core/Router';
import { kidquestBench } from '../Shared/TabWorkbench';
import { resolveDataRoot } from '../Shared/paths';
import { applySkin, listWorlds, resolveMundo } from './worlds';
import { QUIZ_SLOT_IDS, quizzesFor, sanitizeQuiz, type Quiz as BankQuiz } from './quizBank';

type Quiz = BankQuiz;
type Choice = { id: string; label: string; to: string; quiz?: Quiz; reset?: boolean };
type NodeDoc = {
    id: string;
    title: string;
    emoji?: string;
    x?: number;
    y?: number;
    scene: string;
    stamp?: string;
    goal?: boolean;
    choices: Choice[];
};
type QuestDoc = { id: string; title: string; disclaimer?: string; start: string; goal: string; nodes: Record<string, NodeDoc> };
type Learned = { q: string; given: string; ok: boolean; place: string };
type Card = {
    kind: 'cheer' | 'quiz' | 'stamp' | 'recap';
    title: string;
    text: string;
    emoji?: string;
    stars?: number;
    stamps?: string[];
    question?: string;
    options?: string[];
    choiceId?: string;
    questTabId?: string;
    chatSessionId?: string;
    learned?: Learned[];
    tema?: string;
    mundo?: string;
};
type PlayState = {
    questId: string;
    doc: QuestDoc;
    nodeId: string;
    stars: number;
    unlocked: string[];
    visited: string[];
    stamps: string[];
    lastCard: Card;
    questTabId?: string;
    parentChatId?: string;
    tema: string;
    mundo: string;
    fase: 'lobby' | 'play' | 'done';
    awaitingGuide: boolean;
    waitingKind: 'guide' | 'quiz' | 'setup' | '';
    learned: Learned[];
};

type PlayStore = { lastSid: string; plays: Record<string, PlayState> };

function playPath() {
    return path.join(os.homedir(), '.urano', 'kidquest_play.json');
}

function loadStore(): PlayStore {
    try {
        if (!fs.existsSync(playPath())) return { lastSid: '', plays: {} };
        const raw = JSON.parse(fs.readFileSync(playPath(), 'utf8'));
        if (raw && raw.plays) return raw as PlayStore;
        const { __last, ...plays } = raw || {};
        return { lastSid: raw?.__last?.lastSid || '', plays };
    } catch {
        return { lastSid: '', plays: {} };
    }
}

function savePlay(sid: string, state: PlayState) {
    const store = loadStore();
    const key = sid || 'default';
    store.plays[key] = state;
    store.lastSid = key;
    const dir = path.dirname(playPath());
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(playPath(), JSON.stringify(store));
}

function getPlay(sid: string): PlayState | undefined {
    const store = loadStore();
    const raw =
        (sid && store.plays[sid]) ||
        (store.lastSid && store.plays[store.lastSid]) ||
        store.plays['default'] ||
        Object.values(store.plays)[0];
    if (!raw) return undefined;
    const s = raw as PlayState;
    if (!s.fase) s.fase = 'play';
    if (!s.tema) s.tema = '';
    if (!s.mundo) s.mundo = s.questId || '';
    if (!s.learned) s.learned = [];
    if (s.awaitingGuide == null) s.awaitingGuide = false;
    if (!s.waitingKind) s.waitingKind = '';
    return s;
}

function isBubbleId(id: string) {
    return !id || id.startsWith('bubble') || id.startsWith('bubble_');
}

export class QuestPlugin {
    private configStore: any;

    constructor(moduleConfig: any) {
        this.configStore = moduleConfig;
    }

    private root() {
        return resolveDataRoot(this.configStore, __dirname);
    }

    private sid(payload: any) {
        const raw = String(payload?._parentSessionId || payload?._sessionId || payload?.sessionId || payload?.chatSessionId || '');
        if (isBubbleId(raw)) return '';
        return raw;
    }

    async executeAction(action: string, payload: any): Promise<any> {
        switch (action) {
            case 'list_quests':
                return this.listQuests();
            case 'start_quest':
                return this.startQuest(payload);
            case 'pick_choice':
                return this.pickChoice(payload);
            case 'ask_hint':
                return this.askHint(payload);
            case 'show_map':
                return this.showMap(payload);
            case 'score_quest':
                return this.scoreQuest(payload);
            case 'build_card_uispec':
                return this.buildCardUispec(payload);
            case 'send_choice':
                return this.sendChoice(payload);
            case 'fill_quizzes':
                return this.fillQuizzes(payload);
            case 'guide_ready':
                return this.guideReady(payload);
            default:
                throw new Error(`Acción no soportada en Quest: ${action}`);
        }
    }

    async apiSend_choice(payload: any) {
        return this.sendChoice(payload);
    }
    async apiStart_quest(payload: any) {
        return this.startQuest(payload);
    }
    async apiPick_choice(payload: any) {
        return this.pickChoice(payload);
    }
    async apiList_quests(payload: any) {
        return this.listQuests();
    }
    async apiAsk_hint(payload: any) {
        return this.askHint(payload);
    }
    async apiShow_map(payload: any) {
        return this.showMap(payload);
    }
    async apiScore_quest(payload: any) {
        return this.scoreQuest(payload);
    }
    async apiBuild_card_uispec(payload: any) {
        return this.buildCardUispec(payload);
    }
    async apiFill_quizzes(payload: any) {
        return this.fillQuizzes(payload);
    }
    async apiGuide_ready(payload: any) {
        return this.guideReady(payload);
    }

    private listQuests() {
        const dir = path.join(this.root(), 'quests');
        if (!fs.existsSync(dir)) {
            return { dataDir: this.root(), quests: [], note: 'No hay carpeta quests/. Usa fixtures o DATA_DIR.' };
        }
        const quests = fs
            .readdirSync(dir)
            .filter((f) => f.endsWith('.json'))
            .map((f) => {
                const doc = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
                return { id: doc.id, title: doc.title, file: f, start: doc.start, goal: doc.goal };
            });
        return {
            dataDir: this.root(),
            quests,
            ui: 'start_quest({ tema, mundo }). Mundos: bosque, carros, peces, espacio. Luego fill_quizzes.',
            disclaimer: 'Juego de aula. No sustituye a un adulto.',
        };
    }

    private loadQuest(questId: string): QuestDoc {
        const file = path.join(this.root(), 'quests', 'bosque-estrellas.json');
        if (!fs.existsSync(file)) throw new Error('Falta bosque-estrellas.json en fixtures/quests.');
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    }

    private node(state: PlayState): NodeDoc {
        return state.doc.nodes[state.nodeId];
    }

    private labelFor(state: PlayState) {
        return 'QUEST:aventura';
    }

    private mapNodes(state: PlayState) {
        return Object.values(state.doc.nodes).map((n) => ({
            id: n.id,
            title: n.title,
            emoji: n.emoji,
            x: n.x ?? 50,
            y: n.y ?? 50,
            here: n.id === state.nodeId,
            visited: state.visited.includes(n.id),
            goal: !!n.goal,
        }));
    }

    private publicChoices(state: PlayState) {
        if (state.fase === 'lobby') {
            return listWorlds().map((w) => ({ id: `mundo:${w.id}`, label: `${w.emoji} ${w.title}`, locked: false }));
        }
        return this.node(state).choices.map((c) => ({
            id: c.id,
            label: c.label,
            locked: !!(c.quiz && !state.unlocked.includes(c.id)),
        }));
    }

    private edges(state: PlayState) {
        const out: { from: string; to: string; walked: boolean; locked: boolean; here: boolean }[] = [];
        for (const n of Object.values(state.doc.nodes)) {
            for (const c of n.choices || []) {
                if (!c.to || c.reset) continue;
                const walked =
                    state.visited.includes(n.id) && (state.visited.includes(c.to) || state.unlocked.includes(c.id));
                out.push({
                    from: n.id,
                    to: c.to,
                    walked,
                    locked: !!(c.quiz && !state.unlocked.includes(c.id)),
                    here: n.id === state.nodeId,
                });
            }
        }
        return out;
    }

    private workbenchProps(state: PlayState, sid: string) {
        const n = this.node(state);
        return {
            title: state.doc.title,
            questId: state.questId,
            disclaimer: state.doc.disclaimer,
            how:
                state.fase === 'lobby'
                    ? 'Un adulto elige el mundo aquí o en el chat, y dice qué debe aprender el niño (sumas, colores, letras…).'
                    : 'Sigue el camino. Un candado 🔒 es una pregunta. Espera al guía en el chat antes del siguiente paso.',
            scene: state.fase === 'lobby' ? '¡Hola! Elige un mundo. El adulto dice el tema en el chat.' : n.scene,
            nodeTitle: state.fase === 'lobby' ? 'Elige el mundo' : n.title,
            emoji: state.fase === 'lobby' ? '🎲' : n.emoji,
            nodeId: state.nodeId,
            stars: state.stars,
            stamps: state.stamps,
            visited: state.visited,
            nodes: this.mapNodes(state),
            edges: this.edges(state),
            choices: this.publicChoices(state),
            chatSessionId: state.parentChatId || sid,
            questTabId: state.questTabId,
            goal: !!n.goal,
            fase: state.fase,
            tema: state.tema,
            mundo: state.mundo,
            awaitingGuide: state.awaitingGuide && state.fase === 'play',
            waitingKind: state.waitingKind,
            worlds: listWorlds(),
            learned: state.learned,
        };
    }

    private applyBank(state: PlayState, sid: string) {
        const bank = quizzesFor(state.tema || 'mezcla', sid || 'k');
        for (const n of Object.values(state.doc.nodes)) {
            for (const c of n.choices || []) {
                if (QUIZ_SLOT_IDS.includes(c.id) && bank[c.id]) c.quiz = bank[c.id];
            }
        }
    }

    private quizSlots(state: PlayState) {
        const slots: { choiceId: string; place: string }[] = [];
        for (const n of Object.values(state.doc.nodes)) {
            for (const c of n.choices || []) {
                if (QUIZ_SLOT_IDS.includes(c.id)) slots.push({ choiceId: c.id, place: n.title });
            }
        }
        return slots;
    }

    private recapCard(state: PlayState): Card {
        const ok = state.learned.filter((x) => x.ok).length;
        const n = state.learned.length;
        const lines = state.learned.slice(0, 12).map((x) => `${x.ok ? '✅' : '❌'} ${x.q} → ${x.given}`);
        return {
            kind: 'recap',
            title: 'Hoy aprendió',
            text:
                (state.tema ? `Tema: ${state.tema}. ` : '') +
                (state.mundo ? `Mundo: ${state.doc.title}. ` : '') +
                `Acertó ${ok} de ${n} preguntas.` +
                (n ? ` ${lines.join(' ')}` : ' Exploró el mapa.'),
            emoji: '📒',
            stars: state.stars,
            stamps: state.stamps,
            learned: state.learned,
            tema: state.tema,
            mundo: state.doc.title,
        };
    }

    private beginPlay(state: PlayState, sid: string, mundo?: string, tema?: string) {
        const world = resolveMundo(mundo || state.mundo || 'bosque-estrellas');
        const topic = String(tema || state.tema || '').trim();
        const base = this.loadQuest('bosque-estrellas');
        state.doc = applySkin(base, world);
        state.questId = state.doc.id;
        state.mundo = world;
        state.tema = topic;
        state.nodeId = state.doc.start;
        state.stars = 1;
        state.unlocked = [];
        state.visited = [state.doc.start];
        const start = this.node(state);
        state.stamps = start.stamp ? [start.stamp] : [];
        state.learned = [];
        state.fase = 'play';
        this.applyBank(state, sid);
        state.awaitingGuide = true;
        state.waitingKind = 'guide';
        state.lastCard = {
            kind: 'cheer',
            title: state.doc.title,
            text: topic
                ? `Vamos a practicar «${topic}» en ${state.doc.title}. ${start.scene}`
                : start.scene || '¡A jugar!',
            emoji: start.emoji || '🌟',
            stars: 1,
        };
    }

    private uiSpec(state: PlayState, sid: string) {
        return { root: { type: 'kidquest.QuestBoard', props: this.workbenchProps(state, sid) } };
    }

    private async pushTab(state: PlayState, sid: string, purpose: string) {
        const spec = this.uiSpec(state, sid);
        return kidquestBench.launchOrFocus({
            sessionId: sid,
            label: this.labelFor(state),
            uiSpec: spec,
            badgeIcon: 'Sparkles',
            badgeColor: 'info',
            systemPrompt: `Asistente del mapa "${this.labelFor(state)}". No copies widgets al chat. El tablero vive en esta tab.`,
        });
    }

    async startQuest(payload: any) {
        const sid = this.sid(payload);
        const lobby = payload.lobby === true || payload.lobby === 'true';
        const tema = String(payload.tema || payload.topic || payload.aprender || '').trim();
        const mundoRaw = String(payload.mundo || payload.world || payload.actividad || payload.questId || '').trim();
        const mundo = mundoRaw && !lobby ? resolveMundo(mundoRaw) : '';

        const base = this.loadQuest('bosque-estrellas');
        const state: PlayState = {
            questId: 'aventura',
            doc: base,
            nodeId: base.start,
            stars: 0,
            unlocked: [],
            visited: [base.start],
            stamps: [],
            lastCard: {
                kind: 'cheer',
                title: 'Aventura',
                text: 'Un adulto elige mundo y tema (qué aprender).',
                emoji: '🎲',
                stars: 0,
            },
            tema: '',
            mundo: '',
            fase: 'lobby',
            awaitingGuide: false,
            waitingKind: 'setup',
            learned: [],
        };
        if (tema) this.beginPlay(state, sid || 'default', mundo || 'bosque-estrellas', tema);
        else if (mundoRaw && !lobby) {
            state.mundo = resolveMundo(mundoRaw);
            state.doc = applySkin(base, state.mundo);
            state.questId = state.doc.id;
            state.lastCard = {
                kind: 'cheer',
                title: state.doc.title,
                text: 'Mundo listo. El adulto escribe qué debe aprender el niño.',
                emoji: '🎲',
                stars: 0,
            };
        }
        const prev = getPlay(sid);
        if (prev?.questTabId) state.questTabId = prev.questTabId;
        if (prev?.parentChatId) state.parentChatId = prev.parentChatId;
        savePlay(sid || 'default', state);
        const tab = await kidquestBench.enqueue(sid, () => this.pushTab(state, sid, 'start_quest'));
        if (tab?.tabId) {
            state.questTabId = tab.tabId;
            if (sid) state.parentChatId = sid;
            savePlay(sid || 'default', state);
        }
        const slots = state.fase === 'play' ? this.quizSlots(state) : [];
        return {
            success: !!tab?.tabId || !!tab?.success,
            tabId: tab?.tabId,
            label: this.labelFor(state),
            fase: state.fase,
            tema: state.tema,
            mundo: state.mundo,
            worlds: listWorlds(),
            quizSlots: slots,
            card: state.lastCard,
            uiSpec: this.cardUiSpec(state.lastCard, state),
            instruction:
                state.fase === 'lobby'
                    ? 'Pregunta al adulto: ¿qué debe aprender el niño y en qué mundo (bosque, carros, peces, espacio)? Luego start_quest({ tema, mundo }) y fill_quizzes. CheerCard. waitForAction:false. Una línea.'
                    : `fill_quizzes con ${slots.length} preguntas NUEVAS de tema="${state.tema || 'el tema'}" ambientadas en ${state.doc.title}. choiceId de quizSlots. 3 opciones, answer exacta. Edad 6-10. Luego urano_render_json CheerCard. waitForAction:false. Una línea.`,
            disclaimer: base.disclaimer,
            message: tab?.message,
        };
    }

    private needState(sid: string) {
        const s = getPlay(sid);
        if (!s) throw new Error('No hay aventura. Llama start_quest con tema y mundo (bosque, carros, peces, espacio).');
        return s;
    }

    private findChoice(state: PlayState, choiceId: string, labelHint?: string): Choice | undefined {
        const id = String(choiceId || '').trim();
        if (id === 'skip-wait') return { id: 'skip-wait', label: 'Ya leí', to: state.nodeId };
        if (id.startsWith('mundo:')) return { id, label: labelHint || id, to: state.doc.start };
        const hint = String(labelHint || '').toLowerCase();
        if (state.fase === 'lobby') {
            const w = listWorlds().find((x) => id === `mundo:${x.id}` || x.title.toLowerCase() === hint);
            if (w) return { id: `mundo:${w.id}`, label: w.title, to: state.doc.start };
        }
        const here = this.node(state).choices;
        return (
            here.find((c) => c.id === id) ||
            here.find((c) => c.label.toLowerCase() === hint) ||
            Object.values(state.doc.nodes)
                .flatMap((n) => n.choices)
                .find((c) => c.id === id)
        );
    }

    private applyChoice(state: PlayState, choice: Choice, answer?: string): Card {
        if (choice.id === 'skip-wait') {
            state.awaitingGuide = false;
            state.waitingKind = '';
            return state.lastCard;
        }
        if (choice.id.startsWith('mundo:')) {
            const world = resolveMundo(choice.id.slice(6));
            if (state.tema) {
                this.beginPlay(state, loadStore().lastSid || 'default', world, state.tema);
            } else {
                state.mundo = world;
                state.doc = applySkin(this.loadQuest('bosque-estrellas'), world);
                state.questId = state.doc.id;
                state.lastCard = {
                    kind: 'cheer',
                    title: state.doc.title,
                    text: 'Mundo listo. El adulto escribe en el chat qué debe aprender el niño (sumas, colores, letras…).',
                    emoji: listWorlds().find((w) => w.id === world)?.emoji || '🎲',
                    stars: 0,
                };
                state.waitingKind = 'setup';
            }
            return state.lastCard;
        }
        if (choice.reset) {
            this.beginPlay(state, loadStore().lastSid || 'default', state.mundo, state.tema);
            state.awaitingGuide = true;
            state.waitingKind = 'guide';
            return state.lastCard;
        }

        if (choice.quiz && !state.unlocked.includes(choice.id)) {
            const given = String(answer || '').trim();
            if (!given) {
                state.awaitingGuide = true;
                state.waitingKind = 'quiz';
                state.lastCard = {
                    kind: 'quiz',
                    title: '¡Pregunta!',
                    text: choice.quiz.hint || 'Piensa un poquito.',
                    question: choice.quiz.q,
                    options: choice.quiz.options,
                    choiceId: choice.id,
                    stars: state.stars,
                    tema: state.tema,
                };
                return state.lastCard;
            }
            const ok = given.toLowerCase() === String(choice.quiz.answer).toLowerCase();
            state.learned.push({ q: choice.quiz.q, given, ok, place: this.node(state).title });
            if (!ok) {
                state.awaitingGuide = true;
                state.waitingKind = 'quiz';
                state.lastCard = {
                    kind: 'quiz',
                    title: 'Casi…',
                    text: choice.quiz.hint || 'Prueba otra vez.',
                    question: choice.quiz.q,
                    options: choice.quiz.options,
                    choiceId: choice.id,
                    stars: state.stars,
                };
                return state.lastCard;
            }
            state.unlocked.push(choice.id);
            state.stars += 1;
        }

        const dest = state.doc.nodes[choice.to];
        if (!dest) throw new Error(`Nodo destino desconocido: ${choice.to}`);
        state.nodeId = dest.id;
        if (!state.visited.includes(dest.id)) {
            state.visited.push(dest.id);
            state.stars += 1;
            if (dest.stamp && !state.stamps.includes(dest.stamp)) state.stamps.push(dest.stamp);
        }
        const won = dest.goal || dest.id === state.doc.goal;
        state.awaitingGuide = true;
        state.waitingKind = won ? 'guide' : 'guide';
        if (won) {
            state.fase = 'done';
            state.lastCard = this.recapCard(state);
            state.lastCard.title = '¡Llegaste!';
            state.lastCard.emoji = dest.emoji || '🌟';
            return state.lastCard;
        }
        state.lastCard = {
            kind: 'cheer',
            title: dest.title,
            text: dest.scene,
            emoji: dest.emoji || '✨',
            stars: state.stars,
        };
        return state.lastCard;
    }

    private async pickChoice(payload: any) {
        const sid = this.sid(payload);
        const state = this.needState(sid);
        const choice = this.findChoice(state, payload.choiceId || payload.id, payload.label || payload.text);
        if (!choice) throw new Error(`Opción desconocida. ids: ${this.node(state).choices.map((c) => c.id).join(', ')}`);
        const card = this.applyChoice(state, choice, payload.answer || payload.respuesta);
        savePlay(sid || 'default', state);
        const tab = await kidquestBench.enqueue(sid, () => this.pushTab(state, sid, 'pick_choice'));
        return {
            success: true,
            tabId: tab.tabId,
            node: state.nodeId,
            stars: state.stars,
            card,
            uiSpec: this.cardUiSpec(card),
            instruction: 'urano_render_json con este uiSpec. waitForAction:false. Una línea máximo.',
        };
    }

    private async askHint(payload: any) {
        const sid = this.sid(payload);
        const state = this.needState(sid);
        const locked = this.node(state).choices.find((c) => c.quiz && !state.unlocked.includes(c.id));
        const hint = locked?.quiz?.hint || 'Mira el mapa de la tab y pulsa un camino.';
        state.lastCard = { kind: 'cheer', title: 'Pista', text: hint, emoji: '💡', stars: state.stars };
        savePlay(sid || 'default', state);
        return { success: true, card: state.lastCard, uiSpec: this.cardUiSpec(state.lastCard), instruction: 'urano_render_json. Sin spoiler del final.' };
    }

    private async showMap(payload: any) {
        const sid = this.sid(payload);
        const state = this.needState(sid);
        const tab = await kidquestBench.enqueue(sid, () => this.pushTab(state, sid, 'show_map'));
        return { success: true, tabId: tab.tabId, patched: !!tab.patched, message: 'Mapa en la tab. No copies el grafo al chat.' };
    }

    private async scoreQuest(payload: any) {
        const sid = this.sid(payload);
        const state = this.needState(sid);
        state.lastCard = this.recapCard(state);
        state.awaitingGuide = true;
        state.waitingKind = 'guide';
        savePlay(sid || 'default', state);
        const tab = await kidquestBench.enqueue(sid, () => this.pushTab(state, sid, 'score_quest'));
        return {
            success: true,
            tabId: tab.tabId,
            stars: state.stars,
            stamps: state.stamps,
            visited: state.visited,
            learned: state.learned,
            tema: state.tema,
            card: state.lastCard,
            uiSpec: this.cardUiSpec(state.lastCard, state),
            instruction: 'urano_render_json RecapCard (kind recap). Muestra lo aprendido al adulto. waitForAction:false.',
        };
    }

    private bindCard(card: Card, state?: PlayState): Card {
        const play = state || getPlay('');
        return {
            ...card,
            questTabId: card.questTabId || play?.questTabId,
            chatSessionId: card.chatSessionId || play?.parentChatId,
        };
    }

    private cardUiSpec(card: Card, state?: PlayState) {
        const props = this.bindCard(card, state);
        const type =
            props.kind === 'quiz'
                ? 'kidquest.QuizCard'
                : props.kind === 'recap'
                  ? 'kidquest.RecapCard'
                  : props.kind === 'stamp'
                    ? 'kidquest.StampCard'
                    : 'kidquest.CheerCard';
        return { root: { type, props } };
    }

    private buildCardUispec(payload: any) {
        const sid = this.sid(payload);
        let play: PlayState | undefined;
        try {
            play = this.needState(sid);
        } catch {
            play = getPlay(sid);
        }
        const card = play?.lastCard;
        const kind = String(payload.kind || card?.kind || 'cheer') as Card['kind'];
        const built: Card = {
            kind,
            title: String(payload.title || card?.title || '¡Sigue!'),
            text: String(payload.text || card?.text || '').slice(0, 180),
            emoji: payload.emoji || card?.emoji,
            stars: Number(payload.stars ?? card?.stars ?? 0),
            stamps: payload.stamps || card?.stamps,
            question: payload.question || card?.question,
            options: payload.options || card?.options,
            choiceId: payload.choiceId || card?.choiceId,
            learned: payload.learned || card?.learned,
            tema: payload.tema || card?.tema || play?.tema,
            mundo: payload.mundo || card?.mundo || play?.doc?.title,
        };
        return {
            success: true,
            uiSpec: this.cardUiSpec(built, play),
            instruction: 'urano_render_json con purpose + uiSpec. waitForAction:false. Una línea en el chat.',
        };
    }

    private async fillQuizzes(payload: any) {
        const sid = this.sid(payload);
        const state = this.needState(sid);
        if (state.fase === 'lobby') {
            const tema = String(payload.tema || state.tema || '').trim();
            const mundo = String(payload.mundo || state.mundo || '').trim();
            if (tema) this.beginPlay(state, sid || 'default', mundo, tema);
        }
        const raw = payload.quizzes || payload.items || [];
        let n = 0;
        if (Array.isArray(raw)) {
            for (const item of raw) {
                const q = sanitizeQuiz(item);
                const id = String(item?.choiceId || item?.id || '');
                if (!q || !id) continue;
                for (const node of Object.values(state.doc.nodes)) {
                    const c = node.choices.find((x) => x.id === id);
                    if (c) {
                        c.quiz = q;
                        n += 1;
                    }
                }
            }
        }
        savePlay(sid || 'default', state);
        await kidquestBench.enqueue(sid, () => this.pushTab(state, sid, 'fill_quizzes'));
        return {
            success: true,
            applied: n,
            slots: this.quizSlots(state),
            instruction: 'Ya hay preguntas. urano_render_json CheerCard de lastCard. Una línea. No inventes nodos.',
        };
    }

    private async guideReady(payload: any) {
        const sid = this.sid(payload);
        const state = getPlay(sid);
        if (!state) return { success: true, skipped: true };
        if (state.lastCard?.kind === 'quiz' && payload.force !== true && payload.force !== 'true') {
            return { success: true, awaitingGuide: true, reason: 'quiz' };
        }
        state.awaitingGuide = false;
        state.waitingKind = '';
        savePlay(sid || loadStore().lastSid || 'default', state);
        const key = sid || loadStore().lastSid || 'default';
        await kidquestBench.enqueue(key, () => this.pushTab(state, key, 'guide_ready'));
        return { success: true, awaitingGuide: false };
    }

    private parentFromHistory(id: string): string {
        if (!id) return '';
        try {
            const { ChatHistoryManager } = require('@core/ChatHistoryManager');
            const row = ChatHistoryManager.getSession?.(id);
            const parent = row?.parentSessionId;
            if (parent && parent !== id) return String(parent);
        } catch {
            /* optional */
        }
        return '';
    }

    private async resolveParentChatId(payload: any): Promise<string> {
        const manager = await CoreFactory.getSessionManager();
        const asParent = async (id: string): Promise<string> => {
            if (!id) return '';
            const fromHist = this.parentFromHistory(id);
            if (fromHist) return fromHist;
            try {
                const sess = await manager.load(id);
                const parent = sess?.metadata?.parentSessionId;
                if (parent && parent !== id) return String(parent);
                if (sess?.metadata?.isMultiverseTab) return '';
                if (String(id).startsWith('mvtab_')) return '';
                return id;
            } catch {
                return String(id).startsWith('mvtab_') ? '' : id;
            }
        };

        const play = getPlay(this.sid(payload));
        if (play?.parentChatId && !isBubbleId(play.parentChatId)) return play.parentChatId;

        const tabId = String(payload.questTabId || (!isBubbleId(payload.tabId) ? payload.tabId : '') || play?.questTabId || '').trim();
        if (tabId) {
            try {
                const ctx = await Router.executeLocalAction({
                    route: '/module/MultiverseTabs/plugins/Tabs/getTabContext',
                    method: 'POST',
                    data: { tabId, limit: '1' },
                });
                const tabSessionId = String(ctx?.data?.sessionId || ctx?.sessionId || tabId);
                const fromTab = await asParent(tabSessionId);
                if (fromTab) return fromTab;
                const fromKey = await asParent(tabId);
                if (fromKey) return fromKey;
            } catch {
                /* continue */
            }
        }
        const hinted = String(payload.chatSessionId || payload._parentSessionId || payload.sessionId || payload._sessionId || '').trim();
        if (isBubbleId(hinted)) return play?.parentChatId || '';
        return asParent(hinted);
    }

    private async sendToMainChat(chatId: string, prompt: string): Promise<void> {
        const run = async () => {
            const manager = await CoreFactory.getSessionManager();
            const session = await manager.load(chatId);
            const last = session?.metadata?.lastUsedAiConfig;
            const overrides =
                last?.provider && last.provider !== 'default' && last.model && last.model !== 'default'
                    ? { provider: String(last.provider), model: String(last.model) }
                    : undefined;
            await manager.sendInput(chatId, prompt, overrides);
        };
        const { moduleVaultContext } = require('@core/Security/Vault');
        if (moduleVaultContext && typeof moduleVaultContext.exit === 'function') {
            await new Promise<void>((resolve, reject) => {
                moduleVaultContext.exit(() => {
                    run().then(resolve).catch(reject);
                });
            });
            return;
        }
        await run();
    }

    private async sendChoice(payload: any) {
        const sid = this.sid(payload);
        let state: PlayState;
        try {
            state = this.needState(sid);
        } catch {
            await this.startQuest({ ...payload, lobby: true });
            state = this.needState(this.sid(payload) || 'default');
        }
        const choice = this.findChoice(state, payload.choiceId || payload.id, payload.label);
        if (!choice) {
            return { success: false, message: 'Ese botón no existe en este sitio.' };
        }
        if (
            state.awaitingGuide &&
            state.fase === 'play' &&
            !payload.answer &&
            choice.id !== 'skip-wait' &&
            !choice.id.startsWith('mundo:')
        ) {
            return { success: false, message: 'Espera a que el guía hable en el chat.' };
        }
        const card = this.applyChoice(state, choice, payload.answer);
        const key = this.sid(payload) || loadStore().lastSid || 'default';
        const questTab =
            (!isBubbleId(String(payload.questTabId || '')) && payload.questTabId) ||
            (!isBubbleId(String(payload.tabId || '')) && payload.tabId) ||
            state.questTabId ||
            kidquestBench.peekTabId(this.labelFor(state), key);
        if (questTab) state.questTabId = String(questTab);
        state.lastCard = this.bindCard(card, state);
        savePlay(key, state);
        await kidquestBench.enqueue(key, () => this.pushTab(state, key, 'send_choice'));
        if (choice.id === 'skip-wait') {
            return { success: true, applied: true, skippedWait: true };
        }

        const chatId = (state.parentChatId && !isBubbleId(state.parentChatId) ? state.parentChatId : '') || (await this.resolveParentChatId({
            ...payload,
            tabId: state.questTabId,
            questTabId: state.questTabId,
            chatSessionId: state.parentChatId,
        }));
        if (chatId) state.parentChatId = chatId;
        savePlay(key, state);
        const prompt =
            `El niño pulsó «${choice.label}» (choiceId=${choice.id}` +
            (payload.answer ? `, respuesta=${payload.answer}` : '') +
            `). Resultado: ${card.kind} «${card.title}» — ${card.text.slice(0, 160)} ` +
            `Nodo=${state.nodeId} estrellas=${state.stars} tema=${state.tema || '-'}. ` +
            (card.kind === 'recap'
                ? 'Llama build_card_uispec (kind=recap) y urano_render_json RecapCard. El adulto debe ver lo aprendido. '
                : `Llama build_card_uispec (kind=${card.kind}) y urano_render_json con ese uiSpec. `) +
            `Una sola línea en texto. No inventes nodos. La tab espera esta tarjeta.`;
        if (!chatId) {
            return { success: true, applied: true, card: state.lastCard, message: 'Tab actualizada. Sin chat principal para la tarjeta.' };
        }
        try {
            await this.sendToMainChat(chatId, prompt);
            if (state.questTabId && !isBubbleId(state.questTabId)) {
                try {
                    await PluginCore.updateUI({
                        tabId: String(state.questTabId),
                        patch: { root: { props: { chatSessionId: chatId } } },
                        purpose: 'bind chat',
                    });
                } catch {
                    /* non-fatal */
                }
            }
            return { success: true, sentTo: chatId, card: state.lastCard, applied: true };
        } catch (e: any) {
            const msg = String(e?.message || 'sendInput falló');
            if (/already busy|not found/i.test(msg)) {
                return { success: true, applied: true, card: state.lastCard, message: 'Tab actualizada. El chat no pudo recibir la tarjeta.' };
            }
            return { success: true, applied: true, card: state.lastCard, message: msg };
        }
    }
}

export default QuestPlugin;
