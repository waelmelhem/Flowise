import PropTypes from 'prop-types'
import { useState, memo } from 'react'

// material-ui
import { useTheme } from '@mui/material/styles'
import { Box, Typography, Divider, Button } from '@mui/material'

// project imports
import NodeCardWrapper from '@/ui-component/cards/NodeCardWrapper'
import NodeInputHandler from '@/views/canvas/NodeInputHandler'
import NodeOutputHandler from '@/views/canvas/NodeOutputHandler'
import AdditionalParamsDialog from '@/ui-component/dialog/AdditionalParamsDialog'

// const
import { baseURL } from '@/store/constant'
import LlamaindexPNG from '@/assets/images/llamaindex.png'

// ===========================|| FLOW RENDERER NODE ||=========================== //

/**
 * FlowRendererNode - Read-only version of CanvasNode for FlowRenderer
 * Based on MarketplaceCanvasNode but with additional customization options
 */
const FlowRendererNode = ({ data, readOnly = true, showAdditionalParams = false }) => {
    const theme = useTheme()
    
    const [showDialog, setShowDialog] = useState(false)
    const [dialogProps, setDialogProps] = useState({})

    const onDialogClicked = () => {
        if (!readOnly && showAdditionalParams) {
            const dialogProps = {
                data,
                inputParams: data.inputParams.filter((param) => param.additionalParams),
                disabled: readOnly,
                confirmButtonName: 'Save',
                cancelButtonName: 'Cancel'
            }
            setDialogProps(dialogProps)
            setShowDialog(true)
        }
    }

    const getBorderColor = () => {
        if (data.selected) return theme.palette.primary.main
        else if (theme?.customization?.isDarkMode) return theme.palette.grey[900] + 25
        else return theme.palette.grey[900] + 50
    }

    return (
        <>
            <NodeCardWrapper
                content={false}
                sx={{
                    padding: 0,
                    borderColor: getBorderColor()
                }}
                border={false}
            >
                <Box>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                        <Box style={{ width: 50, marginRight: 10, padding: 10 }}>
                            <div
                                style={{
                                    ...theme.typography.commonAvatar,
                                    ...theme.typography.largeAvatar,
                                    borderRadius: '50%',
                                    backgroundColor: 'white',
                                    cursor: readOnly ? 'default' : 'grab',
                                    width: '40px',
                                    height: '40px'
                                }}
                            >
                                <img
                                    style={{ width: '100%', height: '100%', padding: 5, objectFit: 'contain' }}
                                    src={`${baseURL}/api/v1/node-icon/${data.name}`}
                                    alt='Node Icon'
                                />
                            </div>
                        </Box>
                        <Box>
                            <Typography
                                sx={{
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    mr: 2
                                }}
                            >
                                {data.label}
                            </Typography>
                        </Box>
                        <div style={{ flexGrow: 1 }}></div>
                        {data.tags && data.tags.includes('LlamaIndex') && (
                            <>
                                <div
                                    style={{
                                        borderRadius: '50%',
                                        padding: 15
                                    }}
                                >
                                    <img
                                        style={{ width: '25px', height: '25px', borderRadius: '50%', objectFit: 'contain' }}
                                        src={LlamaindexPNG}
                                        alt='LlamaIndex'
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    {(data.inputAnchors.length > 0 || data.inputParams.length > 0) && (
                        <>
                            <Divider />
                            <Box sx={{ background: theme.palette.asyncSelect.main, p: 1 }}>
                                <Typography
                                    sx={{
                                        fontWeight: 500,
                                        textAlign: 'center'
                                    }}
                                >
                                    Inputs
                                </Typography>
                            </Box>
                            <Divider />
                        </>
                    )}
                    {data.inputAnchors.map((inputAnchor, index) => (
                        <NodeInputHandler disabled={readOnly} key={index} inputAnchor={inputAnchor} data={data} />
                    ))}
                    {data.inputParams
                        .filter((inputParam) => !inputParam.hidden)
                        .filter((inputParam) => inputParam.display !== false)
                        .map((inputParam, index) => (
                            <NodeInputHandler disabled={readOnly} key={index} inputParam={inputParam} data={data} />
                        ))}
                    {!readOnly && showAdditionalParams && data.inputParams.find((param) => param.additionalParams) && (
                        <div
                            style={{
                                textAlign: 'center',
                                marginTop:
                                    data.inputParams.filter((param) => param.additionalParams).length ===
                                    data.inputParams.length + data.inputAnchors.length
                                        ? 20
                                        : 0
                            }}
                        >
                            <Button sx={{ borderRadius: 25, width: '90%', mb: 2 }} variant='outlined' onClick={onDialogClicked}>
                                Additional Parameters
                            </Button>
                        </div>
                    )}
                    {data.outputAnchors.length > 0 && <Divider />}
                    {data.outputAnchors.length > 0 && (
                        <Box sx={{ background: theme.palette.asyncSelect.main, p: 1 }}>
                            <Typography
                                sx={{
                                    fontWeight: 500,
                                    textAlign: 'center'
                                }}
                            >
                                Output
                            </Typography>
                        </Box>
                    )}
                    {data.outputAnchors.length > 0 && <Divider />}
                    {data.outputAnchors.length > 0 &&
                        data.outputAnchors.map((outputAnchor) => (
                            <NodeOutputHandler disabled={readOnly} key={JSON.stringify(data)} outputAnchor={outputAnchor} data={data} />
                        ))}
                </Box>
            </NodeCardWrapper>
            {!readOnly && (
                <AdditionalParamsDialog
                    show={showDialog}
                    dialogProps={dialogProps}
                    onCancel={() => setShowDialog(false)}
                />
            )}
        </>
    )
}

FlowRendererNode.propTypes = {
    data: PropTypes.object.isRequired,
    readOnly: PropTypes.bool,
    showAdditionalParams: PropTypes.bool
}

export default memo(FlowRendererNode)