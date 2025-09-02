import { Router } from 'express';
import { supabaseAuthMiddleware } from '../middleware/supabase-auth.middleware';
import { listTopics, createTopic, deleteTopic, listMessages, createMessage } from '../controllers/forum.controller';

const router = Router();

router.get('/topics', listTopics); // público
router.post('/topics', supabaseAuthMiddleware, createTopic);
router.delete('/topics/:id', supabaseAuthMiddleware, deleteTopic);
router.get('/topics/:topicoId/messages', listMessages);
router.post('/topics/:topicoId/messages', supabaseAuthMiddleware, createMessage);

export default router;
