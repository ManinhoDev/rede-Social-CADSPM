import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; // anon key
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // opcional, NÃO expor no frontend

if (!supabaseUrl || !supabaseKey) {
    throw new Error('As variáveis de ambiente SUPABASE_URL e SUPABASE_KEY são obrigatórias');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
export const adminSupabase = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : null;
