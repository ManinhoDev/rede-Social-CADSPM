import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Usuario } from '../../modelos/modelo-usuario';
import { ServicoDados } from '../../servicos/servico-dados';

@Component({
  selector: 'app-usuarios-online',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './usuarios-online.component.html',
  styleUrl: './usuarios-online.component.css'
})
export class UsuariosOnlineComponent {
  @Input() usuarioLogado: Usuario | null = null;
  usuariosOnline: Usuario[] = [];

  constructor(private servicoDados: ServicoDados) {}

  ngOnInit(): void {
    this.carregarUsuariosOnline();
  }

  carregarUsuariosOnline(): void {
    this.usuariosOnline = this.servicoDados.getUsuariosOnline();
  }

  toggleStatusUsuario(usuario: Usuario): void {
    if (!this.usuarioLogado?.isAdmin) return;
    // Apenas demonstração: se fosse outro usuário, backend precisaria de endpoint admin.
    // Aqui só inverte localmente se for o próprio usuário logado.
    if (usuario.id === this.usuarioLogado.id) {
      const novo = !usuario.isOnline;
      this.servicoDados.atualizarStatusOnline(novo).subscribe({
        next: () => { usuario.isOnline = novo; this.carregarUsuariosOnline(); },
        error: () => { usuario.isOnline = novo; this.carregarUsuariosOnline(); }
      });
    }
  }

  ficarOffline(): void {
    if (!this.usuarioLogado) return;
    this.servicoDados.atualizarStatusOnline(false).subscribe({
      next: () => {
        if (this.usuarioLogado) this.usuarioLogado.isOnline = false;
        this.carregarUsuariosOnline();
      },
      error: () => {
        // fallback visual
        if (this.usuarioLogado) this.usuarioLogado.isOnline = false;
        this.carregarUsuariosOnline();
      }
    });
  }
}