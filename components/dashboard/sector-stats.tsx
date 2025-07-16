"use client"

import { Users, Clock, CheckCircle, Timer } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SetorStats } from "@/types/dashboard"

interface SectorStatsProps {
  sectors: SetorStats[] | null
  loading?: boolean
}

export default function SectorStats({ sectors, loading }: SectorStatsProps) {
  if (loading || !sectors) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (sectors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estatísticas por Setor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">Nenhum setor encontrado</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="h-5 w-5 mr-2" />
          Estatísticas por Setor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sectors.map((sector) => {
            const total = sector.aguardandoNaFila + sector.emAndamento + sector.resolvidas
            const filaPercentage = total > 0 ? (sector.aguardandoNaFila / total) * 100 : 0
            const andamentoPercentage = total > 0 ? (sector.emAndamento / total) * 100 : 0
            const resolvidasPercentage = total > 0 ? (sector.resolvidas / total) * 100 : 0

            return (
              <div key={sector.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{sector.nome}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      {sector.agentesOnline} online
                    </Badge>
                    <Badge variant="secondary">
                      <Timer className="h-3 w-3 mr-1" />
                      {Math.round(sector.tempoMedioResposta)}min
                    </Badge>
                  </div>
                </div>

                {/* Estatísticas do setor */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Clock className="h-4 w-4 text-yellow-600 mr-1" />
                      <span className="text-sm font-medium text-gray-600">Na Fila</span>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">{sector.aguardandoNaFila}</div>
                    <div className="text-xs text-gray-500">{filaPercentage.toFixed(1)}%</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="h-4 w-4 text-blue-600 mr-1" />
                      <span className="text-sm font-medium text-gray-600">Em Andamento</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{sector.emAndamento}</div>
                    <div className="text-xs text-gray-500">{andamentoPercentage.toFixed(1)}%</div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm font-medium text-gray-600">Resolvidas</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{sector.resolvidas}</div>
                    <div className="text-xs text-gray-500">{resolvidasPercentage.toFixed(1)}%</div>
                  </div>
                </div>

                {/* Barra de progresso visual */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Distribuição das conversas</span>
                    <span>{total} total</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
                    {filaPercentage > 0 && <div className="bg-yellow-500" style={{ width: `${filaPercentage}%` }} />}
                    {andamentoPercentage > 0 && (
                      <div className="bg-blue-500" style={{ width: `${andamentoPercentage}%` }} />
                    )}
                    {resolvidasPercentage > 0 && (
                      <div className="bg-green-500" style={{ width: `${resolvidasPercentage}%` }} />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
