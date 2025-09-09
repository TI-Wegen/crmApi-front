import React, {useState, useEffect} from 'react';
import {X, Save} from "lucide-react";
import {useContacts} from "@/hooks/use-contacts";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";

interface UserProfileMenuProps {
    user: {
        id?: string;
        name: string;
        phone: string;
        about?: string;
        avatar?: string;
        tagName?: string;
        tagColor?: string;
    };
    isOpen: boolean;
    onClose: () => void;
    onlyView?: boolean;
    onUserUpdate?: (updatedUser: { name: string }) => void;
}

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({user, isOpen, onClose, onlyView = true, onUserUpdate}) => {
    const {updateContact} = useContacts();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setName(user.name);
        setIsEditing(false);
    }, [user.name, user.id]);

    const handleSave = async () => {
        if (!user.id) return;

        setIsSaving(true);
        try {
            await updateContact(user.id, {
                nome: name,
                telefone: user.phone
            });

            if (onUserUpdate) {
                onUserUpdate({ name });
            }

            setIsEditing(false);
        } catch (error) {
            console.error("Erro ao atualizar contato:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setName(user.name);
        setIsEditing(false);
    };

    return (
        <div
            className={`w-80 bg-white shadow-lg transform transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'opacity-100 translate-x-0' : 'opacity-0 w-0 hidden'}`}>

        <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Perfil do Usuário</h2>
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X size={20}/>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 h-full">
                <div className="flex flex-col items-center mb-6">
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-24 h-24 rounded-full object-cover mb-4"
                        />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                            <span className="text-2xl font-bold text-gray-600">
                                {user.name.charAt(0)}
                            </span>
                        </div>
                    )}

                    {isEditing ? (
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="text-center font-bold text-xl"
                        />
                    ) : (
                        <h3 className="text-xl font-bold">{user.name}</h3>
                    )}
                    <p className="text-gray-600">{user.phone}</p>
                </div>

                {user.about && (
                    <div className="mb-6">
                        <h4 className="font-semibold mb-2">Sobre</h4>
                        <p className="text-gray-700">{user.about}</p>
                    </div>
                )}

                <div className="mb-6">
                    <h4 className="font-semibold mb-2">Informações de Contato</h4>
                    <div className="space-y-2">
                        <div>
                            <p className="text-sm text-gray-500">Nome</p>
                            {isEditing ? (
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            ) : (
                                <p className="font-medium">{user.name}</p>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Telefone</p>
                            <p className="font-medium">{user.phone}</p>
                        </div>
                    </div>
                </div>

                {user.tagName && (
                    <>
                        <hr className="my-6 border-gray-200"/>
                        <div className="mb-6">
                            <h4 className="font-semibold mb-2">Tag</h4>
                            <div className="flex items-center">
                                <span
                                    className="inline-block w-3 h-3 rounded-full mr-2"
                                    style={{backgroundColor: user.tagColor || '#ccc'}}
                                ></span>
                                <span className="font-medium">{user.tagName}</span>
                            </div>
                        </div>
                    </>
                )}

                {!onlyView && (
                    <div className="flex justify-end space-x-2 mt-6">
                        {isEditing ? (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    disabled={isSaving}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        "Salvando..."
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4"/>
                                            Salvar
                                        </>
                                    )}
                                </Button>
                            </>
                        ) : (
                            <Button
                                onClick={() => setIsEditing(true)}
                                disabled={!user.id}
                            >
                                Editar
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserProfileMenu;
