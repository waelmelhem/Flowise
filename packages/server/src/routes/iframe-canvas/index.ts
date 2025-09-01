import express from 'express'
import iframeCanvasController from '../../controllers/iframe-canvas'
const router = express.Router()

// READ - Get iframe-friendly canvas for chatflows and agentflows
router.get('/chatflow/:id', iframeCanvasController.getChatflowCanvas)
router.get('/agentflow/:id', iframeCanvasController.getAgentflowCanvas)
router.get('/agentflowv2/:id', iframeCanvasController.getAgentflowV2Canvas)

export default router