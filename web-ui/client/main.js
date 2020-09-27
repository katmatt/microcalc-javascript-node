'use strict';

import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/tracing';
import { WebTracerProvider } from '@opentelemetry/web'
import { FetchPlugin } from '@opentelemetry/plugin-fetch'
import { ZoneContextManager } from '@opentelemetry/context-zone'

const provider = new WebTracerProvider({
  plugins: [
    new FetchPlugin(),
  ]
})

provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

provider.register({
  contextManager: new ZoneContextManager(),
})

function onClick(event) {
  event.preventDefault()

  const webTracerWithZone = provider.getTracer('default')
  const span = webTracerWithZone.startSpan('calc-request', { parent: webTracerWithZone.getCurrentSpan() })
  const form = document.getElementById('calc')
  const fd = new FormData(form);
  const requestPayload = {
    method: fd.get('calcMethod'),
    operands: tokenizeOperands(fd.get('values'))
  }
  webTracerWithZone.withSpan(span, () => {
    calculate(requestPayload).then((response) => {
      webTracerWithZone.getCurrentSpan().addEvent('request-complete')
      span.end();
      updateResult(response);
    })
  })
}

function handleForm() {
  const form = document.getElementById('calc')

  form.addEventListener('submit', onClick)
}

function calculate(payload) {
  return fetch('http://localhost:3000/calculate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload)
  }).then((response) => response.json())
}

function updateResult(res) {
  document.getElementById('result').innerHTML = res
}

function tokenizeOperands(values) {
  return values.split(',').map(Number)
}

window.addEventListener('load', handleForm)
