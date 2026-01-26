const PHONE_NUMBER_ID = import.meta.env.VITE_WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN;

export async function sendOTP(phone: string, code: string) {
    if (!PHONE_NUMBER_ID || !ACCESS_TOKEN) {
        throw new Error('Configurações do WhatsApp não encontradas no arquivo .env (VITE_WHATSAPP_PHONE_NUMBER_ID e VITE_WHATSAPP_ACCESS_TOKEN)');
    }

    // Format phone: remove non-digits and ensure it has 55 (Brazil)
    let formattedPhone = phone.replace(/\D/g, '');
    if (formattedPhone.length === 11 && !formattedPhone.startsWith('55')) {
        formattedPhone = '55' + formattedPhone;
    }

    // For debugging/test
    //console.log(`Enviando código ${code} para ${formattedPhone}`);

    try {
        const response = await fetch(
            `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${ACCESS_TOKEN}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: formattedPhone,
                    type: 'template',
                    template: {
                        name: 'envio_token',
                        language: {
                            code: 'pt_BR'
                        },
                        components: [
                            {
                                type: 'body',
                                parameters: [
                                    {
                                        type: 'text',
                                        text: `${code}`
                                    }
                                ]
                            },
                            {
                                type: 'button',
                                sub_type: 'url',
                                index: 0,
                                parameters: [
                                    {
                                        type: 'text',
                                        text: `${code}`
                                    }
                                ]
                            }
                        ]
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error('WhatsApp API Error Response:', data);
            throw new Error(data.error?.message || 'Falha ao enviar código via WhatsApp.');
        }

        return data;
    } catch (error: any) {
        console.error('WhatsApp Service Error:', error.message);
        throw error;
    }
}
