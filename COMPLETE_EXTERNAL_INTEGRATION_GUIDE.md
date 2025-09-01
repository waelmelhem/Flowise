# 🚀 Complete Guide: Using Flowise Iframe in Another Repository

This is your complete guide to embed Flowise canvas in any external React application using the iframe integration we just built.

## 🏁 Quick Start (Copy & Paste Ready)

### 1. Create the Component File

In your React app, create `src/components/FlowiseCanvas.jsx`:

```jsx
import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

const FlowiseCanvas = ({ 
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

    // Generate iframe URL
    const getIframeUrl = () => {
        const baseUrl = flowiseUrl.endsWith('/') ? flowiseUrl.slice(0, -1) : flowiseUrl
        return `${baseUrl}/api/v1/iframe-canvas/${flowType}/${flowId}`
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
            try {
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
            } catch (e) {
                // Ignore invalid messages
            }
        }

        window.addEventListener('message', handleMessage)
        return () => window.removeEventListener('message', handleMessage)
    }, [])

    // Timeout fallback
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (loading && !error) {
                handleIframeError()
            }
        }, 15000)

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

    return (
        <div style={containerStyle}>
            {/* Loading overlay */}
            {loading && !error && (
                <div style={overlayStyle}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #f3f3f3',
                            borderTop: '4px solid #3498db',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                            margin: '0 auto 16px'
                        }}></div>
                        <div style={{ color: '#666' }}>
                            Loading {flowType} canvas...
                        </div>
                    </div>
                </div>
            )}

            {/* Error overlay */}
            {error && (
                <div style={overlayStyle}>
                    <div style={{ textAlign: 'center', color: '#e74c3c' }}>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
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

            {/* CSS for spinner animation */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    )
}

FlowiseCanvas.propTypes = {
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

export default FlowiseCanvas
```

### 2. Install Required Dependencies

```bash
npm install prop-types
```

### 3. Use in Your App

Update your `src/App.js`:

```jsx
import React, { useState } from 'react'
import FlowiseCanvas from './components/FlowiseCanvas'

function App() {
  // Configuration - Replace with your actual values
  const [config, setConfig] = useState({
    flowiseUrl: 'http://localhost:3000',  // Your Flowise server URL
    apiKey: '',                           // Your API key from Flowise Settings → API Keys
    flowId: '',                           // Flow ID from the URL when viewing a flow
    flowType: 'chatflow'                  // 'chatflow', 'agentflow', or 'agentflowv2'
  })

  const [status, setStatus] = useState('')

  const handleLoad = () => {
    setStatus('✅ Canvas loaded successfully!')
  }

  const handleError = (error) => {
    setStatus(`❌ Error: ${error.message}`)
  }

  const canShowCanvas = config.flowiseUrl && config.apiKey && config.flowId

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1>My App with Flowise Integration</h1>
        <p>Embed Flowise flows in your React application</p>
      </header>

      {/* Configuration Panel */}
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h2>Configuration</h2>
        <div style={{ display: 'grid', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Flowise URL:
            </label>
            <input
              type="text"
              value={config.flowiseUrl}
              onChange={(e) => setConfig({...config, flowiseUrl: e.target.value})}
              placeholder="http://localhost:3000"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              API Key:
            </label>
            <input
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({...config, apiKey: e.target.value})}
              placeholder="Your Flowise API key"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Flow ID:
            </label>
            <input
              type="text"
              value={config.flowId}
              onChange={(e) => setConfig({...config, flowId: e.target.value})}
              placeholder="UUID of your flow"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Flow Type:
            </label>
            <select
              value={config.flowType}
              onChange={(e) => setConfig({...config, flowType: e.target.value})}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="chatflow">Chat Flow</option>
              <option value="agentflow">Agent Flow (v1)</option>
              <option value="agentflowv2">Agent Flow (v2)</option>
            </select>
          </div>
        </div>

        {status && (
          <div style={{
            marginTop: '15px',
            padding: '10px',
            borderRadius: '4px',
            backgroundColor: status.includes('✅') ? '#d4edda' : '#f8d7da',
            color: status.includes('✅') ? '#155724' : '#721c24'
          }}>
            {status}
          </div>
        )}
      </div>

      {/* Canvas Display */}
      {canShowCanvas ? (
        <div>
          <h2>Canvas Preview</h2>
          <FlowiseCanvas
            flowiseUrl={config.flowiseUrl}
            apiKey={config.apiKey}
            flowId={config.flowId}
            flowType={config.flowType}
            width="100%"
            height="600px"
            onLoad={handleLoad}
            onError={handleError}
            style={{
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
          />
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '2px dashed #dee2e6'
        }}>
          <p>Fill in all configuration fields above to see the canvas</p>
        </div>
      )}
    </div>
  )
}

export default App
```

