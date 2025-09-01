# 🚀 Using Flowise Iframe Integration in Another Repository

This guide shows you how to use the Flowise iframe integration in your own React application repository.

## 📋 Prerequisites

1. **Flowise Server Running** - Your Flowise instance with the iframe changes applied
2. **API Key** - Valid Flowise API key from Settings → API Keys
3. **Flow IDs** - IDs of the flows you want to embed
4. **React Application** - Your existing React app or a new one

## 🎯 Quick Setup (5 Minutes)

### Step 1: Copy the Component

Create this file in your React app: `src/components/FlowiseIframe.jsx`

```jsx
import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

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
```

### Step 2: Install Dependencies

```bash
npm install prop-types
```

### Step 3: Use in Your App

```jsx
import React from 'react'
import FlowiseIframe from './components/FlowiseIframe'

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>My Application with Flowise Integration</h1>
      
      {/* Chat Flow Example */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Customer Support Chat Flow</h2>
        <FlowiseIframe
          flowiseUrl="http://localhost:3000" // Your Flowise URL
          apiKey="your-api-key-here"         // Your API key
          flowId="your-chatflow-id-here"     // Your chat flow ID
          flowType="chatflow"
          width="100%"
          height="600px"
          onLoad={() => console.log('Chat flow loaded!')}
          onError={(error) => console.error('Chat flow error:', error)}
        />
      </div>

      {/* Agent Flow Example */}
      <div style={{ marginBottom: '40px' }}>
        <h2>AI Agent Workflow</h2>
        <FlowiseIframe
          flowiseUrl="http://localhost:3000"
          apiKey="your-api-key-here"
          flowId="your-agentflow-id-here"
          flowType="agentflowv2"
          width="100%"
          height="800px"
          style={{
            border: '2px solid #3498db',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}
        />
      </div>
    </div>
  )
}

export default App
```

## 🔧 Configuration Guide

### 1. Get Your Flowise URL
- If running locally: `http://localhost:3000`
- If deployed: `https://your-flowise-domain.com`

### 2. Get Your API Key
1. Open Flowise in your browser
2. Go to **Settings** → **API Keys**
3. Click **"Add New"**
4. Copy the generated API key
5. Store it securely (use environment variables in production)

### 3. Get Flow IDs
1. Open the flow you want to embed in Flowise
2. Look at the URL in your browser:
   - Chat flows: `http://localhost:3000/canvas/12345678-abcd-...` → Flow ID is `12345678-abcd-...`
   - Agent flows v1: `http://localhost:3000/agentcanvas/12345678-abcd-...` → Flow ID is `12345678-abcd-...`
   - Agent flows v2: `http://localhost:3000/v2/agentcanvas/12345678-abcd-...` → Flow ID is `12345678-abcd-...`

## 🎨 Advanced Usage Examples

### Environment Variables Approach

Create a `.env` file in your project:
```env
REACT_APP_FLOWISE_URL=http://localhost:3000
REACT_APP_FLOWISE_API_KEY=your-api-key-here
REACT_APP_CHATFLOW_ID=your-chatflow-id
REACT_APP_AGENTFLOW_ID=your-agentflow-id
```

Then use in your component:
```jsx
function App() {
  return (
    <FlowiseIframe
      flowiseUrl={process.env.REACT_APP_FLOWISE_URL}
      apiKey={process.env.REACT_APP_FLOWISE_API_KEY}
      flowId={process.env.REACT_APP_CHATFLOW_ID}
      flowType="chatflow"
    />
  )
}
```

### Multiple Flows with State Management

```jsx
import React, { useState } from 'react'
import FlowiseIframe from './components/FlowiseIframe'

const flows = [
  {
    id: 'support',
    name: 'Customer Support',
    flowId: 'your-support-flow-id',
    type: 'chatflow'
  },
  {
    id: 'sales',
    name: 'Sales Assistant',
    flowId: 'your-sales-flow-id',
    type: 'agentflow'
  },
  {
    id: 'complex',
    name: 'Complex Workflow',
    flowId: 'your-complex-flow-id',
    type: 'agentflowv2'
  }
]

function FlowDashboard() {
  const [activeFlow, setActiveFlow] = useState(flows[0])

  return (
    <div>
      {/* Flow Selector */}
      <div style={{ marginBottom: '20px' }}>
        {flows.map(flow => (
          <button
            key={flow.id}
            onClick={() => setActiveFlow(flow)}
            style={{
              padding: '10px 20px',
              margin: '0 10px 0 0',
              backgroundColor: activeFlow.id === flow.id ? '#3498db' : '#ecf0f1',
              color: activeFlow.id === flow.id ? 'white' : '#2c3e50',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {flow.name}
          </button>
        ))}
      </div>

      {/* Active Flow */}
      <FlowiseIframe
        flowiseUrl="http://localhost:3000"
        apiKey="your-api-key"
        flowId={activeFlow.flowId}
        flowType={activeFlow.type}
        width="100%"
        height="600px"
      />
    </div>
  )
}
```

### With Loading and Error States

