import {useState, useEffect, useCallback, useRef} from "react"
import {ContactService} from "@/services/contact"
import {ContatoDto, CreateContactDto, LoadContactsProps, PaginationState, UpdateContactDto} from "@/types/contato";

export interface UseContactsReturn {
    contacts: ContatoDto[]
    loading: boolean
    error: string | null
    pagination: PaginationState
    hasMore: boolean
    loadContacts: (params?: {
        pageNumber?: number
        pageSize?: number
        incluirInativos?: boolean
    }) => Promise<void>
    loadMoreContacts: () => Promise<void>
    createContact: (data: CreateContactDto) => Promise<ContatoDto>
    updateContact: (id: string, data: UpdateContactDto) => Promise<ContatoDto>
    deactivateContact: (id: string) => Promise<void>
    searchContacts: (searchTerm: string) => void
    refreshContacts: () => Promise<void>
}

export function useContacts(): UseContactsReturn {
    const [contacts, setContacts] = useState<ContatoDto[]>([])
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)
    const [pagination, setPagination] = useState<PaginationState>({
        pageNumber: 1,
        pageSize: 20,
        total: 0,
    })
    const [hasMore, setHasMore] = useState<boolean>(true)
    const [searchTerm, setSearchTerm] = useState<string>("")
    const isSearching = useRef(false)

    const loadContacts = useCallback(async (params?: LoadContactsProps): Promise<void> => {
        setLoading(true)
        setError(null)

        try {
            const response: PaginationState = await ContactService.listarContatos({
                pageNumber: 1,
                pageSize: 20,
                ...params
            })

            const newContacts = response.data || (response as any)
            setContacts(newContacts)
            setPagination({
                pageNumber: response.pageNumber || 1,
                pageSize: response.pageSize || 20,
                total: response.total || newContacts.length || 0,
            })
            setHasMore(newContacts.length === (response.pageSize || 20))
            isSearching.current = false
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error loading contacts")
            console.error("Error loading contacts:", err)
            setHasMore(false)
        } finally {
            setLoading(false)
        }
    }, [])

    const loadMoreContacts = useCallback(async (): Promise<void> => {
        if (loading || !hasMore || isSearching.current) return

        setLoading(true)
        setError(null)

        try {
            const nextPage = pagination.pageNumber + 1
            const response: PaginationState = await ContactService.listarContatos({
                pageNumber: nextPage,
                pageSize: pagination.pageSize,
                ...(searchTerm ? {searchTerm} : {})
            })

            const newContacts = response.data || (response as any)
            setContacts(prev => [...prev, ...newContacts])
            setPagination(prev => ({
                ...prev,
                pageNumber: nextPage,
                total: response.total || (prev.total + newContacts.length) || 0,
            }))
            setHasMore(newContacts.length === pagination.pageSize)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error loading more contacts")
            console.error("Error loading more contacts:", err)
        } finally {
            setLoading(false)
        }
    }, [loading, hasMore, pagination, searchTerm])

    const refreshContacts = useCallback(async (): Promise<void> => {
        await loadContacts()
    }, [loadContacts, searchTerm])

    const createContact = useCallback(async (data: CreateContactDto): Promise<ContatoDto> => {
        setLoading(true)
        setError(null)

        try {
            const newContact: ContatoDto = await ContactService.criarContato(data) as ContatoDto
            setContacts((prev: ContatoDto[]): ContatoDto[] => [newContact, ...prev])
            setPagination(prev => ({...prev, total: prev.total + 1}))
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
            setPagination(prev => ({...prev, total: prev.total - 1}))
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error deactivating contact")
            console.error("Error deactivating contact:", err)
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    const searchContacts = useCallback((searchTerm: string): void => {
        setSearchTerm(searchTerm)

        if (!searchTerm) {
            isSearching.current = false
            loadContacts()
            return
        }

        isSearching.current = true
        setLoading(true)
        setError(null)

        try {
            const filteredContacts = contacts.filter((contact: ContatoDto): boolean => {
                const searchLower = searchTerm.toLowerCase()
                return (
                    contact.nome.toLowerCase().includes(searchLower) ||
                    contact.telefone.includes(searchTerm) ||
                    (contact.tags && contact.tags.some(tag => tag.toLowerCase().includes(searchLower)))
                    || false
                )
            })

            setContacts(filteredContacts)
            setHasMore(false)
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Error searching contacts")
            console.error("Error searching contacts:", err)
            setContacts([])
            setHasMore(false)
        } finally {
            setLoading(false)
        }
    }, [loadContacts, contacts])


    useEffect((): void => {
        loadContacts()
    }, [loadContacts])

    return {
        contacts,
        loading,
        error,
        pagination,
        hasMore,
        loadContacts,
        loadMoreContacts,
        createContact,
        updateContact,
        deactivateContact,
        searchContacts,
        refreshContacts
    }
}
