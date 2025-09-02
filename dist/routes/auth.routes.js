"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const supabase_auth_middleware_1 = require("../middleware/supabase-auth.middleware");
const supabase_1 = require("../config/supabase");
const router = (0, express_1.Router)();
router.post('/registro', auth_controller_1.authController.registro);
router.post('/login', auth_controller_1.authController.login);
router.get('/me', supabase_auth_middleware_1.supabaseAuthMiddleware, auth_controller_1.authController.me);
router.post('/logout', supabase_auth_middleware_1.supabaseAuthMiddleware, auth_controller_1.authController.logout);
// Rota de debug (NÃO usar em produção)
router.get('/debug', async (_req, res) => {
    try {
        const envInfo = {
            hasUrl: !!process.env.SUPABASE_URL,
            hasAnonKey: !!process.env.SUPABASE_KEY,
            hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
            nodeEnv: process.env.NODE_ENV || null
        };
        const simple = await supabase_1.supabase.from('usuarios').select('id').limit(1);
        res.json({ envInfo, queryOk: !simple.error, queryError: simple.error?.message, rowCount: simple.data?.length });
    }
    catch (e) {
        res.status(500).json({ erro: 'Falha debug', detalhe: e.message });
    }
});
exports.default = router;
