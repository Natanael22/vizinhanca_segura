export const ERROR_MESSAGES: Record<string, { title: string; message: string }> = {
    // Auth Errors
    'Invalid login credentials': {
        title: 'Acesso Negado',
        message: 'E-mail ou senha incorretos. Verifique seus dados e tente novamente.'
    },
    'User already registered': {
        title: 'Conta Existente',
        message: 'Este e-mail ou telefone já está cadastrado. Que tal fazer login em vez de criar uma conta?'
    },
    'Database error saving new user': {
        title: 'Erro no Cadastro',
        message: 'Não conseguimos salvar seu perfil. Tente novamente em alguns instantes.'
    },

    // Geolocation Errors
    'User denied Geolocation': {
        title: 'GPS Desativado',
        message: 'Precisamos do seu GPS para mostrar os alertas próximos. Ative a localização nas configurações do seu navegador.'
    },
    'Position acquisition timed out': {
        title: 'GPS Lento',
        message: 'Não conseguimos obter sua localização a tempo. Verifique se o sinal do GPS está forte.'
    },
    'Only secure origins are allowed': {
        title: 'Conexão Insegura',
        message: 'O GPS só funciona em conexões seguras (HTTPS). Verifique se está acessando o ambiente correto.'
    },

    // Default
    'default': {
        title: 'Ops!',
        message: 'Ocorreu um erro inesperado. Tenta de novo?'
    }
};

export function translateError(errorMsg: string): { title: string; message: string } {
    // Exact match or partial match
    for (const key in ERROR_MESSAGES) {
        if (errorMsg.toLowerCase().includes(key.toLowerCase())) {
            return ERROR_MESSAGES[key];
        }
    }
    return ERROR_MESSAGES['default'];
}
