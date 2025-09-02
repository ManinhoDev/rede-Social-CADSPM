import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServicoAutenticacao } from '../../servicos/servico-autenticacao';
import { Usuario } from '../../modelos/modelo-usuario';
import { FormsModule } from '@angular/forms';
import { NavegacaoComponent } from '../navegacao/navegacao.component';
import { LoginComponent } from '../login/login.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, NavegacaoComponent, LoginComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  usuarioLogado: Usuario | null = null;
  estaLogado: boolean = false;
  noticias: any[] = [];

  constructor(private servicoAutenticacao: ServicoAutenticacao) {}

  ngOnInit(): void {
    this.usuarioLogado = this.servicoAutenticacao.getUsuarioLogado();
    this.estaLogado = !!this.usuarioLogado;
    this.carregarNoticias();
  }

  onLoginSuccess() {
    this.usuarioLogado = this.servicoAutenticacao.getUsuarioLogado();
    this.estaLogado = !!this.usuarioLogado;
    this.carregarNoticias();
  }

  carregarNoticias() {
    // Exemplo estático, pode ser substituído por chamada ao backend
    this.noticias = [
      {
        titulo: 'Bem-vindo à Rede Social CADSPM!',
        conteudo:
          'Acompanhe as novidades, compartilhe ideias e fique por dentro dos eventos.',
        imagem: 'assets/banner1.jpg',
        data: new Date(),
      },
      {
        titulo: 'Nova funcionalidade: Fórum de Discussão',
        conteudo: 'Participe dos debates e contribua com sua experiência.',
        imagem: 'assets/banner2.jpg',
        data: new Date(),
      },
      {
        titulo: 'Chat em tempo real disponível!',
        conteudo: 'Converse com outros membros instantaneamente.',
        imagem: 'assets/banner3.jpg',
        data: new Date(),
      },
    ];
  }
}
