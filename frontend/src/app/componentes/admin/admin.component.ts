import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicoDados } from '../../servicos/servico-dados';
import { ServicoAutenticacao } from '../../servicos/servico-autenticacao';
import { Publicacao } from '../../modelos/modelo-publicacao';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  usuarios: any[] = []; // TODO: implementar fetch real de usuários
  publicacoes: Publicacao[] = [];
  estatisticas: any = {};

  constructor(
    private servicoDados: ServicoDados,
    private servicoAutenticacao: ServicoAutenticacao
  ) {}

  ngOnInit(): void {
    if (this.servicoAutenticacao.isAdmin()) {
      this.servicoDados.listarPublicacoes().subscribe({
        next: pubs => { this.publicacoes = pubs; this.calcularEstatisticas(); },
        error: _ => console.error('Erro ao carregar publicações')
      });
    }
  }

  calcularEstatisticas(): void {
    this.estatisticas = {
      totalUsuarios: this.usuarios.length,
      totalPublicacoes: this.publicacoes.length,
  totalCurtidas: this.publicacoes.reduce((total, pub) => total + pub.curtidas, 0),
  totalComentarios: 0,
  usuariosOnline: 0
    };
  }

  excluirPublicacao(pub: Publicacao): void {
    if (confirm('Excluir publicação?')) {
      // Backend exige ID; se for UUID já funciona
      this.servicoDados.deletarPublicacao(String(pub.id)).subscribe({
        next: () => {
          this.publicacoes = this.publicacoes.filter(p => p.id !== pub.id);
          this.calcularEstatisticas();
        },
        error: _ => alert('Erro ao excluir')
      });
    }
  }

  // Stubs temporários até implementação real de usuários
  alternarStatusUsuario(usuario: any): void {
    usuario.isOnline = !usuario.isOnline;
    this.calcularEstatisticas();
  }

  alternarAdmin(usuario: any): void {
    if (usuario.id === 1) return; // preserva super admin
    usuario.isAdmin = !usuario.isAdmin;
  }
}