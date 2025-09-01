import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Provider } from 'react-redux'
import { ThemeProvider } from '@mui/material/styles'
import { store } from '@/store'
import themes from '@/themes'
import FlowRenderer from './FlowRenderer'

// Mock ReactFlow since it requires DOM setup
jest.mock('reactflow', () => ({
    ...jest.requireActual('reactflow'),
    __esModule: true,
    default: ({ children, ...props }) => <div data-testid="react-flow" {...props}>{children}</div>,
    Controls: ({ children }) => <div data-testid="controls">{children}</div>,
    Background: () => <div data-testid="background" />,
    MiniMap: () => <div data-testid="minimap" />,
    useNodesState: () => [[], jest.fn(), jest.fn()],
    useEdgesState: () => [[], jest.fn(), jest.fn()]
}))

const mockFlowData = {
    nodes: [
        {
            id: 'test-node-1',
            type: 'customNode',
            position: { x: 100, y: 100 },
            data: {
                id: 'test-node-1',
                label: 'Test Node',
                name: 'testNode',
                inputAnchors: [],
                inputParams: [],
                outputAnchors: [],
                inputs: {}
            }
        }
    ],
    edges: []
}

const renderWithProviders = (ui, options = {}) => {
    const customization = { isDarkMode: false }
    
    return render(
        <Provider store={store}>
            <ThemeProvider theme={themes(customization)}>
                {ui}
            </ThemeProvider>
        </Provider>,
        options
    )
}

describe('FlowRenderer', () => {
    test('renders without crashing', () => {
        renderWithProviders(<FlowRenderer flowData={mockFlowData} />)
        expect(screen.getByTestId('react-flow')).toBeInTheDocument()
    })

    test('renders with controls by default', () => {
        renderWithProviders(<FlowRenderer flowData={mockFlowData} />)
        expect(screen.getByTestId('controls')).toBeInTheDocument()
    })

    test('renders with background by default', () => {
        renderWithProviders(<FlowRenderer flowData={mockFlowData} />)
        expect(screen.getByTestId('background')).toBeInTheDocument()
    })

    test('shows minimap when enabled', () => {
        renderWithProviders(<FlowRenderer flowData={mockFlowData} showMiniMap={true} />)
        expect(screen.getByTestId('minimap')).toBeInTheDocument()
    })

    test('hides minimap when disabled', () => {
        renderWithProviders(<FlowRenderer flowData={mockFlowData} showMiniMap={false} />)
        expect(screen.queryByTestId('minimap')).not.toBeInTheDocument()
    })

    test('hides controls when disabled', () => {
        renderWithProviders(<FlowRenderer flowData={mockFlowData} showControls={false} />)
        expect(screen.queryByTestId('controls')).not.toBeInTheDocument()
    })

    test('hides background when disabled', () => {
        renderWithProviders(<FlowRenderer flowData={mockFlowData} showBackground={false} />)
        expect(screen.queryByTestId('background')).not.toBeInTheDocument()
    })

    test('applies custom className', () => {
        renderWithProviders(<FlowRenderer flowData={mockFlowData} className="custom-class" />)
        expect(document.querySelector('.custom-class')).toBeInTheDocument()
    })

    test('handles empty flow data', () => {
        const emptyFlowData = { nodes: [], edges: [] }
        renderWithProviders(<FlowRenderer flowData={emptyFlowData} />)
        expect(screen.getByTestId('react-flow')).toBeInTheDocument()
    })
})