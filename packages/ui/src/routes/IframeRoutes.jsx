import { lazy } from 'react'

// project imports
import Loadable from '@/ui-component/loading/Loadable'
import MinimalLayout from '@/layout/MinimalLayout'

// canvas routing
const IframeCanvas = Loadable(lazy(() => import('@/views/agentflowsv2/IframeCanvas')))

// ==============================|| IFRAME ROUTING ||============================== //

const IframeRoutes = {
    path: '/',
    element: <MinimalLayout />,
    children: [
        {
            path: '/iframe/canvas/:id',
            element: <IframeCanvas />
        }
    ]
}

export default IframeRoutes