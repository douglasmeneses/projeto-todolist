export interface Tarefa {
  id: number;
  titulo: string;
  feito: number;
  criadoEm: string;
}

export interface CriarTarefaDTO {
  titulo?: string | undefined;
}

export interface AtualizarTarefaDTO {
  // Data Transfer Object
  titulo?: string | undefined;
  feito?: number | undefined;
}
