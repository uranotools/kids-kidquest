export type Quiz = { q: string; options: string[]; answer: string; hint?: string };

export const QUIZ_SLOT_IDS = [
    'al-rio',
    'al-sendero',
    'cruzar',
    'a-cueva',
    'salir-cima',
    'a-pradera',
    'pradera-mirador',
    'a-cima',
];

const MATH: Quiz[] = [
    { q: '¿Cuánto es 1 + 1?', options: ['1', '2', '3'], answer: '2', hint: 'Un dedo y otro dedo.' },
    { q: '¿Cuánto es 2 + 2?', options: ['3', '4', '5'], answer: '4', hint: 'Dos y dos más.' },
    { q: '¿Cuánto es 3 + 1?', options: ['3', '4', '5'], answer: '4', hint: 'Tres y uno más.' },
    { q: '¿Cuánto es 5 - 1?', options: ['3', '4', '6'], answer: '4', hint: 'Quita uno de cinco.' },
    { q: '¿Cuánto es 2 + 3?', options: ['4', '5', '6'], answer: '5', hint: 'Dos y tres amiguitos.' },
    { q: '¿Qué número sigue: 1, 2, 3…?', options: ['4', '6', '8'], answer: '4', hint: 'Cuenta con los dedos.' },
    { q: '¿Cuántas ruedas tiene una bici?', options: ['1', '2', '4'], answer: '2', hint: 'Una adelante y una atrás.' },
    { q: '¿Cuánto es 4 + 1?', options: ['4', '5', '7'], answer: '5', hint: 'Cuatro y uno más.' },
    { q: '¿Cuál es más grande?', options: ['2', '5', '3'], answer: '5', hint: 'El que vale más.' },
    { q: '¿Cuánto es 10 - 1?', options: ['8', '9', '11'], answer: '9', hint: 'Uno menos que diez.' },
    { q: '¿Cuántos lados tiene un triángulo?', options: ['3', '4', '5'], answer: '3', hint: 'Tri- significa tres.' },
    { q: '¿Cuánto es 0 + 6?', options: ['0', '5', '6'], answer: '6', hint: 'Cero no suma nada.' },
];

const COLORS: Quiz[] = [
    { q: '¿De qué color es el cielo de día?', options: ['Azul', 'Verde', 'Negro'], answer: 'Azul', hint: 'Cuando no hay atardecer…' },
    { q: '¿De qué color es la hierba?', options: ['Roja', 'Verde', 'Azul'], answer: 'Verde', hint: 'El césped del parque.' },
    { q: '¿De qué color es un plátano maduro?', options: ['Amarillo', 'Azul', 'Rosa'], answer: 'Amarillo', hint: 'Como el sol.' },
    { q: '¿De qué color es una fresa?', options: ['Rojo', 'Gris', 'Azul'], answer: 'Rojo', hint: 'Frutita roja.' },
    { q: 'Mezclas azul y amarillo. ¿Sale…?', options: ['Verde', 'Rosa', 'Negro'], answer: 'Verde', hint: 'Como las plantas.' },
    { q: '¿De qué color es la nieve?', options: ['Blanca', 'Naranja', 'Violeta'], answer: 'Blanca', hint: 'Como una nube.' },
    { q: '¿De qué color es un tomate?', options: ['Rojo', 'Azul', 'Gris'], answer: 'Rojo', hint: 'En la ensalada.' },
    { q: 'El sol se ve…', options: ['Amarillo', 'Verde', 'Morado'], answer: 'Amarillo', hint: 'Brilla de día.' },
];

const LETTERS: Quiz[] = [
    { q: '¿Con qué letra empieza “mamá”?', options: ['M', 'S', 'P'], answer: 'M', hint: 'Ma-má.' },
    { q: '¿Cuántas letras tiene “sol”?', options: ['2', '3', '4'], answer: '3', hint: 'S-O-L.' },
    { q: '¿Qué letra va después de la A?', options: ['B', 'Z', 'M'], answer: 'B', hint: 'A, B, C…' },
    { q: '¿“Casa” empieza igual que…?', options: ['Coche', 'Mesa', 'Uva'], answer: 'Coche', hint: 'Las dos con C.' },
    { q: '¿Cuál es una vocal?', options: ['A', 'T', 'N'], answer: 'A', hint: 'A E I O U.' },
    { q: '¿Cuántas vocales hay?', options: ['3', '5', '8'], answer: '5', hint: 'A E I O U.' },
    { q: '¿“Luna” termina con…?', options: ['A', 'O', 'I'], answer: 'A', hint: 'Lu-nA.' },
    { q: '¿Cuál palabra es un animal?', options: ['Gato', 'Mesa', 'Rojo'], answer: 'Gato', hint: 'Hace miau.' },
];

