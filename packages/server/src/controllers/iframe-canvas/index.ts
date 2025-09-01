import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import path from 'path'
import fs from 'fs'
import { InternalFlowiseError } from '../../errors/internalFlowiseError'
import chatflowsService from '../../services/chatflows'
import { validateAPIKey } from '../../utils/validateKey'
import { getNodeModulesPackagePath } from '../../utils'

/**
 * Get iframe-friendly canvas for chatflows
 */
const getChatflowCanvas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: iframeCanvasController.getChatflowCanvas - id not provided!`
            )
        }

        // Validate API key
        const { isValid, workspaceId } = await validateAPIKey(req)
        if (!isValid) {
            return res.status(401).json({ error: 'Unauthorized Access' })
        }

        // Get chatflow
        const chatflow = await chatflowsService.getChatflowById(req.params.id)
        if (!chatflow) {
            return res.status(404).json({ error: 'Chatflow not found' })
        }

        // Check if chatflow belongs to the workspace
        if (chatflow.workspaceId !== workspaceId) {
            return res.status(403).json({ error: 'Chatflow does not belong to your workspace' })
        }

        // Generate iframe HTML
        const iframeHtml = generateIframeHtml({
            flowId: req.params.id,
            flowType: 'chatflow',
            flowData: chatflow,
            apiKey: req.headers.authorization?.split('Bearer ')[1] || ''
        })

        res.setHeader('Content-Type', 'text/html')
        res.setHeader('X-Frame-Options', 'ALLOWALL')
        res.setHeader('Content-Security-Policy', "frame-ancestors *;")
        return res.send(iframeHtml)
    } catch (error) {
        next(error)
    }
}

/**
 * Get iframe-friendly canvas for agentflows (v1)
 */
const getAgentflowCanvas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: iframeCanvasController.getAgentflowCanvas - id not provided!`
            )
        }

        // Validate API key
        const { isValid, workspaceId } = await validateAPIKey(req)
        if (!isValid) {
            return res.status(401).json({ error: 'Unauthorized Access' })
        }

        // Get agentflow (stored as chatflow with type AGENTFLOW)
        const agentflow = await chatflowsService.getChatflowById(req.params.id)
        if (!agentflow) {
            return res.status(404).json({ error: 'Agentflow not found' })
        }

        // Check if it's actually an agentflow
        if (agentflow.type !== 'AGENTFLOW') {
            return res.status(400).json({ error: 'Flow is not an agentflow' })
        }

        // Check if agentflow belongs to the workspace
        if (agentflow.workspaceId !== workspaceId) {
            return res.status(403).json({ error: 'Agentflow does not belong to your workspace' })
        }

        // Generate iframe HTML
        const iframeHtml = generateIframeHtml({
            flowId: req.params.id,
            flowType: 'agentflow',
            flowData: agentflow,
            apiKey: req.headers.authorization?.split('Bearer ')[1] || ''
        })

        res.setHeader('Content-Type', 'text/html')
        res.setHeader('X-Frame-Options', 'ALLOWALL')
        res.setHeader('Content-Security-Policy', "frame-ancestors *;")
        return res.send(iframeHtml)
    } catch (error) {
        next(error)
    }
}

/**
 * Get iframe-friendly canvas for agentflows v2
 */
