import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

// material-ui
import { 
    Box, 
    Typography, 
    Button, 
    Card, 
    CardContent, 
    Grid, 
    ToggleButton, 
    ToggleButtonGroup,
    FormControlLabel,
    Switch,
    Divider
} from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import MainCard from '@/ui-component/cards/MainCard'
import ViewHeader from '@/layout/MainLayout/ViewHeader'
import FlowRenderer from '@/components/FlowRenderer'

// icons
import { IconEye, IconCode, IconDownload } from '@tabler/icons-react'

// Sample flow data for demo
const SAMPLE_CHATFLOW = {
    "nodes": [
        {
            "width": 300,
            "height": 513,
            "id": "promptTemplate_0",
            "position": { "x": 100, "y": 100 },
            "type": "customNode",
            "data": {
                "id": "promptTemplate_0",
                "label": "Prompt Template",
                "version": 1,
                "name": "promptTemplate",
                "type": "PromptTemplate",
                "baseClasses": ["PromptTemplate", "BaseStringPromptTemplate", "BasePromptTemplate"],
                "category": "Prompts",
                "description": "Schema to represent a basic prompt for an LLM",
                "inputParams": [
                    {
                        "label": "Template",
                        "name": "template",
                        "type": "string",
                        "rows": 4,
                        "placeholder": "What is a good name for a company that makes {product}?",
                        "id": "promptTemplate_0-input-template-string"
                    }
                ],
                "inputAnchors": [],
                "inputs": {
                    "template": "What is a good name for a company that makes {product}?"
                },
                "outputAnchors": [
                    {
                        "id": "promptTemplate_0-output-promptTemplate-PromptTemplate",
                        "name": "promptTemplate",
                        "label": "PromptTemplate",
                        "type": "PromptTemplate | BaseStringPromptTemplate | BasePromptTemplate"
                    }
                ],
                "outputs": {},
                "selected": false
            }
        },
        {
            "width": 300,
            "height": 400,
            "id": "llmChain_0",
            "position": { "x": 500, "y": 100 },
            "type": "customNode",
            "data": {
                "id": "llmChain_0",
                "label": "LLM Chain",
                "version": 3,
                "name": "llmChain",
                "type": "LLMChain",
                "baseClasses": ["LLMChain", "BaseChain", "Runnable"],
                "category": "Chains",
                "description": "Chain to run queries against LLMs",
                "inputParams": [],
                "inputAnchors": [
                    {
                        "label": "Language Model",
                        "name": "model",
                        "type": "BaseLanguageModel",
                        "id": "llmChain_0-input-model-BaseLanguageModel"
                    },
                    {
                        "label": "Prompt",
                        "name": "prompt",
                        "type": "BasePromptTemplate",
                        "id": "llmChain_0-input-prompt-BasePromptTemplate"
                    }
                ],
                "inputs": {
                    "model": "{{chatOpenAI_0.data.instance}}",
                    "prompt": "{{promptTemplate_0.data.instance}}"
                },
                "outputAnchors": [
                    {
                        "id": "llmChain_0-output-llmChain-LLMChain",
                        "name": "output",
                        "label": "Output",
                        "type": "LLMChain | BaseChain | Runnable"
                    }
                ],
                "outputs": {},
                "selected": false
            }
        }
    ],
    "edges": [
        {
            "source": "promptTemplate_0",
            "sourceHandle": "promptTemplate_0-output-promptTemplate-PromptTemplate",
            "target": "llmChain_0",
            "targetHandle": "llmChain_0-input-prompt-BasePromptTemplate",
            "type": "buttonedge",
            "id": "edge-1",
            "data": { "label": "" }
        }
    ]
}

