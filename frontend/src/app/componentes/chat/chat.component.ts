import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServicoDados } from '../../servicos/servico-dados';
import { ServicoAutenticacao } from '../../servicos/servico-autenticacao';
import { Mensagem } from '../../modelos/modelo-mensagem';
import { Usuario } from '../../modelos/modelo-usuario';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})

export class ChatComponent {
  usuarios: Usuario[] = [];
  usuarioSelecionado: Usuario | null = null;
  mensagens: Mensagem[] = [];
  novaMensagem: string = '';
  usuarioLogado: Usuario | null = null;

  constructor(
    private servicoDados: ServicoDados,
    private servicoAutenticacao: ServicoAutenticacao
  ) {}

  ngOnInit(): void {
    this.usuarioLogado = this.servicoAutenticacao.getUsuarioLogado();
    if (this.usuarioLogado) {
      this.servicoDados.getUsuarios$().subscribe({
        next: lista => {
          this.usuarios = lista.filter(u => u.id !== this.usuarioLogado!.id);
          if (this.usuarios.length > 0) this.selecionarUsuario(this.usuarios[0]);
        },
        error: _ => console.error('Falha ao carregar usuários')
      });
    }
  }

  selecionarUsuario(usuario: Usuario): void {
    this.usuarioSelecionado = usuario;
    if (this.usuarioLogado) {
      this.servicoDados.listarMensagens(usuario.id).subscribe({
        next: msgs => this.mensagens = msgs,
        error: _ => console.error('Falha ao carregar mensagens')
      });
    }
  }

  enviarMensagem(): void {
    if (this.novaMensagem.trim() && this.usuarioSelecionado && this.usuarioLogado) {
      const texto = this.novaMensagem;
      this.novaMensagem = '';
      this.servicoDados.enviarMensagem(this.usuarioLogado, this.usuarioSelecionado.id, texto).subscribe({
        next: msg => { this.mensagens = [...this.mensagens, msg]; },
        error: _ => alert('Erro ao enviar mensagem')
      });
    }
  }

  formatarData(data: Date): string {
    return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
}