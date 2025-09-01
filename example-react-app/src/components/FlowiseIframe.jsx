import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

/**
 * FlowiseIframe Component
 * 
 * A React component for embedding Flowise chat flows and agent flows canvas
 * in external applications using iframe with API key authentication.
 * 
 * @param {Object} props
 * @param {string} props.flowiseUrl - The base URL of your Flowise instance (e.g., 'https://your-flowise.com')
 * @param {string} props.apiKey - Your Flowise API key
 * @param {string} props.flowId - The ID of the flow to display
 * @param {string} props.flowType - Type of flow: 'chatflow', 'agentflow', or 'agentflowv2'
 * @param {string} props.width - Width of the iframe (default: '100%')
 * @param {string} props.height - Height of the iframe (default: '600px')
 * @param {Function} props.onLoad - Callback when iframe loads successfully
 * @param {Function} props.onError - Callback when iframe fails to load
 * @param {Object} props.style - Additional styles for the container
 */
const FlowiseIframe = ({ 
    flowiseUrl, 
    apiKey, 
    flowId, 
    flowType = 'chatflow',
    width = '100%',
    height = '600px',
    onLoad,
    onError,
    style = {}
}) => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const iframeRef = useRef(null)

    // Validate required props
    useEffect(() => {
        if (!flowiseUrl || !apiKey || !flowId) {
            const errorMsg = 'Missing required props: flowiseUrl, apiKey, and flowId are required'
            setError(errorMsg)
            setLoading(false)
            onError?.(new Error(errorMsg))
            return
        }

        if (!['chatflow', 'agentflow', 'agentflowv2'].includes(flowType)) {
            const errorMsg = 'Invalid flowType. Must be "chatflow", "agentflow", or "agentflowv2"'
            setError(errorMsg)
            setLoading(false)
            onError?.(new Error(errorMsg))
            return
        }
    }, [flowiseUrl, apiKey, flowId, flowType, onError])

    // Generate iframe URL based on flow type
    const getIframeUrl = () => {
        const baseUrl = flowiseUrl.endsWith('/') ? flowiseUrl.slice(0, -1) : flowiseUrl
        
        switch (flowType) {
            case 'chatflow':
                return `${baseUrl}/api/v1/iframe-canvas/chatflow/${flowId}`
            case 'agentflow':
                return `${baseUrl}/api/v1/iframe-canvas/agentflow/${flowId}`
            case 'agentflowv2':
                return `${baseUrl}/api/v1/iframe-canvas/agentflowv2/${flowId}`
            default:
                return `${baseUrl}/api/v1/iframe-canvas/chatflow/${flowId}`
        }
    }

    // Handle iframe load
    const handleIframeLoad = () => {
        setLoading(false)
        setError(null)
        onLoad?.()
    }

    // Handle iframe error
    const handleIframeError = () => {
        const errorMsg = 'Failed to load Flowise canvas'
        setError(errorMsg)
        setLoading(false)
        onError?.(new Error(errorMsg))
    }

    // Listen for messages from iframe
    useEffect(() => {
        const handleMessage = (event) => {
            // Verify origin for security
            const iframeUrl = new URL(getIframeUrl())
            if (event.origin !== iframeUrl.origin) {
                return
            }

            switch (event.data.type) {
                case 'CANVAS_LOADED':
                    handleIframeLoad()
                    break
                case 'CANVAS_ERROR':
                    handleIframeError()
                    break
                default:
                    break
            }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [])

    // Set up timeout fallback
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (loading && !error) {
                handleIframeError()
            }
        }, 15000) // 15 second timeout

        return () => clearTimeout(timeout)
    }, [loading, error])

    const containerStyle = {
        position: 'relative',
        width,
        height,
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        ...style
    }

    const iframeStyle = {
        width: '100%',
        height: '100%',
        border: 'none',
        display: loading || error ? 'none' : 'block'
    }

    const overlayStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 10
    }

    const spinnerStyle = {
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
    }

    return (
        <div style={containerStyle}>
            {/* Loading overlay */}
            {loading && !error && (
                <div style={overlayStyle}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={spinnerStyle}></div>
                        <div style={{ marginTop: '16px', color: '#666' }}>
                            Loading {flowType} canvas...
                        </div>
                    </div>
                </div>
            )}

            {/* Error overlay */}
            {error && (
                <div style={overlayStyle}>
                    <div style={{ textAlign: 'center', color: '#e74c3c' }}>
                        <div style={{ fontSize: '18px', marginBottom: '8px' }}>⚠️</div>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                            Failed to load canvas
                        </div>
                        <div style={{ fontSize: '14px' }}>
                            {error}
                        </div>
                    </div>
                </div>
            )}

            {/* Iframe */}
            {!error && (
                <iframe
                    ref={iframeRef}
                    src={getIframeUrl()}
                    style={iframeStyle}
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    title={`Flowise ${flowType} Canvas`}
                    sandbox="allow-scripts allow-same-origin allow-forms"
                />
            )}

            {/* CSS animation for spinner */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

FlowiseIframe.propTypes = {
    flowiseUrl: PropTypes.string.isRequired,
    apiKey: PropTypes.string.isRequired,
    flowId: PropTypes.string.isRequired,
    flowType: PropTypes.oneOf(['chatflow', 'agentflow', 'agentflowv2']),
    width: PropTypes.string,
    height: PropTypes.string,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
    style: PropTypes.object
}

export default FlowiseIframe