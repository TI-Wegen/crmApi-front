import {useState, useEffect, useCallback} from "react"
import {ContactService} from "@/services/contact"
import {ContatoDto, CreateContactDto, LoadContactsProps, PaginationState, UpdateContactDto} from "@/types/contato";

export interface UseContactsReturn {
    contacts: ContatoDto[]
    loading: boolean
    error: string | null
    pagination: PaginationState
    loadContacts: (params?: {
        pageNumber?: number
        pageSize?: number
        incluirInativos?: boolean
    }) => Promise<void>
    createContact: (data: CreateContactDto) => Promise<ContatoDto>
    updateContact: (id: string, data: UpdateContactDto) => Promise<ContatoDto>
    deactivateContact: (id: string) => Promise<void>
    searchContacts: (searchTerm: string) => void
}

export function useContacts(): UseContactsReturn {
    const [contacts, setContacts] = useState<ContatoDto[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState<PaginationState>({
        pageNumber: 1,
        pageSize: 100,
        total: 0,
    })

    const loadContacts = useCallback(async (params?: LoadContactsProps): Promise<void> => {
        setLoading(true)
        setError(null)

        try {
            const response: PaginationState = await ContactService.listarContatos(params)

            setContacts(response.data || (response as any))
            setPagination({
                pageNumber: response.pageNumber || params?.pageNumber || 1,
                pageSize: response.pageSize || params?.pageSize || 100,
                total: response.total || (response as any).length || 0,
            })
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error loading contacts")
            console.error("Error loading contacts:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    const createContact = useCallback(async (data: CreateContactDto): Promise<ContatoDto> => {
        setLoading(true)
        setError(null)

        try {
            const newContact: ContatoDto = await ContactService.criarContato(data) as ContatoDto
            setContacts((prev: ContatoDto[]): ContatoDto[] => [newContact, ...prev])
            return newContact
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error creating contact")
            console.error("Error creating contact:", err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const updateContact = useCallback(async (id: string, data: UpdateContactDto): Promise<ContatoDto> => {
        setLoading(true)
        setError(null)

        try {
            await ContactService.atualizarContato(id, data)

            const updatedContact: ContatoDto = await ContactService.buscarContato(id) as ContatoDto
            setContacts((prev: ContatoDto[]): ContatoDto[] =>
                prev.map((contact: ContatoDto): ContatoDto => (contact.id === id ? updatedContact : contact))
            )

            return updatedContact
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error updating contact")
            console.error("Error updating contact:", err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const deactivateContact = useCallback(async (id: string): Promise<void> => {
        setLoading(true)
        setError(null)

        try {
            await ContactService.inativarContato(id)
            setContacts((prev: ContatoDto[]): ContatoDto[] =>
                prev.filter((contact: ContatoDto): boolean => contact.id !== id)
            )
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error deactivating contact")
            console.error("Error deactivating contact:", err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const searchContacts = useCallback((searchTerm: string): void => {
        if (!searchTerm) {
            loadContacts()
            return
        }

        const filtered: ContatoDto[] = contacts.filter(
            (contact: ContatoDto): boolean =>
                contact.nome.toLowerCase().includes(searchTerm.toLowerCase()) || contact.telefone.includes(searchTerm),
        )

        setContacts(filtered)
    }, [contacts, loadContacts])

    useEffect((): void => {
        loadContacts()
    }, [loadContacts])

    return {
        contacts,
        loading,
        error,
        pagination,
        loadContacts,
        createContact,
        updateContact,
        deactivateContact,
        searchContacts,
    }
}