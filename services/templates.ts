import {ApiService} from "./api";


export class TemplateService {
    static async listarTemplates() {
        return ApiService.get(`/api/templates`);
    }

}
