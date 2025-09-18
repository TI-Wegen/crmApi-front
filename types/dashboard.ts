export interface DashboardStats {
    totalMensagemEnviadas: number;
    totalMensagemRecebidas: number;
    totalMensagemRecebidasHoje: number;
    totalMensagemRecebidasSemana: number;
    totalMensagemRecebidasMes: number;
    totalAguardandoNaFila: number;
    totalEmAtendimento: number;
    totalResolvidas: number;
}

export interface DashboardPersonal {
    conversasResolvidas: number;
    conversasAtivas: number;
    mediaAvaliacao: number;
    conversasPendentes: number;
    conversasEmAndamento: number;
}