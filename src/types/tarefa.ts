export interface Tarefa {
  id: number;
  titulo: string;
  feito: number;
  criadoEm: string;
}

export interface AtualizarTarefaDTO {
  //Data Transfer Object
  titulo?: string;
  feito?: number;
}
