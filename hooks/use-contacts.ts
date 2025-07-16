"use client"

import { useState, useEffect, useCallback } from "react"
import type { ContatoDto } from "@/types/crm"
import { ContactService } from "@/services/contact"

export function useContacts() {
  const [contacts, setContacts] = useState<ContatoDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 20,
    total: 0,
  })

  const loadContacts = useCallback(
    async (params?: {
      pageNumber?: number
      pageSize?: number
      incluirInativos?: boolean
    }) => {
      setLoading(true)
      setError(null)

      try {
        const response = (await ContactService.listarContatos(params)) as {
          data: ContatoDto[]
          total: number
          pageNumber: number
          pageSize: number
        }

        setContacts(response.data || (response as any))
        setPagination({
          pageNumber: response.pageNumber || params?.pageNumber || 1,
          pageSize: response.pageSize || params?.pageSize || 20,
          total: response.total || (response as any).length || 0,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar contatos")
        console.error("Erro ao carregar contatos:", err)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // Criar contato
  const createContact = useCallback(async (dados: { nome: string; telefone: string }) => {
    setLoading(true)
    setError(null)

    try {
      const newContact = (await ContactService.criarContato(dados)) as ContatoDto
      setContacts((prev) => [newContact, ...prev])
      return newContact
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar contato")
      console.error("Erro ao criar contato:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Atualizar contato
  const updateContact = useCallback(async (id: string, dados: { nome: string; telefone: string; tags?: string[] }) => {
    setLoading(true)
    setError(null)

    try {
      await ContactService.atualizarContato(id, dados)

      // Recarregar a lista ou atualizar localmente
      const updatedContact = (await ContactService.buscarContato(id)) as ContatoDto
      setContacts((prev) => prev.map((contact) => (contact.id === id ? updatedContact : contact)))

      return updatedContact
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar contato")
      console.error("Erro ao atualizar contato:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Inativar contato
  const deactivateContact = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      await ContactService.inativarContato(id)
      setContacts((prev) => prev.filter((contact) => contact.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao inativar contato")
      console.error("Erro ao inativar contato:", err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar contatos (filtro local)
  const searchContacts = useCallback(
    (searchTerm: string) => {
      if (!searchTerm) {
        loadContacts()
        return
      }

      const filtered = contacts.filter(
        (contact) =>
          contact.nome.toLowerCase().includes(searchTerm.toLowerCase()) || contact.telefone.includes(searchTerm),
      )

      // Para busca local, apenas filtramos os contatos existentes
      // Em uma implementação real, você pode querer fazer uma busca no servidor
      setContacts(filtered)
    },
    [contacts, loadContacts],
  )

  // Carregar contatos na inicialização
  useEffect(() => {
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