const SAMPLE_AGENTFLOW = {
    "nodes": [
        {
            "id": "startAgentflow_0",
            "position": { "x": 100, "y": 200 },
            "type": "agentFlow",
            "data": {
                "id": "startAgentflow_0",
                "label": "Start",
                "name": "startAgentflow",
                "type": "Start",
                "color": "#3b82f6",
                "hideInput": true,
                "outputAnchors": [
                    {
                        "id": "startAgentflow_0-output-start",
                        "name": "start",
                        "label": "Start"
                    }
                ]
            },
            "width": 200,
            "height": 60
        },
        {
            "id": "agent_0", 
            "position": { "x": 400, "y": 200 },
            "type": "agentFlow",
            "data": {
                "id": "agent_0",
                "label": "Research Agent",
                "name": "agent",
                "type": "Agent",
                "color": "#10b981",
                "inputs": {
                    "agentModel": "chatOpenAI",
                    "agentModelConfig": { "modelName": "gpt-4" }
                },
                "outputAnchors": [
                    {
                        "id": "agent_0-output-agent",
                        "name": "agent", 
                        "label": "Agent"
                    }
                ]
            },
            "width": 200,
            "height": 80
        }
    ],
    "edges": [
        {
            "source": "startAgentflow_0",
            "sourceHandle": "startAgentflow_0-output-start",
            "target": "agent_0", 
            "targetHandle": "agent_0",
            "type": "agentFlow",
            "id": "edge-agentflow-1"
        }
    ]
}

// ==============================|| FLOW RENDERER DEMO ||============================== //

const FlowRendererDemo = () => {
    const theme = useTheme()
    const customization = useSelector((state) => state.customization)
    
    const [selectedFlow, setSelectedFlow] = useState('chatflow')
    const [currentFlowData, setCurrentFlowData] = useState(SAMPLE_CHATFLOW)
    const [showMiniMap, setShowMiniMap] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [showBackground, setShowBackground] = useState(true)

    // Switch between different flow types
    useEffect(() => {
        setCurrentFlowData(selectedFlow === 'chatflow' ? SAMPLE_CHATFLOW : SAMPLE_AGENTFLOW)
    }, [selectedFlow])

    const handleFlowTypeChange = (event, newType) => {
        if (newType !== null) {
            setSelectedFlow(newType)
        }
    }

    const handleNodeClick = (event, node) => {
        console.log('Node clicked:', node)
    }

    const downloadFlowData = () => {
        const dataStr = JSON.stringify(currentFlowData, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
        
        const exportFileDefaultName = `${selectedFlow}-sample.json`
        
        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
    }

    return (
        <MainCard>
            <ViewHeader title="FlowRenderer Demo" />
            
            <Grid container spacing={2}>
                {/* Controls Panel */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Demo Controls
                            </Typography>
                            
                            <Box sx={{ mb: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                    Flow Type:
                                </Typography>
                                <ToggleButtonGroup
                                    value={selectedFlow}
                                    exclusive
                                    onChange={handleFlowTypeChange}
                                    aria-label="flow type"
                                    size="small"
                                >
                                    <ToggleButton value="chatflow" aria-label="chatflow">
                                        Chatflow
                                    </ToggleButton>
                                    <ToggleButton value="agentflow" aria-label="agentflow">
                                        Agent Flow
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showMiniMap}
                                            onChange={(e) => setShowMiniMap(e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label="Show MiniMap"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showControls}
                                            onChange={(e) => setShowControls(e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label="Show Controls"
                                />
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={showBackground}
                                            onChange={(e) => setShowBackground(e.target.checked)}
                                            size="small"
                                        />
                                    }
                                    label="Show Background"
                                />
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<IconDownload />}
                                    onClick={downloadFlowData}
                                >
                                    Download Sample JSON
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Flow Renderer */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent sx={{ p: 0 }}>
                            <Box sx={{ height: 600, width: '100%' }}>
                                <FlowRenderer
                                    flowData={currentFlowData}
                                    readOnly={true}
                                    showMiniMap={showMiniMap}
                                    showControls={showControls}
                                    showBackground={showBackground}
                                    onNodeClick={handleNodeClick}
                                    style={{ border: '1px solid #e0e0e0' }}
                                />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Flow Data Preview */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Current Flow JSON
                            </Typography>
                            <Box
                                sx={{
                                    backgroundColor: theme.customization?.isDarkMode ? '#1e1e1e' : '#f5f5f5',
                                    borderRadius: 1,
                                    p: 2,
                                    maxHeight: 400,
                                    overflow: 'auto'
                                }}
                            >
                                <pre style={{ margin: 0, fontSize: '0.8rem' }}>
                                    {JSON.stringify(currentFlowData, null, 2)}
                                </pre>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </MainCard>
    )
}

export default FlowRendererDemo