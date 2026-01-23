// Common types used across the application

export interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
}

export interface ApiResponse<T> {
    data: T | null;
    error: ApiError | null;
}

export interface ApiError {
    message: string;
    code?: string | number;
    details?: any;
}

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
}
