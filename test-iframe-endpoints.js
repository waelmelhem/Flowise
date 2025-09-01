#!/usr/bin/env node

/**
 * Test script for Flowise iframe endpoints
 * 
 * Usage: node test-iframe-endpoints.js
 * 
 * Make sure to set these environment variables:
 * - FLOWISE_URL: Your Flowise instance URL (default: http://localhost:3000)
 * - FLOWISE_API_KEY: Your API key
 * - FLOW_ID: A flow ID to test with
 */

const https = require('https')
const http = require('http')
const url = require('url')

// Configuration
const FLOWISE_URL = process.env.FLOWISE_URL || 'http://localhost:3000'
const API_KEY = process.env.FLOWISE_API_KEY
const FLOW_ID = process.env.FLOW_ID

if (!API_KEY) {
    console.error('❌ Error: FLOWISE_API_KEY environment variable is required')
    console.log('Usage: FLOWISE_API_KEY=your-key FLOW_ID=your-flow-id node test-iframe-endpoints.js')
    process.exit(1)
}

if (!FLOW_ID) {
    console.error('❌ Error: FLOW_ID environment variable is required')
    console.log('Usage: FLOWISE_API_KEY=your-key FLOW_ID=your-flow-id node test-iframe-endpoints.js')
    process.exit(1)
}

// Test endpoints
const endpoints = [
    `/api/v1/iframe-canvas/chatflow/${FLOW_ID}`,
    `/api/v1/iframe-canvas/agentflow/${FLOW_ID}`,
    `/api/v1/iframe-canvas/agentflowv2/${FLOW_ID}`
]

async function testEndpoint(endpoint) {
    return new Promise((resolve) => {
        const fullUrl = `${FLOWISE_URL}${endpoint}`
        const parsedUrl = url.parse(fullUrl)
        const isHttps = parsedUrl.protocol === 'https:'
        const client = isHttps ? https : http
        
        const options = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || (isHttps ? 443 : 80),
            path: parsedUrl.path,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        }

        const req = client.request(options, (res) => {
            let data = ''
            
            res.on('data', (chunk) => {
                data += chunk
            })
            
            res.on('end', () => {
                resolve({
                    endpoint,
                    status: res.statusCode,
                    headers: res.headers,
                    body: data.length > 200 ? data.substring(0, 200) + '...' : data
                })
            })
        })

        req.on('error', (error) => {
            resolve({
                endpoint,
                status: 'ERROR',
                error: error.message
            })
        })

        req.setTimeout(10000, () => {
            req.destroy()
            resolve({
                endpoint,
                status: 'TIMEOUT',
                error: 'Request timeout'
            })
        })

        req.end()
    })
}

async function runTests() {
    console.log('🧪 Testing Flowise Iframe Endpoints')
    console.log('=====================================')
    console.log(`Flowise URL: ${FLOWISE_URL}`)
    console.log(`API Key: ${API_KEY.substring(0, 8)}...`)
    console.log(`Flow ID: ${FLOW_ID}`)
    console.log('')

    for (const endpoint of endpoints) {
        console.log(`Testing: ${endpoint}`)
        const result = await testEndpoint(endpoint)
        
        if (result.status === 200) {
            console.log(`✅ Success: ${result.status}`)
            console.log(`   Content-Type: ${result.headers['content-type']}`)
            console.log(`   Body preview: ${result.body.substring(0, 100)}...`)
        } else if (result.status === 'ERROR' || result.status === 'TIMEOUT') {
            console.log(`❌ ${result.status}: ${result.error}`)
        } else {
            console.log(`⚠️  Status: ${result.status}`)
            console.log(`   Response: ${result.body}`)
        }
        console.log('')
    }

    console.log('🎯 Test Summary')
    console.log('===============')
    console.log('If you see ✅ Success responses, your iframe endpoints are working!')
    console.log('If you see ❌ errors:')
    console.log('  - Check your API key is valid')
    console.log('  - Verify the flow ID exists')
    console.log('  - Ensure Flowise server is running')
    console.log('  - Check the flow belongs to your workspace')
}

runTests().catch(console.error)