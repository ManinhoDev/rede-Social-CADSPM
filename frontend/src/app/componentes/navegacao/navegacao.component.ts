import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { ServicoAutenticacao } from '../../servicos/servico-autenticacao';
import { Usuario } from '../../modelos/modelo-usuario';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navegacao',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navegacao.component.html',
  styleUrl: './navegacao.component.css'
})
export class NavegacaoComponent implements OnInit {
  usuarioLogado: Usuario | null = null;
  menuAberto: boolean = false;

  constructor(
    private servicoAutenticacao: ServicoAutenticacao,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.carregarUsuario();
    
    // Ouvir mudanças de rota para atualizar o estado do usuário
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.carregarUsuario();
      });
  }

  carregarUsuario(): void {
    this.usuarioLogado = this.servicoAutenticacao.getUsuarioLogado();
  }

  logout(): void {
    this.servicoAutenticacao.logout();
    // O router.navigate já está sendo feito no ServicoAutenticacao
  }

  isRotaAtiva(rota: string): boolean {
    return this.router.url === `/${rota}`;
  }

  toggleMenu(): void {
    this.menuAberto = !this.menuAberto;
  }

  fecharMenu(): void {
    this.menuAberto = false;
  }
}