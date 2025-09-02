export class TopicoForum {
  constructor(
  public id: string = '',
    public titulo: string = '',
    public descricao: string = '',
  public criadorId: string = '',
    public criadorNome: string = '',
    public criadorAvatar: string = '',
    public dataCriacao: Date = new Date(),
    public mensagens: MensagemForum[] = [],
    public isFixo: boolean = false,
    public categoria: string = 'Geral'
  ) {}
}

export class MensagemForum {
  constructor(
  public id: string = '',
  public topicoId: string = '',
  public usuarioId: string = '',
    public usuarioNome: string = '',
    public usuarioAvatar: string = '',
    public conteudo: string = '',
    public data: Date = new Date(),
    public curtidas: number = 0
  ) {}
}

export class CategoriaForum {
  constructor(
  public id: string = '',
    public nome: string = '',
    public descricao: string = '',
    public icone: string = '💬'
  ) {}
}