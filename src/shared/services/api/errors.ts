import type { ApiError } from '../../types/common';

export class AppError extends Error {
    code?: string | number;
    details?: any;

    constructor(message: string, code?: string | number, details?: any) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.details = details;
    }

    toApiError(): ApiError {
        return {
            message: this.message,
            code: this.code,
            details: this.details,
        };
    }
}

export function handleError(error: any): AppError {
    // Supabase error
    if (error?.message) {
        // Check for common Supabase errors
        if (error.message.includes('Invalid login credentials')) {
            return new AppError('Invalid email or password', 'AUTH_INVALID_CREDENTIALS');
        }
        if (error.message.includes('User already registered')) {
            return new AppError('An account with this email already exists', 'AUTH_USER_EXISTS');
        }
        if (error.message.includes('Email not confirmed')) {
            return new AppError('Please confirm your email address', 'AUTH_EMAIL_NOT_CONFIRMED');
        }
        if (error.message.includes('violates row-level security')) {
            return new AppError('Permission denied', 'AUTH_PERMISSION_DENIED');
        }

        // Generic Supabase/PostgreSQL error
        return new AppError(error.message, error.code, error.details);
    }

    // Network error
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
        return new AppError('Network error. Please check your connection.', 'NETWORK_ERROR');
    }

    // Unknown error
    return new AppError('An unexpected error occurred', 'UNKNOWN_ERROR', error);
}

export function formatErrorMessage(error: Error | ApiError | AppError): string {
    if (error instanceof AppError) {
        return error.message;
    }
    if ('message' in error && typeof error.message === 'string') {
        return error.message;
    }
    return 'An unexpected error occurred';
}