const ANIMALS: Quiz[] = [
    { q: '¿Cuántas patas tiene un perro?', options: ['2', '4', '6'], answer: '4', hint: 'Las mascotas andan en cuatro.' },
    { q: '¿Qué animal hace miau?', options: ['Gato', 'Vaca', 'Pez'], answer: 'Gato', hint: 'Le gusta la leche.' },
    { q: '¿Los peces viven en…?', options: ['El agua', 'El fuego', 'La nube'], answer: 'El agua', hint: 'Nadan.' },
    { q: '¿Cuántas patas tiene un búho?', options: ['2', '4', '8'], answer: '2', hint: 'Es un ave.' },
    { q: '¿Qué animal vuela?', options: ['Pájaro', 'Pez', 'Vaca'], answer: 'Pájaro', hint: 'Tiene alas.' },
    { q: '¿La vaca da…?', options: ['Leche', 'Miel', 'Lana azul'], answer: 'Leche', hint: 'Para el vaso.' },
    { q: '¿El pez tiene…?', options: ['Escamas', 'Plumas', 'Ruedas'], answer: 'Escamas', hint: 'Brillan en el agua.' },
    { q: '¿Qué sale de noche y brilla?', options: ['Estrellas', 'Sillas', 'Pan'], answer: 'Estrellas', hint: 'En el cielo.' },
];

function familyFor(tema: string): Quiz[] {
    const t = String(tema || '').toLowerCase();
    if (/suma|resta|n[uú]mero|mate|contar|cuenta|m[aá]s|menos/.test(t)) return MATH;
    if (/color|pintur|arco[ií]ris/.test(t)) return COLORS;
    if (/letra|abece|leer|palabra|vocal/.test(t)) return LETTERS;
    if (/animal|bicho|mascota|fauna/.test(t)) return ANIMALS;
    return [...MATH.slice(0, 4), ...COLORS.slice(0, 2), ...LETTERS.slice(0, 1), ...ANIMALS.slice(0, 1)];
}

function mulberry(seed: number) {
    let a = seed >>> 0 || 1;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function shuffle<T>(arr: T[], rnd: () => number): T[] {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function shuffleOptions(q: Quiz, rnd: () => number): Quiz {
    const options = shuffle(q.options.slice(0, 3), rnd);
    while (options.length < 3) options.push('?');
    return { ...q, options, q: q.q.slice(0, 120), hint: (q.hint || '').slice(0, 80) };
}

export function sanitizeQuiz(raw: any): Quiz | null {
    const q = String(raw?.q || raw?.question || '').trim().slice(0, 120);
    let options = Array.isArray(raw?.options) ? raw.options.map((o: any) => String(o).trim()).filter(Boolean) : [];
    options = [...new Set(options)].slice(0, 3);
    const answer = String(raw?.answer || '').trim();
    if (!q || options.length < 2 || !answer) return null;
    const hit = options.find((o) => o.toLowerCase() === answer.toLowerCase());
    if (!hit) return null;
    if (options.length === 2) options.push('Ninguna');
    return { q, options: options.slice(0, 3), answer: hit, hint: String(raw?.hint || 'Piénsalo con calma.').slice(0, 80) };
}

export function quizzesFor(tema: string, seed: string): Record<string, Quiz> {
    const rnd = mulberry(hash(seed + '|' + tema + '|' + Date.now()));
    const pool = shuffle(familyFor(tema).map((q) => shuffleOptions(q, rnd)), rnd);
    const out: Record<string, Quiz> = {};
    QUIZ_SLOT_IDS.forEach((id, i) => {
        out[id] = pool[i % pool.length];
    });
    return out;
}

function hash(s: string) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return h >>> 0;
}