```jsx
import React, { useState } from 'react'
import FlowiseIframe from './components/FlowiseIframe'

function FlowViewer({ flowId, flowType }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  return (
    <div style={{ position: 'relative' }}>
      {/* Custom Loading Indicator */}
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255,255,255,0.9)',
          zIndex: 10
        }}>
          <div>
            <div className="spinner" />
            <p>Loading your flow...</p>
          </div>
        </div>
      )}

      {/* Custom Error Display */}
      {error && (
        <div style={{
          padding: '20px',
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          color: '#c33'
        }}>
          <h3>Failed to Load Flow</h3>
          <p>{error.message}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}

      {/* Flowise Iframe */}
      <FlowiseIframe
        flowiseUrl={process.env.REACT_APP_FLOWISE_URL}
        apiKey={process.env.REACT_APP_FLOWISE_API_KEY}
        flowId={flowId}
        flowType={flowType}
        width="100%"
        height="600px"
        onLoad={() => setIsLoading(false)}
        onError={setError}
      />
    </div>
  )
}
```

## 🛠️ Integration Methods

### Method 1: Direct Component Integration (Recommended)

**Best for:** Most React applications

1. Copy the `FlowiseIframe` component to your project
2. Install `prop-types` dependency
3. Use the component in your JSX

**Pros:**
- Full control over styling and behavior
- Easy to customize loading/error states
- Integrates well with your existing React patterns

### Method 2: Direct Iframe Usage

**Best for:** Simple integrations or non-React apps

```html
<!-- In your HTML -->
<iframe 
  id="flowiseCanvas"
  src="http://localhost:3000/api/v1/iframe-canvas/chatflow/YOUR_FLOW_ID"
  width="100%" 
  height="600px"
  frameborder="0"
  sandbox="allow-scripts allow-same-origin allow-forms"
  style="border: 1px solid #e0e0e0; border-radius: 8px;"
></iframe>

<script>
// Handle authentication (you'll need to implement this)
// The iframe endpoint expects Authorization header with API key
// This requires server-side proxy or custom authentication handling
</script>
```

**Note:** Direct iframe usage requires handling API key authentication on your backend since browsers don't allow setting Authorization headers on iframes.

### Method 3: Server-Side Proxy (Advanced)

**Best for:** When you need server-side control or additional security

Create a proxy endpoint on your backend:
```javascript
// Express.js example
app.get('/proxy/flowise/:type/:id', async (req, res) => {
  const { type, id } = req.params
  const response = await fetch(`http://localhost:3000/api/v1/iframe-canvas/${type}/${id}`, {
    headers: {
      'Authorization': `Bearer ${process.env.FLOWISE_API_KEY}`
    }
  })
  
  const html = await response.text()
  res.send(html)
})
```

## 📝 Environment Setup

### Development Environment

Create `.env` file:
```env
REACT_APP_FLOWISE_URL=http://localhost:3000
REACT_APP_FLOWISE_API_KEY=your-development-api-key
```

### Production Environment

Set environment variables:
```env
REACT_APP_FLOWISE_URL=https://your-production-flowise.com
REACT_APP_FLOWISE_API_KEY=your-production-api-key
```

**🔒 Security Note:** In production, consider storing API keys on your backend and creating a proxy endpoint instead of exposing them in the frontend.

## 🎯 Real-World Examples

### Example 1: Customer Support Dashboard

```jsx
import React from 'react'
import FlowiseIframe from './components/FlowiseIframe'

