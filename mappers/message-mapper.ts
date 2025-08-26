import {formatMessageTimestamp} from "@/utils/date-formatter";
import {Message, MessageDto, MessageWithConversationIdDto} from "@/types/messagem";


export const messageMapper = {
    fromDto(dto: MessageDto): Message {
        const date = new Date(dto.timestamp)

        let formattedTimestamp: string
        formattedTimestamp = date.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        })

        return {
            id: dto.id,
            content: dto.texto,
            timestamp: formattedTimestamp,
            isFromClient: dto.remetenteTipo === "Cliente",
            date: new Date(formattedTimestamp).toString(),
            anexoUrl: dto.anexoUrl,
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
        }
    }
}
