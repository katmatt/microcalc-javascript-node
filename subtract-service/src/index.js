'use strict'

const { NodeTracerProvider } = require('@opentelemetry/node')
const { SimpleSpanProcessor } = require('@opentelemetry/tracing')
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin')
const opentelemetry = require('@opentelemetry/api')

function tracer(serviceName) {
  const provider = new NodeTracerProvider()

  const exporter = new ZipkinExporter({ serviceName, url: 'http://zipkin:9411/api/v2/spans' })
  provider.addSpanProcessor(new SimpleSpanProcessor(exporter))

  provider.register()

  return opentelemetry.trace.getTracer('microcalc-node')
}

const trace = tracer('subtract-service')
const Hapi = require('@hapi/hapi')

const init = async () => {
    
    const server = Hapi.server({
        port: 2999
    })

    server.route({
        method: 'GET',
        path: '/subtract',
        handler: (request, h) => {
            const { values } = request.query
            const operands = values.split(',').map((string) => +string)
            const subtract = (accumulator, currentValue) => accumulator - currentValue
            return operands.reduce(subtract)
        }
    })

    await server.start()
    console.log('subtract-service running on %s', server.info.uri)
}

process.on('unhandledRejection', (err) => {
    console.log(err)
    process.exit(1)
})

init()