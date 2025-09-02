import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { ServicoAutenticacao } from '../servicos/servico-autenticacao';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private servicoAutenticacao: ServicoAutenticacao,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.servicoAutenticacao.estaLogado()) {
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
}