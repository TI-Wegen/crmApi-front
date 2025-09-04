"use client";

import TagForm from "@/components/tag-form";
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Tag, CreateTagDto, UpdateTagDto} from "@/types/tag";

interface TagModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editingTag: Tag | null;
    onCreate: (data: CreateTagDto) => void;
    onUpdate: (data: UpdateTagDto) => void;
    onCancel: () => void;
}

export function TagModal({
                             open,
                             onOpenChange,
                             editingTag,
                             onCreate,
                             onUpdate,
                             onCancel
                         }: TagModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {editingTag ? 'Editar Tag' : 'Criar Nova Tag'}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {editingTag ? (
                        <TagForm
                            tag={editingTag}
                            onSubmit={(data) => onUpdate(data as UpdateTagDto)}
                            onCancel={() => {
                                onOpenChange(false);
                                onCancel();
                            }}
                        />
                    ) : (
                        <TagForm
                            onSubmit={(data) => onCreate(data as unknown as CreateTagDto)}
                            onCancel={() => {
                                onOpenChange(false);
                                onCancel();
                            }}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
