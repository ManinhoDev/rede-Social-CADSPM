import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';
import chatRoutes from './routes/chat.routes';
import forumRoutes from './routes/forum.routes';

dotenv.config();

const app = express();

const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:4200';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

// Healthcheck básico (antes das rotas principais)
app.get('/api/health', (_req, res) => {
	res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/forum', forumRoutes);

// 404 fallback
app.use((req, res) => {
	res.status(404).json({ erro: 'Rota não encontrada', path: req.originalUrl });
});

// Middleware de erro central
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
	console.error('[ERRO_GLOBAL]', err);
	res.status(err?.status || 500).json({ erro: 'Erro interno', detalhe: err?.message });
});

export default app;
