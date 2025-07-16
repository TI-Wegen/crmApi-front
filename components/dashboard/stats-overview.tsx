"use client"

import { Users, MessageCircle, Clock, CheckCircle, Bot, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { DashboardStats } from "@/types/dashboard"

interface StatsOverviewProps {
  stats: DashboardStats | null
  loading?: boolean
}

export default function StatsOverview({ stats, loading }: StatsOverviewProps) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: "Total de Conversas",
      value: stats.conversas.total,
      icon: MessageCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      subtitle: "Todas as conversas",
    },
    {
      title: "Na Fila",
      value: stats.conversas.aguardandoNaFila,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      subtitle: "Aguardando atendimento",
    },
    {
      title: "Em Andamento",
      value: stats.conversas.emAndamento,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
      subtitle: "Sendo atendidas",
    },
    {
      title: "Resolvidas",
      value: stats.conversas.resolvidas,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      subtitle: "Finalizadas",
    },
    {
      title: "Mensagens Enviadas",
      value: stats.mensagens.totalEnviadas,
      icon: TrendingUp,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      subtitle: `${stats.mensagens.hoje} hoje`,
    },
    {
      title: "Mensagens Recebidas",
      value: stats.mensagens.totalRecebidas,
      icon: MessageCircle,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
      subtitle: `${stats.mensagens.semana} esta semana`,
    },
    {
      title: "Mensagens do Bot",
      value: stats.mensagens.enviadasBot,
      icon: Bot,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      subtitle: "Automatizadas",
    },
    {
      title: "Agentes Online",
      value: stats.agentes.online,
      icon: Users,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      subtitle: `${stats.agentes.total} total`,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Tempos médios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tempo Médio de Primeira Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{Math.round(stats.tempoMedio.primeiraResposta)} min</div>
            <p className="text-sm text-gray-500 mt-1">
              Meta: {"<"} 5 minutos
              <Badge variant={stats.tempoMedio.primeiraResposta <= 5 ? "default" : "destructive"} className="ml-2">
                {stats.tempoMedio.primeiraResposta <= 5 ? "✓ Meta atingida" : "⚠ Acima da meta"}
              </Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tempo Médio de Resolução</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{Math.round(stats.tempoMedio.resolucao)} min</div>
            <p className="text-sm text-gray-500 mt-1">
              Meta: {"<"} 30 minutos
              <Badge variant={stats.tempoMedio.resolucao <= 30 ? "default" : "destructive"} className="ml-2">
                {stats.tempoMedio.resolucao <= 30 ? "✓ Meta atingida" : "⚠ Acima da meta"}
              </Badge>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
