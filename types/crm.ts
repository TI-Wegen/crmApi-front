// Atualizar os tipos para corresponder aos DTOs da API

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

export interface AgenteDto {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  timestamp: string;
  atualizadoEm?: string;
}

export interface MessageDto {
  id: string;
  texto: string;
  anexoUrl?: string;
  remetenteTipo: "Cliente" | "Agente";
  agenteId?: string;
  timestamp: string;
}

export interface ConversationDto {
  id: string;
  contatoId: string;
  contatoNome: string;
  contatoTelefone: string;
  agenteId?: string;
  status: "AguardandoNaFila" | "EmAtendimento" | "Resolvida";
  criadaEm: string;
  atualizadaEm?: string;
  ultimaMensagem?: string;
  ultimaMensagemEm?: string;
   sessaoWhatsappAtiva: boolean;
  sessaoWhatsappExpiraEm: string | null;
}

// Novo tipo para a resposta da listagem de conversas
export interface ConversationListItemDto {
  id: string;
  atendimentoId: string;
  contatoId: string;
  contatoNome: string;
  contatoTelefone: string;
  agenteNome?: string | null;
  status: "AguardandoNaFila" | "EmAtendimento" | "Resolvida";
  ultimaMensagemTimestamp: string;
  ultimaMensagemPreview: string;
  mensagensNaoLidas?: number; // Adiciona o campo de mensagens não lidas
    sessaoWhatsappAtiva: boolean;
  sessaoWhatsappExpiraEm: string | null;
  
}

export interface ConversationDetailsDto extends ConversationDto {
  contato: ContatoDto;
  agente?: AgenteDto;
  mensagens: MessageDto[];
  atendimentoId?: string; // Adiciona o campo de atendimentoId
}

// Tipos para o frontend (mantendo compatibilidade)
export interface Conversation {
  id: string;
  contatoId: string;
  agenteId?: string;
  atendimentoId: string;
  contatoNome: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  status: "AguardandoNaFila" | "EmAtendimento" | "Resolvida";
  agentName?: string;
  sessaoWhatsappAtiva: boolean;
  sessaoWhatsappExpiraEm: string | null;
}

export interface Message {
  id: string;
  content: string;
  timestamp: string;
  isFromClient: boolean;
  date: string;
  anexoUrl?: string;
  visualized?: boolean;
}

// Parâmetros para busca de conversas
export interface ConversationSearchParams {
  pageNumber?: number;
  pageSize?: number;
  status?: "AguardandoNaFila" | "EmAtendimento" | "Resolvida";
  agenteId?: string;
  setorId?: string;
}

export interface ConversationSummaryDto {
  id: string;
  atentoId: string;
  contatoId: string;
  contatoNome: string;
  contatoTelefone: string;
  agenteNome?: string;
  mensagensNaoLidas: number; // Sempre começa com 1 mensagem não lida
  status: "AguardandoNaFila" | "EmAtendimento" | "Resolvida";
  ultimaMensagemTimestamp: string; // Vem como string ISO
  ultimaMensagemPreview: string;
    sessaoWhatsappAtiva: boolean;
  sessaoWhatsappExpiraEm: string | null;
}
export interface MessageWithConversationIdDto extends MessageDto {
  conversationId: string;
}

export interface SetorDto {
  id: string;
  nome: string;
}

export interface TemplateDto {
  id: string;
  name: string;
  body: string;
  language: string;
  description?: string;
}

export interface MessageWithConversationIdDto extends MessageDto {
  conversationId: string;
}