function SupportDashboard() {
  return (
    <div className="support-dashboard">
      <header>
        <h1>Customer Support Portal</h1>
      </header>
      
      <main>
        <div className="flow-section">
          <h2>AI Support Assistant</h2>
          <p>Our AI assistant can help you with common questions and issues.</p>
          
          <FlowiseIframe
            flowiseUrl={process.env.REACT_APP_FLOWISE_URL}
            apiKey={process.env.REACT_APP_FLOWISE_API_KEY}
            flowId="support-chatflow-id"
            flowType="chatflow"
            width="100%"
            height="500px"
            style={{
              marginTop: '20px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          />
        </div>
      </main>
    </div>
  )
}
```

### Example 2: Admin Dashboard with Multiple Flows

```jsx
import React, { useState, useEffect } from 'react'
import FlowiseIframe from './components/FlowiseIframe'

function AdminDashboard() {
  const [flows, setFlows] = useState([])
  const [selectedFlow, setSelectedFlow] = useState(null)

  // In a real app, you'd fetch this from your backend
  useEffect(() => {
    setFlows([
      { id: '1', name: 'Customer Onboarding', flowId: 'onboarding-flow-id', type: 'chatflow' },
      { id: '2', name: 'Lead Qualification', flowId: 'leads-flow-id', type: 'agentflow' },
      { id: '3', name: 'Complex Analysis', flowId: 'analysis-flow-id', type: 'agentflowv2' }
    ])
    setSelectedFlow(flows[0])
  }, [])

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <div style={{ width: '300px', padding: '20px', borderRight: '1px solid #eee' }}>
        <h2>Available Flows</h2>
        {flows.map(flow => (
          <div
            key={flow.id}
            onClick={() => setSelectedFlow(flow)}
            style={{
              padding: '15px',
              margin: '10px 0',
              backgroundColor: selectedFlow?.id === flow.id ? '#e3f2fd' : '#f5f5f5',
              borderRadius: '8px',
              cursor: 'pointer',
              border: selectedFlow?.id === flow.id ? '2px solid #2196f3' : '1px solid #ddd'
            }}
          >
            <strong>{flow.name}</strong>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
              {flow.type}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px' }}>
        {selectedFlow ? (
          <>
            <h1>{selectedFlow.name}</h1>
            <FlowiseIframe
              flowiseUrl={process.env.REACT_APP_FLOWISE_URL}
              apiKey={process.env.REACT_APP_FLOWISE_API_KEY}
              flowId={selectedFlow.flowId}
              flowType={selectedFlow.type}
              width="100%"
              height="calc(100vh - 120px)"
            />
          </>
        ) : (
          <div>Select a flow to view</div>
        )}
      </div>
    </div>
  )
}
```

## 🔒 Security Best Practices

### 1. API Key Management

**❌ Don't do this (exposes API key):**
```jsx
<FlowiseIframe apiKey="sk-1234567890abcdef..." />
```

**✅ Do this (environment variables):**
```jsx
<FlowiseIframe apiKey={process.env.REACT_APP_FLOWISE_API_KEY} />
```

**🏆 Best practice (backend proxy):**
```jsx
// Frontend calls your backend
const response = await fetch('/api/flowise-proxy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ flowId, flowType })
})

// Your backend handles the API key
app.post('/api/flowise-proxy', (req, res) => {
  const { flowId, flowType } = req.body
  // Validate user permissions here
  // Then proxy to Flowise with your API key
})
```

### 2. Access Control

```jsx
// Example with user permission checking
function SecureFlowViewer({ user, flowId, flowType }) {
  // Check if user has permission to view this flow
  if (!user.permissions.includes('view-flows')) {
    return <div>Access denied</div>
  }

  return (
    <FlowiseIframe
      flowiseUrl={process.env.REACT_APP_FLOWISE_URL}
      apiKey={process.env.REACT_APP_FLOWISE_API_KEY}
      flowId={flowId}
      flowType={flowType}
    />
  )
}
```

## 🧪 Testing Your Integration

### 1. Test the Component

```jsx
import React from 'react'
import FlowiseIframe from './components/FlowiseIframe'

function TestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Flowise Integration Test</h1>
      
      {/* Test with a known working flow */}
      <FlowiseIframe
        flowiseUrl="http://localhost:3000"
        apiKey="your-test-api-key"
        flowId="your-test-flow-id"
        flowType="chatflow"
        width="100%"
        height="400px"
        onLoad={() => alert('✅ Integration working!')}
        onError={(error) => alert(`❌ Error: ${error.message}`)}
      />
    </div>
  )
}
```

### 2. Debug Common Issues

```jsx
function DebugFlowViewer() {
  const [logs, setLogs] = useState([])

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  return (
    <div>
      {/* Debug Console */}
      <div style={{ 
        height: '150px', 
        overflow: 'auto', 
        backgroundColor: '#f8f8f8', 
        padding: '10px', 
        fontFamily: 'monospace',
        fontSize: '12px',
        marginBottom: '20px'
      }}>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

      {/* Iframe with Debug Logging */}
      <FlowiseIframe
        flowiseUrl="http://localhost:3000"
        apiKey="your-api-key"
        flowId="your-flow-id"
        flowType="chatflow"
        onLoad={() => addLog('✅ Canvas loaded successfully')}
        onError={(error) => addLog(`❌ Error: ${error.message}`)}
      />
    </div>
  )
}
```

## 📦 Package.json Dependencies

Add these to your `package.json`:

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "prop-types": "^15.8.1"
  }
}
```

## 🚨 Troubleshooting

### Issue: "Failed to load canvas"
**Solutions:**
1. Check if Flowise server is running: `curl http://localhost:3000/api/v1/ping`
2. Verify API key is correct
3. Check browser console for detailed errors
4. Ensure flow ID exists and you have access

### Issue: "Unauthorized Access"
**Solutions:**
1. Verify API key format: should be like `sk-...`
2. Check if API key belongs to the same workspace as the flow
3. Ensure API key hasn't expired

### Issue: Blank iframe or CORS errors
**Solutions:**
1. Check if Flowise allows iframe embedding
2. Verify the iframe endpoints are whitelisted
3. Check browser console for CORS errors

## 🎉 You're Ready!

Your external React app can now embed Flowise flows! Here's a minimal example to get started:

```jsx
// src/App.js
import FlowiseIframe from './components/FlowiseIframe'

function App() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>My App with Flowise</h1>
      <FlowiseIframe
        flowiseUrl="http://localhost:3000"
        apiKey="your-api-key"
        flowId="your-flow-id"
        flowType="chatflow"
      />
    </div>
  )
}

export default App
```

Start your React app with `npm start` and you should see your Flowise canvas embedded! 🎊