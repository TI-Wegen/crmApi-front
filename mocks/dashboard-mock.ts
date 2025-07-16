import type { DashboardStats, MessageHistory, BotMessage } from "@/types/dashboard"

// Mock de dados para estatísticas do dashboard
export const mockDashboardStats: DashboardStats = {
  conversas: {
    total: 1247,
    aguardandoNaFila: 23,
    emAndamento: 45,
    resolvidas: 1179,
    porSetor: [
      {
        id: "1",
        nome: "Suporte Técnico",
        aguardandoNaFila: 8,
        emAndamento: 15,
        resolvidas: 342,
        agentesOnline: 5,
        tempoMedioResposta: 3.2,
      },
      {
        id: "2",
        nome: "Vendas",
        aguardandoNaFila: 12,
        emAndamento: 18,
        resolvidas: 456,
        agentesOnline: 7,
        tempoMedioResposta: 2.8,
      },
      {
        id: "3",
        nome: "Financeiro",
        aguardandoNaFila: 3,
        emAndamento: 8,
        resolvidas: 234,
        agentesOnline: 3,
        tempoMedioResposta: 4.1,
      },
      {
        id: "4",
        nome: "Recursos Humanos",
        aguardandoNaFila: 0,
        emAndamento: 4,
        resolvidas: 147,
        agentesOnline: 2,
        tempoMedioResposta: 5.5,
      },
    ],
  },
  mensagens: {
    totalEnviadas: 8934,
    totalRecebidas: 12456,
    enviadasBot: 3421,
    hoje: 234,
    semana: 1678,
    mes: 6789,
  },
  agentes: {
    online: 17,
    total: 25,
    ocupados: 12,
    disponiveis: 5,
  },
  tempoMedio: {
    primeiraResposta: 4.2,
    resolucao: 28.5,
  },
}

