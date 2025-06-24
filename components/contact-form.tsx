"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ContatoDto } from "@/types/crm"

interface ContactFormProps {
  contact?: ContatoDto
  onSubmit: (dados: { nome: string; telefone: string; tags?: string[] }) => Promise<void>
  onCancel: () => void
  title: string
}

export default function ContactForm({ contact, onSubmit, onCancel, title }: ContactFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    tags: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (contact) {
      setFormData({
        nome: contact.nome,
        telefone: contact.telefone,
        tags: contact.tags?.join(", ") || "",
      })
    }
  }, [contact])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório"
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório"
    } else if (!/^\+?[\d\s\-$$$$]+$/.test(formData.telefone)) {
      newErrors.telefone = "Formato de telefone inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      await onSubmit({
        nome: formData.nome.trim(),
        telefone: formData.telefone.trim(),
        tags: tags.length > 0 ? tags : undefined,
      })
    } catch (err) {
      console.error("Erro ao salvar contato:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome completo"
                className={errors.nome ? "border-red-500" : ""}
              />
              {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
            </div>

            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData((prev) => ({ ...prev, telefone: e.target.value }))}
                placeholder="+55 31 99999-9999"
                className={errors.telefone ? "border-red-500" : ""}
              />
              {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>}
            </div>

            <div>
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="cliente-vip, interessado, etc."
              />
            </div>

            <div className="flex space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
