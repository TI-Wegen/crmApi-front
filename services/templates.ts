import { ApiService } from "./api";




export class TemplateService {

    static async listarTemplates() {
        return ApiService.request(`/api/templates`);
    }

}
