import {ApiService} from "./api"
import {DashboardPersonal, DashboardStats} from "@/types/dashboard";

export class DashboardService {
    static async getDashboard(): Promise<DashboardStats> {
        return ApiService.get(`/api/Dashboard/Full`)
    }
    static async getDashboardPersonal(id: string): Promise<DashboardPersonal> {
        return ApiService.get(`/api/Dashboard/${id}/Personal`)
    }
}
