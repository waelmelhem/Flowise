# Flowise Iframe Integration Guide

This guide provides a complete solution for embedding Flowise chat flows and agent flows canvas in external React applications using iframes with API key authentication.

## 🎯 Solution Overview

The solution consists of:

1. **Backend Changes** - New iframe endpoints with API key authentication
2. **Frontend Modifications** - Canvas components that support iframe mode
3. **Example React Component** - Ready-to-use component for external apps
4. **Security Features** - Proper authentication and read-only access

## 📁 Files Created/Modified

### Backend Files

#### New Files Created:
- `packages/server/src/routes/iframe-canvas/index.ts` - Iframe canvas routes
- `packages/server/src/controllers/iframe-canvas/index.ts` - Iframe canvas controller

#### Modified Files:
- `packages/server/src/routes/index.ts` - Added iframe canvas routes
- `packages/server/src/utils/constants.ts` - Added iframe routes to whitelist

### Frontend Files

#### New Files Created:
- `packages/ui/src/views/canvas/IframeCanvas.jsx` - Iframe-specific canvas component
- `packages/ui/src/views/agentflowsv2/IframeCanvasV2.jsx` - Iframe-specific agentflow v2 canvas
- `packages/ui/src/routes/IframeRoutes.jsx` - Iframe routes configuration
- `packages/ui/src/utils/iframeApiClient.js` - API client for iframe mode

#### Modified Files:
- `packages/ui/src/routes/index.jsx` - Added iframe routes
- `packages/ui/src/views/canvas/index.jsx` - Added iframe mode support
- `packages/ui/src/views/agentflowsv2/Canvas.jsx` - Added iframe mode support

### Example App Files:
- `example-react-app/` - Complete example React application
- `example-react-app/src/components/FlowiseIframe.jsx` - Reusable iframe component
- `example-react-app/README.md` - Documentation and usage guide

## 🚀 How It Works

### 1. Authentication Flow

```
External App → Iframe Endpoint → API Key Validation → Canvas Display
```

1. External app calls iframe endpoint with API key in Authorization header
2. Server validates API key and checks workspace permissions
3. Server returns HTML page with embedded canvas iframe
4. Canvas loads in read-only mode with API key authentication

### 2. API Endpoints

#### Iframe Canvas Endpoints:
- `GET /api/v1/iframe-canvas/chatflow/:id` - Chat flow canvas
- `GET /api/v1/iframe-canvas/agentflow/:id` - Agent flow canvas (v1)
- `GET /api/v1/iframe-canvas/agentflowv2/:id` - Agent flow canvas (v2)

#### Authentication:
- All endpoints require `Authorization: Bearer <api-key>` header
- API key must belong to the same workspace as the flow
- Endpoints are whitelisted to bypass normal JWT authentication

### 3. Security Features

- **API Key Authentication** - Only valid API keys can access flows
- **Workspace Isolation** - Users can only access flows in their workspace
- **Read-only Mode** - Canvas is displayed in read-only mode
- **CORS Protection** - Proper headers for iframe embedding
- **Sandboxed Iframe** - Additional security layer

## 📖 Usage Guide

### Step 1: Get Your API Key

1. Log into your Flowise instance
2. Go to Settings → API Keys
3. Create a new API key
4. Copy the API key for use in your external application

### Step 2: Find Flow IDs

1. Open the flow you want to embed in Flowise
2. Copy the UUID from the URL:
   - Chat flows: `/canvas/{flow-id}`
   - Agent flows v1: `/agentcanvas/{flow-id}`
   - Agent flows v2: `/v2/agentcanvas/{flow-id}`

### Step 3: Use the React Component

```jsx
import FlowiseIframe from './components/FlowiseIframe'

function MyApp() {
  return (
    <div>
      <h1>My Application</h1>
      
      {/* Embed Chat Flow */}
      <FlowiseIframe
        flowiseUrl="https://your-flowise.com"
        apiKey="your-api-key"
        flowId="your-chatflow-id"
        flowType="chatflow"
        width="100%"
        height="600px"
        onLoad={() => console.log('Chat flow loaded!')}
        onError={(error) => console.error('Error:', error)}
      />
      
      {/* Embed Agent Flow */}
      <FlowiseIframe
        flowiseUrl="https://your-flowise.com"
        apiKey="your-api-key"
        flowId="your-agentflow-id"
        flowType="agentflowv2"
        width="100%"
        height="800px"
      />
    </div>
  )
}
```

### Step 4: Direct Iframe Usage (Alternative)

If you prefer to use iframes directly without the React component:

```html
<iframe
  src="https://your-flowise.com/api/v1/iframe-canvas/chatflow/your-flow-id"
  width="100%"
  height="600px"
  frameborder="0"
  sandbox="allow-scripts allow-same-origin allow-forms"
  style="border: 1px solid #e0e0e0; border-radius: 8px;"
></iframe>
```

**Note:** When using direct iframes, you'll need to handle API key authentication differently, as the Authorization header needs to be passed to the iframe endpoint.

## 🔧 Component API Reference

### FlowiseIframe Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `flowiseUrl` | string | ✅ | - | Base URL of your Flowise instance |
| `apiKey` | string | ✅ | - | Your Flowise API key |
| `flowId` | string | ✅ | - | UUID of the flow to display |
| `flowType` | string | ❌ | 'chatflow' | Type: 'chatflow', 'agentflow', or 'agentflowv2' |
| `width` | string | ❌ | '100%' | Width of the iframe |
| `height` | string | ❌ | '600px' | Height of the iframe |
| `onLoad` | function | ❌ | - | Callback when iframe loads successfully |
| `onError` | function | ❌ | - | Callback when iframe fails to load |
| `style` | object | ❌ | {} | Additional styles for the container |

