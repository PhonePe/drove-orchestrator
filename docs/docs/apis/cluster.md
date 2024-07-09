# Cluster Management

## Ping API
`GET /apis/v1/ping`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/ping' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

***Response***
```js
{
    "status": "SUCCESS",
    "data": "pong",
    "message": "success"
}
```

!!!tip
    Use this api call to determine the leader in a cluster. This api will return a HTTP 200 _only_ for the leader controller. All other controllers in the cluster will return 4xx for this api call.

## Cluster Management

### Get current cluster state
`GET /apis/v1/cluster`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/cluster' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": {
        "leader": "ppessdev:4000",
        "state": "NORMAL",
        "numExecutors": 1,
        "numApplications": 1,
        "numActiveApplications": 1,
        "freeCores": 9,
        "usedCores": 1,
        "totalCores": 10,
        "freeMemory": 18898,
        "usedMemory": 128,
        "totalMemory": 19026
    },
    "message": "success"
}
```

### Set maintenance mode on cluster
`POST /apis/v1/cluster/maintenance/set`

**Request**
```shell
curl --location --request POST 'http://drove.local:7000/apis/v1/cluster/maintenance/set' \
--header 'Authorization: Basic YWRtaW46YWRtaW4=' \
--data ''
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": {
        "state": "MAINTENANCE",
        "updated": 1719897526772
    },
    "message": "success"
}
```

### Remove maintenance mode from cluster
`POST /apis/v1/cluster/maintenance/unset`

**Request**
```shell
curl --location --request POST 'http://drove.local:7000/apis/v1/cluster/maintenance/unset' \
--header 'Authorization: Basic YWRtaW46YWRtaW4=' \
--data ''
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": {
        "state": "NORMAL",
        "updated": 1719897573226
    },
    "message": "success"
}
```

!!!warning
    Cluster will remain in maintenance mode for some time (about 2 minutes) internally _even after_ maintenance mode is removed.

## Executor Management

### Get list of executors
`GET /apis/v1/cluster/executors`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/cluster/executors' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": [
        {
            "executorId": "a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d",
            "hostname": "ppessdev",
            "port": 3000,
            "transportType": "HTTP",
            "freeCores": 9,
            "usedCores": 1,
            "freeMemory": 18898,
            "usedMemory": 128,
            "tags": [
                "ppessdev"
            ],
            "state": "ACTIVE"
        }
    ],
    "message": "success"
}
```

### Get detailed info for one executor
`GET /apis/v1/cluster/executors/{id}`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/cluster/executors/a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

```js
{
    "status": "SUCCESS",
    "data": {
        "type": "EXECUTOR",
        "hostname": "ppessdev",
        "port": 3000,
        "transportType": "HTTP",
        "updated": 1719897100104,
        "state": {
            "executorId": "a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d",
            "cpus": {
                "type": "CPU",
                "freeCores": {
                    "0": [
                        3,
                        4,
                        5,
                        6,
                        7,
                        8,
                        9,
                        10,
                        11
                    ]
                },
                "usedCores": {
                    "0": [
                        2
                    ]
                }
            },
            "memory": {
                "type": "MEMORY",
                "freeMemory": {
                    "0": 18898
                },
                "usedMemory": {
                    "0": 128
                }
            }
        },
        "instances": [
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
                "updated": 1719897100104
            }
        ],
        "tasks": [],
        "tags": [
            "ppessdev"
        ],
        "blacklisted": false
    },
    "message": "success"
}
```

### Take executor out of rotation
`POST /apis/v1/cluster/executors/blacklist`

**Request**
```shell
curl --location --request POST 'http://drove.local:7000/apis/v1/cluster/executors/blacklist?id=a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d' \
--header 'Authorization: Basic YWRtaW46YWRtaW4=' \
--data ''
```

!!!note
    Unlike other POST apis, the executors to be blacklisted are passed as query parameter `id`. To blacklist multiple executors, pass `.../blacklist?id=<id1>&id=<id2>...`

**Response**
```js
{
    "status": "SUCCESS",
    "data": {
        "successful": [
            "a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d"
        ],
        "failed": []
    },
    "message": "success"
}
```

### Bring executor back into rotation
`POST /apis/v1/cluster/executors/unblacklist`

