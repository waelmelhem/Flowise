# Flowise Iframe Integration Example

This example demonstrates how to embed Flowise chat flows and agent flows canvas in external React applications using iframes with API key authentication.

## Features

- 🔐 **API Key Authentication** - Secure access using Flowise API keys
- 🎨 **Multiple Flow Types** - Support for chat flows, agent flows (v1), and agent flows v2 (multi-agent)
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🔒 **Read-only Mode** - Canvas is displayed in read-only mode for security
- ⚡ **Easy Integration** - Simple React component for quick integration

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Configure your Flowise instance:**
   - Enter your Flowise URL (e.g., `http://localhost:3000`)
   - Enter your API key (get from Flowise Settings → API Keys)
   - Enter the Flow ID (copy from the URL when viewing a flow)
   - Select the flow type

## Component Usage

```jsx
import FlowiseIframe from './components/FlowiseIframe'

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
}
```

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `flowiseUrl` | string | Yes | - | Base URL of your Flowise instance |
| `apiKey` | string | Yes | - | Your Flowise API key |
| `flowId` | string | Yes | - | UUID of the flow to display |
| `flowType` | string | No | 'chatflow' | Type of flow: 'chatflow', 'agentflow', or 'agentflowv2' |
| `width` | string | No | '100%' | Width of the iframe |
| `height` | string | No | '600px' | Height of the iframe |
| `onLoad` | function | No | - | Callback when iframe loads successfully |
| `onError` | function | No | - | Callback when iframe fails to load |
| `style` | object | No | {} | Additional styles for the container |

## Flow Types

- **chatflow** - Regular chat flows created in Flowise
- **agentflow** - Agent flows (v1) for single-agent workflows
- **agentflowv2** - Multi-agent flows (v2) for complex multi-agent systems

## Security Features

- API key authentication ensures only authorized access
- Read-only canvas prevents modifications
- Sandboxed iframe for additional security
- CORS and CSP headers for cross-origin protection

## Troubleshooting

### Common Issues

1. **"Failed to load canvas"**
   - Check if your Flowise URL is correct and accessible
   - Verify your API key is valid
   - Ensure the flow ID exists and you have access to it

2. **"Unauthorized Access"**
   - Check if your API key is correct
   - Verify the flow belongs to the workspace associated with your API key

3. **CORS Errors**
   - Ensure your Flowise instance allows iframe embedding
   - Check CORS configuration in your Flowise instance

### Getting Help

- Check the browser console for detailed error messages
- Verify your Flowise instance is running and accessible
- Test the API key using Flowise's API documentation

## License

This example is provided as-is for demonstration purposes.