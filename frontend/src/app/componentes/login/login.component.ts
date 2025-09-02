import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ServicoAutenticacao } from '../../servicos/servico-autenticacao';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  senha: string = '';
  nome: string = '';
  erro: string = '';
  modoRegistro: boolean = false;

  constructor(private servicoAutenticacao: ServicoAutenticacao) {}

  login(): void {
    this.erro = '';
    if (!this.email.trim() || !this.senha.trim()) {
      this.erro = 'Preencha email e senha';
      return;
    }
    this.servicoAutenticacao.login(this.email, this.senha).subscribe({
      error: (e) => {
        this.erro = e?.error?.erro || 'Falha no login';
      }
    });
  }

  toggleModo(): void {
    this.modoRegistro = !this.modoRegistro;
    this.erro = '';
  }

  registrar(): void {
    this.erro = '';
    if (!this.nome.trim() || !this.email.trim() || !this.senha.trim()) {
      this.erro = 'Preencha nome, email e senha';
      return;
    }
    this.servicoAutenticacao.registro(this.nome, this.email, this.senha).subscribe({
      next: resp => {
        if (resp?.token) {
          // Se backend já retornou token, faz login rápido reutilizando fluxo padrão
          this.servicoAutenticacao.login(this.email, this.senha).subscribe({
            error: _ => this.erro = 'Erro ao logar após registro'
          });
        } else if (resp?.requiresEmailConfirmation) {
          this.erro = 'Confirme seu email antes de logar.';
        } else {
          // fallback
          this.servicoAutenticacao.login(this.email, this.senha).subscribe({
            error: _ => this.erro = 'Erro ao logar após registro'
          });
        }
      },
      error: (e) => {
        this.erro = e?.error?.erro || 'Erro no registro';
      }
    });
  }
}