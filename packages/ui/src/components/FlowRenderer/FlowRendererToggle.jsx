import React, { useState } from 'react'
import PropTypes from 'prop-types'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Avatar, ButtonBase, ToggleButton, ToggleButtonGroup } from '@mui/material'

// icons
import { IconEdit, IconEye } from '@tabler/icons-react'

/**
 * FlowRendererToggle - Toggle button to switch between Editor and Renderer modes
 */
const FlowRendererToggle = ({ mode, onModeChange, disabled = false }) => {
    const theme = useTheme()

    const handleChange = (event, newMode) => {
        if (newMode !== null && !disabled) {
            onModeChange(newMode)
        }
    }

    return (
        <ToggleButtonGroup
            value={mode}
            exclusive
            onChange={handleChange}
            aria-label="view mode"
            size="small"
            sx={{
                mr: 2,
                '& .MuiToggleButton-root': {
                    border: 'none',
                    borderRadius: '50%',
                    width: 40,
                    height: 40,
                    transition: 'all .2s ease-in-out',
                    '&.Mui-selected': {
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark
                        }
                    },
                    '&:not(.Mui-selected)': {
                        backgroundColor: theme.palette.secondary.light,
                        color: theme.palette.secondary.dark,
                        '&:hover': {
                            backgroundColor: theme.palette.secondary.dark,
                            color: theme.palette.secondary.light
                        }
                    }
                }
            }}
        >
            <ToggleButton value="editor" aria-label="editor mode" title="Editor Mode" disabled={disabled}>
                <IconEdit size={20} />
            </ToggleButton>
            <ToggleButton value="renderer" aria-label="renderer mode" title="Renderer Mode" disabled={disabled}>
                <IconEye size={20} />
            </ToggleButton>
        </ToggleButtonGroup>
    )
}

FlowRendererToggle.propTypes = {
    mode: PropTypes.oneOf(['editor', 'renderer']).isRequired,
    onModeChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool
}

export default FlowRendererToggle