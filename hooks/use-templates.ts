import { TemplateService } from "@/services/templates";
import { TemplateDto } from "@/types/crm";
import { use, useCallback, useEffect, useState } from "react";


export function UseTemplates() {
  const [templates, setTemplates] = useState<TemplateDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates =  useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
        const response = (await TemplateService.listarTemplates()) as any   
      setTemplates(response as TemplateDto[]);
    } catch (err) {
        console.error("Erro ao carregar templates:", err);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }
    , []);


    useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);


  return {
    templates,
    loading,
    error,
    loadTemplates,
  };

}