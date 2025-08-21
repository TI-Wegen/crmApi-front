import {Message} from "@/types/messagem";

export const sortMessagesByTimestamp = (messages: Message[]): Message[] =>
    [...messages].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    )