// Mock de histórico de mensagens
export const mockMessageHistory: MessageHistory[] = [
  {
    id: "msg-001",
    conversaId: "conv-001",
    contatoNome: "João Silva",
    contatoTelefone: "+55 31 99999-1234",
    texto: "Olá, preciso de ajuda com meu pedido #12345",
    remetenteTipo: "Cliente",
    criadoEm: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    lida: true,
  },
  {
    id: "msg-002",
    conversaId: "conv-001",
    contatoNome: "João Silva",
    contatoTelefone: "+55 31 99999-1234",
    texto: "Olá João! Vou verificar seu pedido agora mesmo. Um momento, por favor.",
    remetenteTipo: "Agente",
    agenteNome: "Maria Santos",
    criadoEm: new Date(Date.now() - 2 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString(), // 3 min depois
    lida: true,
  },
  {
    id: "msg-003",
    conversaId: "conv-002",
    contatoNome: "Ana Costa",
    contatoTelefone: "+55 31 98888-5678",
    texto: "Gostaria de saber sobre os planos disponíveis",
    remetenteTipo: "Cliente",
    criadoEm: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hora atrás
    lida: true,
  },
  {
    id: "msg-004",
    conversaId: "conv-002",
    contatoNome: "Ana Costa",
    contatoTelefone: "+55 31 98888-5678",
    texto:
      "Claro! Temos 3 planos principais: Básico (R$ 29,90), Intermediário (R$ 49,90) e Premium (R$ 79,90). Qual seria seu interesse?",
    remetenteTipo: "Agente",
    agenteNome: "Carlos Oliveira",
    criadoEm: new Date(Date.now() - 1 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(),
    lida: true,
  },
  {
    id: "msg-005",
    conversaId: "conv-003",
    contatoNome: "Pedro Almeida",
    contatoTelefone: "+55 31 97777-9012",
    texto: "Minha conta foi bloqueada, podem me ajudar?",
    remetenteTipo: "Cliente",
    criadoEm: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min atrás
    lida: false,
  },
  {
    id: "msg-006",
    conversaId: "conv-004",
    contatoNome: "Lucia Ferreira",
    contatoTelefone: "+55 31 96666-3456",
    texto: "Preciso cancelar minha assinatura",
    remetenteTipo: "Cliente",
    criadoEm: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 min atrás
    lida: true,
  },
  {
    id: "msg-007",
    conversaId: "conv-004",
    contatoNome: "Lucia Ferreira",
    contatoTelefone: "+55 31 96666-3456",
    texto:
      "Entendo sua solicitação, Lucia. Posso processar o cancelamento para você. Poderia me informar o motivo para melhorarmos nossos serviços?",
    remetenteTipo: "Agente",
    agenteNome: "Ana Paula",
    criadoEm: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    lida: true,
  },
  {
    id: "msg-008",
    conversaId: "conv-005",
    contatoNome: "Roberto Santos",
    contatoTelefone: "+55 31 95555-7890",
    texto: "Como faço para alterar meus dados cadastrais?",
    remetenteTipo: "Cliente",
    criadoEm: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
    lida: true,
  },
  {
    id: "msg-009",
    conversaId: "conv-006",
    contatoNome: "Fernanda Lima",
    contatoTelefone: "+55 31 94444-2468",
    texto: "Estou com dificuldades para acessar o sistema",
    anexoUrl: "https://example.com/screenshot.png",
    remetenteTipo: "Cliente",
    criadoEm: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 dias atrás
    lida: true,
  },
  {
    id: "msg-010",
    conversaId: "conv-007",
    contatoNome: "Marcos Pereira",
    contatoTelefone: "+55 31 93333-1357",
    texto: "Quando será lançada a nova funcionalidade?",
    remetenteTipo: "Cliente",
    criadoEm: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
    lida: true,
  },
]

// Mock de mensagens do bot
export const mockBotMessages: BotMessage[] = [
  {
    id: "bot-001",
    conversaId: "conv-001",
    contatoNome: "João Silva",
    contatoTelefone: "+55 31 99999-1234",
    texto: "Olá! 👋 Bem-vindo ao nosso atendimento. Como posso ajudá-lo hoje?",
    tipoBot: "Boas-vindas",
    sucesso: true,
    criadoEm: new Date(Date.now() - 2 * 60 * 60 * 1000 - 5 * 60 * 1000).toISOString(),
  },
  {
    id: "bot-002",
    conversaId: "conv-002",
    contatoNome: "Ana Costa",
    contatoTelefone: "+55 31 98888-5678",
    texto: "Escolha uma das opções abaixo:\n\n1️⃣ Suporte Técnico\n2️⃣ Vendas\n3️⃣ Financeiro\n4️⃣ Falar com atendente",
    tipoBot: "Menu",
    sucesso: true,
    criadoEm: new Date(Date.now() - 1 * 60 * 60 * 1000 - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "bot-003",
    conversaId: "conv-003",
    contatoNome: "Pedro Almeida",
    contatoTelefone: "+55 31 97777-9012",
    texto:
      "Aqui estão algumas perguntas frequentes:\n\n❓ Como redefinir minha senha?\n❓ Como alterar meus dados?\n❓ Como cancelar minha conta?",
    tipoBot: "FAQ",
    sucesso: true,
    criadoEm: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
  {
    id: "bot-004",
    conversaId: "conv-004",
    contatoNome: "Lucia Ferreira",
    contatoTelefone: "+55 31 96666-3456",
    texto: "Transferindo você para um atendente especializado. Aguarde um momento... ⏳",
    tipoBot: "Transferencia",
    sucesso: true,
    criadoEm: new Date(Date.now() - 50 * 60 * 1000).toISOString(),
  },
  {
    id: "bot-005",
    conversaId: "conv-008",
    contatoNome: "Carlos Mendes",
    contatoTelefone: "+55 31 92222-4680",
    texto: "Obrigado por entrar em contato! Sua solicitação foi resolvida. Avalie nosso atendimento: ⭐⭐⭐⭐⭐",
    tipoBot: "Encerramento",
    sucesso: true,
    criadoEm: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bot-006",
    conversaId: "conv-009",
    contatoNome: "Beatriz Rocha",
    contatoTelefone: "+55 31 91111-9753",
    texto: "Olá! 👋 Bem-vindo ao nosso atendimento. Como posso ajudá-lo hoje?",
    tipoBot: "Boas-vindas",
    sucesso: false,
    criadoEm: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bot-007",
    conversaId: "conv-010",
    contatoNome: "Rafael Costa",
    contatoTelefone: "+55 31 90000-8642",
    texto:
      "Para redefinir sua senha:\n\n1. Acesse 'Esqueci minha senha'\n2. Digite seu email\n3. Verifique sua caixa de entrada\n4. Clique no link recebido",
    tipoBot: "FAQ",
    sucesso: true,
    criadoEm: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bot-008",
    conversaId: "conv-011",
    contatoNome: "Juliana Martins",
    contatoTelefone: "+55 31 89999-7531",
    texto: "Escolha uma das opções abaixo:\n\n1️⃣ Suporte Técnico\n2️⃣ Vendas\n3️⃣ Financeiro\n4️⃣ Falar com atendente",
    tipoBot: "Menu",
    sucesso: true,
    criadoEm: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bot-009",
    conversaId: "conv-012",
    contatoNome: "Eduardo Silva",
    contatoTelefone: "+55 31 88888-6420",
    texto: "Transferindo você para o setor financeiro. Aguarde um momento... ⏳",
    tipoBot: "Transferencia",
    sucesso: false,
    criadoEm: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bot-010",
    conversaId: "conv-013",
    contatoNome: "Camila Santos",
    contatoTelefone: "+55 31 87777-5309",
    texto: "Obrigado por entrar em contato! Sua solicitação foi resolvida. Avalie nosso atendimento: ⭐⭐⭐⭐⭐",
    tipoBot: "Encerramento",
    sucesso: true,
    criadoEm: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Função para gerar mais mensagens de histórico (simulação de paginação)
export const generateMoreMessageHistory = (page: number, pageSize: number): MessageHistory[] => {
  const baseMessages = mockMessageHistory
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize

  // Simular mais mensagens duplicando e modificando as existentes
  const additionalMessages: MessageHistory[] = []

  for (let i = 0; i < pageSize; i++) {
    const baseIndex = i % baseMessages.length
    const baseMessage = baseMessages[baseIndex]

    additionalMessages.push({
      ...baseMessage,
      id: `msg-${startIndex + i + 1}`,
      conversaId: `conv-${Math.floor(Math.random() * 100) + 1}`,
      contatoNome: `${baseMessage.contatoNome} ${Math.floor(Math.random() * 100)}`,
      contatoTelefone: `+55 31 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
      criadoEm: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      lida: Math.random() > 0.3, // 70% das mensagens são lidas
    })
  }

  return additionalMessages
}

// Função para gerar mais mensagens do bot (simulação de paginação)
export const generateMoreBotMessages = (page: number, pageSize: number): BotMessage[] => {
  const baseMessages = mockBotMessages
  const startIndex = (page - 1) * pageSize

  const additionalMessages: BotMessage[] = []

  for (let i = 0; i < pageSize; i++) {
    const baseIndex = i % baseMessages.length
    const baseMessage = baseMessages[baseIndex]

    additionalMessages.push({
      ...baseMessage,
      id: `bot-${startIndex + i + 1}`,
      conversaId: `conv-${Math.floor(Math.random() * 100) + 1}`,
      contatoNome: `${baseMessage.contatoNome.split(" ")[0]} ${["Silva", "Santos", "Costa", "Oliveira", "Pereira"][Math.floor(Math.random() * 5)]}`,
      contatoTelefone: `+55 31 9${Math.floor(Math.random() * 9000) + 1000}-${Math.floor(Math.random() * 9000) + 1000}`,
      sucesso: Math.random() > 0.15, // 85% de taxa de sucesso
      criadoEm: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }

  return additionalMessages
}

// Função para simular filtros nas mensagens
export const filterMessageHistory = (
  messages: MessageHistory[],
  filters: {
    dataInicio?: string
    dataFim?: string
    tipoMensagem?: "Todas" | "Cliente" | "Agente" | "Bot"
    searchTerm?: string
  },
): MessageHistory[] => {
  return messages.filter((message) => {
    // Filtro por data
    if (filters.dataInicio) {
      const messageDate = new Date(message.criadoEm)
      const startDate = new Date(filters.dataInicio)
      if (messageDate < startDate) return false
    }

    if (filters.dataFim) {
      const messageDate = new Date(message.criadoEm)
      const endDate = new Date(filters.dataFim)
      endDate.setHours(23, 59, 59, 999) // Fim do dia
      if (messageDate > endDate) return false
    }

    // Filtro por tipo
    if (filters.tipoMensagem && filters.tipoMensagem !== "Todas") {
      if (message.remetenteTipo !== filters.tipoMensagem) return false
    }

    // Filtro por busca
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const matchesText = message.texto.toLowerCase().includes(searchLower)
      const matchesName = message.contatoNome.toLowerCase().includes(searchLower)
      const matchesPhone = message.contatoTelefone.includes(searchLower)

      if (!matchesText && !matchesName && !matchesPhone) return false
    }

    return true
  })
}

// Função para simular filtros nas mensagens do bot
export const filterBotMessages = (
  messages: BotMessage[],
  filters: {
    dataInicio?: string
    dataFim?: string
    tipoBot?: string
    searchTerm?: string
  },
): BotMessage[] => {
  return messages.filter((message) => {
    // Filtro por data
    if (filters.dataInicio) {
      const messageDate = new Date(message.criadoEm)
      const startDate = new Date(filters.dataInicio)
      if (messageDate < startDate) return false
    }

    if (filters.dataFim) {
      const messageDate = new Date(message.criadoEm)
      const endDate = new Date(filters.dataFim)
      endDate.setHours(23, 59, 59, 999)
      if (messageDate > endDate) return false
    }

    // Filtro por tipo de bot
    if (filters.tipoBot && filters.tipoBot !== "Todos") {
      if (message.tipoBot !== filters.tipoBot) return false
    }

    // Filtro por busca
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      const matchesText = message.texto.toLowerCase().includes(searchLower)
      const matchesName = message.contatoNome.toLowerCase().includes(searchLower)
      const matchesPhone = message.contatoTelefone.includes(searchLower)

      if (!matchesText && !matchesName && !matchesPhone) return false
    }

    return true
  })
}

// Função para simular estatísticas dinâmicas baseadas em filtros
export const generateFilteredStats = (filters: {
  dataInicio?: string
  dataFim?: string
  setorId?: string
}): DashboardStats => {
  // Simular variação nas estatísticas baseada nos filtros
  const baseStats = mockDashboardStats
  const variation = Math.random() * 0.3 + 0.85 // Variação entre 85% e 115%

  return {
    ...baseStats,
    conversas: {
      ...baseStats.conversas,
      total: Math.floor(baseStats.conversas.total * variation),
      aguardandoNaFila: Math.floor(baseStats.conversas.aguardandoNaFila * variation),
      emAndamento: Math.floor(baseStats.conversas.emAndamento * variation),
      resolvidas: Math.floor(baseStats.conversas.resolvidas * variation),
      porSetor: baseStats.conversas.porSetor.map((setor) => ({
        ...setor,
        aguardandoNaFila: Math.floor(setor.aguardandoNaFila * variation),
        emAndamento: Math.floor(setor.emAndamento * variation),
        resolvidas: Math.floor(setor.resolvidas * variation),
      })),
    },
    mensagens: {
      ...baseStats.mensagens,
      totalEnviadas: Math.floor(baseStats.mensagens.totalEnviadas * variation),
      totalRecebidas: Math.floor(baseStats.mensagens.totalRecebidas * variation),
      enviadasBot: Math.floor(baseStats.mensagens.enviadasBot * variation),
      hoje: Math.floor(baseStats.mensagens.hoje * variation),
      semana: Math.floor(baseStats.mensagens.semana * variation),
      mes: Math.floor(baseStats.mensagens.mes * variation),
    },
    tempoMedio: {
      primeiraResposta: baseStats.tempoMedio.primeiraResposta * (0.8 + Math.random() * 0.4),
      resolucao: baseStats.tempoMedio.resolucao * (0.8 + Math.random() * 0.4),
    },
  }
}
