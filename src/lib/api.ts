// Helper to perform API requests with the configured basePath
export const apiFetch = (path: string, init?: RequestInit) => {
    const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
    // Ensure we don't double‑prefix if the path already starts with the base
    const url = path.startsWith(base) ? path : `${base}${path}`;
    return fetch(url, init);
};
