export function formatMessageTimestamp(timestamp: string | Date): string {
  let messageDate: Date

  if (typeof timestamp === "string") {
    // Remove o 'Z' para evitar que o JS interprete como UTC
    const normalized = timestamp.endsWith("Z") ? timestamp.slice(0, -1) : timestamp
    messageDate = new Date(normalized)
  } else {
    messageDate = timestamp
  }

  const now = new Date()

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate())

  const diffInDays = (today.getTime() - messageDay.getTime()) / (1000 * 3600 * 24)

  if (diffInDays === 0) {
    return messageDate.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  } else if (diffInDays === 1) {
    return "Ontem"
  } else {
    return messageDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    })
  }
}
