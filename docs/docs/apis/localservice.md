# Local Service Management

## Issue local service operation command

`POST /apis/v1/localservices/operations`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/localservices/operations' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic YWRtaW46YWRtaW4=' \
--data '{
    "type": "CREATE",
    "spec": {
        "name": "NODE_EXPORTER",
        "version": "1",
        "type": "SERVICE",
        "executable": {
            "type": "DOCKER",
            "url": "ghcr.io/appform-io/perf-test-server-httplib",
            "dockerPullTimeout": "100 seconds"
        },
        "exposedPorts": [
            {
                "name": "main",
                "port": 8000,
                "type": "HTTP"
            }
        ],
        "resources": [
            {
                "type": "CPU",
                "count": 1
            },
            {
                "type": "MEMORY",
                "sizeInMB": 128
            }
        ],
        "placementPolicy": {
            "type": "LOCAL",
            "hostLevel": true
        },
        "healthcheck": {
            "mode": {
                "type": "HTTP",
                "protocol": "HTTP",
                "portName": "main",
                "path": "/",
                "verb": "GET",
                "successCodes": [200],
                "payload": "",
                "connectionTimeout": "1 second"
            },
            "timeout": "1 second",
            "interval": "5 seconds",
            "attempts": 3,
            "initialDelay": "0 seconds"
        },
        "readiness": {
            "mode": {
                "type": "HTTP",
                "protocol": "HTTP",
                "portName": "main",
                "path": "/",
                "verb": "GET",
                "successCodes": [200],
                "payload": "",
                "connectionTimeout": "1 second"
            },
            "timeout": "1 second",
            "interval": "3 seconds",
            "attempts": 3,
            "initialDelay": "0 seconds"
        }
    },
    "instancesPerHost": 1
}'
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": {
        "serviceId": "NODE_EXPORTER-1"
    },
    "message": "success"
}
```

!!!tip
    Relevant payloads for local service commands can be found in [local service operations section](../localservices/operations.md).

!!!note
    Operation payloads use `opSpec` for timeout/parallelism/failure strategy.

## Cancel currently running operation

`POST /apis/v1/localservices/operations/{serviceId}/cancel`

**Request**
```shell
curl --location --request POST 'http://drove.local:7000/apis/v1/localservices/operations/NODE_EXPORTER-1/cancel' \
--header 'Authorization: Basic YWRtaW46YWRtaW4=' \
--data ''
```

## Get list of local services

`GET /apis/v1/localservices`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/localservices' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": {
        "NODE_EXPORTER-1": {
            "id": "NODE_EXPORTER-1",
            "name": "NODE_EXPORTER",
            "instancesPerHost": 1,
            "healthyInstances": 3,
            "totalCPUs": 3,
            "totalMemory": 384,
            "tags": {
                "owner": "platform"
            },
            "activationState": "ACTIVE",
            "state": "ACTIVE",
            "created": 1719826995764,
            "updated": 1719892126096
        }
    },
    "message": "success"
}
```

## Get local service summary

`GET /apis/v1/localservices/{serviceId}`

## Validate local service spec

`POST /apis/v1/localservices/validate/spec`

!!!note
    Validation enforces local-service specific rules, including `LOCAL`-only placement policy.

## Get local service spec

`GET /apis/v1/localservices/{serviceId}/spec`

## Get active local service instances

`GET /apis/v1/localservices/{serviceId}/instances`

Optionally filter by state:

`GET /apis/v1/localservices/{serviceId}/instances?state=HEALTHY&state=UNREADY`

## Get local service instance details

`GET /apis/v1/localservices/{serviceId}/instances/{instanceId}`

## Get old local service instances

`GET /apis/v1/localservices/{serviceId}/instances/old`

!!!note
    `configs` section payloads are masked in spec responses.

!!!note
    `exposedPorts` are required in local service specs because check definitions (`healthcheck` and `readiness`) refer to `portName` values from this section.

!!!warning
    For host-level services (`placementPolicy.hostLevel=true`), use `stopFirst=true` in restart/replace operations to avoid fixed host-port conflicts.
