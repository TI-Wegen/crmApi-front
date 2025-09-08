import {
    Conversation,
    ConversationDetailsDto,
    ConversationListItemDto,
    ConversationSummaryDto
} from "@/types/conversa";
import { formatMessageTimestamp } from "@/utils/date-formatter";

export const conversationMapper = {
    fromListItemDto(dto: ConversationListItemDto): Conversation {
        return {
            id: dto.id,
            atendimentoId: dto.atendimentoId,
            contatoId: dto.contatoId,
            contatoNome: dto.contatoNome,
            contatoTelefone: dto.contatoTelefone,
            status: dto.status,
            sessaoWhatsappAtiva: dto.sessaoWhatsappAtiva,
            tagId: dto.tagId,
            tagName: dto.tagName,
            tagColor: dto.tagColor,
            sessaoWhatsappExpiraEm: dto.sessaoWhatsappExpiraEm,
            lastMessage: dto.ultimaMensagemPreview,
            timestamp: formatMessageTimestamp(dto.ultimaMensagemTimestamp),
            unread: dto.mensagensNaoLidas || 0,
            avatar: `/placeholder.svg?height=40&width=40`,
        };
    },

    fromSummaryDto(dto: ConversationSummaryDto): Conversation {
        return {
            id: dto.id,
            atendimentoId: dto.atentoId,
            contatoId: dto.contatoId,
            contatoNome: dto.contatoNome,
            contatoTelefone: dto.contatoTelefone,
            status: dto.status,
            sessaoWhatsappAtiva: dto.sessaoWhatsappAtiva,
            tagId: dto.tagId,
            tagName: dto.tagName,
            tagColor: dto.tagColor,
            sessaoWhatsappExpiraEm: dto.sessaoWhatsappExpiraEm,
            lastMessage: dto.ultimaMensagemPreview,
            timestamp: formatMessageTimestamp(dto.ultimaMensagemTimestamp),
            unread: dto.mensagensNaoLidas,
            avatar: `/placeholder.svg?height=40&width=40`,
        };
    },

    fromDetailsDto(dto: ConversationDetailsDto): Conversation {
        return {
            id: dto.id,
            atendimentoId: dto.atendimentoId || "",
            contatoId: dto.contatoId,
            contatoNome: dto.contatoNome,
            contatoTelefone: dto.contatoTelefone,
            status: dto.status,
            sessaoWhatsappAtiva: dto.sessaoWhatsappAtiva,
            tagId: dto.tagId,
            tagName: dto.tagName,
            tagColor: dto.tagColor,
            sessaoWhatsappExpiraEm: dto.sessaoWhatsappExpiraEm,
            lastMessage: dto.ultimaMensagem || "",
            timestamp: dto.ultimaMensagemEm
                ? formatMessageTimestamp(dto.ultimaMensagemEm)
                : "",
            unread: 0,
            avatar: `/placeholder.svg?height=40&width=40`,
        };
    }
};