## 📋 Step-by-Step Setup

### Step 1: Create New React App (if needed)

```bash
# Create new React app
npx create-react-app my-flowise-app
cd my-flowise-app

# Or use an existing React app
cd your-existing-react-app
```

### Step 2: Install Dependencies

```bash
npm install prop-types
```

### Step 3: Get Your Flowise Credentials

1. **Start your Flowise server** (with the iframe changes applied)
2. **Get API Key:**
   - Open Flowise in browser: `http://localhost:3000`
   - Go to Settings → API Keys
   - Click "Add New" and copy the key
3. **Get Flow ID:**
   - Open any flow in Flowise
   - Copy the UUID from URL (e.g., `/canvas/12345678-abcd-...`)

### Step 4: Create the Component

Copy the `FlowiseCanvas` component code above into `src/components/FlowiseCanvas.jsx`

### Step 5: Update Your App

Replace your `src/App.js` with the example code above, or integrate the component into your existing app.

### Step 6: Test It!

```bash
npm start
```

Open `http://localhost:3001` and fill in your Flowise details to see the embedded canvas!

## 🔧 Production Setup

### Environment Variables Approach

Create `.env` file:
```env
REACT_APP_FLOWISE_URL=https://your-flowise.com
REACT_APP_FLOWISE_API_KEY=your-production-api-key
REACT_APP_SUPPORT_FLOW_ID=your-support-flow-id
REACT_APP_SALES_FLOW_ID=your-sales-flow-id
```

Use in component:
```jsx
function ProductionApp() {
  return (
    <div>
      <h1>Customer Portal</h1>
      
      {/* Support Flow */}
      <section>
        <h2>Get Help</h2>
        <FlowiseCanvas
          flowiseUrl={process.env.REACT_APP_FLOWISE_URL}
          apiKey={process.env.REACT_APP_FLOWISE_API_KEY}
          flowId={process.env.REACT_APP_SUPPORT_FLOW_ID}
          flowType="chatflow"
          height="500px"
        />
      </section>
      
      {/* Sales Flow */}
      <section>
        <h2>Talk to Sales</h2>
        <FlowiseCanvas
          flowiseUrl={process.env.REACT_APP_FLOWISE_URL}
          apiKey={process.env.REACT_APP_FLOWISE_API_KEY}
          flowId={process.env.REACT_APP_SALES_FLOW_ID}
          flowType="agentflowv2"
          height="700px"
        />
      </section>
    </div>
  )
}
```

## 🎨 Styling Examples

### Custom Styling

```jsx
<FlowiseCanvas
  flowiseUrl="http://localhost:3000"
  apiKey="your-api-key"
  flowId="your-flow-id"
  style={{
    border: '2px solid #3498db',
    borderRadius: '12px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    background: 'linear-gradient(145deg, #f0f0f0, #ffffff)'
  }}
/>
```

### Responsive Design

```jsx
function ResponsiveFlowView() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth > 768 ? '100%' : '100%',
    height: window.innerWidth > 768 ? '600px' : '400px'
  })

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: '100%',
        height: window.innerWidth > 768 ? '600px' : '400px'
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <FlowiseCanvas
      flowiseUrl="http://localhost:3000"
      apiKey="your-api-key"
      flowId="your-flow-id"
      width={dimensions.width}
      height={dimensions.height}
    />
  )
}
```

## 🔍 Advanced Examples

### Multi-Flow Dashboard

