import { Router } from 'express';
import { listMessages, sendMessage } from '../controllers/chat.controller';
import { supabaseAuthMiddleware } from '../middleware/supabase-auth.middleware';

const router = Router();

router.get('/:otherUserId/messages', supabaseAuthMiddleware, listMessages);
router.post('/:otherUserId/messages', supabaseAuthMiddleware, sendMessage);

export default router;
