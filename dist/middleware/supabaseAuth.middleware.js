"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAuthMiddleware = void 0;
const supabase_1 = require("../config/supabase");
const supabaseAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ erro: 'Token ausente' });
        }
        const token = authHeader.split(' ')[1];
        const { data, error } = await supabase_1.supabase.auth.getUser(token);
        if (error || !data.user) {
            return res.status(401).json({ erro: 'Token inválido' });
        }
        req.user = { id: data.user.id, email: data.user.email ?? null, role: data.user.role ?? null };
        next();
    }
    catch (e) {
        res.status(401).json({ erro: 'Não autorizado' });
    }
};
exports.supabaseAuthMiddleware = supabaseAuthMiddleware;
