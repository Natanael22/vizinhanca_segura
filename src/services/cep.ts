export async function fetchAddressByCEP(cep: string) {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) throw new Error('CEP inválido');

    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const data = await response.json();

    if (data.erro) throw new Error('CEP não encontrado');

    return {
        neighborhood: data.bairro,
        city: data.localidade,
        state: data.uf,
        street: data.logradouro
    };
}
