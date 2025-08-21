export interface MessageDto {
  id: string;
  texto: string;
  anexoUrl?: string;
  remetenteTipo: "Cliente" | "Agente";
  agenteId?: string;
  timestamp: string;
}

export interface MessageWithConversationIdDto extends MessageDto {
  conversationId: string;
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
