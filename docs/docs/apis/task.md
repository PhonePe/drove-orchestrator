# Task Management

## Issue task operation

`POST /apis/v1/tasks/operations`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/tasks/operations' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic YWRtaW46YWRtaW4=' \
--data '{
    "type": "KILL",
    "sourceAppName" : "TEST_APP",
    "taskId" : "T0012",
    "opSpec": {
        "timeout": "5m",
        "parallelism": 1,
        "failureStrategy": "STOP"
    }
}'
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": {
        "taskId": "T0012"
    },
    "message": "success"
}
```

!!!tip
    Relevant payloads for task commands can be found in [task operations section](../tasks/operations.md).

## Search for task
`POST /apis/v1/tasks/search`


## List all tasks

`GET /apis/v1/tasks`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/tasks' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": [
        {
            "sourceAppName": "TEST_APP",
            "taskId": "T0013",
            "instanceId": "TI-c2140806-2bb5-4ed3-9bb9-0c0c5fd0d8d6",
            "executorId": "a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d",
            "hostname": "ppessdev",
            "executable": {
                "type": "DOCKER",
                "url": "ghcr.io/appform-io/test-task",
                "dockerPullTimeout": "100 seconds"
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
                        "0": 512
                    }
                }
            ],
            "volumes": [],
            "env": {
                "ITERATIONS": "10"
            },
            "state": "RUNNING",
            "metadata": {},
            "errorMessage": "",
            "created": 1719827035480,
            "updated": 1719827038414
        }
    ],
    "message": "success"
}
```

## Get Task Instance Details

`GET /apis/v1/tasks/{sourceAppName}/instances/{taskId}`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/tasks/TEST_APP/instances/T0012' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": {
        "sourceAppName": "TEST_APP",
        "taskId": "T0012",
        "instanceId": "TI-6cf36f5c-6480-4ed5-9e2d-f79d9648529a",
        "executorId": "a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d",
        "hostname": "ppessdev",
        "executable": {
            "type": "DOCKER",
            "url": "ghcr.io/appform-io/test-task",
            "dockerPullTimeout": "100 seconds"
        },
        "resources": [
            {
                "type": "CPU",
                "cores": {
                    "0": [
                        3
                    ]
                }
            },
            {
                "type": "MEMORY",
                "memoryInMB": {
                    "0": 512
                }
            }
        ],
        "volumes": [],
        "env": {
            "ITERATIONS": "10"
        },
        "state": "STOPPED",
        "metadata": {},
        "taskResult": {
            "status": "SUCCESSFUL",
            "exitCode": 0
        },
        "errorMessage": "",
        "created": 1719823470267,
        "updated": 1719823483836
    },
    "message": "success"
}
```