```jsx
import React, { useState } from 'react'
import FlowiseCanvas from './components/FlowiseCanvas'

const flows = [
  {
    id: 'support',
    name: 'Customer Support',
    description: 'Get help with your account and billing',
    flowId: 'your-support-flow-id',
    type: 'chatflow',
    icon: '🎧'
  },
  {
    id: 'sales',
    name: 'Sales Assistant',
    description: 'Learn about our products and pricing',
    flowId: 'your-sales-flow-id',
    type: 'agentflow',
    icon: '💼'
  },
  {
    id: 'technical',
    name: 'Technical Support',
    description: 'Get technical help and documentation',
    flowId: 'your-technical-flow-id',
    type: 'agentflowv2',
    icon: '🔧'
  }
]

function FlowDashboard() {
  const [activeFlow, setActiveFlow] = useState(flows[0])
  const [loadingStates, setLoadingStates] = useState({})

  const handleFlowLoad = (flowId) => {
    setLoadingStates(prev => ({ ...prev, [flowId]: 'loaded' }))
  }

  const handleFlowError = (flowId, error) => {
    setLoadingStates(prev => ({ ...prev, [flowId]: `error: ${error.message}` }))
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: '300px',
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRight: '1px solid #dee2e6'
      }}>
        <h2>Available Flows</h2>
        {flows.map(flow => (
          <div
            key={flow.id}
            onClick={() => setActiveFlow(flow)}
            style={{
              padding: '15px',
              margin: '10px 0',
              backgroundColor: activeFlow.id === flow.id ? '#e3f2fd' : 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              border: activeFlow.id === flow.id ? '2px solid #2196f3' : '1px solid #ddd',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '5px' }}>
              {flow.icon} <strong>{flow.name}</strong>
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              {flow.description}
            </div>
            <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
              Type: {flow.type}
            </div>
            {loadingStates[flow.flowId] && (
              <div style={{ fontSize: '12px', marginTop: '5px' }}>
                Status: {loadingStates[flow.flowId]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '20px' }}>
        <header style={{ marginBottom: '20px' }}>
          <h1>{activeFlow.icon} {activeFlow.name}</h1>
          <p style={{ color: '#666' }}>{activeFlow.description}</p>
        </header>

        <FlowiseCanvas
          flowiseUrl={process.env.REACT_APP_FLOWISE_URL || 'http://localhost:3000'}
          apiKey={process.env.REACT_APP_FLOWISE_API_KEY || 'your-api-key'}
          flowId={activeFlow.flowId}
          flowType={activeFlow.type}
          width="100%"
          height="calc(100vh - 140px)"
          onLoad={() => handleFlowLoad(activeFlow.flowId)}
          onError={(error) => handleFlowError(activeFlow.flowId, error)}
        />
      </div>
    </div>
  )
}

export default FlowDashboard
```

### Dynamic Flow Loading

```jsx
import React, { useState, useEffect } from 'react'
import FlowiseCanvas from './components/FlowiseCanvas'

function DynamicFlowViewer() {
  const [availableFlows, setAvailableFlows] = useState([])
  const [selectedFlow, setSelectedFlow] = useState(null)

  // Fetch available flows from your backend
  useEffect(() => {
    const fetchFlows = async () => {
      try {
        // This would be your API that returns available flows
        const response = await fetch('/api/available-flows')
        const flows = await response.json()
        setAvailableFlows(flows)
        setSelectedFlow(flows[0])
      } catch (error) {
        console.error('Error fetching flows:', error)
      }
    }

    fetchFlows()
  }, [])

  return (
    <div>
      <h1>Dynamic Flow Viewer</h1>
      
      {/* Flow Selector */}
      <select 
        value={selectedFlow?.id || ''}
        onChange={(e) => {
          const flow = availableFlows.find(f => f.id === e.target.value)
          setSelectedFlow(flow)
        }}
        style={{ marginBottom: '20px', padding: '10px' }}
      >
        <option value="">Select a flow...</option>
        {availableFlows.map(flow => (
          <option key={flow.id} value={flow.id}>
            {flow.name} ({flow.type})
          </option>
        ))}
      </select>

      {/* Dynamic Canvas */}
      {selectedFlow && (
        <FlowiseCanvas
          flowiseUrl={process.env.REACT_APP_FLOWISE_URL}
          apiKey={process.env.REACT_APP_FLOWISE_API_KEY}
          flowId={selectedFlow.flowiseId}
          flowType={selectedFlow.type}
          width="100%"
          height="600px"
          key={selectedFlow.id} // Force re-render when flow changes
        />
      )}
    </div>
  )
}
```

## 🔐 Security Considerations

### 1. API Key Security

**❌ Never expose API keys in client code:**
```jsx
// DON'T DO THIS
const apiKey = "sk-1234567890abcdef..." // Visible to anyone!
```

**✅ Use environment variables:**
```jsx
// DO THIS
const apiKey = process.env.REACT_APP_FLOWISE_API_KEY
```

**🏆 Best: Backend proxy (recommended for production):**
```jsx
// Your React app calls your backend
const response = await fetch('/api/get-flow-iframe', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${userToken}` },
  body: JSON.stringify({ flowId, flowType })
})

