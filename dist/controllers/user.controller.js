"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMyStatus = exports.listUsers = exports.unfollowUser = exports.followUser = void 0;
const supabase_1 = require("../config/supabase");
const followUser = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ erro: 'Não autenticado' });
        const { id: followingId } = req.params;
        if (user.id === followingId)
            return res.status(400).json({ erro: 'Não pode seguir a si mesmo' });
        const { error } = await supabase_1.supabase.from('followers').insert({ follower_id: user.id, following_id: followingId });
        if (error)
            return res.status(400).json({ erro: error.message });
        res.json({ mensagem: 'Seguindo' });
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.followUser = followUser;
const unfollowUser = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ erro: 'Não autenticado' });
        const { id: followingId } = req.params;
        const { error } = await supabase_1.supabase.from('followers').delete().eq('follower_id', user.id).eq('following_id', followingId);
        if (error)
            return res.status(400).json({ erro: error.message });
        res.json({ mensagem: 'Parou de seguir' });
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.unfollowUser = unfollowUser;
const listUsers = async (_req, res) => {
    try {
        const { data, error } = await supabase_1.supabase.from('usuarios').select('id, nome, email, avatar_url, is_online, last_seen, is_admin').order('nome');
        if (error)
            return res.status(400).json({ erro: error.message });
        res.json(data);
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.listUsers = listUsers;
const updateMyStatus = async (req, res) => {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ erro: 'Não autenticado' });
        const { online } = req.body;
        const { error } = await supabase_1.supabase.from('usuarios').update({ is_online: !!online, last_seen: new Date().toISOString() }).eq('id', user.id);
        if (error)
            return res.status(400).json({ erro: error.message });
        res.json({ mensagem: 'Status atualizado', online: !!online });
    }
    catch (e) {
        res.status(500).json({ erro: e.message });
    }
};
exports.updateMyStatus = updateMyStatus;
