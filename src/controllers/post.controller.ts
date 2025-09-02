import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { createClient } from '@supabase/supabase-js';

const getAuthedClient = (req: Request) => {
    const token = req.headers.authorization?.split(' ')[1];
    const url = process.env.SUPABASE_URL as string;
    const key = process.env.SUPABASE_KEY as string; // anon key
    return createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` } } });
};

// POST /api/posts
export const createPost = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ erro: 'Não autenticado' });
        const { conteudo } = req.body;
        if (!conteudo) return res.status(400).json({ erro: 'Conteúdo obrigatório' });
        const authed = getAuthedClient(req);
        const { data, error } = await authed
            .from('publicacoes')
            .insert({ conteudo, usuario_id: user.id })
            .select('id, conteudo, created_at, usuario_id, usuarios:usuario_id(id, nome, avatar_url)')
            .single();
        if (error) return res.status(400).json({ erro: error.message });
        res.status(201).json(data);
    } catch (e: any) {
        res.status(500).json({ erro: e.message });
    }
};

// GET /api/posts
export const getPosts = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const authed = user ? getAuthedClient(req) : supabase;
        const { data: posts, error } = await authed
            .from('publicacoes')
            .select('id, conteudo, created_at, usuario_id, usuarios:usuario_id(id, nome, avatar_url), likes:likes(count)')
            .order('created_at', { ascending: false });
        if (error) return res.status(400).json({ erro: error.message });

        let likedSet = new Set<string>();
        if (user) {
            const { data: myLikes } = await authed
                .from('likes')
                .select('post_id')
                .eq('usuario_id', user.id);
            if (Array.isArray(myLikes)) {
                likedSet = new Set(myLikes.map(l => (l as any).post_id));
            }
        }

        const mapped = (posts || []).map(p => ({ ...p, liked: likedSet.has((p as any).id) }));
        res.json(mapped);
    } catch (e: any) {
        res.status(500).json({ erro: e.message });
    }
};

// GET /api/posts/mine
export const getMyPosts = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ erro: 'Não autenticado' });
        const authed = getAuthedClient(req);
        const { data: posts, error } = await authed
            .from('publicacoes')
            .select('id, conteudo, created_at, usuario_id, usuarios:usuario_id(id, nome, avatar_url), likes:likes(count)')
            .eq('usuario_id', user.id)
            .order('created_at', { ascending: false });
        if (error) return res.status(400).json({ erro: error.message });
        const { data: myLikes } = await authed.from('likes').select('post_id').eq('usuario_id', user.id);
        const likedSet = new Set((myLikes || []).map(l => (l as any).post_id));
        res.json((posts || []).map(p => ({ ...p, liked: likedSet.has((p as any).id) })));
    } catch (e: any) {
        res.status(500).json({ erro: e.message });
    }
};

// POST /api/posts/:id/like
export const likePost = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ erro: 'Não autenticado' });
        const { id } = req.params;
    const authed = getAuthedClient(req);
    const { error } = await authed.from('likes').insert({ post_id: id, usuario_id: user.id });
        if (error) return res.status(400).json({ erro: error.message });
        res.json({ mensagem: 'Curtido' });
    } catch (e: any) {
        res.status(500).json({ erro: e.message });
    }
};

// DELETE /api/posts/:id/like
export const unlikePost = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ erro: 'Não autenticado' });
        const { id } = req.params;
    const authed = getAuthedClient(req);
    const { error } = await authed.from('likes').delete().eq('post_id', id).eq('usuario_id', user.id);
        if (error) return res.status(400).json({ erro: error.message });
        res.json({ mensagem: 'Descurtido' });
    } catch (e: any) {
        res.status(500).json({ erro: e.message });
    }
};

// DELETE /api/posts/:id
export const deletePost = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ erro: 'Não autenticado' });
        const { id } = req.params;
    const authed = getAuthedClient(req);
    const { error } = await authed.from('publicacoes').delete().eq('id', id).eq('usuario_id', user.id);
        if (error) return res.status(400).json({ erro: error.message });
        return res.status(204).send();
    } catch (e: any) {
        res.status(500).json({ erro: e.message });
    }
};
