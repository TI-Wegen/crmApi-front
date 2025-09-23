import {ApiError, ApiService} from "@/services/api";

export interface UseTagsError {
    message: string;
    type: 'validation' | 'auth' | 'server' | 'network' | 'unknown';
    statusCode?: number;
    validationErrors?: Record<string, string[]>;
    timestamp?: string;
}

export const createErrorFromApiError = (err: any, defaultMessage: string): UseTagsError => {
    if (err instanceof ApiError) {
        let type: UseTagsError['type'] = 'unknown';

        if (ApiService.isValidationError(err)) type = 'validation';
        else if (ApiService.isAuthError(err)) type = 'auth';
        else if (ApiService.isServerError(err)) type = 'server';

        return {
            message: err.message,
            type,
            statusCode: err.statusCode,
            validationErrors: err.getFieldErrors(),
            timestamp: err.timestamp
        };
    }

    return {
        message: err instanceof Error ? err.message : defaultMessage,
        type: 'unknown'
    };
};