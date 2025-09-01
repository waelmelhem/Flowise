import React, { useState } from 'react'
import FlowiseIframe from './components/FlowiseIframe'
import './App.css'

function App() {
  // Replace these with your actual values
  const [config, setConfig] = useState({
    flowiseUrl: 'http://localhost:3000', // Your Flowise instance URL
    apiKey: '', // Your API key
    flowId: '', // Flow ID to display
    flowType: 'chatflow' // 'chatflow', 'agentflow', or 'agentflowv2'
  })

  const [loadingState, setLoadingState] = useState('')

  const handleConfigChange = (field, value) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleLoad = () => {
    setLoadingState('✅ Canvas loaded successfully!')
    console.log('Flowise canvas loaded successfully')
  }

  const handleError = (error) => {
    setLoadingState(`❌ Error: ${error.message}`)
    console.error('Flowise canvas error:', error)
  }

  const canShowIframe = config.flowiseUrl && config.apiKey && config.flowId

  return (
    <div className="App">
      <header className="App-header">
        <h1>Flowise Iframe Integration Example</h1>
        <p>Embed Flowise chat flows and agent flows in your React application</p>
      </header>

      <main className="App-main">
        {/* Configuration Form */}
        <div className="config-section">
          <h2>Configuration</h2>
          <div className="config-form">
            <div className="form-group">
              <label htmlFor="flowiseUrl">Flowise URL:</label>
              <input
                id="flowiseUrl"
                type="text"
                value={config.flowiseUrl}
                onChange={(e) => handleConfigChange('flowiseUrl', e.target.value)}
                placeholder="http://localhost:3000"
              />
            </div>

            <div className="form-group">
              <label htmlFor="apiKey">API Key:</label>
              <input
                id="apiKey"
                type="password"
                value={config.apiKey}
                onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                placeholder="Your Flowise API key"
              />
            </div>

            <div className="form-group">
              <label htmlFor="flowId">Flow ID:</label>
              <input
                id="flowId"
                type="text"
                value={config.flowId}
                onChange={(e) => handleConfigChange('flowId', e.target.value)}
                placeholder="UUID of your flow"
              />
            </div>

            <div className="form-group">
              <label htmlFor="flowType">Flow Type:</label>
              <select
                id="flowType"
                value={config.flowType}
                onChange={(e) => handleConfigChange('flowType', e.target.value)}
              >
                <option value="chatflow">Chat Flow</option>
                <option value="agentflow">Agent Flow (v1)</option>
                <option value="agentflowv2">Agent Flow (v2)</option>
              </select>
            </div>
          </div>

          {loadingState && (
            <div className={`status-message ${loadingState.includes('❌') ? 'error' : 'success'}`}>
              {loadingState}
            </div>
          )}
        </div>

        {/* Iframe Preview */}
        {canShowIframe ? (
          <div className="iframe-section">
            <h2>Canvas Preview</h2>
            <div className="iframe-container">
              <FlowiseIframe
                flowiseUrl={config.flowiseUrl}
                apiKey={config.apiKey}
                flowId={config.flowId}
                flowType={config.flowType}
                width="100%"
                height="500px"
                onLoad={handleLoad}
                onError={handleError}
                style={{
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px'
                }}
              />
            </div>
          </div>
        ) : (
          <div className="placeholder-section">
            <h2>Canvas Preview</h2>
            <div className="placeholder">
              <p>Fill in all configuration fields above to see the canvas preview</p>
            </div>
          </div>
        )}

        {/* Usage Instructions */}
        <div className="instructions-section">
          <h2>Usage Instructions</h2>
          <div className="instructions">
            <h3>1. Get your API Key</h3>
            <p>In your Flowise instance, go to Settings → API Keys and create a new API key.</p>

            <h3>2. Find your Flow ID</h3>
            <p>Open the flow you want to embed and copy the ID from the URL (the UUID after /canvas/ or /agentcanvas/).</p>

            <h3>3. Choose Flow Type</h3>
            <ul>
              <li><strong>chatflow</strong> - Regular chat flows</li>
              <li><strong>agentflow</strong> - Agent flows (v1)</li>
              <li><strong>agentflowv2</strong> - Multi-agent flows (v2)</li>
            </ul>

            <h3>4. Embed in your app</h3>
            <pre className="code-block">
{`import FlowiseIframe from './components/FlowiseIframe'

function MyComponent() {
  return (
    <FlowiseIframe
      flowiseUrl="https://your-flowise.com"
      apiKey="your-api-key"
      flowId="your-flow-id"
      flowType="chatflow"
      width="100%"
      height="600px"
      onLoad={() => console.log('Canvas loaded!')}
      onError={(error) => console.error('Error:', error)}
    />
  )
}`}
            </pre>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App