import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicoDados } from '../../servicos/servico-dados';
import { ServicoAutenticacao } from '../../servicos/servico-autenticacao';
import { TopicoForum, MensagemForum, CategoriaForum } from '../../modelos/modelo-forum';
import { Usuario } from '../../modelos/modelo-usuario';

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.css'
})
export class ForumComponent {
  topicos: TopicoForum[] = [];
  categorias: CategoriaForum[] = [];
  topicoSelecionado: TopicoForum | null = null;
  usuarioLogado: Usuario | null = null;
  carregandoTopicos: boolean = false;
  carregandoMensagens: boolean = false;
  erroTopicos: string | null = null;
  
  // Variáveis para criar novo tópico
  criandoTopico: boolean = false;
  novoTopicTitulo: string = '';
  novoTopicDescricao: string = '';
  novoTopicCategoria: string = 'Geral';
  
  // Variáveis para mensagens
  novaMensagem: string = '';
  filtrandoCategoria: string = 'Todas';

  constructor(
    private servicoDados: ServicoDados,
    private servicoAutenticacao: ServicoAutenticacao
  ) {}

  ngOnInit(): void {
    this.usuarioLogado = this.servicoAutenticacao.getUsuarioLogado();
    this.carregarTopicos();
    this.categorias = this.servicoDados.getCategoriasForum();
  }

  carregarTopicos(): void {
    this.carregandoTopicos = true;
    this.erroTopicos = null;
    this.servicoDados.listarTopicos$().subscribe({
      next: lista => {
        this.topicos = this.filtrandoCategoria === 'Todas'
          ? lista
          : lista.filter(t => t.categoria === this.filtrandoCategoria);
      },
      error: _ => this.erroTopicos = 'Falha ao carregar tópicos',
      complete: () => this.carregandoTopicos = false
    });
  }

  selecionarTopico(topico: TopicoForum): void {
    this.topicoSelecionado = topico;
    this.carregandoMensagens = true;
    this.servicoDados.listarMensagensTopico$(topico.id).subscribe({
      next: msgs => { if (this.topicoSelecionado && this.topicoSelecionado.id === topico.id) this.topicoSelecionado.mensagens = msgs; },
      error: _ => console.error('Falha ao carregar mensagens'),
      complete: () => this.carregandoMensagens = false
    });
  }

  voltarParaLista(): void {
    this.topicoSelecionado = null;
    this.novaMensagem = '';
  }

  criarNovoTopico(): void {
    if (this.novoTopicTitulo.trim() && this.novoTopicDescricao.trim() && this.usuarioLogado) {
      this.servicoDados.criarTopico(this.novoTopicTitulo, this.novoTopicDescricao, this.novoTopicCategoria, this.usuarioLogado)
        .subscribe({
          next: topico => {
            // Insere no topo
            this.topicos = [topico, ...this.topicos];
            this.criandoTopico = false;
            this.novoTopicTitulo = '';
            this.novoTopicDescricao = '';
            this.novoTopicCategoria = 'Geral';
          },
          error: _ => alert('Falha ao criar tópico')
        });
    }
  }

  enviarMensagem(): void {
    if (this.novaMensagem.trim() && this.topicoSelecionado && this.usuarioLogado) {
      const texto = this.novaMensagem;
      this.novaMensagem = '';
      const idTopico = this.topicoSelecionado.id;
      this.servicoDados.adicionarMensagemForum(idTopico, texto, this.usuarioLogado)
        .subscribe({
          next: msg => {
            if (this.topicoSelecionado && this.topicoSelecionado.id === idTopico) {
              this.topicoSelecionado.mensagens = [...this.topicoSelecionado.mensagens, msg];
            }
          },
          error: _ => alert('Falha ao enviar mensagem')
        });
    }
  }

  curtirMensagem(mensagem: MensagemForum): void {
    alert('Curtir mensagem ainda não implementado');
  }

  deletarTopico(topico: TopicoForum): void {
  if (this.usuarioLogado && (topico.criadorId === this.usuarioLogado.id || this.usuarioLogado.isAdmin)) {
      const confirmacao = confirm('Tem certeza que deseja excluir este tópico?');
      if (confirmacao) {
        this.servicoDados.deletarTopico(topico.id, this.usuarioLogado.id).subscribe({
          next: () => {
            this.topicos = this.topicos.filter(t => t.id !== topico.id);
            if (this.topicoSelecionado?.id === topico.id) this.voltarParaLista();
          },
          error: _ => alert('Falha ao deletar tópico')
        });
      }
    }
  }

  fixarTopico(topico: TopicoForum): void {
    alert('Fixar tópico ainda não implementado');
  }

  filtrarPorCategoria(categoria: string): void {
    this.filtrandoCategoria = categoria;
    this.carregarTopicos();
  }

  podeDeletarTopico(topico: TopicoForum): boolean {
    return this.usuarioLogado !== null && 
           (topico.criadorId === this.usuarioLogado.id || this.usuarioLogado.isAdmin);
  }

  formatarData(data: Date): string {
    return new Date(data).toLocaleString('pt-BR');
  }

  getTopicosFixos(): TopicoForum[] {
    return this.topicos.filter(t => t.isFixo);
  }

  getTopicosNormais(): TopicoForum[] {
    return this.topicos.filter(t => !t.isFixo);
  }
}