const getAgentflowV2Canvas = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (typeof req.params === 'undefined' || !req.params.id) {
            throw new InternalFlowiseError(
                StatusCodes.PRECONDITION_FAILED,
                `Error: iframeCanvasController.getAgentflowV2Canvas - id not provided!`
            )
        }

        // Validate API key
        const { isValid, workspaceId } = await validateAPIKey(req)
        if (!isValid) {
            return res.status(401).json({ error: 'Unauthorized Access' })
        }

        // Get agentflow v2 (stored as chatflow with type MULTIAGENT)
        const agentflowv2 = await chatflowsService.getChatflowById(req.params.id)
        if (!agentflowv2) {
            return res.status(404).json({ error: 'Agentflow v2 not found' })
        }

        // Check if it's actually an agentflow v2
        if (agentflowv2.type !== 'MULTIAGENT') {
            return res.status(400).json({ error: 'Flow is not an agentflow v2' })
        }

        // Check if agentflow belongs to the workspace
        if (agentflowv2.workspaceId !== workspaceId) {
            return res.status(403).json({ error: 'Agentflow v2 does not belong to your workspace' })
        }

        // Generate iframe HTML
        const iframeHtml = generateIframeHtml({
            flowId: req.params.id,
            flowType: 'agentflowv2',
            flowData: agentflowv2,
            apiKey: req.headers.authorization?.split('Bearer ')[1] || ''
        })

        res.setHeader('Content-Type', 'text/html')
        res.setHeader('X-Frame-Options', 'ALLOWALL')
        res.setHeader('Content-Security-Policy', "frame-ancestors *;")
        return res.send(iframeHtml)
    } catch (error) {
        next(error)
    }
}

/**
 * Generate iframe HTML with embedded canvas
 */
const generateIframeHtml = ({ flowId, flowType, flowData, apiKey }: {
    flowId: string
    flowType: 'chatflow' | 'agentflow' | 'agentflowv2'
    flowData: any
    apiKey: string
}) => {
    // Determine the correct canvas path
    let canvasPath = ''
    switch (flowType) {
        case 'chatflow':
            canvasPath = `/canvas/${flowId}`
            break
        case 'agentflow':
            canvasPath = `/agentcanvas/${flowId}`
            break
        case 'agentflowv2':
            canvasPath = `/v2/agentcanvas/${flowId}`
            break
    }

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flowise ${flowType} Canvas - ${flowData.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
            overflow: hidden;
        }
        
        .iframe-container {
            width: 100vw;
            height: 100vh;
            position: relative;
            background: white;
        }
        
        .loading {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #666;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .canvas-frame {
            width: 100%;
            height: 100%;
            border: none;
            background: white;
        }
        
        .error-message {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #e74c3c;
            background: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .header {
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(255, 255, 255, 0.95);
            padding: 8px 16px;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            font-size: 14px;
            color: #333;
            z-index: 1000;
        }
        
        .readonly-badge {
            background: #e3f2fd;
            color: #1976d2;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-left: 8px;
        }
    </style>
</head>
<body>
    <div class="iframe-container">
        <div class="header">
            <strong>${flowData.name}</strong>
            <span class="readonly-badge">Read-only</span>
        </div>
        
        <div class="loading" id="loading">
            <div class="spinner"></div>
            <div>Loading canvas...</div>
        </div>
        
        <div class="error-message" id="error" style="display: none;">
            <h3>Failed to load canvas</h3>
            <p>Please check your API key and permissions.</p>
        </div>
        
        <iframe 
            id="canvasFrame"
            class="canvas-frame"
            src="${canvasPath}?iframe=true&apikey=${encodeURIComponent(apiKey)}"
            onload="handleFrameLoad()"
            onerror="handleFrameError()"
            style="display: none;"
        ></iframe>
    </div>
    
    <script>
        function handleFrameLoad() {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('canvasFrame').style.display = 'block';
        }
        
        function handleFrameError() {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('error').style.display = 'block';
        }
        
        // Handle iframe communication
        window.addEventListener('message', function(event) {
            // Handle messages from the iframe if needed
            if (event.data.type === 'CANVAS_LOADED') {
                handleFrameLoad();
            } else if (event.data.type === 'CANVAS_ERROR') {
                handleFrameError();
            }
        });
        
        // Timeout fallback
        setTimeout(() => {
            const frame = document.getElementById('canvasFrame');
            if (frame.style.display === 'none') {
                handleFrameError();
            }
        }, 10000);
    </script>
</body>
</html>
    `
}

export default {
    getChatflowCanvas,
    getAgentflowCanvas,
    getAgentflowV2Canvas
}