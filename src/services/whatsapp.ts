import { supabase } from '../lib/supabase';
import { logError } from "./logger";

export async function sendOTP(phone: string) {
    try {
        const { data, error } = await supabase.functions.invoke('whatsapp-otp', {
            body: { action: 'send', phone }
        });

        // invoke doesn't automatically throw on 4xx/5xx if we handle it returning JSON with error
        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        return data;
    } catch (error: any) {
        await logError({
            message: error.message,
            stack: error.stack,
            context: 'whatsapp.sendOTP',
            metadata: { phone: phone ? '***' + phone.slice(-4) : 'unknown' }
        });
        throw error;
    }
}

export async function verifyOTP(phone: string, code: string) {
    try {
        const { data, error } = await supabase.functions.invoke('whatsapp-otp', {
            body: { action: 'verify', phone, code }
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        return data;
    } catch (error: any) {
        await logError({
            message: error.message,
            stack: error.stack,
            context: 'whatsapp.verifyOTP',
            metadata: { phone: phone ? '***' + phone.slice(-4) : 'unknown' }
        });
        throw error;
    }
}
