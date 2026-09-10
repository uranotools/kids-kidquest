import { EnginePluginBase, EnginePreProcessResult, ContextEngineResult } from '@core/EnginePluginBase';
import type { SessionContext } from '@core/runtime/SessionContext';
import { QuestPlugin } from '../Quest/QuestPlugin';
import { isTabSession } from '../Shared/tabSession';

export class UranoKidquestEnginePlugin extends EnginePluginBase {
    protected config: any;
    constructor(config: any) {
        super(config);
        this.config = config;
    }

    async onSessionStart(ctx: SessionContext): Promise<void> {
        if (isTabSession(ctx)) return;
        ctx.addBadge({
            id: 'kidquest-active',
            label: 'Aventura',
            color: 'info',
        });
        await ctx.store.setSession('kidquest_ready', true);
        ctx.appendCustomInstructions(
            `\n\n[URANO KIDQUEST — AVENTURA]\n` +
                `Lee el skill urano-kidquest. Tools: urano_uranokidquest_quest_*.\n` +
                `Al inicio: el ADULTO elige TEMA (qué aprender) y MUNDO (bosque, carros, peces, espacio).\n` +
                `start_quest({ tema, mundo }) → fill_quizzes (preguntas NUEVAS) → CheerCard urano_render_json.\n` +
                `UNA sola tab QUEST:aventura. No llames start_quest otra vez si la tab ya está abierta; usa pick_choice / show_map.\n` +
                `Chat: UNA línea + tarjeta. La tab espera la tarjeta antes del siguiente paso.\n` +
                `Al final RecapCard (lo aprendido) para el adulto. No es clase certificada. Un adulto cerca.\n` +
                `No inventes nodos. Comandos: /mapa /estrellas`
        );
        try {
            const quest = new QuestPlugin(this.config);
            await quest.startQuest({ _sessionId: ctx.sessionId, _parentSessionId: ctx.sessionId, lobby: true });
        } catch (e: any) {
            console.warn('[Kidquest] auto lobby:', e?.message || e);
        }
    }

    async getContextEngine(ctx: SessionContext): Promise<ContextEngineResult | null> {
        if (isTabSession(ctx)) return null;
        return {
            key: 'kidquest_context',
            content: `kidquest UI=tab mapa + burbujas; lobby=tema+mundo; mundos=bosque|carros|peces|espacio; al final RecapCard; una sola tab; session=${ctx.sessionId}`,
            priority: 8,
        };
    }

    async preMessageProcess(ctx: SessionContext, message: any): Promise<EnginePreProcessResult> {
        if (isTabSession(ctx)) return { status: 'continue' };
        const content = typeof message.content === 'string' ? message.content.trim() : '';
        const low = content.toLowerCase();
        if (low === '/mapa') {
            return {
                status: 'intercepted',
                overrideResponse: '### Mapa\nEstá en la tab QUEST. Si no la ves: `show_map`. No copies el grafo aquí.',
            };
        }
        if (low === '/estrellas') {
            return {
                status: 'intercepted',
                overrideResponse: '### Estrellas\nLlama `score_quest` y luego `urano_render_json` con el RecapCard. Una línea.',
            };
        }
        return { status: 'continue' };
    }
}

export default UranoKidquestEnginePlugin;
