export function formatDate(dateString: string): string {
  const date: Date = parseDateLocal(dateString)
  const today: Date = new Date()
  const yesterday: Date = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const isToday: boolean = date.toDateString() === today.toDateString()
  const isYesterday: boolean = date.toDateString() === yesterday.toDateString()

  if (isToday) {
    return "Hoje"
  }

  if (isYesterday) {
    return "Ontem"
  }

  return date.toLocaleDateString("pt-BR")
}

export function parseDateLocal(dateString: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString + "T00:00:00")
  }
  return new Date(dateString)
}

export function formatMessageTimestamp(timestamp: string): string {
  const date: Date = new Date(timestamp)
  const now: Date = new Date()

  const isToday: boolean = date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()

  if (isToday) {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  })
}
