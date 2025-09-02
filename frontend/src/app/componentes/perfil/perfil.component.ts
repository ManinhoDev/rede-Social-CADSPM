import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ServicoAutenticacao } from '../../servicos/servico-autenticacao';
import { ServicoDados } from '../../servicos/servico-dados';
import { Usuario } from '../../modelos/modelo-usuario';
import { Publicacao } from '../../modelos/modelo-publicacao';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'] // ⚠️ aqui era "styleUrl", o correto é "styleUrls"
})
export class PerfilComponent {
  usuario: Usuario | null = null;
  publicacoesUsuario: Publicacao[] = [];
  editando: boolean = false;
  novoNome: string = '';
  novoAvatar: string = '';
  atualizandoStatus: boolean = false;

  constructor(
    private servicoAutenticacao: ServicoAutenticacao,
    private servicoDados: ServicoDados
  ) {}

  ngOnInit(): void {
    this.usuario = this.servicoAutenticacao.getUsuarioLogado();
    if (this.usuario) {
      this.carregarPublicacoesUsuario();
      this.novoNome = this.usuario.nome;
      this.novoAvatar = this.usuario.avatar;
    }
  }

  carregarPublicacoesUsuario(): void {
    if (!this.usuario) return;
    this.servicoDados.listarMinhasPublicacoes().subscribe({
      next: pubs => { this.publicacoesUsuario = pubs; },
      error: _ => console.error('Erro ao carregar minhas publicações')
    });
  }

  calcularTotalCurtidas(): number {
    return this.publicacoesUsuario.reduce((total: number, pub: Publicacao) => total + pub.curtidas, 0);
  }

  calcularTotalComentarios(): number {
    return this.publicacoesUsuario.reduce((total: number, pub: Publicacao) => total + pub.comentarios.length, 0);
  }

  salvarPerfil(): void {
    if (this.usuario) {
      this.usuario.nome = this.novoNome;
      this.usuario.avatar = this.novoAvatar;
      
  // TODO: Chamar endpoint de atualização de perfil (não implementado ainda)
      
      this.editando = false;
      alert('Perfil atualizado com sucesso!');
    }
  }

  toggleStatusOnline(): void {
    if (!this.usuario || this.atualizandoStatus) return;
    this.atualizandoStatus = true;
    const novo = !this.usuario.isOnline;
    this.servicoDados.atualizarStatusOnline(novo).subscribe({
      next: () => { if (this.usuario) this.usuario.isOnline = novo; },
      error: _ => alert('Falha ao atualizar status'),
      complete: () => this.atualizandoStatus = false
    });
  }

  // 🔹 Métodos que estavam faltando
  toggleEdicao(): void {
    this.editando = !this.editando;
  }

  cancelarEdicao(): void {
    this.editando = false;
    if (this.usuario) {
      this.novoNome = this.usuario.nome;
      this.novoAvatar = this.usuario.avatar;
    }
  }

  formatarData(data: string | Date): string {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
