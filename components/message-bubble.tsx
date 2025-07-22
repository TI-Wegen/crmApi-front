import type { Message } from "@/types/crm"

interface MessageBubbleProps {
  message: Message
}
export default function MessageBubble({ message }: MessageBubbleProps) {
  const isImage = message.anexoUrl?.match(/\.(jpeg|jpg|png|gif|webp)$/i)
  const isPDF = message.anexoUrl?.endsWith(".pdf")
  const isAudio = message.anexoUrl?.match(/\.(mp3|ogg|wav)$/i)
  const isVideo = message.anexoUrl?.match(/\.(mp4|webm|mov|ogg)$/i) && !isAudio // ogg pode ser vídeo ou áudio

  return (
    <div className={`flex ${message.isFromClient ? "justify-start" : "justify-end"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
          message.isFromClient
            ? "bg-white text-gray-800 rounded-bl-sm"
            : "bg-blue-500 text-white rounded-br-sm"
        } shadow-sm`}
      >
        {message.anexoUrl && (
          <div className="mb-2">
            {isImage ? (
              <a href={message.anexoUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={message.anexoUrl}
                  alt="Imagem enviada"
                  className="w-32 h-32 object-cover rounded-md border"
                />
              </a>
            ) : isPDF ? (
              <a
                href={message.anexoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-500 hover:underline"
              >
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C9.243 0 7 2.243 7 5v3H4v4h3v10h10V12h3V8h-3V5c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v3H9V5c0-1.654 1.346-3 3-3zm1 12v6h-2v-6H9l3-3 3 3h-2z" />
                </svg>
                Documento PDF
              </a>
            ) : isAudio ? (
              <audio controls className="w-full mt-1">
                <source src={message.anexoUrl} />
                Seu navegador não suporta o player de áudio.
              </audio>
            ) : isVideo ? (
              <video controls className="w-full mt-1 rounded-md max-h-60">
                <source src={message.anexoUrl} />
                Seu navegador não suporta o player de vídeo.
              </video>
            ) : (
              <a
                href={message.anexoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {message.anexoUrl}
              </a>
            )}
          </div>
        )}

        {message.content && <p className="text-sm">{message.content}</p>}

           <div className="flex justify-between items-center mt-1">
          <p
            className={`text-xs ${
              message.isFromClient ? "text-gray-500" : "text-blue-100"
            }`}
          >
            {message.timestamp}
          </p>

          {!message.isFromClient && (
            <div className="ml-2 flex items-center">
              <svg
                className={`w-4 h-4 ${
                  message.visualized? "text-blue-800" : "text-gray-200"
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M1.5 12l5 5L20.5 3.5l1.5 1.5L6.5 20l-6.5-6.5 1.5-1.5z" />
                <path d="M10.5 12l5 5L23.5 4.5l-1.5-1.5L11.5 20l-6.5-6.5 1.5-1.5z" />
              </svg>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
