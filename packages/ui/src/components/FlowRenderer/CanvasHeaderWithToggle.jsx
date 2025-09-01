import React from 'react'
import PropTypes from 'prop-types'

// material-ui
import { Stack, Box } from '@mui/material'

// project imports
import CanvasHeader from '@/views/canvas/CanvasHeader'
import FlowRendererToggle from './FlowRendererToggle'

/**
 * CanvasHeaderWithToggle - Enhanced Canvas Header with Editor/Renderer toggle
 */
const CanvasHeaderWithToggle = ({ 
    chatflow, 
    isAgentCanvas, 
    isAgentflowV2, 
    handleSaveFlow, 
    handleDeleteFlow, 
    handleLoadFlow,
    viewMode,
    onViewModeChange,
    showToggle = true
}) => {
    return (
        <Stack flexDirection='row' justifyContent='space-between' sx={{ width: '100%' }}>
            {/* Original Canvas Header */}
            <Box sx={{ flexGrow: 1 }}>
                <CanvasHeader
                    chatflow={chatflow}
                    isAgentCanvas={isAgentCanvas}
                    isAgentflowV2={isAgentflowV2}
                    handleSaveFlow={handleSaveFlow}
                    handleDeleteFlow={handleDeleteFlow}
                    handleLoadFlow={handleLoadFlow}
                />
            </Box>
            
            {/* View Mode Toggle */}
            {showToggle && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FlowRendererToggle
                        mode={viewMode}
                        onModeChange={onViewModeChange}
                        disabled={!chatflow?.flowData}
                    />
                </Box>
            )}
        </Stack>
    )
}

CanvasHeaderWithToggle.propTypes = {
    chatflow: PropTypes.object,
    isAgentCanvas: PropTypes.bool,
    isAgentflowV2: PropTypes.bool,
    handleSaveFlow: PropTypes.func,
    handleDeleteFlow: PropTypes.func,
    handleLoadFlow: PropTypes.func,
    viewMode: PropTypes.oneOf(['editor', 'renderer']),
    onViewModeChange: PropTypes.func,
    showToggle: PropTypes.bool
}

export default CanvasHeaderWithToggle