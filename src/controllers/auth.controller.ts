import { Request, Response } from 'express';
import { supabase, adminSupabase } from '../config/supabase';

// Tipos auxiliares
interface RegistroDTO { email: string; senha: string; nome: string; }
interface LoginDTO { email: string; senha: string; }

export const authController = {
    // POST /api/auth/registro
    async registro(req: Request, res: Response) {
        try {
            const { email, senha, nome } = req.body as RegistroDTO;
            if (!email || !senha || !nome) {
                return res.status(400).json({ erro: 'Campos obrigatórios: email, senha, nome' });
            }

            let signUpData: any = null;
            let signUpError: any = null;
            if (adminSupabase) {
                // Cria usuário já confirmado usando service role
                const { data, error } = await (adminSupabase as any).auth.admin.createUser({
                    email,
                    password: senha,
                    email_confirm: true,
                    user_metadata: { name: nome }
                });
                signUpData = data;
                signUpError = error;
            } else {
                const redirectBase = process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:4200';
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password: senha,
                    options: {
                        data: { name: nome },
                        emailRedirectTo: `${redirectBase.replace(/\/$/, '')}/auth/callback`
                    }
                });
                signUpData = data;
                signUpError = error;
            }
            if (signUpError) {
                console.error('[registro] signUpError:', signUpError);
                const msg = signUpError.message || 'Erro no registro';
                const code = (signUpError as any).status || signUpError.name || 'SIGNUP_ERROR';
                // Sempre retorna mensagem original + código para facilitar debug no frontend
                return res.status(400).json({ erro: msg, codigo: code });
            }

            const userId = signUpData.user?.id;
            if (!userId) return res.status(500).json({ erro: 'Falha ao criar usuário' });

            // Trigger no banco cria o perfil automaticamente.
            // Buscar perfil recém criado (pode haver pequeno delay; tentamos uma vez).
            let { data: perfil } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', userId)
                .single();
            if (!perfil) {
                // pequeno retry após 200ms
                await new Promise(r => setTimeout(r, 200));
                const retry = await supabase.from('usuarios').select('*').eq('id', userId).single();
                perfil = retry.data || null;
            }

            // Se usamos admin createUser não vem session; vamos gerar sessão manual fazendo login automático
            let token: string | null = null;
            if (signUpData.session?.access_token) {
                token = signUpData.session.access_token;
            } else {
                // login automático (sem exigir confirmação) usando credenciais
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({ email, password: senha });
                if (!loginError && loginData.session) token = loginData.session.access_token;
            }
            res.status(201).json({ usuario: perfil, token, requiresEmailConfirmation: false });
        } catch (e: any) {
            res.status(500).json({ erro: e.message });
        }
    },

    // POST /api/auth/login
    async login(req: Request, res: Response) {
        try {
            const { email, senha } = req.body as LoginDTO;
            if (!email || !senha) return res.status(400).json({ erro: 'Informe email e senha' });
            console.log('[LOGIN] tentativa', { email });
            const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
            if (error) {
                console.error('[login] error:', error);
                const original = error.message || 'Credenciais inválidas';
                const msg = original.includes('Email not confirmed') ? 'Email não confirmado. Verifique sua caixa de entrada.' : original;
                const code = (error as any).status || error.name || 'LOGIN_ERROR';
                return res.status(401).json({ erro: msg, codigo: code, detalhe: original });
            }
            if (!data.session || !data.user) {
                return res.status(401).json({ erro: 'Sessão não criada (possível necessidade de confirmar email)' });
            }

            const userId = data.user.id;

            let { data: perfil } = await supabase
                .from('usuarios')
                .select('*')
                .eq('id', userId)
                .single();
            if (!perfil) {
                await new Promise(r => setTimeout(r, 200));
                const retry = await supabase.from('usuarios').select('*').eq('id', userId).single();
                perfil = retry.data || null;
            }
            // Atualiza status online (sempre)
            await supabase.from('usuarios').update({ is_online: true, last_seen: new Date().toISOString() }).eq('id', userId);
            console.log('[LOGIN] sucesso', { userId, perfilEncontrado: !!perfil });
            res.json({ token: data.session.access_token, usuario: perfil });
        } catch (e: any) {
            console.error('[LOGIN] exceção', e);
            res.status(500).json({ erro: e.message });
        }
    },

    // GET /api/auth/me
    async me(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(401).json({ erro: 'Não autenticado' });
            const { data: perfil, error } = await supabase.from('usuarios').select('*').eq('id', userId).single();
            if (error) return res.status(404).json({ erro: 'Usuário não encontrado' });
            res.json(perfil);
        } catch (e: any) {
            res.status(500).json({ erro: e.message });
        }
    },

    // POST /api/auth/logout (opcional)
    async logout(req: Request, res: Response) {
        try {
            const token = req.headers.authorization?.split(' ')[1];
            if (token) {
                await supabase.auth.signOut();
            }
            res.status(200).json({ mensagem: 'Logout efetuado' });
        } catch (e: any) {
            res.status(500).json({ erro: e.message });
        }
    }
};
