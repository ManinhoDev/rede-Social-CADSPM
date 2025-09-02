import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from '../modelos/modelo-usuario';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { supabase } from './supabase-client';

@Injectable({ providedIn: 'root' })
export class ServicoAutenticacao {
  private usuarioLogado: Usuario | null = null;
  private readonly STORAGE_TOKEN = 'auth_token';
  private readonly STORAGE_USER = 'usuarioLogado';

  constructor(private router: Router, private http: HttpClient) {
    this.restoreSession();
  }

  private restoreSession() {
    const token = localStorage.getItem(this.STORAGE_TOKEN);
    const rawUser = localStorage.getItem(this.STORAGE_USER);
    if (token && rawUser) {
      try {
        this.usuarioLogado = JSON.parse(rawUser);
        this.me().subscribe({
          next: user => {
            this.usuarioLogado = user;
            localStorage.setItem(this.STORAGE_USER, JSON.stringify(user));
          },
          error: () => this.logout()
        });
      } catch { this.logout(); }
    }
  }

  private setSession(token: string, usuario: any) {
    localStorage.setItem(this.STORAGE_TOKEN, token);
    localStorage.setItem(this.STORAGE_USER, JSON.stringify(usuario));
    this.usuarioLogado = usuario;
  }

  getToken(): string | null { return localStorage.getItem(this.STORAGE_TOKEN); }

  private authHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({ 'Authorization': `Bearer ${token}` });
  }

  login(email: string, senha: string): Observable<any> {
  if (environment.useSupabaseDirect) {
      if (!supabase) {
        return new Observable(sub => sub.error(new Error('Supabase não configurado')));
      }
      // Modo direto Supabase
      return new Observable(sub => {
  const s = supabase!;
  s.auth.signInWithPassword({ email, password: senha }).then(async ({ data, error }) => {
          if (error || !data.session || !data.user) {
            sub.error(error || new Error('Falha no login'));
            return;
          }
          // Buscar/garantir perfil na tabela usuarios via RPC ou fallback: armazenar user básico
          const meta: any = data.user.user_metadata || {};
          const perfilBasico: any = { id: data.user.id, email: data.user.email, nome: meta['name'] || data.user.email };
          this.setSession(data.session.access_token, perfilBasico);
          this.router.navigate(['/feed']);
          sub.next({ token: data.session.access_token, usuario: perfilBasico });
          sub.complete();
        });
      });
    }
    // Modo API backend
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, { email, senha })
      .pipe(tap(resp => {
        this.setSession(resp.token, resp.usuario);
        this.router.navigate(['/feed']);
      }));
  }

  registro(nome: string, email: string, senha: string): Observable<any> {
  if (environment.useSupabaseDirect) {
      if (!supabase) {
        return new Observable(sub => sub.error(new Error('Supabase não configurado')));
      }
      return new Observable(sub => {
  const s = supabase!;
  s.auth.signUp({ email, password: senha, options: { data: { name: nome } } }).then(({ data, error }) => {
          if (error) { sub.error(error); return; }
          sub.next({ usuario: { id: data.user?.id, email: data.user?.email, nome }, token: data.session?.access_token, requiresEmailConfirmation: !data.session });
          sub.complete();
        });
      });
    }
    return this.http.post<any>(`${environment.apiUrl}/auth/registro`, { nome, email, senha });
  }

  me(): Observable<Usuario> {
  if (environment.useSupabaseDirect) {
      if (!supabase) {
        return new Observable(sub => sub.error(new Error('Supabase não configurado')));
      }
      return new Observable(sub => {
        const token = this.getToken();
        if (!token) { sub.error(new Error('Sem token')); return; }
  const s = supabase!;
  s.auth.getUser(token).then(({ data, error }) => {
          if (error || !data.user) { sub.error(error || new Error('Usuário não encontrado')); return; }
          const meta: any = data.user.user_metadata || {};
          const u: any = { id: data.user.id, email: data.user.email, nome: meta['name'] || data.user.email };
            sub.next(u);
            sub.complete();
        });
      });
    }
    return this.http.get<Usuario>(`${environment.apiUrl}/auth/me`, { headers: this.authHeaders() });
  }

  logout() {
    localStorage.removeItem(this.STORAGE_TOKEN);
    localStorage.removeItem(this.STORAGE_USER);
    this.usuarioLogado = null;
    this.router.navigate(['/login']);
  }

  getUsuarioLogado(): Usuario | null { return this.usuarioLogado; }
  estaLogado(): boolean { return !!this.usuarioLogado; }
  isAdmin(): boolean { return !!this.usuarioLogado?.isAdmin; }
}