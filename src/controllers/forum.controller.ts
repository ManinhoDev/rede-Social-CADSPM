import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../config/supabase';

const getAuthed = (req: Request) => {
  const token = req.headers.authorization?.split(' ')[1];
  return createClient(process.env.SUPABASE_URL as string, process.env.SUPABASE_KEY as string, { global: { headers: { Authorization: `Bearer ${token}` } } });
};

export const listTopics = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('forum_topics')
      .select('id, titulo, descricao, categoria, criador_id, is_fixo, created_at, usuarios:criador_id(id, nome, avatar_url)')
      .order('is_fixo', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) return res.status(400).json({ erro: error.message });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
};

export const createTopic = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ erro: 'Não autenticado' });
    const { titulo, descricao, categoria } = req.body as { titulo: string; descricao: string; categoria?: string };
    if (!titulo || !descricao) return res.status(400).json({ erro: 'Título e descrição obrigatórios' });
    const authed = getAuthed(req);
    const { data, error } = await authed
      .from('forum_topics')
      .insert({ titulo, descricao, categoria: categoria || 'Geral', criador_id: user.id })
      .select('id, titulo, descricao, categoria, criador_id, is_fixo, created_at, usuarios:criador_id(id, nome, avatar_url)')
      .single();
    if (error) return res.status(400).json({ erro: error.message });
    res.status(201).json(data);
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
};

export const deleteTopic = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ erro: 'Não autenticado' });
    const { id } = req.params;
    const authed = getAuthed(req);
    const { error } = await authed.from('forum_topics').delete().eq('id', id).eq('criador_id', user.id);
    if (error) return res.status(400).json({ erro: error.message });
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
};

export const listMessages = async (req: Request, res: Response) => {
  try {
    const { topicoId } = req.params;
    const { data, error } = await supabase
      .from('forum_messages')
      .select('id, conteudo, created_at, usuario_id, topico_id, usuarios:usuario_id(id, nome, avatar_url)')
      .eq('topico_id', topicoId)
      .order('created_at', { ascending: true });
    if (error) return res.status(400).json({ erro: error.message });
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
};

export const createMessage = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) return res.status(401).json({ erro: 'Não autenticado' });
    const { topicoId } = req.params;
    const { conteudo } = req.body as { conteudo: string };
    if (!conteudo) return res.status(400).json({ erro: 'Conteúdo obrigatório' });
    const authed = getAuthed(req);
    const { data, error } = await authed
      .from('forum_messages')
      .insert({ topico_id: topicoId, usuario_id: user.id, conteudo: conteudo.trim() })
      .select('id, conteudo, created_at, usuario_id, topico_id, usuarios:usuario_id(id, nome, avatar_url)')
      .single();
    if (error) return res.status(400).json({ erro: error.message });
    res.status(201).json(data);
  } catch (e: any) {
    res.status(500).json({ erro: e.message });
  }
};
