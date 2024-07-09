# Application Management

## Issue application operation command
`POST /apis/v1/applications/operations`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/operations' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic YWRtaW46YWRtaW4=' \
--data '{
    "type": "SCALE",
    "appId": "TEST_APP-1",
    "requiredInstances": 1,
    "opSpec": {
        "timeout": "1m",
        "parallelism": 20,
        "failureStrategy": "STOP"
    }
}'
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": {
        "appId": "TEST_APP-1"
    },
    "message": "success"
}
```

!!!tip
    Relevant payloads for application commands can be found in [application operations section](../applications/operations.md).

## Cancel currently running operation
`POST /apis/v1/applications/operations/{appId}/cancel`

**Request**
```shell
curl --location --request POST 'http://drove.local:7000/apis/v1/operations/TEST_APP/cancel' \
--header 'Authorization: Basic YWRtaW46YWRtaW4=' \
--data ''
```

**Response**
```js
{
    "status": "SUCCESS",
    "message": "success"
}
```

## Get list of applications
`GET /apis/v1/applications`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/applications' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": {
        "TEST_APP-1": {
            "id": "TEST_APP-1",
            "name": "TEST_APP",
            "requiredInstances": 0,
            "healthyInstances": 0,
            "totalCPUs": 0,
            "totalMemory": 0,
            "state": "MONITORING",
            "created": 1719826995764,
            "updated": 1719892126096
        }
    },
    "message": "success"
}
```

## Get info for an app
`GET /apis/v1/applications/{id}`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/applications/TEST_APP-1' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": {
        "id": "TEST_APP-1",
        "name": "TEST_APP",
        "requiredInstances": 1,
        "healthyInstances": 1,
        "totalCPUs": 1,
        "totalMemory": 128,
        "state": "RUNNING",
        "created": 1719826995764,
        "updated": 1719892279019
    },
    "message": "success"
}
```

## Get raw JSON specs
`GET /apis/v1/applications/{id}/spec`

**Request**

```shell
curl --location 'http://drove.local:7000/apis/v1/applications/TEST_APP-1/spec' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": {
        "name": "TEST_APP",
        "version": "1",
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
        "volumes": [],
        "configs": [
            {
                "type": "INLINE",
                "localFilename": "/testfiles/drove.txt",
                "data": ""
            }
        ],
        "type": "SERVICE",
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
            "type": "ANY"
        },
        "healthcheck": {
            "mode": {
                "type": "HTTP",
                "protocol": "HTTP",
                "portName": "main",
                "path": "/",
                "verb": "GET",
                "successCodes": [
                    200
                ],
                "payload": "",
                "connectionTimeout": "1 second",
                "insecure": false
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
                "successCodes": [
                    200
                ],
                "payload": "",
                "connectionTimeout": "1 second",
                "insecure": false
            },
            "timeout": "1 second",
            "interval": "3 seconds",
            "attempts": 3,
            "initialDelay": "0 seconds"
        },
        "tags": {
            "superSpecialApp": "yes_i_am",
            "say_my_name": "heisenberg"
        },
        "env": {
            "CORES": "8"
        },
        "exposureSpec": {
            "vhost": "testapp.local",
            "portName": "main",
            "mode": "ALL"
        },
        "preShutdown": {
            "hooks": [
                {
                    "type": "HTTP",
                    "protocol": "HTTP",
                    "portName": "main",
                    "path": "/",
                    "verb": "GET",
                    "successCodes": [
                        200
                    ],
                    "payload": "",
                    "connectionTimeout": "1 second",
                    "insecure": false
                }
            ],
            "waitBeforeKill": "3 seconds"
        }
    },
    "message": "success"
}
```

!!!note
    `configs` section data will not be returned by any api calls

## Get list of currently active instances
`GET /apis/v1/applications/{id}/instances`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/applications/TEST_APP-1/instances' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": [
        {
            "appId": "TEST_APP-1",
            "appName": "TEST_APP",
            "instanceId": "AI-58eb1111-8c2c-4ea2-a159-8fc68010a146",
            "executorId": "a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d",
            "localInfo": {
                "hostname": "ppessdev",
                "ports": {
                    "main": {
                        "containerPort": 8000,
                        "hostPort": 33857,
                        "portType": "HTTP"
                    }
                }
            },
            "resources": [
                {
                    "type": "CPU",
                    "cores": {
                        "0": [
                            2
                        ]
                    }
                },
                {
                    "type": "MEMORY",
                    "memoryInMB": {
                        "0": 128
                    }
                }
            ],
            "state": "HEALTHY",
            "metadata": {},
            "errorMessage": "",
            "created": 1719892354194,
            "updated": 1719893180105
        }
    ],
    "message": "success"
}
```

