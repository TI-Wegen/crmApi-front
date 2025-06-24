import type { Message } from "@/types/crm"

interface MessageBubbleProps {
  message: Message
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  return (
    <div className={`flex ${message.isFromClient ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          message.isFromClient ? "bg-white text-gray-800 rounded-bl-sm" : "bg-blue-500 text-white rounded-br-sm"
        } shadow-sm`}
      >
        <p className="text-sm">{message.content}</p>
        <p className={`text-xs mt-1 ${message.isFromClient ? "text-gray-500" : "text-blue-100"}`}>
          {message.timestamp}
        </p>
      </div>
    </div>
  )
}
