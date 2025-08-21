export interface ContatoDto {
  id: string;
  atendimentoId: string;
  nome: string;
  telefone: string;
  tags?: string[];
  ativo: boolean;
  timestamp: string;
  atualizadoEm?: string;
  setorId?: string;
  botSetId?: string;
}

export interface CreateContactDto {
    nome: string
    telefone: string
}

export interface UpdateContactDto {
    nome: string
    telefone: string
    tags?: string[]
}

export interface PaginationState {
    data?: ContatoDto[]
    pageNumber: number
    pageSize: number
    total: number
}

export interface LoadContactsProps {
    pageNumber?: number
    pageSize?: number
    incluirInativos?: boolean
}
