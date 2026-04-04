const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Generic API call function
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

export default {
    // GET request
    get: (endpoint: string) => apiCall(endpoint, { method: 'GET' }),

    // POST request
    post: (endpoint: string, body: unknown) =>
        apiCall(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
        }),

    // PUT request
    put: (endpoint: string, body: unknown) =>
        apiCall(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body),
        }),

    // PATCH request
    patch: (endpoint: string, body: unknown) =>
        apiCall(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body),
        }),

    // DELETE request
    delete: (endpoint: string) =>
        apiCall(endpoint, {
            method: 'DELETE',
        }),
};
