"use client"

import React from "react"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart"
import {Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis} from "recharts"
import {useDashboard} from "@/hooks/use-dashboard"
import {RotateCw} from "lucide-react"

export default function DashboardPage() {
    const {dashboardData, loadingDashboard} = useDashboard()

    if (loadingDashboard) {
        return (
            <div className="max-w-7xl mx-auto p-4 md:p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
                <div className="flex justify-center items-center h-64">
                    <RotateCw className="h-8 w-8 animate-spin text-blue-500"/>
                </div>
            </div>
        )
    }

    const data = dashboardData || {
        totalMensagens: 0,
        totalMensagemEnviadas: 0,
        totalMensagemRecebidas: 0,
        totalMensagemRecebidasHoje: 0,
        totalMensagemRecebidasSemana: 0,
        totalMensagemRecebidasMes: 0,
        totalAtendimentos: 0,
        totalAguardandoNaFila: 0,
        totalEmAtendimento: 0,
        totalResolvidas: 0
    }

    const messageData = [
        {name: "Enviadas", value: data.totalMensagemEnviadas},
        {name: "Recebidas", value: data.totalMensagemRecebidas}
    ]

    const timeData = [
        {name: "Hoje", value: data.totalMensagemRecebidasHoje},
        {name: "Semana", value: data.totalMensagemRecebidasSemana},
        {name: "Mês", value: data.totalMensagemRecebidasMes}
    ]

    const attendanceData = [
        {name: "Aguardando", value: data.totalAguardandoNaFila},
        {name: "Em Atendimento", value: data.totalEmAtendimento},
        {name: "Resolvidas", value: data.totalResolvidas}
    ]

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

    const messageChartConfig = {
        enviadas: {label: "Enviadas"},
        recebidas: {label: "Recebidas"}
    }

    const timeChartConfig = {
        hoje: {label: "Hoje"},
        semana: {label: "Semana"},
        mes: {label: "Mês"}
    }

    const attendanceChartConfig = {
        aguardando: {label: "Aguardando"},
        emAtendimento: {label: "Em Atendimento"},
        resolvidas: {label: "Resolvidas"}
    }

    return (
        <div className="max-w-7xl mx-auto pt-5">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mensagens Enviadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalMensagemEnviadas}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mensagens Recebidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalMensagemRecebidas}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recebidas Hoje</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalMensagemRecebidasHoje}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Recebidas na Semana</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.totalMensagemRecebidasSemana}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Estatísticas de Mensagens</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={messageChartConfig} className="min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <ChartTooltip content={<ChartTooltipContent/>}/>
                                    <ChartLegend content={<ChartLegendContent/>}/>
                                    <Pie
                                        data={messageData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {messageData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Mensagens por Período</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={timeChartConfig} className="min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={timeData}>
                                    <XAxis dataKey="name"/>
                                    <YAxis/>
                                    <ChartTooltip content={<ChartTooltipContent/>}/>
                                    <ChartLegend content={<ChartLegendContent/>}/>
                                    <Bar dataKey="value" fill="#00C49F"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Estatísticas de Atendimentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={attendanceChartConfig} className="min-h-[300px] w-full">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={attendanceData}>
                                    <XAxis dataKey="name"/>
                                    <YAxis/>
                                    <ChartTooltip content={<ChartTooltipContent/>}/>
                                    <ChartLegend content={<ChartLegendContent/>}/>
                                    <Bar dataKey="value" fill="#8884d8"/>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
