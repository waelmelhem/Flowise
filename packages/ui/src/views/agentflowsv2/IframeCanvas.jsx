import { useEffect, useRef, useState, useCallback, useContext } from 'react'
import ReactFlow, { Controls, MiniMap, Background, useNodesState, useEdgesState } from 'reactflow'
import 'reactflow/dist/style.css'
import './index.css'
import './iframe.css'

import { useDispatch, useSelector } from 'react-redux'
import {
    SET_CHATFLOW,
    enqueueSnackbar as enqueueSnackbarAction,
    closeSnackbar as closeSnackbarAction
} from '@/store/actions'

// material-ui
import { Toolbar, Box, AppBar, Button } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import CanvasNode from './AgentFlowNode'
import IterationNode from './IterationNode'
import AgentFlowEdge from './AgentFlowEdge'
import ConnectionLine from './ConnectionLine'
import StickyNote from './StickyNote'
import { flowContext } from '@/store/context/ReactFlowContext'
import { useIframe } from '@/store/context/IframeContext'

// icons
import { IconX, IconMagnetFilled, IconMagnetOff } from '@tabler/icons-react'

// utils
import useNotifier from '@/utils/useNotifier'

const nodeTypes = { agentFlow: CanvasNode, stickyNote: StickyNote, iteration: IterationNode }
const edgeTypes = { agentFlow: AgentFlowEdge }

// ==============================|| IFRAME CANVAS ||============================== //

const IframeCanvas = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    
    const { isIframeMode, iframeApiKey, iframeChatflowId, apiCall } = useIframe()

    const dispatch = useDispatch()
    const [chatflow, setChatflow] = useState(null)
    const { reactFlowInstance, setReactFlowInstance } = useContext(flowContext)
    const [loading, setLoading] = useState(true)

    // ==============================|| Snackbar ||============================== //

    useNotifier()
    const enqueueSnackbar = (...args) => dispatch(enqueueSnackbarAction(...args))
    const closeSnackbar = (...args) => dispatch(closeSnackbarAction(...args))

    // ==============================|| ReactFlow ||============================== //

    const [nodes, setNodes, onNodesChange] = useNodesState()
    const [edges, setEdges, onEdgesChange] = useEdgesState()

    const [selectedNode, setSelectedNode] = useState(null)
    const [isSnappingEnabled, setIsSnappingEnabled] = useState(false)
    const [isReadOnly] = useState(true) // Iframe mode is read-only

    const reactFlowWrapper = useRef(null)

    // ==============================|| Events & Actions ||============================== //

    // Disabled events for read-only mode
    const onConnect = () => {} // No connections allowed in iframe

    // eslint-disable-next-line
    const onNodeClick = useCallback((event, clickedNode) => {
        setSelectedNode(clickedNode)
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === clickedNode.id) {
                    node.data = {
                        ...node.data,
                        selected: true
                    }
                } else {
                    node.data = {
                        ...node.data,
                        selected: false
                    }
                }

                return node
            })
        )
    })

    // Disabled events for read-only iframe mode
    const onNodeDoubleClick = () => {} // No editing in iframe
    const onDragOver = () => {} // No dragging in iframe  
    const onDrop = () => {} // No dropping in iframe

    const errorFailed = (message) => {
        enqueueSnackbar({
            message,
            options: {
                key: new Date().getTime() + Math.random(),
                variant: 'error',
                persist: true,
                action: (key) => (
                    <Button style={{ color: 'white' }} onClick={() => closeSnackbar(key)}>
                        <IconX />
                    </Button>
                )
            }
        })
    }

    // ==============================|| useEffect ||============================== //

    // Apply iframe-specific styling
    useEffect(() => {
        if (isIframeMode) {
            document.body.classList.add('iframe-mode')
            return () => {
                document.body.classList.remove('iframe-mode')
            }
        }
    }, [isIframeMode])

    // Load chatflow data with API key
    useEffect(() => {
        const loadChatflow = async () => {
            if (!iframeChatflowId || !iframeApiKey) {
                errorFailed('Missing chatflow ID or API key')
                setLoading(false)
                return
            }

            try {
                const response = await apiCall(`/api/v1/chatflows/${iframeChatflowId}`)
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch chatflow: ${response.statusText}`)
                }
                
                const chatflowData = await response.json()
                const flowData = chatflowData.flowData ? JSON.parse(chatflowData.flowData) : { nodes: [], edges: [] }
                
                setNodes(flowData.nodes || [])
                setEdges(flowData.edges || [])
                setChatflow(chatflowData)
                dispatch({ type: SET_CHATFLOW, chatflow: chatflowData })
                setLoading(false)
            } catch (error) {
                errorFailed(`Failed to load agentflow: ${error.message}`)
                setLoading(false)
            }
        }

        if (isIframeMode) {
            loadChatflow()
        }
    }, [iframeChatflowId, iframeApiKey, isIframeMode, dispatch, apiCall])

    // Validation check
    if (!isIframeMode || !iframeChatflowId || !iframeApiKey) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <h3>Invalid iframe configuration</h3>
                <p>Please provide both chatflow ID and API key in the URL</p>
            </Box>
        )
    }

    if (loading) {
        return (
            <Box sx={{ p: 3, textAlign: 'center' }}>
                <h3>Loading...</h3>
            </Box>
        )
    }

    return (
        <Box className="iframe-mode" sx={{ height: '100vh', width: '100%' }}>
            <div className='reactflow-parent-wrapper'>
                <div className='reactflow-wrapper' ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        edgeTypes={edgeTypes}
                        onInit={setReactFlowInstance}
                        fitView
                        minZoom={0.5}
                        snapGrid={[25, 25]}
                        snapToGrid={isSnappingEnabled}
                        connectionLineComponent={ConnectionLine}
                        nodesDraggable={false}
                        nodesConnectable={false}
                        elementsSelectable={true}
                        deleteKeyCode={null}
                    >
                        <Controls
                            className={customization.isDarkMode ? 'dark-mode-controls' : ''}
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                left: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}
                            showZoom={true}
                            showFitView={true}
                            showInteractive={false}
                        />
                        <MiniMap
                            nodeStrokeWidth={3}
                            nodeColor={customization.isDarkMode ? '#2d2d2d' : '#e2e2e2'}
                            nodeStrokeColor={customization.isDarkMode ? '#525252' : '#fff'}
                            maskColor={customization.isDarkMode ? 'rgb(45, 45, 45, 0.6)' : 'rgb(240, 240, 240, 0.6)'}
                            style={{
                                backgroundColor: customization.isDarkMode ? theme.palette.background.default : '#fff'
                            }}
                        />
                        <Background color='#aaa' gap={16} />
                    </ReactFlow>
                </div>
            </div>
        </Box>
    )
}

export default IframeCanvas