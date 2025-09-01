import { createContext, useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useParams, useSearchParams } from 'react-router-dom'

const IframeContext = createContext()

export const IframeProvider = ({ children }) => {
    const { id: chatflowId } = useParams()
    const [searchParams] = useSearchParams()
    const apiKey = searchParams.get('apiKey')
    
    const [isIframeMode, setIsIframeMode] = useState(false)
    const [iframeApiKey, setIframeApiKey] = useState(null)
    const [iframeChatflowId, setIframeChatflowId] = useState(null)

    useEffect(() => {
        const isIframe = window.location.pathname.includes('/iframe/')
        setIsIframeMode(isIframe)
        
        if (isIframe && apiKey && chatflowId) {
            setIframeApiKey(apiKey)
            setIframeChatflowId(chatflowId)
        }
    }, [apiKey, chatflowId])

    // Custom API call function that uses API key for iframe mode
    const apiCall = async (url, options = {}) => {
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        }

        if (isIframeMode && iframeApiKey) {
            headers['Authorization'] = `Bearer ${iframeApiKey}`
        }

        return fetch(url, {
            ...options,
            headers
        })
    }

    return (
        <IframeContext.Provider
            value={{
                isIframeMode,
                iframeApiKey,
                iframeChatflowId,
                apiCall
            }}
        >
            {children}
        </IframeContext.Provider>
    )
}

export const useIframe = () => {
    const context = useContext(IframeContext)
    if (!context) {
        throw new Error('useIframe must be used within an IframeProvider')
    }
    return context
}

IframeProvider.propTypes = {
    children: PropTypes.any
}