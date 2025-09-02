"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const post_routes_1 = __importDefault(require("./routes/post.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const forum_routes_1 = __importDefault(require("./routes/forum.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:4200';
app.use((0, cors_1.default)({ origin: allowedOrigin, credentials: true }));
app.use(express_1.default.json());
// Healthcheck básico (antes das rotas principais)
app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
});
// Rotas da API
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/posts', post_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
app.use('/api/forum', forum_routes_1.default);
// 404 fallback
app.use((req, res) => {
    res.status(404).json({ erro: 'Rota não encontrada', path: req.originalUrl });
});
// Middleware de erro central
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, _req, res, _next) => {
    console.error('[ERRO_GLOBAL]', err);
    res.status(err?.status || 500).json({ erro: 'Erro interno', detalhe: err?.message });
});
exports.default = app;
