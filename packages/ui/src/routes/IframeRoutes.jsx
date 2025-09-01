import { lazy } from 'react'

// project imports
import Loadable from '@/ui-component/loading/Loadable'
import MinimalLayout from '@/layout/MinimalLayout'

// iframe canvas routing
const IframeCanvas = Loadable(lazy(() => import('@/views/canvas/IframeCanvas')))
const IframeCanvasV2 = Loadable(lazy(() => import('@/views/agentflowsv2/IframeCanvasV2')))

// ==============================|| IFRAME CANVAS ROUTING ||============================== //

const IframeRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/iframe/canvas/:id',
            element: <IframeCanvas />
        },
        {
            path: '/iframe/agentcanvas/:id',
            element: <IframeCanvas />
        },
        {
            path: '/iframe/v2/agentcanvas/:id',
            element: <IframeCanvasV2 />
        }
    ]
}

export default IframeRoutes