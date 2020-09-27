# Calculator Microservice

This is a port of https://github.com/distributed-tracing-in-practice/microcalc to Javascript/node.

## Prerequisites

* Docker

## Installation and Usage

* You can run all services together with a zipkin server by running `docker-compose up` in this folder.
* The services and the web ui are running in hot reload mode. Changing a file will immediately reload the changes.
- The web ui is available at http://localhost:8090/ and provides a link to the zipkin UI
- The zipkin UI is available at http://localhost:9411/