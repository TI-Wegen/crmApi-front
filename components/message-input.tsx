"use client"

import React, {useEffect, useRef, useState} from "react"
import {Loader2, Paperclip, Send, Smile} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Textarea} from "@/components/ui/textarea"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {useTemplates} from "@/hooks/use-templates"
import {Template} from "@/types/template"
import EmojiPicker, {EmojiClickData} from "emoji-picker-react"

interface MessageInputProps {
    onSendMessage: (content: string, file?: File) => void
    sessaoAtiva: boolean
    onConversationStarted?: (conversationId: string, template: string) => void
    conversationId: string
    contactName: string
}

export default function MessageInput({
                                         onSendMessage,
                                         sessaoAtiva,
                                         conversationId,
                                         onConversationStarted,
                                         contactName,
                                     }: MessageInputProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [message, setMessage] = useState<string>("")
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>("")
    const [loading, setLoading] = useState<boolean>(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false)

    const {templates, loading: loadingTemplates} = useTemplates()
    const emojiPickerRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const handleEmojiClick = (emojiData: EmojiClickData) => {
        setMessage((prevMessage) => prevMessage + emojiData.emoji)
    }

    const handleClickOutside = (event: MouseEvent) => {
        if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
            setShowEmojiPicker(false)
        }
    }

    useEffect(() => {
        if (showEmojiPicker) {
            document.addEventListener("mousedown", handleClickOutside)
        } else {
            document.removeEventListener("mousedown", handleClickOutside)
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [showEmojiPicker])

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault()

        if (sessaoAtiva) {
            if (message.trim() || selectedFile) {
                onSendMessage(message.trim(), selectedFile || undefined)
                setMessage("")
                setSelectedFile(null)
            }
        } else {
            if (!conversationId || !selectedTemplateId) {
                return
            }

            setLoading(true)
            try {
                if (onConversationStarted) {
                    onConversationStarted(conversationId, selectedTemplateId ?? "")
                }
            } catch (err: unknown) {
                console.error("Error starting conversation:", err)
            } finally {
                setLoading(false)
            }
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent): void => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e as unknown as React.FormEvent)
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const file: File | undefined = e.target.files?.[0]
        if (file) setSelectedFile(file)
    }

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [message]);

    return (
        <div className="p-4 border-t border-gray-200 bg-white relative">
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
                {selectedFile && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Paperclip className="h-4 w-4"/>
                        <span>{selectedFile.name}</span>
                        <button
                            type="button"
                            onClick={(): void => setSelectedFile(null)}
                            className="text-red-500 hover:text-red-700"
                        >
                            ×
                        </button>
                    </div>
                )}

                <div className="flex items-center space-x-2">
                    {sessaoAtiva ? (
                        <>
                            <input
                                type="file"
                                id="file-input"
                                className="hidden"
                                onChange={handleFileSelect}
                                accept="image/*,application/pdf,.doc,.docx"
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-gray-500 hover:text-gray-700"
                                onClick={(): void => document.getElementById("file-input")?.click()}
                            >
                                <Paperclip className="h-5 w-5"/>
                            </Button>

                            <div className="flex-1 relative">
                                <div
                                    className="relative rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                    <Textarea
                                        ref={textareaRef}
                                        value={message}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => setMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Type your message..."
                                        className="w-full resize-none border-0 rounded-lg py-2 px-4 focus-visible:ring-0 focus-visible:ring-offset-0 min-h-[80px] max-h-[200px]"
                                    />
                                    <div className="absolute right-2 bottom-2 flex items-center">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-gray-500 hover:text-gray-700 h-6 w-6 p-0"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        >
                                            <Smile className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                </div>

                                <div
                                    ref={emojiPickerRef}
                                    className={`absolute bottom-full right-0 mb-2 z-10 transition-all duration-300 ease-in-out transform ${
                                        showEmojiPicker
                                            ? 'opacity-100 translate-y-0 scale-100'
                                            : 'opacity-0 translate-y-5 scale-95 pointer-events-none'
                                    }`}
                                >
                                    <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400}/>
                                </div>
                            </div>
                        </>
                    ) : (
                        <Select
                            value={selectedTemplateId}
                            onValueChange={(value: string) => setSelectedTemplateId(value)}
                            disabled={loading || loadingTemplates}
                        >
                            <SelectTrigger className="pr-10 rounded-full border-gray-300 focus:border-blue-500">
                                <SelectValue placeholder="Selecione um template..."/>
                            </SelectTrigger>
                            <SelectContent>
                                {templates.map((template: Template) => (
                                    <SelectItem key={template.id} value={template.name}>
                                        {template.body}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    <Button
                        type="submit"
                        size="sm"
                        className="rounded-full bg-blue-500 hover:bg-blue-600"
                        disabled={loading || (sessaoAtiva ? !message.trim() : !selectedTemplateId)}
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4"/> : <Send className="h-4 w-4"/>}
                    </Button>
                </div>
            </form>
        </div>
    )
}
