export type WorldInfo = { id: string; title: string; emoji: string; blurb: string };

type NodeSkin = { title?: string; emoji?: string; scene?: string; stamp?: string; labels?: Record<string, string> };

type Skin = { id: string; title: string; nodes: Record<string, NodeSkin> };

const SKINS: Record<string, Skin> = {
    'bosque-estrellas': {
        id: 'bosque-estrellas',
        title: 'El Bosque de las Estrellas',
        nodes: {},
    },
    'circuito-carros': {
        id: 'circuito-carros',
        title: 'El Circuito de los Carros',
        nodes: {
            claro: { title: 'El garage', emoji: '🚗', scene: 'Un garage brillante. El auto Rojo te saluda con las luces.', stamp: 'auto', labels: { 'al-rio': 'Ir al taller', 'al-sendero': 'Pista de tierra' } },
            rio: { title: 'El taller', emoji: '🔧', scene: 'Huelen las ruedas nuevas. Hay que cruzar el puente de goma.', stamp: 'llave', labels: { 'volver-claro': 'Volver al garage', cruzar: 'Cruzar el puente' } },
            sendero: { title: 'Pista de tierra', emoji: '🏜️', scene: 'Polvito y conos. Un camión esconde un mapa.', stamp: 'camión', labels: { 'a-cueva': 'Entrar al túnel', 'sendero-claro': 'Volver al garage' } },
            puente: { title: 'Puente de goma', emoji: '🌉', scene: 'El puente rebotá. Al otro lado hay un semáforo.', stamp: 'semáforo', labels: { 'a-pradera': 'Ir a la recta', 'puente-rio': 'Bajar al taller' } },
            cueva: { title: 'Túnel de eco', emoji: '🕳️', scene: 'Broom-broom… Un murciélago-mecánico pregunta.', stamp: 'casco', labels: { 'salir-cima': 'Salir a la meta', 'cueva-sendero': 'Volver a la pista' } },
            pradera: { title: 'La recta', emoji: '🏁', scene: 'Banderitas ondean. Falta poco para la meta.', stamp: 'bandera', labels: { 'pradera-mirador': 'Subir al palco', 'pradera-puente': 'Volver al puente' } },
            mirador: { title: 'Palco', emoji: '📣', scene: 'Se ve todo el circuito. Un paso más.', stamp: 'trofeo', labels: { 'a-cima': 'Camino a la meta', 'mirador-pradera': 'Bajar a la recta' } },
            cima: { title: 'La meta', emoji: '🏆', scene: '¡Llegaste! Rojo suena la bocina y todos aplauden.', stamp: 'copa', labels: { 'otra-vez': 'Correr otra vez' } },
        },
    },
    'arrecife-peces': {
        id: 'arrecife-peces',
        title: 'El Arrecife de los Peces',
        nodes: {
            claro: { title: 'La laguna', emoji: '🐠', scene: 'Agua calma. El pez Luna mueve las aletas y te saluda.', stamp: 'pez', labels: { 'al-rio': 'Nadar al río', 'al-sendero': 'Arrecife oscuro' } },
            rio: { title: 'La corriente', emoji: '🌊', scene: 'La corriente canta. Una nutria-pez señala algas para cruzar.', stamp: 'alga', labels: { 'volver-claro': 'Volver a la laguna', cruzar: 'Cruzar las algas' } },
            sendero: { title: 'Arrecife de coral', emoji: '🪸', scene: 'Corales brillan. Un cangrejo esconde una perla.', stamp: 'cangrejo', labels: { 'a-cueva': 'Entrar a la gruta', 'sendero-claro': 'Volver a la laguna' } },
            puente: { title: 'Puente de coral', emoji: '🌉', scene: 'El coral se mueve un poquito. Hay un farol de mar.', stamp: 'concha', labels: { 'a-pradera': 'Ir a la pradera marina', 'puente-rio': 'Bajar a la corriente' } },
            cueva: { title: 'Gruta de eco', emoji: '🐙', scene: 'Blub blub… Un pulpo pregunta en el eco.', stamp: 'pulpo', labels: { 'salir-cima': 'Salir a la superficie', 'cueva-sendero': 'Volver al coral' } },
            pradera: { title: 'Pradera marina', emoji: '✨', scene: 'Luces de medusas. Una estrella de mar cae despacio.', stamp: 'medusa', labels: { 'pradera-mirador': 'Subir al mirador', 'pradera-puente': 'Volver al coral-puente' } },
            mirador: { title: 'Mirador del mar', emoji: '🔭', scene: 'Se ve todo el arrecife. Falta un salto.', stamp: 'ancla', labels: { 'a-cima': 'Nadar a la isla', 'mirador-pradera': 'Bajar a las medusas' } },
            cima: { title: 'Isla de estrellas', emoji: '🌟', scene: '¡Llegaste! El cielo y el mar se llenan de brillos.', stamp: 'perla', labels: { 'otra-vez': 'Nadar otra vez' } },
        },
    },
    'orbitas-espacio': {
        id: 'orbitas-espacio',
        title: 'Las Órbitas del Espacio',
        nodes: {
            claro: { title: 'La estación', emoji: '🚀', scene: 'Una estación suave. El robot Luna parpadea y te saluda.', stamp: 'cohete', labels: { 'al-rio': 'Ir al cometa', 'al-sendero': 'Cinturón oscuro' } },
            rio: { title: 'El cometa', emoji: '☄️', scene: 'Polvito de estrella. Hay que cruzar tres rocas.', stamp: 'cometa', labels: { 'volver-claro': 'Volver a la estación', cruzar: 'Cruzar las rocas' } },
            sendero: { title: 'Cinturón de asteroides', emoji: '🪨', scene: 'Rocas brillan. Un ovni esconde una linterna.', stamp: 'ovni', labels: { 'a-cueva': 'Entrar al cráter', 'sendero-claro': 'Volver a la estación' } },
            puente: { title: 'Puente de luz', emoji: '🌈', scene: 'El puente de luz tiembla. Hay un farol espacial.', stamp: 'farol', labels: { 'a-pradera': 'Ir a la nebulosa', 'puente-rio': 'Bajar al cometa' } },
            cueva: { title: 'Cráter de eco', emoji: '🌑', scene: 'Eco en el cráter. Una luna pregunta el color.', stamp: 'luna', labels: { 'salir-cima': 'Salir al observatorio', 'cueva-sendero': 'Volver a los asteroides' } },
            pradera: { title: 'Nebulosa', emoji: '🌌', scene: 'Luces diminutas bailan. Una estrella cae despacio.', stamp: 'nebulosa', labels: { 'pradera-mirador': 'Subir al observatorio', 'pradera-puente': 'Volver al puente' } },
            mirador: { title: 'Observatorio', emoji: '🔭', scene: 'Se ve toda la galaxia. Un paso para la cima.', stamp: 'telescopio', labels: { 'a-cima': 'Camino a la estrella', 'mirador-pradera': 'Bajar a la nebulosa' } },
            cima: { title: 'Estrella mayor', emoji: '🌟', scene: '¡Llegaste! El cielo se llena de estrellas y Luna aplaude.', stamp: 'estrella', labels: { 'otra-vez': 'Viajar otra vez' } },
        },
    },
};

