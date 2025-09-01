# Flowise Iframe Integration

This document explains how to embed Flowise canvas views in external applications using API key authentication.

## Overview

You can now embed Flowise agent flow canvases in your external React applications (like wael-ui) using iframe integration with API key authentication, bypassing the normal user authentication flow.

## Server Changes Made

1. **New Iframe Route**: Added `/iframe/canvas/:flowId` route that validates API keys
2. **API Key Validation**: Uses existing API key validation system
3. **Workspace Security**: Ensures the API key has access to the requested flow's workspace
4. **Whitelisted Endpoints**: Added necessary API endpoints to whitelist for API key access

## Frontend Changes Made

1. **IframeCanvas Component**: New read-only canvas component for iframe embedding
2. **IframeContext**: Context provider for iframe mode detection and API key handling
3. **IframeRoutes**: New route configuration for iframe access
4. **Iframe Styling**: Specific CSS for iframe optimization

## Usage

### URL Format
```
https://your-flowise-server.com/iframe/canvas/{FLOW_ID}?apiKey={API_KEY}
```

### Example
```
https://your-flowise-server.com/iframe/canvas/9539d415-ffc8-4c0c-9f58-336aa5bdcf15?apiKey=05AKRTi_ieo4jkvQAp_xhrV96zIwJhl_qRK3g4-KpVM
```

## Integration in wael-ui React Project

### Basic Integration
```jsx
import React from 'react'

const FlowViewer = ({ flowId, apiKey, height = '600px' }) => {
    const iframeSrc = `https://your-flowise-server.com/iframe/canvas/${flowId}?apiKey=${apiKey}`
    
    return (
        <iframe 
            src={iframeSrc}
            title="Flowise Agent Canvas"
            style={{ 
                width: '100%', 
                height: height, 
                border: 'none',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
            sandbox="allow-scripts allow-same-origin allow-forms"
        />
    )
}

export default FlowViewer
```

### Advanced Integration with Error Handling
```jsx
import React, { useState } from 'react'

const FlowViewer = ({ flowId, apiKey, height = '600px' }) => {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    
    const iframeSrc = `https://your-flowise-server.com/iframe/canvas/${flowId}?apiKey=${apiKey}`
    
    const handleLoad = () => {
        setIsLoading(false)
    }
    
    const handleError = () => {
        setIsLoading(false)
        setHasError(true)
    }
    
    if (hasError) {
        return (
            <div style={{ padding: '20px', textAlign: 'center', color: '#red' }}>
                <h3>Failed to load canvas</h3>
                <p>Please check your API key and flow ID</p>
            </div>
        )
    }
    
    return (
        <div style={{ position: 'relative' }}>
            {isLoading && (
                <div style={{ 
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)',
                    zIndex: 10
                }}>
                    Loading canvas...
                </div>
            )}
            <iframe 
                src={iframeSrc}
                title="Flowise Agent Canvas"
                style={{ 
                    width: '100%', 
                    height: height, 
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
                sandbox="allow-scripts allow-same-origin allow-forms"
                onLoad={handleLoad}
                onError={handleError}
            />
        </div>
    )
}

export default FlowViewer
```

### Usage in Your Component
```jsx
import FlowViewer from './components/FlowViewer'

const MyApp = () => {
    const flowConfig = {
        flowId: '9539d415-ffc8-4c0c-9f58-336aa5bdcf15',
        apiKey: '05AKRTi_ieo4jkvQAp_xhrV96zIwJhl_qRK3g4-KpVM'
    }
    
    return (
        <div>
            <h1>My Application</h1>
            <FlowViewer 
                flowId={flowConfig.flowId}
                apiKey={flowConfig.apiKey}
                height="800px"
            />
        </div>
    )
}
```

## Security Features

1. **API Key Validation**: Each request validates the API key against the database
2. **Workspace Isolation**: Users can only access flows in their workspace
3. **Read-Only Mode**: Iframe canvas is read-only to prevent unauthorized modifications
4. **Sandbox Attributes**: Iframe uses sandbox attributes for additional security

## Features in Iframe Mode

✅ **Available:**
- View agent flow diagrams
- Zoom and pan
- Mini-map navigation
- Node selection and highlighting
- Responsive design

❌ **Disabled:**
- Node editing
- Adding new nodes
- Deleting nodes
- Saving flows
- Chat functionality
- Node dragging/dropping

## Testing

1. Start your Flowise server
2. Open `/iframe-test.html` in your browser to test the iframe
3. Verify the canvas loads with your flow data
4. Test with different flow IDs and API keys

## Troubleshooting

### Common Issues:

1. **401 Unauthorized**: Check if API key is valid and active
2. **403 Forbidden**: API key doesn't have access to the requested flow's workspace  
3. **404 Not Found**: Flow ID doesn't exist
4. **Blank iframe**: Check browser console for JavaScript errors

### Debug Steps:

1. Test the iframe URL directly in browser
2. Check browser developer tools for network errors
3. Verify API key has proper permissions
4. Ensure flow exists and is in the correct workspace

## Configuration

Make sure your Flowise server allows iframe embedding by configuring CORS properly if needed. The current implementation should work for same-origin iframes by default.