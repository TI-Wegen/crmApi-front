import { ApiService } from "./api";

export class ContactService {
      static async criarContato(dados: { nome: string; telefone: string }) {
        return ApiService.request("/api/contacts", {
          method: "POST",
          body: JSON.stringify(dados),
        })
      }
    
      static async listarContatos(params?: {
        pageNumber?: number
        pageSize?: number
        incluirInativos?: boolean
      }) {
        const searchParams = new URLSearchParams()
        if (params?.pageNumber) searchParams.set("pageNumber", params.pageNumber.toString())
        if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString())
        if (params?.incluirInativos) searchParams.set("incluirInativos", params.incluirInativos.toString())
    
        const query = searchParams.toString()
        return ApiService.request(`/api/contacts${query ? `?${query}` : ""}`)
      }
    
      static async buscarContato(id: string) {
        return ApiService.request(`/api/contacts/${id}`)
      }
    
      static async atualizarContato(id: string, dados: { nome: string; telefone: string; tags?: string[] }) {
        return ApiService.request(`/api/contacts/${id}`, {
          method: "PUT",
          body: JSON.stringify(dados),
        })
      }
    
      static async inativarContato(id: string) {
        return ApiService.request(`/api/contacts/${id}`, {
          method: "DELETE",
        })
      }
}