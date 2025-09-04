"use client";

import { useState, useCallback, useEffect } from "react";
import { Plus, X, Search, UserPlus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useContacts } from "@/hooks/use-contacts";
import { useTemplates } from "@/hooks/use-templates";
import { TemplateDto } from "@/types/template";

interface NewConversationProps {
  onConversationStarted: (contactId: string, templateName: string, bodyParameters: string[]) => void;
  onCancel: () => void;
  show: boolean;
  setShow: (show: boolean) => void;
}

export default function NewConversation({
  onConversationStarted,
  onCancel,
  show,
  setShow
}: NewConversationProps) {
  const { contacts, searchContacts } = useContacts();
  const { templates, loading: templatesLoading } = useTemplates();
  const [step, setStep] = useState<"contact" | "template">("contact");
  const [selectedContact, setSelectedContact] = useState<{ id: string; nome: string; telefone: string } | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    searchContacts(value);
  };

  const handleSelectContact = (contact: { id: string; nome: string; telefone: string }) => {
    setSelectedContact(contact);
    setStep("template");
  };

  const handleStartConversation = useCallback(() => {
    if (selectedContact && selectedTemplate) {
      const template = templates.find(t => t.name === selectedTemplate);
      if (template) {
        onConversationStarted(selectedContact.id, template.name, [template.name]);
      }
    }
  }, [selectedContact, selectedTemplate, templates, onConversationStarted]);

  const handleBackToContacts = () => {
    setStep("contact");
    setSelectedTemplate("");
  };

  const handleClose = () => {
    setShow(false);
    onCancel();
    setStep("contact");
    setSelectedContact(null);
    setSelectedTemplate("");
    setSearchTerm("");
  };

  useEffect(() => {
    if (templates.length > 0 && !templates.some(t => t.name === selectedTemplate)) {
      setSelectedTemplate("");
    }
  }, [templates, selectedTemplate]);

  return (
    <>
      <div className="p-4 border-b">
        <Button
          onClick={() => setShow(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Conversa
        </Button>
      </div>

      {/* Modal de nova conversa */}
      <Dialog open={show} onOpenChange={handleClose}>
        <DialogContent className="max-w-md p-0">
          <DialogHeader className="p-4 border-b">
            <div className="flex justify-between items-center">
              <DialogTitle>
                {step === "contact" ? "Selecionar Contato" : "Selecionar Template"}
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="p-4">
            {step === "contact" ? (
              <>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar contatos..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {contacts.length > 0 ? (
                    <div className="space-y-2">
                      {contacts.map((contact) => (
                        <Card
                          key={contact.id}
                          className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleSelectContact(contact)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium">
                                  {contact.nome.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-medium text-gray-900">{contact.nome}</h3>
                                <p className="text-sm text-gray-600">{contact.telefone}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <UserPlus className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-600 mb-2">Nenhum contato encontrado</h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm ? "Tente buscar com outros termos" : "Comece adicionando um novo contato"}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="mb-4">
                  <Button variant="ghost" onClick={handleBackToContacts} className="mb-2">
                    ← Voltar
                  </Button>
                  <Card className="mb-4">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {selectedContact?.nome.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{selectedContact?.nome}</h3>
                          <p className="text-sm text-gray-600">{selectedContact?.telefone}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecione um template
                    </label>
                    <Select
                      value={selectedTemplate}
                      onValueChange={setSelectedTemplate}
                      disabled={templatesLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={templatesLoading ? "Carregando templates..." : "Escolha um template"} />
                      </SelectTrigger>
                      <SelectContent>
                        {templatesLoading ? (
                          <SelectItem value="__loading__" disabled>
                            Carregando...
                          </SelectItem>
                        ) : (
                          templates.map((template) => (
                            <SelectItem key={template.id} value={template.name}>
                              {template.body}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedTemplate && (
                    <Card className="mb-4">
                      <CardContent className="p-3">
                        <h4 className="font-medium text-gray-900 mb-2">Pré-visualização</h4>
                        <p className="text-sm text-gray-600">
                          {templates.find(t => t.name === selectedTemplate)?.body.replace(/{{\d+}}/g, selectedContact?.nome || "")}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    className="w-full"
                    onClick={handleStartConversation}
                    disabled={!selectedTemplate || templatesLoading}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Iniciar Conversa
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