// Your backend validates user and proxies to Flowise
```

### 2. Access Control

```jsx
function SecureFlowViewer({ user, flowId }) {
  // Check user permissions
  if (!user.canViewFlows) {
    return <div>Access denied</div>
  }

  return (
    <FlowiseCanvas
      flowiseUrl={process.env.REACT_APP_FLOWISE_URL}
      apiKey={process.env.REACT_APP_FLOWISE_API_KEY}
      flowId={flowId}
    />
  )
}
```

## 🧪 Testing Your Integration

### 1. Basic Test

Create `src/TestFlowiseIntegration.jsx`:
```jsx
import React from 'react'
import FlowiseCanvas from './components/FlowiseCanvas'

function TestFlowiseIntegration() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Flowise Integration Test</h1>
      
      <FlowiseCanvas
        flowiseUrl="http://localhost:3000"
        apiKey="your-test-api-key"
        flowId="your-test-flow-id"
        flowType="chatflow"
        width="800px"
        height="600px"
        onLoad={() => {
          console.log('✅ Integration working!')
          alert('Success! Flowise canvas loaded.')
        }}
        onError={(error) => {
          console.error('❌ Integration failed:', error)
          alert(`Failed: ${error.message}`)
        }}
      />
    </div>
  )
}

export default TestFlowiseIntegration
```

### 2. Debug Mode

```jsx
function DebugFlowViewer() {
  const [debugLogs, setDebugLogs] = useState([])

  const addDebugLog = (message) => {
    const timestamp = new Date().toLocaleTimeString()
    setDebugLogs(prev => [...prev, `[${timestamp}] ${message}`])
  }

  useEffect(() => {
    addDebugLog('Component mounted')
  }, [])

  return (
    <div>
      {/* Debug Console */}
      <div style={{
        height: '200px',
        overflow: 'auto',
        backgroundColor: '#1e1e1e',
        color: '#00ff00',
        padding: '10px',
        fontFamily: 'monospace',
        fontSize: '12px',
        marginBottom: '20px'
      }}>
        <div>🔍 Debug Console:</div>
        {debugLogs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

      {/* Canvas with Debug */}
      <FlowiseCanvas
        flowiseUrl="http://localhost:3000"
        apiKey="your-api-key"
        flowId="your-flow-id"
        onLoad={() => addDebugLog('✅ Canvas loaded successfully')}
        onError={(error) => addDebugLog(`❌ Canvas error: ${error.message}`)}
      />
    </div>
  )
}
```

## 🌐 Integration with Different Frameworks

### Next.js Integration

```jsx
// pages/flows/[flowId].js
import { useRouter } from 'next/router'
import FlowiseCanvas from '../../components/FlowiseCanvas'

export default function FlowPage() {
  const router = useRouter()
  const { flowId, type = 'chatflow' } = router.query

  if (!flowId) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>Flow Viewer</h1>
      <FlowiseCanvas
        flowiseUrl={process.env.NEXT_PUBLIC_FLOWISE_URL}
        apiKey={process.env.NEXT_PUBLIC_FLOWISE_API_KEY}
        flowId={flowId}
        flowType={type}
        width="100%"
        height="600px"
      />
    </div>
  )
}
```

### TypeScript Integration

```typescript
// components/FlowiseCanvas.tsx
import React, { useState, useEffect, useRef } from 'react'

interface FlowiseCanvasProps {
  flowiseUrl: string
  apiKey: string
  flowId: string
  flowType?: 'chatflow' | 'agentflow' | 'agentflowv2'
  width?: string
  height?: string
  onLoad?: () => void
  onError?: (error: Error) => void
  style?: React.CSSProperties
}

