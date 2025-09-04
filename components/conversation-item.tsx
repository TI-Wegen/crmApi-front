"use client";

import {User, XCircle, CheckCircle} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {differenceInHours, formatDistanceToNowStrict, isBefore, parseISO,} from "date-fns";
import {ptBR} from "date-fns/locale/pt-BR";
import {Conversation} from "@/types/conversa";

interface ConversationItemProps {
    conversation: Conversation;
    isSelected: boolean;
    onClick: () => void;
}

export default function ConversationItem({
                                             conversation,
                                             isSelected,
                                             onClick,
                                         }: ConversationItemProps) {
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
                    {conversation?.avatar && !["", "null", "undefined"].includes(conversation.avatar) ? (
                        <img
                            src={conversation.avatar}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="text-gray-500"/>
                        </div>
                    )}

                    <div className="flex items-center gap-1 mt-1">
                        {conversation.sessaoWhatsappAtiva ? (
                            (() => {
                                const expiraEm = conversation.sessaoWhatsappExpiraEm;
                                const isExpired = expiraEm && isBefore(
                                    typeof expiraEm === "string" ? parseISO(expiraEm) : expiraEm,
                                    new Date()
                                );

                                return isExpired ? (
                                    <div title="Atendimento finalizado" className="text-gray-400">
                                        <CheckCircle size={18} />
                                    </div>
                                ) : (
                                    <div title="Atendimento em andamento" className="text-green-500">
                                        <User size={18} />
                                    </div>
                                );
                            })()
                        ) : (
                            <div
                                title={`Sessão desativada.`}
                            >
                                <XCircle size={18} className="text-gray-400"/>
                            </div>
                        )}
                    </div>

                    {conversation.unread > 0 && (
                        <div
                            className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-sm">
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

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            {conversation.tagName && conversation.tagColor ? (
                                <Badge
                                    variant="secondary"
                                    className="text-xs"
                                    style={{
                                        backgroundColor: `${conversation.tagColor}20`,
                                        color: conversation.tagColor,
                                        border: `1px solid ${conversation.tagColor}`
                                    }}
                                >
                                    <span>{conversation.tagName}</span>
                                </Badge>
                            ) : (<div></div>)}
                        </div>

                        {conversation.agentName && (
                            <span
                                className={`text-xs flex items-center flex-shrink-0 ml-2 ${
                                    isSelected ? "text-blue-600" : "text-gray-500"
                                }`}
                            >
                                <User className="h-3 w-3 mr-1"/>
                                {conversation.agentName}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
