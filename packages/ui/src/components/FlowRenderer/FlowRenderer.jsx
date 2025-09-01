import React, { useEffect, useRef, useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import ReactFlow, { Controls, Background, MiniMap, useNodesState, useEdgesState } from 'reactflow'
import 'reactflow/dist/style.css'
import '@/views/canvas/index.css'

// material-ui
import { Box, useTheme } from '@mui/material'

// project imports
import FlowRendererNode from './FlowRendererNode'
import FlowRendererAgentNode from './FlowRendererAgentNode'
import FlowRendererStickyNote from './FlowRendererStickyNote'
import ButtonEdge from '@/views/canvas/ButtonEdge'
import AgentFlowEdge from '@/views/agentflowsv2/AgentFlowEdge'

// Default node types for different flow types
const DEFAULT_NODE_TYPES = {
    customNode: FlowRendererNode,
    stickyNote: FlowRendererStickyNote,
    agentFlow: FlowRendererAgentNode,
    iteration: FlowRendererAgentNode
}

const DEFAULT_EDGE_TYPES = {
    buttonedge: ButtonEdge,
    agentFlow: AgentFlowEdge
}

/**
 * FlowRenderer - A read-only component for rendering Flowise flows
 * 
 * @param {Object} props - Component props
 * @param {Object} props.flowData - Flowise flow JSON with nodes and edges
 * @param {boolean} [props.readOnly=true] - Whether the flow is read-only
 * @param {boolean} [props.showMiniMap=false] - Whether to show the minimap
 * @param {boolean} [props.showControls=true] - Whether to show flow controls
 * @param {boolean} [props.showBackground=true] - Whether to show the background grid
 * @param {Object} [props.nodeComponentMap={}] - Custom node component mappings
 * @param {Function} [props.onNodeClick] - Callback for node click events
 * @param {Function} [props.onNodeDoubleClick] - Callback for node double click events
 * @param {Object} [props.style] - Custom styles for the container
 * @param {string} [props.className] - Custom CSS class for the container
 * @param {number} [props.minZoom=0.1] - Minimum zoom level
 * @param {number} [props.maxZoom=2] - Maximum zoom level
 * @param {boolean} [props.fitView=true] - Whether to fit the view on initial render
 */
const FlowRenderer = ({
    flowData,
    readOnly = true,
    showMiniMap = false,
    showControls = true,
    showBackground = true,
    nodeComponentMap = {},
    onNodeClick,
    onNodeDoubleClick,
    style = {},
    className = '',
    minZoom = 0.1,
    maxZoom = 2,
    fitView = true,
    ...otherProps
}) => {
    const theme = useTheme()
    const reactFlowWrapper = useRef(null)
    const [reactFlowInstance, setReactFlowInstance] = useState(null)
    
    // Merge custom node types with defaults
    const nodeTypes = useMemo(() => ({
        ...DEFAULT_NODE_TYPES,
        ...nodeComponentMap
    }), [nodeComponentMap])

    // Determine edge types based on flow type
    const edgeTypes = useMemo(() => {
        if (!flowData?.edges?.length) return DEFAULT_EDGE_TYPES
        
        // Check if this is an agent flow
        const hasAgentFlowEdges = flowData.edges.some(edge => edge.type === 'agentFlow')
        const hasButtonEdges = flowData.edges.some(edge => edge.type === 'buttonedge')
        
        if (hasAgentFlowEdges) {
            return { agentFlow: AgentFlowEdge }
        } else if (hasButtonEdges) {
            return { buttonedge: ButtonEdge }
        }
        
        return DEFAULT_EDGE_TYPES
    }, [flowData])

    // Initialize nodes and edges from flow data
    const [nodes, setNodes, onNodesChange] = useNodesState(flowData?.nodes || [])
    const [edges, setEdges, onEdgesChange] = useEdgesState(flowData?.edges || [])

    // Update nodes and edges when flowData changes
    useEffect(() => {
        if (flowData) {
            setNodes(flowData.nodes || [])
            setEdges(flowData.edges || [])
        }
    }, [flowData, setNodes, setEdges])

    // Handle node interactions
    const handleNodeClick = (event, node) => {
        if (onNodeClick && !readOnly) {
            onNodeClick(event, node)
        }
    }

    const handleNodeDoubleClick = (event, node) => {
        if (onNodeDoubleClick && !readOnly) {
            onNodeDoubleClick(event, node)
        }
    }

    // Disable interactions in read-only mode
    const handleNodesChange = readOnly ? () => {} : onNodesChange
    const handleEdgesChange = readOnly ? () => {} : onEdgesChange

    return (
        <Box 
            sx={{ 
                height: '100%', 
                width: '100%',
                ...style 
            }}
            className={`flow-renderer ${className}`}
        >
            <div className='reactflow-parent-wrapper' style={{ height: '100%' }}>
                <div className='reactflow-wrapper' ref={reactFlowWrapper} style={{ height: '100%' }}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={handleNodesChange}
                        onEdgesChange={handleEdgesChange}
                        onNodeClick={handleNodeClick}
                        onNodeDoubleClick={handleNodeDoubleClick}
                        onInit={setReactFlowInstance}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        nodesDraggable={!readOnly}
                        nodesConnectable={!readOnly}
                        elementsSelectable={!readOnly}
                        fitView={fitView}
                        minZoom={minZoom}
                        maxZoom={maxZoom}
                        {...otherProps}
                    >
                        {showControls && (
                            <Controls
                                showZoom={true}
                                showFitView={true}
                                showInteractive={!readOnly}
                                className={theme.customization?.isDarkMode ? 'dark-mode-controls' : ''}
                            />
                        )}
                        {showBackground && <Background color='#aaa' gap={16} />}
                        {showMiniMap && (
                            <MiniMap
                                nodeStrokeColor={(n) => {
                                    if (n.style?.background) return n.style.background
                                    if (n.type === 'input') return '#0041d0'
                                    if (n.type === 'output') return '#ff0072'
                                    if (n.type === 'default') return '#1a192b'
                                    return '#eee'
                                }}
                                nodeColor={(n) => {
                                    if (n.style?.background) return n.style.background
                                    return '#fff'
                                }}
                                nodeBorderRadius={2}
                            />
                        )}
                    </ReactFlow>
                </div>
            </div>
        </Box>
    )
}

FlowRenderer.propTypes = {
    flowData: PropTypes.shape({
        nodes: PropTypes.array.isRequired,
        edges: PropTypes.array.isRequired
    }).isRequired,
    readOnly: PropTypes.bool,
    showMiniMap: PropTypes.bool,
    showControls: PropTypes.bool,
    showBackground: PropTypes.bool,
    nodeComponentMap: PropTypes.object,
    onNodeClick: PropTypes.func,
    onNodeDoubleClick: PropTypes.func,
    style: PropTypes.object,
    className: PropTypes.string,
    minZoom: PropTypes.number,
    maxZoom: PropTypes.number,
    fitView: PropTypes.bool
}

export default FlowRenderer