const FlowiseCanvas: React.FC<FlowiseCanvasProps> = ({
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
  // Component implementation (same as JavaScript version)
  // ...
}

export default FlowiseCanvas
```

## 📊 Real-World Use Cases

### 1. Customer Support Portal

```jsx
function SupportPortal() {
  return (
    <div className="support-portal">
      <header>
        <h1>How can we help you?</h1>
        <p>Our AI assistant is here to help with your questions.</p>
      </header>
      
      <FlowiseCanvas
        flowiseUrl="https://support-ai.yourcompany.com"
        apiKey={process.env.REACT_APP_SUPPORT_API_KEY}
        flowId="customer-support-flow-id"
        flowType="chatflow"
        width="100%"
        height="500px"
        style={{ margin: '20px 0' }}
      />
      
      <footer>
        <p>Still need help? <a href="/contact">Contact our team</a></p>
      </footer>
    </div>
  )
}
```

### 2. Product Demo Page

```jsx
function ProductDemo() {
  const [currentDemo, setCurrentDemo] = useState('overview')

  const demos = {
    overview: {
      name: 'Product Overview',
      flowId: 'product-overview-flow',
      type: 'chatflow'
    },
    advanced: {
      name: 'Advanced Features',
      flowId: 'advanced-features-flow',
      type: 'agentflowv2'
    }
  }

  return (
    <div>
      <nav style={{ marginBottom: '30px' }}>
        {Object.entries(demos).map(([key, demo]) => (
          <button
            key={key}
            onClick={() => setCurrentDemo(key)}
            style={{
              padding: '10px 20px',
              margin: '0 10px 0 0',
              backgroundColor: currentDemo === key ? '#007bff' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            {demo.name}
          </button>
        ))}
      </nav>

      <FlowiseCanvas
        flowiseUrl="https://demo.yourcompany.com"
        apiKey={process.env.REACT_APP_DEMO_API_KEY}
        flowId={demos[currentDemo].flowId}
        flowType={demos[currentDemo].type}
        width="100%"
        height="700px"
        key={currentDemo} // Force re-render when demo changes
      />
    </div>
  )
}
```

### 3. Embedded in Existing Dashboard

```jsx
function ExistingDashboard() {
  return (
    <div className="dashboard">
      {/* Your existing dashboard content */}
      <div className="dashboard-header">
        <h1>Company Dashboard</h1>
      </div>
      
      <div className="dashboard-grid">
        {/* Your existing widgets */}
        <div className="widget">
          <h3>Sales Metrics</h3>
          {/* Your sales charts */}
        </div>
        
        <div className="widget">
          <h3>User Activity</h3>
          {/* Your activity charts */}
        </div>
        
        {/* New Flowise Widget */}
        <div className="widget flowise-widget">
          <h3>AI Assistant</h3>
          <FlowiseCanvas
            flowiseUrl={process.env.REACT_APP_FLOWISE_URL}
            apiKey={process.env.REACT_APP_FLOWISE_API_KEY}
            flowId="dashboard-assistant-flow"
            flowType="chatflow"
            width="100%"
            height="400px"
          />
        </div>
      </div>
    </div>
  )
}
```

## ⚡ Performance Tips

### 1. Lazy Loading

```jsx
import { lazy, Suspense } from 'react'

const FlowiseCanvas = lazy(() => import('./components/FlowiseCanvas'))

function App() {
  return (
    <div>
      <h1>My App</h1>
      
      <Suspense fallback={<div>Loading Flowise integration...</div>}>
        <FlowiseCanvas
          flowiseUrl="http://localhost:3000"
          apiKey="your-api-key"
          flowId="your-flow-id"
        />
      </Suspense>
    </div>
  )
}
```

### 2. Memoization for Multiple Flows

```jsx
import React, { memo } from 'react'

const MemoizedFlowiseCanvas = memo(FlowiseCanvas)

function MultiFlowApp({ flows }) {
  return (
    <div>
      {flows.map(flow => (
        <MemoizedFlowiseCanvas
          key={flow.id}
          flowiseUrl="http://localhost:3000"
          apiKey="your-api-key"
          flowId={flow.flowId}
          flowType={flow.type}
        />
      ))}
    </div>
  )
}
```

## 🚨 Troubleshooting Checklist

### Before You Start
- [ ] Flowise server is running and accessible
- [ ] You have a valid API key
- [ ] You have at least one flow created in Flowise
- [ ] You know the flow ID (UUID from the URL)

### If Canvas Won't Load
- [ ] Check browser console for errors
- [ ] Verify API key format (should start with `sk-`)
- [ ] Test API key with curl: `curl -H "Authorization: Bearer your-key" http://localhost:3000/api/v1/ping`
- [ ] Check if flow exists: open it in Flowise first
- [ ] Try a different flow ID

### If You See Authentication Errors
- [ ] API key belongs to the same workspace as the flow
- [ ] API key hasn't been deleted or expired
- [ ] Flow hasn't been moved to a different workspace

### Network Issues
- [ ] Flowise URL is correct and accessible
- [ ] No firewall blocking the connection
- [ ] CORS is properly configured
- [ ] Try accessing Flowise directly in browser first

## 🎊 You're All Set!

Your external React app can now display Flowise canvas with just a few lines of code:

```jsx
<FlowiseCanvas
  flowiseUrl="http://localhost:3000"
  apiKey="your-api-key"
  flowId="your-flow-id"
  flowType="chatflow"
/>
```

**Next Steps:**
1. Copy the component to your React app
2. Get your API key and flow ID from Flowise
3. Test with the examples above
4. Customize styling and behavior for your use case

Happy coding! 🚀