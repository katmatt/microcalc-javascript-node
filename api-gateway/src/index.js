'use strict'

const { NodeTracerProvider } = require('@opentelemetry/node')
const { SimpleSpanProcessor } = require('@opentelemetry/tracing')
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin')
const opentelemetry = require('@opentelemetry/api')
const fetch = require('node-fetch')

function tracer(serviceName) {
    const provider = new NodeTracerProvider()

    const exporter = new ZipkinExporter({ serviceName, url: 'http://zipkin:9411/api/v2/spans' })
    provider.addSpanProcessor(new SimpleSpanProcessor(exporter))

    provider.register()

    return opentelemetry.trace.getTracer('microcalc-node')
}

const trace = tracer('api-gateway')
const Hapi = require('@hapi/hapi')

const init = async () => {

    const server = Hapi.server({
        port: 3000
    })

    server.route({
        method: 'POST',
        path: '/calculate',
        options: {
            cors: true,
        },
        handler: async (request, h) => {
            const { method, operands } = request.payload
            const port = method === 'add' ? 3001 : 2999
            const url = `http://${method}-service:${port}/${method}?values=${operands.join(',')}`
            const response = await fetch(url)
            const result = response.json()
            return result
        }
    })

    await server.start()
    console.log('api-gateway running on %s', server.info.uri)
}

process.on('unhandledRejection', (err) => {
    console.log(err)
    process.exit(1)
})

init()