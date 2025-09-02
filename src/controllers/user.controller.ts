import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const followUser = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ erro: 'Não autenticado' });
        const { id: followingId } = req.params;
        if (user.id === followingId) return res.status(400).json({ erro: 'Não pode seguir a si mesmo' });
        const { error } = await supabase.from('followers').insert({ follower_id: user.id, following_id: followingId });
        if (error) return res.status(400).json({ erro: error.message });
        res.json({ mensagem: 'Seguindo' });
    } catch (e: any) {
        res.status(500).json({ erro: e.message });
    }
};

export const unfollowUser = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ erro: 'Não autenticado' });
        const { id: followingId } = req.params;
        const { error } = await supabase.from('followers').delete().eq('follower_id', user.id).eq('following_id', followingId);
        if (error) return res.status(400).json({ erro: error.message });
        res.json({ mensagem: 'Parou de seguir' });
    } catch (e: any) {
        res.status(500).json({ erro: e.message });
    }
};

export const listUsers = async (_req: Request, res: Response) => {
    try {
        const { data, error } = await supabase.from('usuarios').select('id, nome, email, avatar_url, is_online, last_seen, is_admin').order('nome');
        if (error) return res.status(400).json({ erro: error.message });
        res.json(data);
    } catch (e: any) {
        res.status(500).json({ erro: e.message });
    }
};

export const updateMyStatus = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ erro: 'Não autenticado' });
        const { online } = req.body as { online: boolean };
        const { error } = await supabase.from('usuarios').update({ is_online: !!online, last_seen: new Date().toISOString() }).eq('id', user.id);
        if (error) return res.status(400).json({ erro: error.message });
        res.json({ mensagem: 'Status atualizado', online: !!online });
    } catch (e: any) {
        res.status(500).json({ erro: e.message });
    }
};
