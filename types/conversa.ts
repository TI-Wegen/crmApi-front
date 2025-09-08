import {MessageDto} from "@/types/messagem";
import {ContatoDto} from "@/types/contato";
import {AgenteDto} from "@/types/agente";

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
    tagId: string | null;
    tagName: string | null;
    tagColor: string | null;
}

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
    mensagensNaoLidas?: number;
    sessaoWhatsappAtiva: boolean;
    tagId: string | null,
    tagName: string | null,
    tagColor: string | null,
    sessaoWhatsappExpiraEm: string | null;
}

export interface ConversationDetailsDto extends ConversationDto {
    contato: ContatoDto;
    agente?: AgenteDto;
    mensagens: MessageDto[];
    atendimentoId?: string;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface ConversationSummaryDto {
    id: string;
    atentoId: string;
    contatoId: string;
    contatoNome: string;
    contatoTelefone: string;
    agenteNome?: string;
    mensagensNaoLidas: number;
    status: "AguardandoNaFila" | "EmAtendimento" | "Resolvida";
    ultimaMensagemTimestamp: string;
    ultimaMensagemPreview: string;
    sessaoWhatsappAtiva: boolean;
    tagId: string | null;
    tagName: string | null;
    tagColor: string | null;
    sessaoWhatsappExpiraEm: string | null;
}

export interface Conversation {
    id: string;
    contatoId: string;
    agenteId?: string;
    atendimentoId: string;
    contatoNome: string;
    contatoTelefone: string;
    lastMessage: string;
    timestamp: string;
    unread: number;
    avatar: string;
    status: "AguardandoNaFila" | "EmAtendimento" | "Resolvida";
    agentName?: string;
    sessaoWhatsappAtiva: boolean;
    tagId: string | null;
    tagName: string | null;
    tagColor: string | null;
    sessaoWhatsappExpiraEm: string | null;
}

export interface ConversationSearchParams {
    pageNumber?: number;
    pageSize?: number;
    status?: "AguardandoNaFila" | "EmAtendimento" | "Resolvida";
    agenteId?: string;
    setorId?: string;
    tagId?: string;
}

export interface StartConversationByTemplateData {
    contactId: string
    templateName: string
    bodyParameters: string[]
}

export interface AssignAgentData {
    agenteId: string
}

export interface TransferConversationData {
    novoAgenteId?: string
    novoSetorId?: string
}
