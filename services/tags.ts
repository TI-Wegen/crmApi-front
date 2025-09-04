import {ApiService} from "./api";
import type {CreateTagDto, Tag, UpdateTagDto} from "@/types/tag";
import {PaginatedResponse} from "@/types/common/pagination";


const mapTagFromApi = (apiTag: Tag): Tag => ({
    id: apiTag.id,
    nome: apiTag.nome,
    cor: apiTag.cor,
    descricao: apiTag.descricao,
    createdAt: apiTag.createdAt || new Date().toISOString(),
    updatedAt: apiTag.updatedAt || new Date().toISOString()
});


export class TagsService {
    static async getAll(pageNumber: number = 1, pageSize: number = 20): Promise<Tag[]> {
        const params = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString()
        });

        const queryString = params.toString();
        const url = `/api/tags${queryString ? `?${queryString}` : ''}`;

        const response = await ApiService.get<PaginatedResponse<Tag>>(url);
        return response.items.map(mapTagFromApi);
    }

    static async getById(id: string): Promise<Tag> {
        const apiTag = await ApiService.get<Tag>(`/api/tags/${id}`);
        return mapTagFromApi(apiTag);
    }

    static async create(data: CreateTagDto): Promise<Tag> {
        const apiTag = await ApiService.post<Tag>("/api/tags", data);
        return mapTagFromApi(apiTag);
    }

    static async update(id: string, data: UpdateTagDto): Promise<Tag> {
        const apiTag = await ApiService.put<Tag>(`/api/tags/${id}`, data);
        return mapTagFromApi(apiTag);
    }

    static async delete(id: string): Promise<void> {
        await ApiService.delete<void>(`/api/tags/${id}`);
    }
}
