"use client";

import type { Conversation } from "@/types/crm";
import { Clock, User, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Clock3, XCircle } from "lucide-react";
import {
  formatDistanceToNowStrict,
  differenceInHours,
  parseISO,
  isBefore,
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
// Atualizar a interface para incluir agentName
interface ConversationItemProps {
  conversation: Conversation & { agentName?: string };
  isSelected: boolean;
  onClick: () => void;
}

// Atualizar o componente para mostrar status e agente
export default function ConversationItem({
  conversation,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "AguardandoNaFila":
        return <Clock className="h-3 w-3 text-yellow-600" />;
      case "EmAndamento":
        return <User className="h-3 w-3 text-blue-600" />;
      case "Resolvida":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      default:
        return null;
    }
  };




  const getStatusColor = (status: string) => {
    switch (status) {
      case "AguardandoNaFila":
        return "bg-yellow-100 text-yellow-800";
      case "EmAndamento":
        return "bg-blue-100 text-blue-800";
      case "Resolvida":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "AguardandoNaFila":
        return "Na Fila";
      case "EmAndamento":
        return "Em Andamento";
      case "Resolvida":
        return "Resolvida";
      default:
        return status;
    }
  };

  const getSessionStatusInfo = (expiraEm: string | Date | null) => {
    if (!expiraEm)
      return { color: "text-gray-400", title: "Sem dados de expiração" };

    const expiracao =
      typeof expiraEm === "string" ? parseISO(expiraEm) : expiraEm;
    const now = new Date();
    const diff = differenceInHours(expiracao, now);

    if (isBefore(expiracao, now)) {
      return { color: "text-gray-400", title: "Sessão expirada" };
    }

    if (diff <= 2)
      return {
        color: "text-red-500",
        title: `Expira em ${formatDistanceToNowStrict(expiracao, {
          locale: ptBR,
        })}`,
      };
    if (diff <= 6)
      return {
        color: "text-orange-500",
        title: `Expira em ${formatDistanceToNowStrict(expiracao, {
          locale: ptBR,
        })}`,
      };
    if (diff <= 12)
      return {
        color: "text-yellow-500",
        title: `Expira em ${formatDistanceToNowStrict(expiracao, {
          locale: ptBR,
        })}`,
      };

    return {
      color: "text-green-500",
      title: `Expira em ${formatDistanceToNowStrict(expiracao, {
        locale: ptBR,
      })}`,
    };
  };

  return (
    <div
      className={`p-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 active:bg-gray-100 ${
        isSelected
          ? "bg-blue-50 border-r-4 border-r-blue-500 shadow-sm"
          : "border-b border-gray-100 hover:border-gray-200"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="relative flex-shrink-0">
          <img
            src={conversation.avatar || "/placeholder.svg"}
            alt={conversation.contatoNome}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
          />

          <div className="flex items-center gap-1 mt-1">
            {conversation.sessaoWhatsappAtiva ? (
              (() => {
                const { color, title } = getSessionStatusInfo(
                  conversation.sessaoWhatsappExpiraEm
                );
                return <div title={title} className={`text-xs ${color}`}>
                  <Clock3 size={18} className={color}  />
                </div>
              })()
            ) : (
              <div
                title={`Sessão desativada. Última: ${conversation.sessaoWhatsappExpiraEm}`}
              >
                <XCircle size={18} className="text-gray-400" />
              </div>
            )}
          </div>

          {conversation.unread > 0 && (
            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm">
              {conversation.unread > 9 ? "9+" : conversation.unread}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={`text-sm font-medium truncate ${
                isSelected ? "text-blue-900" : "text-gray-900"
              }`}
            >
              {conversation.contatoNome}
            </h3>
            <span
              className={`text-xs flex-shrink-0 ml-2 ${
                isSelected ? "text-blue-600" : "text-gray-500"
              }`}
            >
              {conversation.timestamp}
            </span>
          </div>

          <div className="flex items-center justify-between mb-2">
            <p
              className={`text-sm truncate ${
                isSelected ? "text-blue-700" : "text-gray-600"
              }`}
            >
              {conversation.lastMessage}
            </p>
          </div>

          {/* Status e Agente */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className={`text-xs ${getStatusColor(conversation.status)}`}
              >
                <span className="flex items-center space-x-1">
                  {getStatusIcon(conversation.status)}
                  <span>{getStatusLabel(conversation.status)}</span>
                </span>
              </Badge>
            </div>

            {conversation.agentName && (
              <span
                className={`text-xs flex items-center flex-shrink-0 ml-2 ${
                  isSelected ? "text-blue-600" : "text-gray-500"
                }`}
              >
                <User className="h-3 w-3 mr-1" />
                {conversation.agentName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
