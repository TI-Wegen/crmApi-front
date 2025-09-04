// components/tag-form.tsx
"use client";

import {useState, useEffect} from 'react';
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {Label} from "@/components/ui/label";
import {Tag} from '@/types/tag';
import {getContrastColor} from "@/utils/contrast-color";

interface TagFormProps {
    tag?: Tag;
    onSubmit: (data: { nome: string; cor: string; descricao?: string }) => void;
    onCancel: () => void;
    loading?: boolean;
}

const DEFAULT_COLORS = [
    '#FFD700',
    '#4169E1',
    '#DC143C',
    '#32CD32',
    '#9370DB',
    '#FF6347',
    '#20B2AA',
    '#FF69B4',
    '#000000',
    '#FFFFFF',
];

export default function TagForm({tag, onSubmit, onCancel, loading}: TagFormProps) {
    const [nome, setNome] = useState(tag?.nome || tag?.nome || '');
    const [cor, setCor] = useState(tag?.cor || tag?.cor || DEFAULT_COLORS[0]);
    const [descricao, setDescricao] = useState(tag?.descricao || tag?.descricao || '');
    const [customColor, setCustomColor] = useState(tag?.cor || tag?.cor || DEFAULT_COLORS[0]);

    useEffect(() => {
        if (tag) {
            setNome(tag.nome || tag.nome || '');
            setCor(tag.cor || tag.cor || DEFAULT_COLORS[0]);
            setDescricao(tag.descricao || tag.descricao || '');
            setCustomColor(tag.cor || tag.cor || DEFAULT_COLORS[0]);
        } else {
            setNome('');
            setCor(DEFAULT_COLORS[0]);
            setDescricao('');
            setCustomColor(DEFAULT_COLORS[0]);
        }
    }, [tag]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({nome, cor, descricao});
    };

    const handleColorChange = (newColor: string) => {
        setCor(newColor);
        setCustomColor(newColor);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="nome">Nome da Tag</Label>
                <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Cliente VIP"
                    required
                />
            </div>

            <div>
                <Label>Cor</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {DEFAULT_COLORS.map((c) => (
                        <button
                            key={c}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 ${
                                cor === c
                                    ? 'border-gray-800 ring-2 ring-offset-2 ring-blue-500'
                                    : 'border-gray-300'
                            }`}
                            style={{backgroundColor: c}}
                            onClick={() => handleColorChange(c)}
                            aria-label={`Cor ${c}`}
                        />
                    ))}
                </div>

                <div className="flex items-center mt-4">
                    <div className="flex items-center">
                        <Label htmlFor="custom-color" className="mr-2">Personalizar:</Label>
                        <Input
                            id="custom-color"
                            type="color"
                            value={customColor}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="w-12 h-10 p-1 cursor-pointer"
                        />
                    </div>
                    <Input
                        type="text"
                        value={cor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        placeholder="#000000"
                        className="ml-2 flex-1"
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="descricao">Descrição (Opcional)</Label>
                <Textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descreva para que serve esta tag"
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={loading || !nome.trim()}
                    style={{backgroundColor: cor, color: getContrastColor(cor)}}
                >
                    {tag ? 'Atualizar Tag' : 'Criar Tag'}
                </Button>
            </div>
        </form>
    );
}