**Request**
```shell
curl --location --request POST 'http://drove.local:7000/apis/v1/cluster/executors/unblacklist?id=a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d' \
--header 'Authorization: Basic YWRtaW46YWRtaW4=' \
--data ''
```
!!!note
    Unlike other POST apis, the executors to be un-blacklisted are passed as query parameter `id`. To un-blacklist multiple executors, pass `.../unblacklist?id=<id1>&id=<id2>...`

**Response**
```js
{
    "status": "SUCCESS",
    "data": {
        "successful": [
            "a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d"
        ],
        "failed": []
    },
    "message": "success"
}
```

## Drove Cluster Events
The following APIs can be used to monitor events on Drove. If the data needs to be consumed, the `/latest` API should be used. For simply knowing if an event of a certain type has occurred or not, the `/summary` is sufficient.

### Event List
`GET /apis/v1/cluster/events/latest`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/cluster/events/latest?size=1024&lastSyncTime=0' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Response**
```js
{
    "status": "SUCCESS",
    "data": {
        "events": [
            {
                "metadata": {
                    "CURRENT_INSTANCES": 0,
                    "APP_ID": "TEST_APP-1",
                    "PLACEMENT_POLICY": "ANY",
                    "APP_VERSION": "1",
                    "CPU_COUNT": 1,
                    "CURRENT_STATE": "RUNNING",
                    "PORTS": "main:8000:http",
                    "MEMORY": 128,
                    "EXECUTABLE": "ghcr.io/appform-io/perf-test-server-httplib",
                    "VHOST": "testapp.local",
                    "APP_NAME": "TEST_APP"
                },
                "type": "APP_STATE_CHANGE",
                "id": "a2b7d673-2bc2-4084-8415-d8d37cafa63d",
                "time": 1719977632050
            },
            {
                "metadata": {
                    "APP_NAME": "TEST_APP",
                    "APP_ID": "TEST_APP-1",
                    "PORTS": "main:44315:http",
                    "EXECUTOR_ID": "a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d",
                    "EXECUTOR_HOST": "ppessdev",
                    "CREATED": 1719977629042,
                    "INSTANCE_ID": "AI-5efbb94f-835c-4c62-a073-a68437e60339",
                    "CURRENT_STATE": "HEALTHY"
                },
                "type": "INSTANCE_STATE_CHANGE",
                "id": "55d5876f-94ac-4c5d-a580-9c3b296add46",
                "time": 1719977631534
            }
        ],
        "lastSyncTime": 1719977632050//(1)!
    },
    "message": "success"
}
```

1. Pass this as the parameter `lastSyncTime` in the next call to `events` api to receive latest events.

| Query Parameter | Validation     | Description                                                                           |
|-----------------|----------------|---------------------------------------------------------------------------------------|
| lastSyncTime    | +ve long range | Time when the last sync call happened on the server. Defaults to 0 (initial sync).    |
| size            | 1-1024         | Number of latest events to return. Defaults to 1024. We recommend leaving this as is. |

### Event Summary
`GET /apis/v1/cluster/events/summary`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/cluster/events/summary?lastSyncTime=0' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```
**Response**
```js
{
    "status": "SUCCESS",
    "data": {
        "eventsCount": {
            "INSTANCE_STATE_CHANGE": 8,
            "APP_STATE_CHANGE": 17,
            "EXECUTOR_BLACKLISTED": 1,
            "EXECUTOR_UN_BLACKLISTED": 1
        },
        "lastSyncTime": 1719977632050//(1)!
    },
    "message": "success"
}
```

1. Pass this as the parameter `lastSyncTime` in the next call to `events` api to receive latest events.

### Continuous monitoring for events
This is applicable for both the APIs listed above

- In the first call to events api, pass `lastSyncTime` as zero.
- In the response there will be a field `lastSyncTime`
- Pass the last received `lastSyncTime` as the `lastSyncTime` param in the next call
- This api is cheap enough, you should plan to make calls to it every few seconds

!!!info
    Model for the events can be found [here](https://github.com/PhonePe/drove/tree/master/drove-models/src/main/java/com/phonepe/drove/models/events).

!!!tip
    Java programs should _definitely_ look at using the [event listener library](https://github.com/PhonePe/drove/packages/2186474) 
    to listen to cluster events




