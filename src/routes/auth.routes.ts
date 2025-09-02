import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { supabaseAuthMiddleware } from '../middleware/supabase-auth.middleware';
import { supabase } from '../config/supabase';

const router = Router();

router.post('/registro', authController.registro);
router.post('/login', authController.login);
router.get('/me', supabaseAuthMiddleware, authController.me);
router.post('/logout', supabaseAuthMiddleware, authController.logout);

// Rota de debug (NÃO usar em produção)
router.get('/debug', async (_req, res) => {
	try {
		const envInfo = {
			hasUrl: !!process.env.SUPABASE_URL,
			hasAnonKey: !!process.env.SUPABASE_KEY,
			hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
			nodeEnv: process.env.NODE_ENV || null
		};
		const simple = await supabase.from('usuarios').select('id').limit(1);
		res.json({ envInfo, queryOk: !simple.error, queryError: simple.error?.message, rowCount: simple.data?.length });
	} catch (e: any) {
		res.status(500).json({ erro: 'Falha debug', detalhe: e.message });
	}
});

export default router;
