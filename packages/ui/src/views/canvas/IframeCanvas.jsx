import { useEffect, useRef, useState, useCallback, useContext } from 'react'
import ReactFlow, { addEdge, Controls, Background, useNodesState, useEdgesState } from 'reactflow'
import 'reactflow/dist/style.css'
import { useSearchParams } from 'react-router-dom'
import { omit, cloneDeep } from 'lodash'

// material-ui
import { Toolbar, Box, AppBar, Button, Fab } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import CanvasNode from './CanvasNode'
import ButtonEdge from './ButtonEdge'
import StickyNote from './StickyNote'
import { flowContext } from '@/store/context/ReactFlowContext'

// API
import nodesApi from '@/api/nodes'
import chatflowsApi from '@/api/chatflows'

// Hooks
import useApi from '@/hooks/useApi'

// utils
import {
    getUniqueNodeId,
    initNode,
    rearrangeToolsOrdering,
    updateOutdatedNodeData,
    updateOutdatedNodeEdge
} from '@/utils/genericHelper'

// const
import { FLOWISE_CREDENTIAL_ID } from '@/store/constant'

const nodeTypes = { customNode: CanvasNode, stickyNote: StickyNote }
const edgeTypes = { buttonedge: ButtonEdge }

// ==============================|| IFRAME CANVAS ||============================== //

const IframeCanvas = () => {
    const theme = useTheme()
    const [searchParams] = useSearchParams()
    
    // Get parameters from URL
    const apiKey = searchParams.get('apikey')
    const flowId = searchParams.get('flowId') || window.location.pathname.split('/').pop()
    const isAgentCanvas = window.location.pathname.includes('agentcanvas')
    
    const { reactFlowInstance, setReactFlowInstance } = useContext(flowContext)

    // ==============================|| ReactFlow ||============================== //

    const [nodes, setNodes, onNodesChange] = useNodesState()
    const [edges, setEdges, onEdgesChange] = useEdgesState()
    const [selectedNode, setSelectedNode] = useState(null)
    const reactFlowWrapper = useRef(null)
    const [chatflow, setChatflow] = useState(null)
    const [flowData, setFlowData] = useState('')

    // ==============================|| API Calls with API Key ||============================== //

    // Custom API client for iframe mode
    const iframeApiClient = {
        get: async (url) => {
            const response = await fetch(`/api/v1${url}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            })
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            return { data: await response.json() }
        }
    }

    const getNodesApi = useApi(nodesApi.getAllNodes)

    // ==============================|| Events & Actions ||============================== //

    const onConnect = (params) => {
        const newEdge = {
            ...params,
            type: 'buttonedge',
            id: `${params.source}-${params.sourceHandle}-${params.target}-${params.targetHandle}`
        }

        const targetNodeId = params.targetHandle.split('-')[0]
        const sourceNodeId = params.sourceHandle.split('-')[0]
        const targetInput = params.targetHandle.split('-')[2]

        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === targetNodeId) {
                    let value
                    const inputAnchor = node.data.inputAnchors.find((ancr) => ancr.name === targetInput)
                    const inputParam = node.data.inputParams.find((param) => param.name === targetInput)

                    if (inputAnchor && inputAnchor.list) {
                        const newValues = node.data.inputs[targetInput] || []
                        if (targetInput === 'tools') {
                            rearrangeToolsOrdering(newValues, sourceNodeId)
                        } else {
                            newValues.push(`{{${sourceNodeId}.data.instance}}`)
                        }
                        value = newValues
                    } else if (inputParam && inputParam.acceptVariable) {
                        value = node.data.inputs[targetInput] || ''
                    } else {
                        value = `{{${sourceNodeId}.data.instance}}`
                    }
                    node.data = {
                        ...node.data,
                        inputs: {
                            ...node.data.inputs,
                            [targetInput]: value
                        }
                    }
                }
                return node
            })
        )
        setEdges((eds) => addEdge(newEdge, eds))
    }

    const onNodeClick = (event, node) => {
        setSelectedNode(node)
    }

    const onPaneClick = () => {
        setSelectedNode(null)
    }

    // ==============================|| useEffect ||============================== //

    // Get specific chatflow successful
    useEffect(() => {
        if (flowId) {
            const getChatflow = async () => {
                try {
                    const response = await iframeApiClient.get(`/chatflows/${flowId}`)
                    const chatflowData = response.data
                    setChatflow(chatflowData)
                    setFlowData(chatflowData?.flowData ? JSON.parse(chatflowData.flowData) : {})
                    
                    // Notify parent window that canvas is loaded
                    window.parent.postMessage({ type: 'CANVAS_LOADED' }, '*')
                } catch (error) {
                    console.error('Error loading chatflow:', error)
                    window.parent.postMessage({ type: 'CANVAS_ERROR', error: error.message }, '*')
                }
            }
            getChatflow()
        }
    }, [flowId, apiKey])

    // Load nodes and edges when flow data changes
    useEffect(() => {
        if (flowData) {
            if (flowData.nodes) {
                const initialNodes = flowData.nodes.map((node) => {
                    return {
                        ...node,
                        data: {
                            ...initNode(node.data, getNodesApi.data || []),
                            selected: false
                        }
                    }
                })
                setNodes(initialNodes)
            }
            if (flowData.edges) {
                setEdges(flowData.edges)
            }
        }
    }, [flowData, getNodesApi.data, setNodes, setEdges])

    // Get all nodes
    useEffect(() => {
        getNodesApi.request()
    }, [])

    return (
        <Box>
            <div className="reactflow-wrapper" ref={reactFlowWrapper} style={{ height: '100vh', width: '100vw' }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    onInit={setReactFlowInstance}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    snapToGrid={false}
                    snapGrid={[15, 15]}
                    deleteKeyCode={null} // Disable delete in iframe mode
                    multiSelectionKeyCode={null} // Disable multi-selection in iframe mode
                    selectionKeyCode={null} // Disable selection in iframe mode
                    panOnDrag={true}
                    zoomOnScroll={true}
                    zoomOnPinch={true}
                    panOnScroll={false}
                    zoomOnDoubleClick={false}
                    selectNodesOnDrag={false}
                    nodesDraggable={false} // Make read-only
                    nodesConnectable={false} // Make read-only
                    elementsSelectable={true}
                    minZoom={0.1}
                    maxZoom={4}
                    defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                    fitView
                    attributionPosition="bottom-left"
                >
                    <Controls 
                        showZoom={true}
                        showFitView={true}
                        showInteractive={false}
                    />
                    <Background variant="dots" gap={12} size={1} />
                </ReactFlow>
            </div>
        </Box>
    )
}

export default IframeCanvas