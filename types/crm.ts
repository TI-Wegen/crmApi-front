// Atualizar os tipos para corresponder aos DTOs da API

export interface ContatoDto {
  id: string
  nome: string
  telefone: string
  tags?: string[]
  ativo: boolean
  timestamp: string
  atualizadoEm?: string
}

export interface AgenteDto {
  id: string
  nome: string
  email: string
  ativo: boolean
  timestamp: string
  atualizadoEm?: string
}

export interface MessageDto {
  id: string
  texto: string
  anexoUrl?: string
  remetenteTipo: "Cliente" | "Agente"
  agenteId?: string
  timestamp: string
}

export interface ConversationDto {
  id: string
  contatoId: string
  agenteId?: string
  status: "AguardandoNaFila" | "EmAtendimento" | "Resolvida"
  criadaEm: string
  atualizadaEm?: string
  ultimaMensagem?: string
  ultimaMensagemEm?: string
}

// Novo tipo para a resposta da listagem de conversas
export interface ConversationListItemDto {
  id: string
  contatoNome: string
  contatoTelefone: string
  agenteNome?: string | null
  status: "AguardandoNaFila" | "EmAtendimento" | "Resolvida"
  ultimaMensagemTimestamp: string
  ultimaMensagemPreview: string
}

export interface ConversationDetailsDto extends ConversationDto {
  contato: ContatoDto
  agente?: AgenteDto
  mensagens: MessageDto[]
}

// Tipos para o frontend (mantendo compatibilidade)
export interface Conversation {
  id: string
  clientName: string
  lastMessage: string
  timestamp: string
  unread: number
  avatar: string
  status: "AguardandoNaFila" | "EmAtendimento" | "Resolvida"
  agentName?: string
}

export interface Message {
  id: string
  content: string
  timestamp: string
  isFromClient: boolean
  date: string
  anexoUrl?: string
}

// Parâmetros para busca de conversas
export interface ConversationSearchParams {
  pageNumber?: number
  pageSize?: number
  status?: "AguardandoNaFila" | "EmAtendimento" | "Resolvida"
  agenteId?: string
  setorId?: string
}

export interface ConversationSummaryDto {
  id: string;
  contatoNome: string;
  contatoTelefone: string;
  agenteNome?: string;
  status: string;
  ultimaMensagemTimestamp: string; // Vem como string ISO
  ultimaMensagemPreview: string;
}

export interface ConversationsDto{
  
}