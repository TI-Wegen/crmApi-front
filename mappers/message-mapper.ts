import {formatMessageTimestamp} from "@/utils/date-formatter";
import {Message, MessageDto, MessageWithConversationIdDto} from "@/types/messagem";


export const messageMapper = {
    fromDto(dto: MessageDto): Message {
        const date = new Date(dto.timestamp)

        let formattedTimestamp: string
        formattedTimestamp = date.toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })

        return {
            id: dto.id,
            content: dto.texto,
            timestamp: formattedTimestamp,
            isFromClient: dto.remetenteTipo === "Cliente",
            date: date.toString(),
            anexoUrl: dto.anexoUrl,
            reacaoMensagem: dto.reacaoMensagem,
        }
    },

    fromSignalR(dto: MessageWithConversationIdDto): Message {
        return {
            id: dto.id,
            content: dto.texto,
            timestamp: formatMessageTimestamp(dto.timestamp),
            isFromClient: dto.remetenteTipo === "Cliente",
            date: new Date(dto.timestamp).toISOString(),
            anexoUrl: dto.anexoUrl,
            reacaoMensagem: dto.reacaoMensagem,
        }
    }
}
