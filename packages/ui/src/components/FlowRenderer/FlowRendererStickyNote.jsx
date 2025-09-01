import PropTypes from 'prop-types'
import { memo } from 'react'

// material-ui
import { styled, useTheme } from '@mui/material/styles'
import { Box, Typography } from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'

// icons
import { IconNote } from '@tabler/icons-react'

const CardWrapper = styled(MainCard)(({ theme }) => ({
    background: '#FFF04B',
    color: theme.darkTextPrimary,
    border: 'solid 1px',
    borderColor: '#FFF04B',
    width: '300px',
    height: 'auto',
    padding: '10px',
    boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)'
}))

// ===========================|| FLOW RENDERER STICKY NOTE ||=========================== //

/**
 * FlowRendererStickyNote - Read-only version of StickyNote for FlowRenderer
 */
const FlowRendererStickyNote = ({ data, readOnly = true }) => {
    const theme = useTheme()

    const getBorderColor = () => {
        if (data.selected) return theme.palette.primary.main
        return '#FFF04B'
    }

    return (
        <CardWrapper
            content={false}
            sx={{
                padding: 0,
                borderColor: getBorderColor(),
                cursor: readOnly ? 'default' : 'grab'
            }}
            border={false}
        >
            <Box sx={{ p: 2 }}>
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <IconNote size={20} />
                    <Typography
                        sx={{
                            fontSize: '1rem',
                            fontWeight: 500,
                            ml: 1
                        }}
                    >
                        {data.label || 'Sticky Note'}
                    </Typography>
                </div>
                {data.inputs?.note && (
                    <Typography
                        sx={{
                            fontSize: '0.9rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word'
                        }}
                    >
                        {data.inputs.note}
                    </Typography>
                )}
            </Box>
        </CardWrapper>
    )
}

FlowRendererStickyNote.propTypes = {
    data: PropTypes.object.isRequired,
    readOnly: PropTypes.bool
}

export default memo(FlowRendererStickyNote)