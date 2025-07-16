export interface DashboardStats {
  conversas: {
    total: number
    aguardandoNaFila: number
    emAndamento: number
    resolvidas: number
    porSetor: SetorStats[]
  }
  mensagens: {
    totalEnviadas: number
    totalRecebidas: number
    enviadasBot: number
    hoje: number
    semana: number
    mes: number
  }
  agentes: {
    online: number
    total: number
    ocupados: number
    disponiveis: number
  }
  tempoMedio: {
    primeiraResposta: number // em minutos
    resolucao: number // em minutos
  }
}

export interface SetorStats {
  id: string
  nome: string
  aguardandoNaFila: number
  emAndamento: number
  resolvidas: number
  agentesOnline: number
  tempoMedioResposta: number
}

export interface MessageHistory {
  id: string
  conversaId: string
  contatoNome: string
  contatoTelefone: string
  texto: string
  anexoUrl?: string
  remetenteTipo: "Cliente" | "Agente" | "Bot"
  agenteNome?: string
  criadoEm: string
  lida: boolean
}

export interface BotMessage {
  id: string
  conversaId: string
  contatoNome: string
  contatoTelefone: string
  texto: string
  tipoBot: "Boas-vindas" | "Menu" | "FAQ" | "Transferencia" | "Encerramento"
  sucesso: boolean
  criadoEm: string
}

export interface DashboardFilters {
  dataInicio?: string
  dataFim?: string
  setorId?: string
  agenteId?: string
  tipoMensagem?: "Todas" | "Cliente" | "Agente" | "Bot"
}
