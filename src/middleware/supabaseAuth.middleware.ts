import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface SupabaseUserInfo {
  id: string;
  email: string | null;
  role: string | null;
}

declare global {
  // Extensão da Request
  namespace Express {
    interface Request {
      user?: SupabaseUserInfo;
    }
  }
}

export const supabaseAuthMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token ausente' });
    }
    const token = authHeader.split(' ')[1];

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return res.status(401).json({ erro: 'Token inválido' });
    }

  req.user = { id: data.user.id, email: data.user.email ?? null, role: (data.user as any).role ?? null };
    next();
  } catch (e: any) {
    res.status(401).json({ erro: 'Não autorizado' });
  }
};
