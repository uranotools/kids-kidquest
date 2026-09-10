/**
 * Folder === name: urano-kidquest
 * SKILL.md tools[] must include urano_urano-kidquest_* so SkillRegistry
 * resolves the directory from parts[1]. Runtime also registers
 * urano_uranokidquest_* (hyphens stripped from config.name).
 */
export const UranoKidquestConfig = {
    name: 'urano-kidquest',
    description:
        'Aventura por turnos para niños (6–10): mapa en una MultiverseTab, tarjetas JsonLive en el chat. Fixtures locales.',
    icon: 'Sparkles',
    category: 'Educación',
    inDesktop: true,
    inCloud: false,
    enginePlugin: true,
    engineHooks: ['onSessionStart', 'getContextEngine', 'preMessageProcess'],
    enginePluginPath: 'Plugins/Engine/UranoKidquestEnginePlugin',
    enabledPlugins: ['Quest'],
    jsonLiveWidgets: [
        { type: 'kidquest.QuestBoard', bundle: 'ui/widgets.js', exportName: 'QuestBoard', propsHint: '{ title, scene, nodes, nodeId, stars, stamps, choices }', aliases: ['QuestBoard'] },
        { type: 'kidquest.PathMap', bundle: 'ui/widgets.js', exportName: 'PathMap', propsHint: '{ nodes, nodeId, visited }', aliases: ['PathMap'] },
        { type: 'kidquest.ChoiceBar', bundle: 'ui/widgets.js', exportName: 'ChoiceBar', propsHint: '{ choices, tabId }', aliases: ['ChoiceBar'] },
        { type: 'kidquest.CheerCard', bundle: 'ui/widgets.js', exportName: 'CheerCard', propsHint: '{ title, text, stars, emoji }', aliases: ['CheerCard'] },
        { type: 'kidquest.QuizCard', bundle: 'ui/widgets.js', exportName: 'QuizCard', propsHint: '{ question, options, choiceId }', aliases: ['QuizCard'] },
        { type: 'kidquest.StampCard', bundle: 'ui/widgets.js', exportName: 'StampCard', propsHint: '{ stamps, stars }', aliases: ['StampCard'] },
        { type: 'kidquest.RecapCard', bundle: 'ui/widgets.js', exportName: 'RecapCard', propsHint: '{ learned, tema, mundo }', aliases: ['RecapCard'] },
    ],
    settings: [
        {
            name: 'DATA_DIR',
            type: 'directory',
            title: 'Carpeta de aventuras',
            description: 'quests/*.json. Si vacío, se usan fixtures del plugin.',
        },
    ],
    mcpServer: { command: 'native', args: [] },
    pluginSchemas: {
        Quest: {
            actions: {
                list_quests: { label: 'Listar aventuras del banco', fields: [] },
                start_quest: {
                    label: 'Abrir aventura (una tab)',
                    fields: [
                        { name: 'tema', type: 'text', label: 'Qué debe aprender (sumas, colores…)' },
                        { name: 'mundo', type: 'text', label: 'bosque | carros | peces | espacio' },
                    ],
                },
                pick_choice: {
                    label: 'Elegir camino o responder quiz',
                    fields: [
                        { name: 'choiceId', type: 'text', label: 'id de la opción' },
                        { name: 'answer', type: 'text', label: 'respuesta del quiz (si hay)' },
                    ],
                },
                ask_hint: { label: 'Pista corta (sin spoiler del final)', fields: [] },
                show_map: { label: 'Enfocar / restaurar tab del mapa', fields: [] },
                score_quest: { label: 'Estrellas y sellos', fields: [] },
                build_card_uispec: {
                    label: 'uiSpec de tarjeta para urano_render_json',
                    fields: [
                        { name: 'kind', type: 'text', label: 'cheer | quiz | stamp' },
                        { name: 'title', type: 'text', label: 'título' },
                        { name: 'text', type: 'text', label: 'texto corto' },
                    ],
                },
                send_choice: {
                    label: 'Botón de la tab → chat principal',
                    fields: [
                        { name: 'choiceId', type: 'text', label: 'id' },
                        { name: 'answer', type: 'text', label: 'respuesta quiz' },
                    ],
                },
                fill_quizzes: {
                    label: 'Preguntas nuevas del tema (nunca iguales)',
                    fields: [{ name: 'quizzes', type: 'textarea', label: 'JSON [{choiceId,q,options,answer,hint}]' }],
                },
                guide_ready: {
                    label: 'La tarjeta del guía ya se mostró (desbloquea el mapa)',
                    fields: [],
                },
            },
        },
    },
};
