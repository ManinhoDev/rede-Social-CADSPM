import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Publicacao, Comentario } from '../modelos/modelo-publicacao';
import { Usuario } from '../modelos/modelo-usuario';
import { TopicoForum, MensagemForum, CategoriaForum } from '../modelos/modelo-forum';
import { Mensagem } from '../modelos/modelo-mensagem';
import { ServicoAutenticacao } from './servico-autenticacao';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServicoDados {
  curtirMensagemForum(id: string, id1: string) {
    throw new Error('Method not implemented.');
  }
  constructor(private http: HttpClient, private auth: ServicoAutenticacao) {}

  private headers(): HttpHeaders { return new HttpHeaders({ 'Authorization': `Bearer ${this.auth.getToken()}` }); }

  // POSTS
  listarPublicacoes(): Observable<Publicacao[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/posts`, { headers: this.headers() }).pipe(
      map(rows => rows.map(r => {
        const likesCount = (Array.isArray(r.likes) && r.likes.length ? r.likes[0].count : 0) || 0;
        return new Publicacao(
          r.id,
          r.usuario_id,
            r.usuarios?.nome || 'Usuário',
            r.usuarios?.avatar_url || 'assets/avatar-padrao.jpg',
            r.conteudo,
            new Date(r.created_at),
            likesCount,
            [],
            !!r.liked
          );
      }))
    );
  }

  listarMinhasPublicacoes(): Observable<Publicacao[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/posts/mine`, { headers: this.headers() }).pipe(
      map(rows => rows.map(r => new Publicacao(
        r.id,
        r.usuario_id,
        r.usuarios?.nome || 'Você',
        r.usuarios?.avatar_url || 'assets/avatar-padrao.jpg',
        r.conteudo,
        new Date(r.created_at),
        (Array.isArray(r.likes) && r.likes.length ? r.likes[0].count : 0) || 0,
        [],
        !!r.liked
      )))
    );
  }

  criarPublicacao(conteudo: string): Observable<Publicacao> {
    return this.http.post<any>(`${environment.apiUrl}/posts`, { conteudo }, { headers: this.headers() })
      .pipe(map(r => new Publicacao(
        r.id,
        r.usuario_id,
        this.auth.getUsuarioLogado()?.nome || 'Você',
        this.auth.getUsuarioLogado()?.avatar || 'assets/avatar-padrao.jpg',
        r.conteudo,
        new Date(r.created_at),
        0,
        []
      )));
  }

  deletarPublicacao(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/posts/${id}`, { headers: this.headers() });
  }

  curtirPublicacao(id: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/posts/${id}/like`, {}, { headers: this.headers() });
  }

  descurtirPublicacao(id: string): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/posts/${id}/like`, { headers: this.headers() });
  }

  listarComentarios(postId: string): Observable<Comentario[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/posts/${postId}/comments`, { headers: this.headers() })
      .pipe(map(rows => rows.map(r => new Comentario(
        r.id,
        r.usuario_id,
        r.usuarios?.nome || '',
        r.usuarios?.avatar_url || 'assets/avatar-padrao.jpg',
        r.conteudo,
        new Date(r.created_at)
      ))));
  }

  criarComentario(postId: string, conteudo: string): Observable<Comentario> {
    return this.http.post<any>(`${environment.apiUrl}/posts/${postId}/comments`, { conteudo }, { headers: this.headers() })
      .pipe(map(r => new Comentario(
        r.id,
        r.usuario_id,
        r.usuarios?.nome || '',
        r.usuarios?.avatar_url || 'assets/avatar-padrao.jpg',
        r.conteudo,
        new Date(r.created_at)
      )));
  }

  deletarComentario(postId: string, comentarioId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/posts/${postId}/comments/${comentarioId}`, { headers: this.headers() });
  }

  // ====== Stubs temporários para fórum / usuários (evita erros de compilação) ======
  getCategoriasForum(): CategoriaForum[] { return []; }

  getTopicosForum(): TopicoForum[] { return []; } // legado local (não usado após API)
  getTopicoPorId(_id: string): TopicoForum | undefined { return undefined; }

  listarTopicos$(): Observable<TopicoForum[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/forum/topics`).pipe(
      map(rows => rows.map(r => new TopicoForum(
        r.id,
        r.titulo,
        r.descricao,
        r.criador_id,
        r.usuarios?.nome || '',
        r.usuarios?.avatar_url || 'assets/avatar-padrao.jpg',
        new Date(r.created_at),
        [],
        r.is_fixo,
        r.categoria || 'Geral'
      )))
    );
  }

  criarTopico(titulo: string, descricao: string, categoria: string, _u: Usuario): Observable<TopicoForum> {
    return this.http.post<any>(`${environment.apiUrl}/forum/topics`, { titulo, descricao, categoria }, { headers: this.headers() }).pipe(
      map(r => new TopicoForum(
        r.id, r.titulo, r.descricao, r.criador_id,
        r.usuarios?.nome || '', r.usuarios?.avatar_url || 'assets/avatar-padrao.jpg',
        new Date(r.created_at), [], r.is_fixo, r.categoria || 'Geral'
      ))
    );
  }

  listarMensagensTopico$(topicoId: string): Observable<MensagemForum[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/forum/topics/${topicoId}/messages`).pipe(
      map(rows => rows.map(r => new MensagemForum(
        r.id,
        r.topico_id,
        r.usuario_id,
        r.usuarios?.nome || '',
        r.usuarios?.avatar_url || 'assets/avatar-padrao.jpg',
        r.conteudo,
        new Date(r.created_at),
        0
      )))
    );
  }

  adicionarMensagemForum(topicoId: string, conteudo: string, _u: Usuario): Observable<MensagemForum> {
    return this.http.post<any>(`${environment.apiUrl}/forum/topics/${topicoId}/messages`, { conteudo }, { headers: this.headers() }).pipe(
      map(r => new MensagemForum(
        r.id,
        r.topico_id,
        r.usuario_id,
        r.usuarios?.nome || '',
        r.usuarios?.avatar_url || 'assets/avatar-padrao.jpg',
        r.conteudo,
        new Date(r.created_at),
        0
      ))
    );
  }

  deletarTopico(id: string, _usuarioId: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/forum/topics/${id}`, { headers: this.headers() });
  }

  // fixarTopico: não implementado no backend ainda
  fixarTopico(_id: string): void {}

  // (Futuras funções para usuários, chat e fórum podem ser reimplementadas com API real aqui)

  // ====== Stubs Chat / Usuários ======
  getUsuarios$(): Observable<Usuario[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/users`, { headers: this.headers() }).pipe(
      map(rows => rows.map(r => new Usuario(
        r.id,
        r.nome,
        r.email,
        '',
        r.avatar_url || 'assets/avatar-padrao.jpg',
        r.is_online,
        r.is_admin
      )))
    );
  }

  atualizarStatusOnline(online: boolean): Observable<any> {
    return this.http.patch(`${environment.apiUrl}/users/me/status`, { online }, { headers: this.headers() });
  }
  // Retorna usuários online simples (placeholder local até endpoint dedicado)
  getUsuariosOnline(): Usuario[] {
    // Ideal: consumir endpoint /users?online=1; fallback: retorna usuário logado se online
    const u = this.auth.getUsuarioLogado();
    return u && u.isOnline ? [u] : [];
  }
  getMensagens(_usuarioId: string): Mensagem[] { return []; }
  listarMensagens(otherUserId: string): Observable<Mensagem[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/chat/${otherUserId}/messages`, { headers: this.headers() }).pipe(
      map(rows => rows.map(r => new Mensagem(r.id, r.remetente_id, '', r.destinatario_id, r.conteudo, new Date(r.created_at), r.lida)))
    );
  }

  enviarMensagem(remetente: Usuario, destinatarioId: string, conteudo: string): Observable<Mensagem> {
    return this.http.post<any>(`${environment.apiUrl}/chat/${destinatarioId}/messages`, { conteudo }, { headers: this.headers() })
      .pipe(map(r => new Mensagem(r.id, remetente.id, remetente.nome, r.destinatario_id, r.conteudo, new Date(r.created_at), r.lida)));
  }
}