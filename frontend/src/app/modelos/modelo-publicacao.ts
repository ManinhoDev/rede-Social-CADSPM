export class Publicacao {
  constructor(
  public id: string = '',
  public usuarioId: string = '',
    public usuarioNome: string = '',
    public usuarioAvatar: string = '',
    public conteudo: string = '',
    public data: Date = new Date(),
    public curtidas: number = 0,
  public comentarios: Comentario[] = [],
  public liked?: boolean
  ) {}
}

export class Comentario {
  constructor(
  public id: string = '',
  public usuarioId: string = '',
    public usuarioNome: string = '',
    public usuarioAvatar: string = '',
    public conteudo: string = '',
    public data: Date = new Date()
  ) {}
}