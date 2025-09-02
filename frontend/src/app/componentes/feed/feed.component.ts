import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServicoDados } from '../../servicos/servico-dados';
import { ServicoAutenticacao } from '../../servicos/servico-autenticacao';
import { Publicacao } from '../../modelos/modelo-publicacao';
import { Usuario } from '../../modelos/modelo-usuario';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css'
})
export class FeedComponent {
  publicacoes: Publicacao[] = [];
  novaPublicacao: string = '';
  comentarioAtivo: string | null = null;
  novoComentario: string = '';
  usuarioLogado: Usuario | null = null;

  constructor(
    private servicoDados: ServicoDados,
    private servicoAutenticacao: ServicoAutenticacao
  ) {}

  ngOnInit(): void {
    this.usuarioLogado = this.servicoAutenticacao.getUsuarioLogado();
    this.carregarPublicacoes();
  }

  carregarPublicacoes(): void {
    this.servicoDados.listarPublicacoes().subscribe({
      next: posts => this.publicacoes = posts,
      error: _ => console.error('Falha ao carregar publicações')
    });
  }

  publicar(): void {
    if (this.novaPublicacao.trim()) {
      this.servicoDados.criarPublicacao(this.novaPublicacao).subscribe({
        next: _ => { this.novaPublicacao = ''; this.carregarPublicacoes(); },
        error: _ => alert('Erro ao publicar')
      });
    }
  }

  deletarPublicacao(publicacao: Publicacao): void {
    if (confirm('Excluir publicação?')) {
      this.servicoDados.deletarPublicacao(String(publicacao.id)).subscribe({
        next: () => this.carregarPublicacoes(),
        error: _ => alert('Erro ao excluir')
      });
    }
  }

  curtir(publicacao: Publicacao): void {
    const liked = publicacao.liked;
    // Otimista
    publicacao.liked = !liked;
    publicacao.curtidas += liked ? -1 : 1;
    const obs = liked
      ? this.servicoDados.descurtirPublicacao(String(publicacao.id))
      : this.servicoDados.curtirPublicacao(String(publicacao.id));
    obs.subscribe({
      error: _ => {
        // rollback
        publicacao.liked = liked;
        publicacao.curtidas += liked ? 1 : -1;
        alert('Falha ao atualizar curtida');
      }
    });
  }

  toggleComentarios(publicacaoId: string): void {
    this.comentarioAtivo = this.comentarioAtivo === publicacaoId ? null : publicacaoId;
    this.novoComentario = '';
    if (this.comentarioAtivo) {
      const pub = this.publicacoes.find(p => p.id === this.comentarioAtivo);
      if (pub) {
        this.servicoDados.listarComentarios(pub.id).subscribe({
          next: cs => pub.comentarios = cs,
          error: _ => console.error('Falha ao listar comentários')
        });
      }
    }
  }

  comentar(publicacao: Publicacao): void {
    if (!this.novoComentario.trim()) return;
    const texto = this.novoComentario;
    this.novoComentario = '';
    this.servicoDados.criarComentario(publicacao.id, texto).subscribe({
      next: c => {
        publicacao.comentarios = [...publicacao.comentarios, c];
      },
      error: _ => alert('Falha ao comentar')
    });
  }

  formatarData(data: Date): string {
    return new Date(data).toLocaleString('pt-BR');
  }

  podeDeletar(publicacao: Publicacao): boolean {
    return !!this.usuarioLogado && publicacao.usuarioId === this.usuarioLogado.id;
  }
}