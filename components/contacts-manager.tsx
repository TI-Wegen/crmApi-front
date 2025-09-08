// components/contacts-manager.tsx
"use client"

import {useState, useCallback, useRef, useEffect} from "react"
import {Phone, Plus, Search} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Card, CardContent} from "@/components/ui/card"
import {Badge} from "@/components/ui/badge"
import {useContacts} from "@/hooks/use-contacts"
import ContactForm from "./contact-form"
import {ContatoDto} from "@/types/contato";

interface ContactsManagerProps {
    onStartConversation?: (conversationId: string) => void
}

export default function ContactsManager({onStartConversation}: ContactsManagerProps) {
    const {
        contacts,
        loading,
        error,
        hasMore,
        loadMoreContacts,
        createContact,
        updateContact,
        searchContacts,
        refreshContacts
    } = useContacts()

    const [showForm, setShowForm] = useState(false)
    const [editingContact, setEditingContact] = useState<ContatoDto | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const observer = useRef<IntersectionObserver | null>(null)
    const lastContactRef = useRef<HTMLDivElement | null>(null)

    const handleCreateContact = async (dados: { nome: string; telefone: string }) => {
        try {
            await createContact(dados)
            setShowForm(false)
        } catch (err) {
            console.error("Erro ao criar contato:", err)
        }
    }

    const handleUpdateContact = async (dados: { nome: string; telefone: string}) => {
        if (!editingContact) return

        try {
            await updateContact(editingContact.id, dados)
            setEditingContact(null)
        } catch (err) {
            console.error("Erro ao atualizar contato:", err)
        }
    }

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        searchContacts(value)
    }

    const handleContactClick = (contactId: string) => {
        if (onStartConversation) {
            onStartConversation(contactId)
        }
    }

    const loadMoreIfIntersecting = useCallback((node: HTMLDivElement | null) => {
        if (loading) return
        if (observer.current) observer.current.disconnect()

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMoreContacts()
            }
        })

        if (node) observer.current.observe(node)
        lastContactRef.current = node
    }, [loading, hasMore, loadMoreContacts])

    useEffect(() => {
        return () => {
            if (observer.current) observer.current.disconnect()
        }
    }, [])

    if (error) {
        return (
            <div className="p-4 text-center">
                <div className="text-red-500 mb-2">Erro ao carregar contatos</div>
                <p className="text-gray-600 text-sm">{error}</p>
                <Button onClick={refreshContacts} className="mt-2">Tentar novamente</Button>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-white">
            <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Contatos</h2>
                    <Button onClick={() => setShowForm(true)} size="sm">
                        <Plus className="h-4 w-4 mr-2"/>
                        Novo Contato
                    </Button>
                </div>

                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"/>
                    <Input
                        placeholder="Buscar contatos..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-10 bg-gray-50 border-gray-200 rounded-full"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {loading && contacts.length === 0 ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {contacts.map((contact, index) => (
                            <div
                                key={contact.id}
                                ref={index === contacts.length - 1 ? loadMoreIfIntersecting : null}
                                onClick={() => handleContactClick(contact.id)} // Adicionando o handler de clique
                                className="cursor-pointer" // Adicionando cursor de pointer para indicar que é clicável
                            >
                                <Card className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span
                                                        className="text-blue-600 font-medium">{contact.nome.charAt(0).toUpperCase()}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{contact.nome}</h3>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                        <Phone className="h-3 w-3"/>
                                                        <span>{contact.telefone}</span>
                                                    </div>
                                                    {contact.tags && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {contact.tags}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}

                        {contacts.length === 0 && !loading && (
                            <div className="text-center py-8">
                                <div
                                    className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                                    <Phone className="h-8 w-8 text-gray-400"/>
                                </div>
                                <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum contato encontrado</h3>
                                <p className="text-gray-500 mb-4">
                                    {searchTerm ? "Tente buscar com outros termos" : "Comece adicionando um novo contato"}
                                </p>
                                {!searchTerm && (
                                    <Button onClick={() => setShowForm(true)}>
                                        <Plus className="h-4 w-4 mr-2"/>
                                        Adicionar Contato
                                    </Button>
                                )}
                            </div>
                        )}

                        {hasMore && contacts.length > 0 && (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showForm && (
                <ContactForm onSubmit={handleCreateContact} onCancel={() => setShowForm(false)} title="Novo Contato"/>
            )}

            {editingContact && (
                <ContactForm
                    contact={editingContact}
                    onSubmit={handleUpdateContact}
                    onCancel={() => setEditingContact(null)}
                    title="Editar Contato"
                />
            )}
        </div>
    )
}
