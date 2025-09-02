"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteComment = exports.createComment = exports.listComments = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_1 = require("../config/supabase");
const getAuthed = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    return (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, { global: { headers: { Authorization: `Bearer ${token}` } } });
};
// GET /api/posts/:postId/comments
const listComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const { data, error } = await supabase_1.supabase
            .from('comentarios')
            .select('id, conteudo, created_at, usuario_id, usuarios:usuario_id(id, nome, avatar_url)')
            .eq('post_id', postId)
            .order('created_at', { ascending: true });
        if (error)
            return res.status(400).json({ erro: error.message });
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.listComments = listComments;
// POST /api/posts/:postId/comments { conteudo }
const createComment = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ erro: 'Não autenticado' });
        const { postId } = req.params;
        const { conteudo } = req.body;
        if (!conteudo || !conteudo.trim())
            return res.status(400).json({ erro: 'Conteúdo obrigatório' });
        const authed = getAuthed(req);
        const { data, error } = await authed
            .from('comentarios')
            .insert({ post_id: postId, usuario_id: user.id, conteudo: conteudo.trim() })
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
exports.createComment = createComment;
// DELETE /api/posts/:postId/comments/:id
const deleteComment = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ erro: 'Não autenticado' });
        const { id } = req.params;
        const authed = getAuthed(req);
        const { error } = await authed.from('comentarios').delete().eq('id', id).eq('usuario_id', user.id);
        if (error)
            return res.status(400).json({ erro: error.message });
        res.status(204).send();
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.deleteComment = deleteComment;
