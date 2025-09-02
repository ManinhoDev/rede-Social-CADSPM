export class Mensagem {
  constructor(
  public id: string = '',
  public remetenteId: string = '',
    public remetenteNome: string = '',
  public destinatarioId: string = '',
    public conteudo: string = '',
    public data: Date = new Date(),
    public lida: boolean = false
  ) {}
}