## Get list of old instances
`GET /apis/v1/applications/{id}/instances/old`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/applications/TEST_APP-1/instances/old' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": [
        {
            "appId": "TEST_APP-1",
            "appName": "TEST_APP",
            "instanceId": "AI-869e34ed-ebf3-4908-bf48-719475ca5640",
            "executorId": "a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d",
            "resources": [
                {
                    "type": "CPU",
                    "cores": {
                        "0": [
                            2
                        ]
                    }
                },
                {
                    "type": "MEMORY",
                    "memoryInMB": {
                        "0": 128
                    }
                }
            ],
            "state": "STOPPED",
            "metadata": {},
            "errorMessage": "Error while pulling image ghcr.io/appform-io/perf-test-server-httplib: Status 500: {\"message\":\"Get \\\"https://ghcr.io/v2/\\\": net/http: request canceled while waiting for connection (Client.Timeout exceeded while awaiting headers)\"}\n",
            "created": 1719892279039,
            "updated": 1719892354099
        }
    ],
    "message": "success"
}
```

## Get info for an instance
`GET /apis/v1/applications/{appId}/instances/{instanceId}`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/applications/TEST_APP-1/instances/AI-58eb1111-8c2c-4ea2-a159-8fc68010a146' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": {
        "appId": "TEST_APP-1",
        "appName": "TEST_APP",
        "instanceId": "AI-58eb1111-8c2c-4ea2-a159-8fc68010a146",
        "executorId": "a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d",
        "localInfo": {
            "hostname": "ppessdev",
            "ports": {
                "main": {
                    "containerPort": 8000,
                    "hostPort": 33857,
                    "portType": "HTTP"
                }
            }
        },
        "resources": [
            {
                "type": "CPU",
                "cores": {
                    "0": [
                        2
                    ]
                }
            },
            {
                "type": "MEMORY",
                "memoryInMB": {
                    "0": 128
                }
            }
        ],
        "state": "HEALTHY",
        "metadata": {},
        "errorMessage": "",
        "created": 1719892354194,
        "updated": 1719893440105
    },
    "message": "success"
}
```

## Application Endpoints
`GET /apis/v1/endpoints`

!!!info
    This API provides up-to-date information about the host and port information about application instances running on the cluster. This information can be used for Service Discovery systems to keep their information in sync with changes in the topology of applications running on the cluster.

!!!tip
    Any `tag` specified in the application specification is also exposed on endpoint. This can be used to implement complicated routing logic if needed in the NGinx template on Drove Gateway.

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/endpoints' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": [
        {
            "appId": "TEST_APP-1",
            "vhost": "testapp.local",
            "tags": {
                "superSpecialApp": "yes_i_am",
                "say_my_name": "heisenberg"
            },
            "hosts": [
                {
                    "host": "ppessdev",
                    "port": 44315,
                    "portType": "HTTP"
                }
            ]
        },
        {
            "appId": "TEST_APP-2",
            "vhost": "testapp.local",
            "tags": {
                "superSpecialApp": "yes_i_am",
                "say_my_name": "heisenberg"
            },
            "hosts": [
                {
                    "host": "ppessdev",
                    "port": 46623,
                    "portType": "HTTP"
                }
            ]
        }
    ],
    "message": "success"
}
```

