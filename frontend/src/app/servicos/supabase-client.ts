import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Declaração mínima para evitar erro de tipo em import.meta.env (Angular + Vite futuro ou custom bundler)
interface ImportMetaEnv { [key: string]: string | undefined; }
interface ImportMetaCustom { env?: ImportMetaEnv; }
declare const importMeta: ImportMetaCustom; // não substitui import.meta real, apenas tipagem suave

import { environment } from '../../environments/environment';

let supabase: SupabaseClient | undefined;

if (environment.useSupabaseDirect) {
  if (!environment.supabaseUrl || !environment.supabaseAnonKey) {
    console.warn('[Supabase] Modo direto ativado mas supabaseUrl/supabaseAnonKey vazios. Preencha environment.');
  } else {
    supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }
}

export { supabase };
