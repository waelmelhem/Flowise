# 🎯 Flowise Iframe Integration - Complete Solution

This is a complete solution for embedding Flowise chat flows and agent flows canvas in external React applications using iframes with API key authentication.

## ✅ What's Been Implemented

### 🔧 Backend Changes
- ✅ **New Iframe Endpoints** - Dedicated endpoints for iframe canvas viewing
- ✅ **API Key Authentication** - Secure access using existing Flowise API keys
- ✅ **Workspace Validation** - Users can only access flows in their workspace
- ✅ **Whitelist Configuration** - Iframe routes added to authentication whitelist

### 🎨 Frontend Changes
- ✅ **Iframe Mode Detection** - Canvas components detect and handle iframe mode
- ✅ **Read-only Canvas** - Embedded canvas is read-only for security
- ✅ **API Key Client** - Custom API client for iframe authentication
- ✅ **Responsive Design** - Works across different screen sizes

### 📦 Example Integration
- ✅ **React Component** - Ready-to-use `FlowiseIframe` component
- ✅ **Example App** - Complete example React application
- ✅ **Documentation** - Comprehensive usage guide and API reference

## 🚀 Quick Start

### 1. Start Your Flowise Server
```bash
# In the Flowise directory
npm start
```

### 2. Test the Iframe Endpoints
```bash
# Set your API key and flow ID
export FLOWISE_API_KEY="your-api-key"
export FLOW_ID="your-flow-id"

# Run the test script
node test-iframe-endpoints.js
```

### 3. Try the Example App
```bash
# Navigate to example app
cd example-react-app

# Install dependencies
npm install

# Start the example app
npm start
```

### 4. Integrate in Your App

Copy the `FlowiseIframe` component and use it in your React application:

```jsx
import FlowiseIframe from './components/FlowiseIframe'

function MyApp() {
  return (
    <FlowiseIframe
      flowiseUrl="http://localhost:3000"
      apiKey="your-api-key"
      flowId="your-flow-id"
      flowType="chatflow"
      width="100%"
      height="600px"
    />
  )
}
```

## 📋 Files Modified/Created

### Backend Files
```
packages/server/src/
├── controllers/iframe-canvas/index.ts          [NEW] - Iframe canvas controller
├── routes/iframe-canvas/index.ts               [NEW] - Iframe canvas routes
├── routes/index.ts                            [MODIFIED] - Added iframe routes
└── utils/constants.ts                         [MODIFIED] - Added whitelist URLs
```

### Frontend Files
```
packages/ui/src/
├── views/canvas/IframeCanvas.jsx              [NEW] - Iframe chat flow canvas
├── views/agentflowsv2/IframeCanvasV2.jsx      [NEW] - Iframe agent flow v2 canvas
├── routes/IframeRoutes.jsx                    [NEW] - Iframe routes configuration
├── utils/iframeApiClient.js                   [NEW] - API client for iframe mode
├── routes/index.jsx                           [MODIFIED] - Added iframe routes
├── views/canvas/index.jsx                     [MODIFIED] - Added iframe mode support
└── views/agentflowsv2/Canvas.jsx              [MODIFIED] - Added iframe mode support
```

### Example App
```
example-react-app/
├── src/
│   ├── components/FlowiseIframe.jsx           [NEW] - Reusable iframe component
│   ├── App.js                                 [NEW] - Example application
│   ├── App.css                                [NEW] - Styling
│   └── index.js                               [NEW] - Entry point
├── public/index.html                          [NEW] - HTML template
├── package.json                               [NEW] - Dependencies
├── README.md                                  [NEW] - Usage documentation
└── .gitignore                                 [NEW] - Git ignore rules
```

### Documentation
```
├── IFRAME_INTEGRATION_GUIDE.md                [NEW] - Complete integration guide
├── IFRAME_SOLUTION_SUMMARY.md                 [NEW] - This summary file
└── test-iframe-endpoints.js                   [NEW] - Test script
```

## 🔑 Key Features

### Security
- 🔐 **API Key Authentication** - Uses existing Flowise API key system
- 🏢 **Workspace Isolation** - Users only see flows from their workspace
- 📖 **Read-only Access** - Embedded canvas is read-only for security
- 🛡️ **Sandboxed Iframe** - Additional security layer

### Functionality
- 📊 **Multiple Flow Types** - Supports chat flows, agent flows v1 & v2
- 📱 **Responsive Design** - Works on desktop and mobile
- ⚡ **Fast Loading** - Optimized for quick canvas loading
- 🎨 **Customizable** - Flexible styling and configuration options

### Developer Experience
- 🔌 **Easy Integration** - Simple React component
- 📚 **Complete Documentation** - Comprehensive guides and examples
- 🧪 **Testing Tools** - Test script for validation
- 🛠️ **Error Handling** - Proper error states and messaging

## 🌐 API Endpoints

| Endpoint | Description | Flow Type |
|----------|-------------|-----------|
| `/api/v1/iframe-canvas/chatflow/:id` | Chat flow canvas | Regular chat flows |
| `/api/v1/iframe-canvas/agentflow/:id` | Agent flow canvas | Single-agent flows |
| `/api/v1/iframe-canvas/agentflowv2/:id` | Agent flow v2 canvas | Multi-agent flows |

All endpoints require `Authorization: Bearer <api-key>` header.

## 🎉 Ready to Use!

Your Flowise iframe integration is now complete and ready to use! The solution provides:

1. **Secure Authentication** - Using your existing API keys
2. **Multiple Flow Support** - All flow types supported
3. **Production Ready** - Proper error handling and security
4. **Easy Integration** - Simple React component for immediate use

Start by testing the endpoints with the provided test script, then try the example app, and finally integrate the component into your own application.

## 📞 Need Help?

- Check the `IFRAME_INTEGRATION_GUIDE.md` for detailed documentation
- Run the test script to verify your setup
- Look at the example app for implementation details
- Check browser console for debugging information