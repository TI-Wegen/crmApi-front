export interface Tag {
    id: string;
    nome: string;
    cor: string;
    descricao?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateTagDto {
    name: string;
    color: string;
    description?: string;
}

export interface UpdateTagDto {
    name?: string;
    color?: string;
    description?: string;
}
