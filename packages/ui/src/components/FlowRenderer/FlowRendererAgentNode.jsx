import PropTypes from 'prop-types'
import { memo, useRef, useState, useEffect } from 'react'
import { Handle, Position, useUpdateNodeInternals } from 'reactflow'

// material-ui
import { styled, useTheme, alpha, darken, lighten } from '@mui/material/styles'
import { Avatar, Box, Typography, Tooltip } from '@mui/material'

// project imports
import MainCard from '@/ui-component/cards/MainCard'

// icons
import {
    IconCheck,
    IconExclamationMark,
    IconCircleChevronRightFilled,
    IconLoader,
    IconAlertCircleFilled,
    IconCode,
    IconWorldWww,
    IconPhoto
} from '@tabler/icons-react'
import StopCircleIcon from '@mui/icons-material/StopCircle'
import CancelIcon from '@mui/icons-material/Cancel'

// const
import { baseURL, AGENTFLOW_ICONS } from '@/store/constant'

const CardWrapper = styled(MainCard)(({ theme }) => ({
    background: theme.palette.card.main,
    color: theme.darkTextPrimary,
    border: 'solid 1px',
    width: 'max-content',
    height: 'auto',
    padding: '10px',
    boxShadow: 'none'
}))

// ===========================|| FLOW RENDERER AGENT NODE ||=========================== //

/**
 * FlowRendererAgentNode - Read-only version of AgentFlowNode for FlowRenderer
 */
