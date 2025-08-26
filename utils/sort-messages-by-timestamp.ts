import {Message} from "@/types/messagem";

export const sortMessagesByTimestamp = (messages: Message[]): Message[] => {
    return [...messages].sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;

        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();

        if (isNaN(timeA) && isNaN(timeB)) return 0;
        if (isNaN(timeA)) return 1;
        if (isNaN(timeB)) return -1;

        return timeA - timeB;
    });
};
