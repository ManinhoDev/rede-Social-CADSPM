import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

const getAuthed = (req: Request) => {
  const token = req.headers.authorization?.split(' ')[1];
  return createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string, { global: { headers: { Authorization: `Bearer ${token}` } } });
};

// GET /api/posts/:postId/comments
export const listComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { data, error } = await supabase
      .from('comentarios')
      .select('id, conteudo, created_at, usuario_id, usuarios:usuario_id(id, nome, avatar_url)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error) return res.status(400).json({ erro: error.message });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
};

// POST /api/posts/:postId/comments { conteudo }
export const createComment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ erro: 'Não autenticado' });
    const { postId } = req.params;
    const { conteudo } = req.body as { conteudo: string };
    if (!conteudo || !conteudo.trim()) return res.status(400).json({ erro: 'Conteúdo obrigatório' });
    const authed = getAuthed(req);
    const { data, error } = await authed
      .from('comentarios')
      .insert({ post_id: postId, usuario_id: user.id, conteudo: conteudo.trim() })
      .select('id, conteudo, created_at, usuario_id, usuarios:usuario_id(id, nome, avatar_url)')
      .single();
    if (error) return res.status(400).json({ erro: error.message });
    res.status(201).json(data);
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
};

// DELETE /api/posts/:postId/comments/:id
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ erro: 'Não autenticado' });
    const { id } = req.params;
    const authed = getAuthed(req);
    const { error } = await authed.from('comentarios').delete().eq('id', id).eq('usuario_id', user.id);
    if (error) return res.status(400).json({ erro: error.message });
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
};