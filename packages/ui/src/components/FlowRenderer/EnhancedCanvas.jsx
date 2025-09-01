import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// material-ui
import { Toolbar, Box, AppBar } from '@mui/material'
import { useTheme } from '@mui/material/styles'

// project imports
import Canvas from '@/views/canvas'
import FlowRenderer from './FlowRenderer'
import CanvasHeaderWithToggle from './CanvasHeaderWithToggle'

/**
 * EnhancedCanvas - Canvas component with Editor/Renderer toggle functionality
 * This component wraps the existing Canvas and adds FlowRenderer capability
 */
const EnhancedCanvas = () => {
    const theme = useTheme()
    const { state } = useLocation()
    const [viewMode, setViewMode] = useState('editor')
    const [flowData, setFlowData] = useState(null)
    const [chatflow, setChatflow] = useState(null)
    
    // Extract flow data from Canvas component when it changes
    useEffect(() => {
        // Listen for flow data changes from the Canvas component
        // This is a simplified approach - in a real implementation, 
        // you might want to use a shared state management solution
        const handleFlowDataChange = (event) => {
            if (event.detail?.flowData) {
                setFlowData(event.detail.flowData)
            }
            if (event.detail?.chatflow) {
                setChatflow(event.detail.chatflow)
            }
        }

        window.addEventListener('flowDataChanged', handleFlowDataChange)
        return () => {
            window.removeEventListener('flowDataChanged', handleFlowDataChange)
        }
    }, [])

    const handleViewModeChange = (newMode) => {
        setViewMode(newMode)
    }

    // If in renderer mode and we have flow data, show the FlowRenderer
    if (viewMode === 'renderer' && flowData) {
        return (
            <Box>
                <AppBar
                    enableColorOnDark
                    position='fixed'
                    color='inherit'
                    elevation={1}
                    sx={{
                        bgcolor: theme.palette.background.default
                    }}
                >
                    <Toolbar>
                        <CanvasHeaderWithToggle
                            chatflow={chatflow}
                            viewMode={viewMode}
                            onViewModeChange={handleViewModeChange}
                            showToggle={true}
                        />
                    </Toolbar>
                </AppBar>
                <Box sx={{ pt: '70px', height: '100vh', width: '100%' }}>
                    <FlowRenderer
                        flowData={flowData}
                        readOnly={true}
                        showMiniMap={true}
                        showControls={true}
                        showBackground={true}
                        style={{ height: '100%' }}
                    />
                </Box>
            </Box>
        )
    }

    // Otherwise, show the regular Canvas with the toggle
    return <Canvas viewMode={viewMode} onViewModeChange={handleViewModeChange} />
}

export default EnhancedCanvas