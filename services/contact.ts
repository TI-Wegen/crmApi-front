import { ApiService } from "./api";
import type {
    LoadContactsProps,
    ContatoDto,
    CreateContactDto,
    UpdateContactDto,
    PaginationState,
} from "@/types/contato";

export class ContactService {
    static async criarContato(dados: CreateContactDto): Promise<ContatoDto> {
        return ApiService.post<ContatoDto>("/api/contacts", dados);
    }

    static async listarContatos(params?: LoadContactsProps): Promise<PaginationState> {
        const searchParams = new URLSearchParams();
        if (params?.pageNumber) searchParams.set("pageNumber", params.pageNumber.toString());
        if (params?.pageSize) searchParams.set("pageSize", params.pageSize.toString());
        if (params?.incluirInativos) searchParams.set("incluirInativos", params.incluirInativos.toString());

        const query = searchParams.toString();
        return ApiService.get<PaginationState>(`/api/contacts${query ? `?${query}` : ""}`);
    }

    static async buscarContato(id: string): Promise<ContatoDto> {
        return ApiService.get<ContatoDto>(`/api/contacts/${id}`);
    }

    static async atualizarContato(id: string, dados: UpdateContactDto): Promise<ContatoDto> {
        return ApiService.put<ContatoDto>(`/api/contacts/${id}`, dados);
    }

    static async inativarContato(id: string): Promise<void> {
        return ApiService.delete<void>(`/api/contacts/${id}`);
    }
}
