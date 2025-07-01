// utils/date-formatter.ts

export function formatMessageTimestamp(timestamp: Date | string): string {
  const messageDate = new Date(timestamp);
  const now = new Date();
  
  // Zera as horas para comparar apenas os dias
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());

  const diffInDays = (today.getTime() - messageDay.getTime()) / (1000 * 3600 * 24);

  if (diffInDays === 0) {
    // Hoje -> "14:32"
    return messageDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } else if (diffInDays === 1) {
    // Ontem -> "Ontem"
    return "Ontem";
  } else {
    // Mais de um dia -> "28/06"
    return messageDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  }
}