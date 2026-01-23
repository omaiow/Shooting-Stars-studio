import { useState, useCallback, useEffect } from 'react';
import type { AsyncState } from '../types/common';

interface UseAsyncOptions {
    immediate?: boolean;
    onSuccess?: (data: any) => void;
    onError?: (error: Error) => void;
}

export function useAsync<T>(
    asyncFunction: () => Promise<T>,
    options: UseAsyncOptions = {}
) {
    const { immediate = false, onSuccess, onError } = options;

    const [state, setState] = useState<AsyncState<T>>({
        data: null,
        loading: immediate,
        error: null,
    });

    const execute = useCallback(async () => {
        setState({ data: null, loading: true, error: null });

        try {
            const data = await asyncFunction();
            setState({ data, loading: false, error: null });
            onSuccess?.(data);
            return data;
        } catch (error) {
            const err = error as Error;
            setState({ data: null, loading: false, error: err });
            onError?.(err);
            throw err;
        }
    }, [asyncFunction, onSuccess, onError]);

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [immediate, execute]);

    return {
        ...state,
        execute,
        retry: execute,
        reset: () => setState({ data: null, loading: false, error: null }),
    };
}