const ALIAS: Record<string, string> = {
    bosque: 'bosque-estrellas',
    forest: 'bosque-estrellas',
    estrellas: 'bosque-estrellas',
    naturaleza: 'bosque-estrellas',
    'bosque-estrellas': 'bosque-estrellas',
    carros: 'circuito-carros',
    autos: 'circuito-carros',
    coches: 'circuito-carros',
    pista: 'circuito-carros',
    'circuito-carros': 'circuito-carros',
    peces: 'arrecife-peces',
    mar: 'arrecife-peces',
    oceano: 'arrecife-peces',
    océano: 'arrecife-peces',
    arrecife: 'arrecife-peces',
    'arrecife-peces': 'arrecife-peces',
    espacio: 'orbitas-espacio',
    planetas: 'orbitas-espacio',
    cohete: 'orbitas-espacio',
    galaxia: 'orbitas-espacio',
    'orbitas-espacio': 'orbitas-espacio',
};

export function resolveMundo(raw?: string): string {
    const k = String(raw || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-');
    return ALIAS[k] || (SKINS[k] ? k : 'bosque-estrellas');
}

export function listWorlds(): WorldInfo[] {
    return [
        { id: 'bosque-estrellas', title: 'Bosque', emoji: '🌲', blurb: 'Árboles, río y estrellas' },
        { id: 'circuito-carros', title: 'Carros', emoji: '🚗', blurb: 'Pista, taller y meta' },
        { id: 'arrecife-peces', title: 'Peces', emoji: '🐠', blurb: 'Laguna, coral y perlas' },
        { id: 'orbitas-espacio', title: 'Espacio', emoji: '🚀', blurb: 'Cohete, cometa y estrellas' },
    ];
}

export function applySkin(doc: any, mundo: string) {
    const id = resolveMundo(mundo);
    const skin = SKINS[id];
    if (!skin) return doc;
    const next = JSON.parse(JSON.stringify(doc));
    next.id = skin.id;
    next.title = skin.title;
    for (const [nid, patch] of Object.entries(skin.nodes)) {
        const n = next.nodes[nid];
        if (!n) continue;
        if (patch.title) n.title = patch.title;
        if (patch.emoji) n.emoji = patch.emoji;
        if (patch.scene) n.scene = patch.scene;
        if (patch.stamp) n.stamp = patch.stamp;
        if (patch.labels) {
            for (const c of n.choices || []) {
                if (patch.labels[c.id]) c.label = patch.labels[c.id];
            }
        }
    }
    return next;
}
