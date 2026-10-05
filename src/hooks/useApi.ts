import { DependencyList, useCallback, useEffect, useRef, useState } from 'react';
import { errorMessage, type ApiResponse, type Pagination } from '../api';

interface State<T> {
    data: T | undefined;
    pagination?: Pagination;
    loading: boolean;
    error: string | null;
}

/**
 * Runs an API call when `deps` change and tracks loading / error state. Stale responses from
 * earlier calls are ignored so fast filter changes never show the wrong results.
 */
export function useApi<T>(fetcher: (signal: AbortSignal) => Promise<ApiResponse<T>>, deps: DependencyList, enabled = true) {
    const [state, setState] = useState<State<T>>({ data: undefined, loading: enabled, error: null });
    const [nonce, setNonce] = useState(0);
    const fetcherRef = useRef(fetcher);
    fetcherRef.current = fetcher;

    useEffect(() => {
        if (!enabled) {
            setState(s => ({ ...s, loading: false }));
            return undefined;
        }
        const controller = new AbortController();
        setState(s => ({ ...s, loading: true, error: null }));
        fetcherRef.current(controller.signal)
            .then(res => {
                if (!controller.signal.aborted) setState({ data: res.data, pagination: res.pagination, loading: false, error: null });
            })
            .catch(err => {
                if (!controller.signal.aborted) setState(s => ({ ...s, loading: false, error: errorMessage(err) }));
            });
        return () => controller.abort();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps, nonce, enabled]);

    const reload = useCallback(() => setNonce(n => n + 1), []);
    const setData = useCallback((data: T) => setState(s => ({ ...s, data })), []);
    return { ...state, reload, setData };
}
