import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { createClient } from '@supabase/supabase-js';

const getAuthedClient = (req: Request) => {
  const token = req.headers.authorization?.split(' ')[1];
  const url = process.env.SUPABASE_URL as string;
  const key = process.env.SUPABASE_KEY as string;
  return createClient(url, key, { global: { headers: { Authorization: `Bearer ${token}` } } });
};

// GET /api/chat/:otherUserId/messages
export const listMessages = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ erro: 'Não autenticado' });
    const { otherUserId } = req.params;
    if (!otherUserId) return res.status(400).json({ erro: 'Parâmetro otherUserId obrigatório' });

    const filter = `and(remetente_id.eq.${user.id},destinatario_id.eq.${otherUserId}),and(remetente_id.eq.${otherUserId},destinatario_id.eq.${user.id})`;
  const authed = getAuthedClient(req);
  const { data, error } = await authed
      .from('mensagens')
      .select('id, remetente_id, destinatario_id, conteudo, lida, created_at')
      .or(filter)
      .order('created_at', { ascending: true });
    if (error) return res.status(400).json({ erro: error.message });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
};

// POST /api/chat/:otherUserId/messages { conteudo }
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ erro: 'Não autenticado' });
    const { otherUserId } = req.params;
    const { conteudo } = req.body as { conteudo: string };
    if (!otherUserId || !conteudo || !conteudo.trim()) return res.status(400).json({ erro: 'Destinatário e conteúdo obrigatórios' });

  const authed = getAuthedClient(req);
  const { data, error } = await authed.from('mensagens')
      .insert({ remetente_id: user.id, destinatario_id: otherUserId, conteudo: conteudo.trim() })
      .select('id, remetente_id, destinatario_id, conteudo, lida, created_at')
      .single();
    if (error) return res.status(400).json({ erro: error.message });
    res.status(201).json(data);
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
};
