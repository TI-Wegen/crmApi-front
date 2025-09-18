"use client"

import React, {useEffect} from "react"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart"
import {Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, XAxis, YAxis} from "recharts"
import {Avatar, AvatarFallback} from "@/components/ui/avatar"
import {CheckCircle, Clock, Mail, MessageCircle, TrendingUp, User} from "lucide-react"
import {useAuth} from "@/hooks/use-auth"
import {useDashboard} from "@/hooks/use-dashboard"

export default function ProfilePage() {
    const {user} = useAuth()
    const {dashboardPersonal, getPersonalDashboard, loadingDashboard} = useDashboard()

    useEffect(() => {
        if (user?.id) {
            getPersonalDashboard(user.id)
        }
    }, [user, getPersonalDashboard])

    const activityData = [
        {name: "Seg", messages: 0},
        {name: "Ter", messages: 0},
        {name: "Qua", messages: 0},
        {name: "Qui", messages: 0},
        {name: "Sex", messages: 0},
        {name: "Sáb", messages: 0},
        {name: "Dom", messages: 0}
    ]

    const statusData = [
        {name: "Ativo", value: dashboardPersonal?.conversasAtivas || 0, color: "#10B981"},
        {name: "Inativo", value: dashboardPersonal?.conversasPendentes || 0, color: "#EF4444"}
    ]

    const performanceData = [
        {name: "Resolvidas", value: dashboardPersonal?.conversasResolvidas || 0},
        {name: "Pendentes", value: dashboardPersonal?.conversasPendentes || 0},
        {name: "Em Andamento", value: dashboardPersonal?.conversasEmAndamento || 0}
    ]

    const COLORS = ["#10B981", "#F59E0B", "#3B82F6"]

    if (loadingDashboard) {
        return <div className="flex justify-center items-center h-screen">Carregando...</div>
    }

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Meu Perfil</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversas</CardTitle>
                        <MessageCircle className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dashboardPersonal ?
                                (dashboardPersonal.conversasAtivas +
                                    dashboardPersonal.conversasPendentes +
                                    dashboardPersonal.conversasEmAndamento) : 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dashboardPersonal?.conversasResolvidas || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Média Avaliação</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {dashboardPersonal?.mediaAvaliacao?.toFixed(1) || '-'}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground"/>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Ativo</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações Pessoais</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col items-center">
                                <Avatar className="h-24 w-24 mb-4">
                                    <AvatarFallback className="text-2xl bg-blue-100">
                                        {user?.name?.substring(0, 2).toUpperCase() || 'US'}
                                    </AvatarFallback>
                                </Avatar>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {user?.name || 'Nome do Usuário'}
                                </h2>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Detalhes da Conta</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-start">
                                <Mail className="h-4 w-4 text-gray-500 mt-1 mr-3 flex-shrink-0"/>
                                <div>
                                    <p className="text-sm text-gray-500">Email</p>
                                    <p className="text-sm">{user?.email || 'email@exemplo.com'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Atividade Semanal</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ChartContainer config={{}} className="min-h-[300px] w-full">
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={activityData}>
                                        <XAxis dataKey="name"/>
                                        <YAxis/>
                                        <ChartTooltip content={<ChartTooltipContent/>}/>
                                        <Bar dataKey="messages" fill="#3B82F6" radius={[4, 4, 0, 0]}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Status das Conversas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={{}} className="min-h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <ChartTooltip content={<ChartTooltipContent/>}/>
                                            <Pie
                                                data={statusData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={true}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {statusData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color}/>
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Desempenho</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ChartContainer config={{}} className="min-h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={performanceData}>
                                            <XAxis dataKey="name"/>
                                            <YAxis/>
                                            <ChartTooltip content={<ChartTooltipContent/>}/>
                                            <ChartLegend content={<ChartLegendContent/>}/>
                                            <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]}>
                                                {performanceData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
