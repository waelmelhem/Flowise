# FlowRenderer

A read-only React component for rendering Flowise flows (node graphs) similar to n8n-demo. This component provides a stable public API for embedding Flowise flows in other applications or documentation.

## Features

- ✅ Read-only flow visualization
- ✅ Support for both Chatflows and Agent Flows
- ✅ Customizable node component mapping
- ✅ MiniMap, Controls, and Background options
- ✅ Click event handlers
- ✅ Responsive design
- ✅ Theme support (light/dark mode)
- ✅ Editor ↔ Renderer toggle integration

## Installation

The FlowRenderer is part of the Flowise UI package. Import it directly:

```javascript
import FlowRenderer from '@/components/FlowRenderer'
// or
import { FlowRenderer } from '@/components/FlowRenderer'
```

## Basic Usage

```jsx
import React from 'react'
import FlowRenderer from '@/components/FlowRenderer'

const MyComponent = () => {
  const flowData = {
    nodes: [
      {
        id: 'node1',
        type: 'customNode',
        position: { x: 100, y: 100 },
        data: {
          label: 'Start Node',
          // ... other node data
        }
      }
    ],
    edges: [
      {
        id: 'edge1',
        source: 'node1',
        target: 'node2',
        type: 'buttonedge'
      }
    ]
  }

  return (
    <div style={{ height: '600px' }}>
      <FlowRenderer
        flowData={flowData}
        readOnly={true}
        showControls={true}
        showMiniMap={false}
      />
    </div>
  )
}
```

## API Reference

### FlowRenderer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `flowData` | `Object` | **Required** | Flowise flow JSON with `nodes` and `edges` arrays |
| `readOnly` | `boolean` | `true` | Whether the flow is read-only (non-interactive) |
| `showMiniMap` | `boolean` | `false` | Show the minimap navigation |
| `showControls` | `boolean` | `true` | Show zoom and fit view controls |
| `showBackground` | `boolean` | `true` | Show the background grid |
| `nodeComponentMap` | `Object` | `{}` | Custom node component mappings |
| `onNodeClick` | `Function` | `undefined` | Callback for node click events |
| `onNodeDoubleClick` | `Function` | `undefined` | Callback for node double click events |
| `style` | `Object` | `{}` | Custom styles for the container |
| `className` | `string` | `''` | Custom CSS class |
| `minZoom` | `number` | `0.1` | Minimum zoom level |
| `maxZoom` | `number` | `2` | Maximum zoom level |
| `fitView` | `boolean` | `true` | Fit view on initial render |

### Flow Data Structure

The `flowData` prop expects a Flowise flow JSON object with this structure:

```javascript
{
  nodes: [
    {
      id: string,           // Unique node ID
      type: string,         // Node type: 'customNode', 'agentFlow', 'stickyNote', etc.
      position: { x, y },   // Node position
      data: {               // Node data
        label: string,      // Display label
        name: string,       // Node name/type
        inputs: Object,     // Input values
        inputAnchors: [],   // Input connection points
        outputAnchors: [],  // Output connection points
        // ... other node properties
      }
    }
  ],
  edges: [
    {
      id: string,           // Unique edge ID
      source: string,       // Source node ID
      target: string,       // Target node ID
      sourceHandle: string, // Source connection point
      targetHandle: string, // Target connection point
      type: string,         // Edge type: 'buttonedge', 'agentFlow', etc.
    }
  ]
}
```

### Custom Node Components

You can provide custom node components via the `nodeComponentMap` prop:

```jsx
import CustomNodeComponent from './CustomNodeComponent'

<FlowRenderer
  flowData={flowData}
  nodeComponentMap={{
    customNode: CustomNodeComponent,
    myCustomType: MyCustomNodeComponent
  }}
/>
```

### Event Handlers

```jsx
const handleNodeClick = (event, node) => {
  console.log('Node clicked:', node)
}

const handleNodeDoubleClick = (event, node) => {
  console.log('Node double-clicked:', node)
}

<FlowRenderer
  flowData={flowData}
  onNodeClick={handleNodeClick}
  onNodeDoubleClick={handleNodeDoubleClick}
/>
```

## Built-in Node Types

FlowRenderer supports these node types out of the box:

- **customNode**: Standard Flowise chatflow nodes
- **agentFlow**: Agent flow nodes with enhanced styling
- **iteration**: Iteration nodes for agent flows
- **stickyNote**: Sticky note nodes

## Integration with Canvas

FlowRenderer integrates seamlessly with the existing Canvas editor. When viewing a flow in the Canvas, you can toggle between Editor and Renderer modes using the toggle buttons in the header.

## Demo

Visit `/flowrenderer-demo` in the Flowise UI to see FlowRenderer in action with sample flows.

## Styling

FlowRenderer respects the current theme (light/dark mode) and uses Material-UI components for consistency with the rest of the Flowise UI.

You can customize the appearance using:

- `style` prop for container styles
- `className` prop for custom CSS classes
- Custom node components via `nodeComponentMap`

## Examples

### Chatflow Example

```jsx
<FlowRenderer
  flowData={chatflowData}
  readOnly={true}
  showControls={true}
  showBackground={true}
  style={{ border: '1px solid #ccc', borderRadius: '8px' }}
/>
```

### Agent Flow Example

```jsx
<FlowRenderer
  flowData={agentflowData}
  readOnly={true}
  showMiniMap={true}
  showControls={true}
  onNodeClick={(event, node) => {
    console.log('Agent node clicked:', node.data.label)
  }}
/>
```

### Embedded in Documentation

```jsx
// Perfect for embedding in docs or demos
<div style={{ height: '400px', width: '100%' }}>
  <FlowRenderer
    flowData={exampleFlow}
    readOnly={true}
    showControls={false}
    showBackground={false}
    fitView={true}
  />
</div>
```

## Browser Support

FlowRenderer works in all modern browsers that support React and ReactFlow:

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Contributing

FlowRenderer is part of the Flowise project. To contribute:

1. Make changes in `packages/ui/src/components/FlowRenderer/`
2. Test with the demo page at `/flowrenderer-demo`
3. Update this documentation if needed
4. Submit a pull request

## License

Same as Flowise project license.