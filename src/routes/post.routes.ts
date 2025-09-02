import { Router } from 'express';
import { createPost, getPosts, likePost, unlikePost, deletePost, getMyPosts } from '../controllers/post.controller';
import { listComments, createComment, deleteComment } from '../controllers/comment.controller';
import { supabaseAuthMiddleware } from '../middleware/supabase-auth.middleware';

const router = Router();
router.post('/', supabaseAuthMiddleware, createPost);
router.get('/', supabaseAuthMiddleware, getPosts);
router.get('/mine', supabaseAuthMiddleware, getMyPosts);
router.get('/:postId/comments', supabaseAuthMiddleware, listComments);
router.post('/:postId/comments', supabaseAuthMiddleware, createComment);
router.delete('/:postId/comments/:id', supabaseAuthMiddleware, deleteComment);
router.post('/:id/like', supabaseAuthMiddleware, likePost);
router.delete('/:id/like', supabaseAuthMiddleware, unlikePost);
router.delete('/:id', supabaseAuthMiddleware, deletePost);

export default router;
