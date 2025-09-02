"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePost = exports.unlikePost = exports.likePost = exports.getMyPosts = exports.getPosts = exports.createPost = void 0;
const supabase_1 = require("../config/supabase");
const supabase_js_1 = require("@supabase/supabase-js");
const getAuthedClient = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_KEY; // anon key
    return (0, supabase_js_1.createClient)(url, key, { global: { headers: { Authorization: `Bearer ${token}` } } });
};
// POST /api/posts
const createPost = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ erro: 'Não autenticado' });
        const { conteudo } = req.body;
        if (!conteudo)
            return res.status(400).json({ erro: 'Conteúdo obrigatório' });
        const authed = getAuthedClient(req);
        const { data, error } = await authed
            .from('publicacoes')
            .insert({ conteudo, usuario_id: user.id })
            .select('id, conteudo, created_at, usuario_id, usuarios:usuario_id(id, nome, avatar_url)')
            .single();
        if (error)
            return res.status(400).json({ erro: error.message });
        res.status(201).json(data);
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.createPost = createPost;
// GET /api/posts
const getPosts = async (req, res) => {
    try {
        const user = req.user;
        const authed = user ? getAuthedClient(req) : supabase_1.supabase;
        const { data: posts, error } = await authed
            .from('publicacoes')
            .select('id, conteudo, created_at, usuario_id, usuarios:usuario_id(id, nome, avatar_url), likes:likes(count)')
            .order('created_at', { ascending: false });
        if (error)
            return res.status(400).json({ erro: error.message });
        let likedSet = new Set();
        if (user) {
            const { data: myLikes } = await authed
                .from('likes')
                .select('post_id')
                .eq('usuario_id', user.id);
            if (Array.isArray(myLikes)) {
                likedSet = new Set(myLikes.map(l => l.post_id));
            }
        }
        const mapped = (posts || []).map(p => ({ ...p, liked: likedSet.has(p.id) }));
        res.json(mapped);
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.getPosts = getPosts;
// GET /api/posts/mine
const getMyPosts = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ erro: 'Não autenticado' });
        const authed = getAuthedClient(req);
        const { data: posts, error } = await authed
            .from('publicacoes')
            .select('id, conteudo, created_at, usuario_id, usuarios:usuario_id(id, nome, avatar_url), likes:likes(count)')
            .eq('usuario_id', user.id)
            .order('created_at', { ascending: false });
        if (error)
            return res.status(400).json({ erro: error.message });
        const { data: myLikes } = await authed.from('likes').select('post_id').eq('usuario_id', user.id);
        const likedSet = new Set((myLikes || []).map(l => l.post_id));
        res.json((posts || []).map(p => ({ ...p, liked: likedSet.has(p.id) })));
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.getMyPosts = getMyPosts;
// POST /api/posts/:id/like
const likePost = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ erro: 'Não autenticado' });
        const { id } = req.params;
        const authed = getAuthedClient(req);
        const { error } = await authed.from('likes').insert({ post_id: id, usuario_id: user.id });
        if (error)
            return res.status(400).json({ erro: error.message });
        res.json({ mensagem: 'Curtido' });
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.likePost = likePost;
// DELETE /api/posts/:id/like
const unlikePost = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ erro: 'Não autenticado' });
        const { id } = req.params;
        const authed = getAuthedClient(req);
        const { error } = await authed.from('likes').delete().eq('post_id', id).eq('usuario_id', user.id);
        if (error)
            return res.status(400).json({ erro: error.message });
        res.json({ mensagem: 'Descurtido' });
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.unlikePost = unlikePost;
// DELETE /api/posts/:id
const deletePost = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ erro: 'Não autenticado' });
        const { id } = req.params;
        const authed = getAuthedClient(req);
        const { error } = await authed.from('publicacoes').delete().eq('id', id).eq('usuario_id', user.id);
        if (error)
            return res.status(400).json({ erro: error.message });
        return res.status(204).send();
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.deletePost = deletePost;