### Flow Types

- **`chatflow`** - Regular chat flows created in Flowise
- **`agentflow`** - Agent flows (v1) for single-agent workflows  
- **`agentflowv2`** - Multi-agent flows (v2) for complex multi-agent systems

## 🛠️ Installation & Setup

### 1. Apply Backend Changes

The backend changes are already included in the modified files. Make sure to:

1. Restart your Flowise server after applying the changes
2. Verify the new endpoints are accessible:
   ```bash
   curl -H "Authorization: Bearer YOUR_API_KEY" \
        "http://localhost:3000/api/v1/iframe-canvas/chatflow/YOUR_FLOW_ID"
   ```

### 2. Test the Example App

1. Navigate to the example app directory:
   ```bash
   cd example-react-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open http://localhost:3001 and configure your Flowise settings

### 3. Integrate in Your App

1. Copy the `FlowiseIframe.jsx` component to your React application
2. Install required dependencies if not already present:
   ```bash
   npm install prop-types
   ```
3. Import and use the component as shown in the usage examples

## 🔒 Security Considerations

### API Key Security
- **Never expose API keys in client-side code**
- Store API keys securely (environment variables, secure storage)
- Use different API keys for different environments
- Regularly rotate API keys

### Iframe Security
- The iframe is sandboxed with limited permissions
- Canvas is read-only to prevent unauthorized modifications
- CORS headers are properly configured
- Content Security Policy allows iframe embedding

### Best Practices
- Validate API keys on your backend before passing to iframe
- Implement proper error handling for failed authentications
- Monitor API key usage and implement rate limiting if needed
- Use HTTPS in production environments

## 🐛 Troubleshooting

### Common Issues

#### 1. "Unauthorized Access" Error
**Cause:** Invalid API key or workspace mismatch
**Solution:** 
- Verify API key is correct
- Ensure flow belongs to the workspace associated with the API key
- Check API key hasn't expired

#### 2. "Failed to load canvas" Error
**Cause:** Network issues or server problems
**Solution:**
- Check if Flowise server is running and accessible
- Verify the flow ID exists
- Check browser console for detailed error messages

#### 3. Blank Iframe
**Cause:** CORS or CSP issues
**Solution:**
- Ensure proper CORS configuration
- Check Content Security Policy settings
- Verify iframe sandbox permissions

#### 4. Canvas Not Responsive
**Cause:** CSS or sizing issues
**Solution:**
- Check container dimensions
- Verify iframe width/height settings
- Test with different screen sizes

### Debug Mode

Enable debug mode by adding `?debug=true` to the iframe URL to see additional logging:

```jsx
<FlowiseIframe
  flowiseUrl="https://your-flowise.com"
  apiKey="your-api-key"
  flowId="your-flow-id"
  // Add debug parameter to the URL
  style={{ border: '2px solid red' }} // Visual debugging
/>
```

## 📝 API Documentation

### Iframe Canvas API

#### Get Chat Flow Canvas
```http
GET /api/v1/iframe-canvas/chatflow/{flowId}
Authorization: Bearer {apiKey}
```

#### Get Agent Flow Canvas
```http
GET /api/v1/iframe-canvas/agentflow/{flowId}
Authorization: Bearer {apiKey}
```

#### Get Agent Flow V2 Canvas
```http
GET /api/v1/iframe-canvas/agentflowv2/{flowId}
Authorization: Bearer {apiKey}
```

#### Response
Returns HTML page with embedded canvas iframe.

#### Error Responses
- `401 Unauthorized` - Invalid API key
- `403 Forbidden` - Flow doesn't belong to your workspace
- `404 Not Found` - Flow not found
- `400 Bad Request` - Invalid flow type

## 🎨 Customization

### Styling the Iframe

You can customize the appearance by passing styles to the component:

```jsx
<FlowiseIframe
  // ... other props
  style={{
    border: '2px solid #3498db',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    background: '#f8f9fa'
  }}
/>
```

### Custom Loading States

Handle loading and error states with custom UI:

```jsx
const [isLoading, setIsLoading] = useState(true)
const [error, setError] = useState(null)

return (
  <div>
    {isLoading && <div>Loading your flow...</div>}
    {error && <div>Error: {error.message}</div>}
    
    <FlowiseIframe
      flowiseUrl="https://your-flowise.com"
      apiKey="your-api-key"
      flowId="your-flow-id"
      onLoad={() => setIsLoading(false)}
      onError={(err) => {
        setIsLoading(false)
        setError(err)
      }}
    />
  </div>
)
```

## 🔄 Updates & Maintenance

### Updating the Integration

When updating Flowise:
1. Test iframe endpoints after updates
2. Check for any breaking changes in canvas components
3. Update example app dependencies if needed

### Monitoring

Monitor the following:
- API key usage and rate limits
- Iframe loading performance
- Error rates and types
- User access patterns

## 📞 Support

For issues with this integration:
1. Check the troubleshooting section above
2. Review browser console errors
3. Test API endpoints directly
4. Check Flowise server logs

## 📄 License

This integration follows the same license as the main Flowise project.