const FlowRendererAgentNode = ({ data, readOnly = true }) => {
    const theme = useTheme()
    const ref = useRef(null)
    const updateNodeInternals = useUpdateNodeInternals()
    const [position, setPosition] = useState(0)
    const [isHovered, setIsHovered] = useState(false)

    const defaultColor = '#666666'
    const nodeColor = data.color || defaultColor

    // Get different shades of the color based on state
    const getStateColor = () => {
        if (data.selected) return nodeColor
        if (isHovered && !readOnly) return alpha(nodeColor, 0.8)
        return alpha(nodeColor, 0.5)
    }

    const getOutputAnchors = () => {
        return data.outputAnchors ?? []
    }

    const getAnchorPosition = (index) => {
        const currentHeight = ref.current?.clientHeight || 0
        const spacing = currentHeight / (getOutputAnchors().length + 1)
        const position = spacing * (index + 1)

        if (position > 0) {
            updateNodeInternals(data.id)
        }

        return position
    }

    const getMinimumHeight = () => {
        const outputCount = getOutputAnchors().length
        return Math.max(60, outputCount * 20 + 40)
    }

    const getBackgroundColor = () => {
        if (theme.customization?.isDarkMode) {
            return isHovered && !readOnly ? darken(nodeColor, 0.7) : darken(nodeColor, 0.8)
        }
        return isHovered && !readOnly ? lighten(nodeColor, 0.8) : lighten(nodeColor, 0.9)
    }

    const getStatusBackgroundColor = (status) => {
        switch (status) {
            case 'ERROR':
                return theme.palette.error.dark
            case 'INPROGRESS':
                return theme.palette.warning.dark
            case 'STOPPED':
            case 'TERMINATED':
                return theme.palette.error.main
            case 'FINISHED':
                return theme.palette.success.dark
            default:
                return theme.palette.primary.dark
        }
    }

    const renderIcon = (node) => {
        const foundIcon = AGENTFLOW_ICONS.find((icon) => icon.name === node.name)
        if (!foundIcon) return null
        return <foundIcon.icon size={24} color={'white'} />
    }

    const getBuiltInOpenAIToolIcon = (toolName) => {
        switch (toolName) {
            case 'web_search_preview':
                return <IconWorldWww size={14} color={'white'} />
            case 'code_interpreter':
                return <IconCode size={14} color={'white'} />
            case 'image_generation':
                return <IconPhoto size={14} color={'white'} />
            default:
                return null
        }
    }

    useEffect(() => {
        if (ref.current) {
            setTimeout(() => {
                setPosition(ref.current?.offsetTop + ref.current?.clientHeight / 2)
                updateNodeInternals(data.id)
            }, 10)
        }
    }, [data, ref, updateNodeInternals])

    return (
        <div 
            ref={ref} 
            onMouseEnter={() => !readOnly && setIsHovered(true)} 
            onMouseLeave={() => !readOnly && setIsHovered(false)}
        >
            <CardWrapper
                content={false}
                sx={{
                    borderColor: getStateColor(),
                    borderWidth: '1px',
                    boxShadow: data.selected ? `0 0 0 1px ${getStateColor()} !important` : 'none',
                    minHeight: getMinimumHeight(),
                    height: 'auto',
                    backgroundColor: getBackgroundColor(),
                    display: 'flex',
                    alignItems: 'center',
                    '&:hover': {
                        boxShadow: data.selected ? `0 0 0 1px ${getStateColor()} !important` : 'none'
                    }
                }}
                border={false}
            >
                {data && data.status && (
                    <Tooltip title={data.status === 'ERROR' ? data.error || 'Error' : ''}>
                        <Avatar
                            variant='rounded'
                            sx={{
                                ...theme.typography.smallAvatar,
                                borderRadius: '50%',
                                background:
                                    data.status === 'STOPPED' || data.status === 'TERMINATED'
                                        ? 'white'
                                        : getStatusBackgroundColor(data.status),
                                color: 'white',
                                ml: 2,
                                position: 'absolute',
                                top: -10,
                                right: -10
                            }}
                        >
                            {data.status === 'INPROGRESS' ? (
                                <IconLoader className='spin-animation' />
                            ) : data.status === 'ERROR' ? (
                                <IconExclamationMark />
                            ) : data.status === 'TERMINATED' ? (
                                <CancelIcon sx={{ color: getStatusBackgroundColor(data.status) }} />
                            ) : data.status === 'STOPPED' ? (
                                <StopCircleIcon sx={{ color: getStatusBackgroundColor(data.status) }} />
                            ) : (
                                <IconCheck />
                            )}
                        </Avatar>
                    </Tooltip>
                )}

                <Box sx={{ width: '100%' }}>
                    {!data.hideInput && (
                        <Handle
                            type='target'
                            position={Position.Left}
                            id={data.id}
                            style={{
                                width: 5,
                                height: 20,
                                backgroundColor: 'transparent',
                                border: 'none',
                                position: 'absolute',
                                left: -2
                            }}
                        >
                            <div
                                style={{
                                    width: 5,
                                    height: 20,
                                    backgroundColor: nodeColor,
                                    position: 'absolute',
                                    left: '50%',
                                    top: '50%',
                                    transform: 'translate(-50%, -50%)'
                                }}
                            />
                        </Handle>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Box item style={{ width: 50 }}>
                            {data.color && !data.icon ? (
                                <div
                                    style={{
                                        ...theme.typography.commonAvatar,
                                        ...theme.typography.largeAvatar,
                                        borderRadius: '15px',
                                        backgroundColor: data.color,
                                        cursor: readOnly ? 'default' : 'grab',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        background: data.color
                                    }}
                                >
                                    {renderIcon(data)}
                                </div>
                            ) : (
                                <div
                                    style={{
                                        ...theme.typography.commonAvatar,
                                        ...theme.typography.largeAvatar,
                                        borderRadius: '50%',
                                        backgroundColor: 'white',
                                        cursor: readOnly ? 'default' : 'grab'
                                    }}
                                >
                                    <img
                                        style={{ width: '100%', height: '100%', padding: 5, objectFit: 'contain' }}
                                        src={`${baseURL}/api/v1/node-icon/${data.name}`}
                                        alt={data.name}
                                    />
                                </div>
                            )}
                        </Box>
                        <Box>
                            <Typography
                                sx={{
                                    fontSize: '0.85rem',
                                    fontWeight: 500
                                }}
                            >
                                {data.label}
                            </Typography>

                            {(() => {
                                // Array of model configs to check and render
                                const modelConfigs = [
                                    { model: data.inputs?.llmModel, config: data.inputs?.llmModelConfig },
                                    { model: data.inputs?.agentModel, config: data.inputs?.agentModelConfig },
                                    { model: data.inputs?.conditionAgentModel, config: data.inputs?.conditionAgentModelConfig }
                                ]

                                // Filter out undefined models and render each valid one
                                return modelConfigs
                                    .filter((item) => item.model && item.config)
                                    .map((item, index) => (
                                        <Box key={`model-${index}`} sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                            <Box
                                                sx={{
                                                    backgroundColor: theme.customization?.isDarkMode
                                                        ? 'rgba(255, 255, 255, 0.2)'
                                                        : 'rgba(255, 255, 255, 0.9)',
                                                    borderRadius: '16px',
                                                    width: 'max-content',
                                                    height: 24,
                                                    pl: 1,
                                                    pr: 1,
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <img
                                                    style={{ width: 20, height: 20, objectFit: 'contain' }}
                                                    src={`${baseURL}/api/v1/node-icon/${item.model}`}
                                                    alt={item.model}
                                                />
                                                <Typography sx={{ fontSize: '0.7rem', ml: 0.5 }}>
                                                    {item.config.modelName || item.config.model}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    ))
                            })()}

                            {(() => {
                                // Array of tool configurations to check and render
                                const toolConfigs = [
                                    { tools: data.inputs?.llmTools, toolProperty: 'llmSelectedTool' },
                                    { tools: data.inputs?.agentTools, toolProperty: 'agentSelectedTool' },
                                    {
                                        tools:
                                            data.inputs?.selectedTool ?? data.inputs?.toolAgentflowSelectedTool
                                                ? [{ selectedTool: data.inputs?.selectedTool ?? data.inputs?.toolAgentflowSelectedTool }]
                                                : [],
                                        toolProperty: ['selectedTool', 'toolAgentflowSelectedTool']
                                    },
                                    { tools: data.inputs?.agentKnowledgeVSEmbeddings, toolProperty: ['vectorStore', 'embeddingModel'] },
                                    {
                                        tools: data.inputs?.agentToolsBuiltInOpenAI
                                            ? (typeof data.inputs.agentToolsBuiltInOpenAI === 'string'
                                                  ? JSON.parse(data.inputs.agentToolsBuiltInOpenAI)
                                                  : data.inputs.agentToolsBuiltInOpenAI
                                              ).map((tool) => ({ builtInTool: tool }))
                                            : [],
                                        toolProperty: 'builtInTool',
                                        isBuiltInOpenAI: true
                                    }
                                ]

                                // Filter out undefined tools and render each valid collection
                                return toolConfigs
                                    .filter((config) => config.tools && config.tools.length > 0)
                                    .map((config, configIndex) => (
                                        <Box key={`tools-${configIndex}`} sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                            {config.tools.flatMap((tool, toolIndex) => {
                                                if (Array.isArray(config.toolProperty)) {
                                                    return config.toolProperty
                                                        .filter((prop) => tool[prop])
                                                        .map((prop, propIndex) => {
                                                            const toolName = tool[prop]
                                                            return (
                                                                <Box
                                                                    key={`tool-${configIndex}-${toolIndex}-${propIndex}`}
                                                                    component='img'
                                                                    src={`${baseURL}/api/v1/node-icon/${toolName}`}
                                                                    alt={toolName}
                                                                    sx={{
                                                                        width: 20,
                                                                        height: 20,
                                                                        borderRadius: '50%',
                                                                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                                        padding: 0.3
                                                                    }}
                                                                />
                                                            )
                                                        })
                                                } else {
                                                    const toolName = tool[config.toolProperty]
                                                    if (!toolName) return []

                                                    // Handle built-in OpenAI tools with icons
                                                    if (config.isBuiltInOpenAI) {
                                                        const icon = getBuiltInOpenAIToolIcon(toolName)
                                                        if (!icon) return []

                                                        return [
                                                            <Box
                                                                key={`tool-${configIndex}-${toolIndex}`}
                                                                sx={{
                                                                    width: 20,
                                                                    height: 20,
                                                                    borderRadius: '50%',
                                                                    backgroundColor: theme.customization?.isDarkMode
                                                                        ? darken(data.color, 0.5)
                                                                        : darken(data.color, 0.2),
                                                                    display: 'flex',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    padding: 0.2
                                                                }}
                                                            >
                                                                {icon}
                                                            </Box>
                                                        ]
                                                    }

                                                    return [
                                                        <Box
                                                            key={`tool-${configIndex}-${toolIndex}`}
                                                            component='img'
                                                            src={`${baseURL}/api/v1/node-icon/${toolName}`}
                                                            alt={toolName}
                                                            sx={{
                                                                width: 20,
                                                                height: 20,
                                                                borderRadius: '50%',
                                                                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                                                                padding: 0.3
                                                            }}
                                                        />
                                                    ]
                                                }
                                            })}
                                        </Box>
                                    ))
                            })()}
                        </Box>
                    </div>
                    {getOutputAnchors().map((outputAnchor, index) => {
                        return (
                            <Handle
                                type='source'
                                position={Position.Right}
                                key={outputAnchor.id}
                                id={outputAnchor.id}
                                style={{
                                    height: 20,
                                    width: 20,
                                    top: getAnchorPosition(index),
                                    backgroundColor: 'transparent',
                                    border: 'none',
                                    position: 'absolute',
                                    right: -10,
                                    opacity: readOnly ? 0.7 : (isHovered ? 1 : 0),
                                    transition: 'opacity 0.2s'
                                }}
                            >
                                <div
                                    style={{
                                        position: 'absolute',
                                        width: 20,
                                        height: 20,
                                        borderRadius: '50%',
                                        backgroundColor: theme.palette.background.paper,
                                        pointerEvents: 'none'
                                    }}
                                />
                                <IconCircleChevronRightFilled
                                    size={20}
                                    color={nodeColor}
                                    style={{
                                        pointerEvents: 'none',
                                        position: 'relative',
                                        zIndex: 1
                                    }}
                                />
                            </Handle>
                        )
                    })}
                </Box>
            </CardWrapper>
        </div>
    )
}

FlowRendererAgentNode.propTypes = {
    data: PropTypes.object.isRequired,
    readOnly: PropTypes.bool
}

export default memo(FlowRendererAgentNode)