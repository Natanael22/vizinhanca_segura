const ADJECTIVES = [
    'Atento', 'Vigilante', 'Solidário', 'Amigo', 'Protetor',
    'Agente', 'Sentinela', 'Guardião', 'Observador', 'Zeloso'
];

const NOUNS = [
    'Bairro', 'Vila', 'Rua', 'Casa', 'Cidade',
    'Parque', 'Jardim', 'Praça', 'Lote', 'Bloco'
];

/**
 * Generates a random pseudonym like "Vigilante do Bairro 42A" or "Amigo da Rua 7"
 */
export function generateRandomPseudonym(): string {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    const suffix = Math.floor(100 + Math.random() * 900); // 3-digit random number

    // Choose between "Adj do Noun" or "Adj da Noun"
    const connector = ['Cidade', 'Vila', 'Rua', 'Casa', 'Praça'].includes(noun) ? 'da' : 'do';

    return `${adj} ${connector} ${noun} ${suffix}`;
}
