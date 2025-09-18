import {useCallback, useEffect, useState} from "react";
import {DashboardService} from "@/services/dashboard";
import {DashboardPersonal, DashboardStats} from "@/types/dashboard";

export interface useDashboardReturn {
    getFullDashboard: () => Promise<void>;
    getPersonalDashboard: (id: string) => Promise<void>;
    dashboardData: DashboardStats | null;
    dashboardPersonal: DashboardPersonal | null;
    loadingDashboard: boolean;
}

export function useDashboard(): useDashboardReturn {
    const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
    const [loadingDashboard, setLoadingDashboard] = useState<boolean>(false)
    const [dashboardPersonal, setDashboardPersonal] = useState<DashboardPersonal | null>(null)

    const getFullDashboard = useCallback(async () => {
        try {
            const data: DashboardStats = await DashboardService.getDashboard();
            setDashboardData(data);
        } catch (error) {
            console.error("Erro ao buscar dashboard:", error);
            setDashboardData(null);
            throw error;
        } finally {
            setLoadingDashboard(false);
        }
    }, []);

    const getPersonalDashboard = useCallback(async (id: string) => {
        try {
            const data: DashboardPersonal = await DashboardService.getDashboardPersonal(id);
            setDashboardPersonal(data);
        } catch (error) {
            console.error("Erro ao buscar dashboard:", error);
            setDashboardData(null);
            throw error;
        } finally {
            setLoadingDashboard(false);
        }
    }, []);

    useEffect(() => {
        getFullDashboard()
    }, [getFullDashboard])

    return {
        getFullDashboard,
        dashboardData,
        loadingDashboard,
        dashboardPersonal,
        getPersonalDashboard
    };
}
