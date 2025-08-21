import { useCallback, useEffect, useState } from "react";
import { TemplateService } from "@/services/templates";
import {TemplateDto} from "@/types/template";

export function useTemplates() {
  const [templates, setTemplates] = useState<TemplateDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await TemplateService.listarTemplates();
      setTemplates(response as TemplateDto[]);
    } catch (err) {
      console.error("Error loading templates:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

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
