"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessage = exports.listMessages = exports.deleteTopic = exports.createTopic = exports.listTopics = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const supabase_1 = require("../config/supabase");
const getAuthed = (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    return (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY, { global: { headers: { Authorization: `Bearer ${token}` } } });
};
const listTopics = async (_req, res) => {
    try {
        const { data, error } = await supabase_1.supabase
            .from('forum_topics')
            .select('id, titulo, descricao, categoria, criador_id, is_fixo, created_at, usuarios:criador_id(id, nome, avatar_url)')
            .order('is_fixo', { ascending: false })
            .order('created_at', { ascending: false });
        if (error)
            return res.status(400).json({ erro: error.message });
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.listTopics = listTopics;
const createTopic = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ erro: 'Não autenticado' });
        const { titulo, descricao, categoria } = req.body;
        if (!titulo || !descricao)
            return res.status(400).json({ erro: 'Título e descrição obrigatórios' });
        const authed = getAuthed(req);
        const { data, error } = await authed
            .from('forum_topics')
            .insert({ titulo, descricao, categoria: categoria || 'Geral', criador_id: user.id })
            .select('id, titulo, descricao, categoria, criador_id, is_fixo, created_at, usuarios:criador_id(id, nome, avatar_url)')
            .single();
        if (error)
            return res.status(400).json({ erro: error.message });
        res.status(201).json(data);
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.createTopic = createTopic;
const deleteTopic = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ erro: 'Não autenticado' });
        const { id } = req.params;
        const authed = getAuthed(req);
        const { error } = await authed.from('forum_topics').delete().eq('id', id).eq('criador_id', user.id);
        if (error)
            return res.status(400).json({ erro: error.message });
        res.status(204).send();
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.deleteTopic = deleteTopic;
const listMessages = async (req, res) => {
    try {
        const { topicoId } = req.params;
        const { data, error } = await supabase_1.supabase
            .from('forum_messages')
            .select('id, conteudo, created_at, usuario_id, topico_id, usuarios:usuario_id(id, nome, avatar_url)')
            .eq('topico_id', topicoId)
            .order('created_at', { ascending: true });
        if (error)
            return res.status(400).json({ erro: error.message });
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.listMessages = listMessages;
const createMessage = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ erro: 'Não autenticado' });
        const { topicoId } = req.params;
        const { conteudo } = req.body;
        if (!conteudo)
            return res.status(400).json({ erro: 'Conteúdo obrigatório' });
        const authed = getAuthed(req);
        const { data, error } = await authed
            .from('forum_messages')
            .insert({ topico_id: topicoId, usuario_id: user.id, conteudo: conteudo.trim() })
            .select('id, conteudo, created_at, usuario_id, topico_id, usuarios:usuario_id(id, nome, avatar_url)')
            .single();
        if (error)
            return res.status(400).json({ erro: error.message });
        res.status(201).json(data);
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.createMessage = createMessage;
