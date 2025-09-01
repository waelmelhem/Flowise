import { baseURL } from '@/store/constant'

/**
 * Create API client for iframe mode with API key authentication
 * @param {string} apiKey - The API key for authentication
 * @returns {Object} API client object
 */
export const createIframeApiClient = (apiKey) => {
    const client = {
        get: async (url) => {
            const response = await fetch(`${baseURL}/api/v1${url}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            return { data: await response.json() }
        },
        
        post: async (url, data) => {
            const response = await fetch(`${baseURL}/api/v1${url}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            return { data: await response.json() }
        },
        
        put: async (url, data) => {
            const response = await fetch(`${baseURL}/api/v1${url}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            return { data: await response.json() }
        },
        
        delete: async (url) => {
            const response = await fetch(`${baseURL}/api/v1${url}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            return { data: await response.json() }
        }
    }
    
    return client
}

export default createIframeApiClient