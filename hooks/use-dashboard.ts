import {useCallback, useEffect, useState} from "react";
import {DashboardService} from "@/services/dashboard";
import {DashboardStats} from "@/types/dashboard";

export interface useDashboardReturn {
    getFullDashboard: () => Promise<void>;
    dashboardData: DashboardStats | null;
    loadingDashboard: boolean;
}

export function useDashboard(): useDashboardReturn {
    const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null)
    const [loadingDashboard, setLoadingDashboard] = useState<boolean>(false)

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

    useEffect(() => {
        getFullDashboard()
    }, [getFullDashboard])

    return {
        getFullDashboard,
        dashboardData,
        loadingDashboard
    };
}
