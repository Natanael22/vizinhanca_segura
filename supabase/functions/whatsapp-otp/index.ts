import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'npm:@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, phone, code } = await req.json()
    
    // Validations
    if (!phone) throw new Error('Telefone obrigatório')
    if (action === 'verify' && !code) throw new Error('Código obrigatório')

    // Create Supabase client with Service Role to bypass RLS for OTP table
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    if (action === 'send') {
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString()
      
      // Store in DB
      const { error: dbError } = await supabase
        .from('otp_requests')
        .upsert({ 
          phone, 
          code: generatedCode, 
          expires_at: new Date(Date.now() + 5 * 60000).toISOString() // 5 minutes validity
        })

      if (dbError) throw dbError

      // Send via WhatsApp
      const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
      const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')

      if (!phoneNumberId || !accessToken) {
        throw new Error('WhatsApp configuration missing')
      }

      let formattedPhone = phone.replace(/\D/g, '')
      if (formattedPhone.length === 11 && !formattedPhone.startsWith('55')) {
        formattedPhone = '55' + formattedPhone
      }

      const response = await fetch(
        `https://graph.facebook.com/v17.0/${phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: formattedPhone,
            type: 'template',
            template: {
              name: 'envio_token',
              language: { code: 'pt_BR' },
              components: [
                {
                  type: 'body',
                  parameters: [{ type: 'text', text: generatedCode }]
                },
                {
                  type: 'button',
                  sub_type: 'url',
                  index: 0,
                  parameters: [{ type: 'text', text: generatedCode }]
                }
              ]
            }
          })
        }
      )

      const waData = await response.json()
      if (!response.ok) {
        console.error('WA Error:', waData)
        throw new Error(waData.error?.message || 'Falha ao enviar via WhatsApp')
      }

      return new Response(JSON.stringify({ success: true, message: 'OTP sent' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } 
    
    if (action === 'verify') {
      // Validate code
      const { data, error } = await supabase
        .from('otp_requests')
        .select('*')
        .eq('phone', phone)
        .single()

      if (error || !data) {
        throw new Error('Código não encontrado ou expirado')
      }

      const isExpired = new Date(data.expires_at) < new Date()
      if (isExpired) {
        // Delete expired
        await supabase.from('otp_requests').delete().eq('phone', phone)
        throw new Error('Código expirado')
      }

      if (data.code !== code) {
        throw new Error('Código incorreto')
      }

      // Valid code, delete it so it can't be reused
      await supabase.from('otp_requests').delete().eq('phone', phone)

      return new Response(JSON.stringify({ success: true, message: 'OTP verified' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    throw new Error('Ação inválida')

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
