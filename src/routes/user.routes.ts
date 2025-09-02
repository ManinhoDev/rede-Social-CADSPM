import { Router } from 'express';
import { followUser, unfollowUser, listUsers, updateMyStatus } from '../controllers/user.controller';
import { supabaseAuthMiddleware } from '../middleware/supabase-auth.middleware';

const router = Router();

router.get('/', supabaseAuthMiddleware, listUsers);
router.patch('/me/status', supabaseAuthMiddleware, updateMyStatus);
router.post('/:id/follow', supabaseAuthMiddleware, followUser);
router.delete('/:id/unfollow', supabaseAuthMiddleware, unfollowUser);

export default router;
