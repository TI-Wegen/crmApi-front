import {ApiService} from "./api"
import {DashboardStats} from "@/types/dashboard";

export class DashboardService {
    static async getDashboard(): Promise<DashboardStats> {
        return ApiService.get(`/api/Dashboard/Full`)
    }
}
