# Application Specification

An application is defined using JSON. We use a sample configuration below to explain the options.

## Sample Application Definition

```js
{
    "name": "TEST_APP", // (1)!
    "version": "1", // (2)!
    "type": "SERVICE", // (3)!
    "executable": { //(4)!
        "type": "DOCKER", // (5)!
        "url": "ghcr.io/appform-io/perf-test-server-httplib",// (6)!
        "dockerPullTimeout": "100 seconds"// (7)!
    },
    "resources": [//(20)!
        {
            "type": "CPU",
            "count": 1//(21)!
        },
        {
            "type": "MEMORY",
            "sizeInMB": 128//(22)!
        }
    ],
    "volumes": [//(12)!
        {
            "pathInContainer": "/data",//(13)!
            "pathOnHost": "/mnt/datavol",//(14)!
            "mode" : "READ_WRITE"//(15)!
        }
    ],
    "configs" : [//(16)!
        {
            "type" : "INLINE",//(17)!
            "localFilename": "/testfiles/drove.txt",//(18)!
            "data" : "RHJvdmUgdGVzdA=="//(19)!
        }
    ],
    "placementPolicy": {//(23)!
        "type": "ANY"//(24)!
    },
    "exposedPorts": [//(8)!
        {
            "name": "main",//(9)!
            "port": 8000,//(10)!
            "type": "HTTP"//(11)!
        }
    ],
    "healthcheck": {//(25)!
        "mode": {//(26)!
            "type": "HTTP", //(27)!
            "protocol": "HTTP",//(28)!
            "portName": "main",//(29)!
            "path": "/",//(30)!
            "verb": "GET",//(31)!
            "successCodes": [//(32)!
                200
            ],
            "payload": "", //(33)!
            "connectionTimeout": "1 second" //(34)!
        },
        "timeout": "1 second",//(35)!
        "interval": "5 seconds",//(36)!
        "attempts": 3,//(37)!
        "initialDelay": "0 seconds"//(38)!
    },
    "readiness": {//(39)!
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
            "connectionTimeout": "1 second"
        },
        "timeout": "1 second",
        "interval": "3 seconds",
        "attempts": 3,
        "initialDelay": "0 seconds"
    },
    "exposureSpec": {//(42)!
        "vhost": "testapp.local", //(43)!
        "portName": "main", //(44)!
        "mode": "ALL"//(45)!
    },
    "env": {//(41)!
        "CORES": "8"
    },
    "tags": { //(40)!
        "superSpecialApp": "yes_i_am",
        "say_my_name": "heisenberg"
    },
    "preShutdown": {//(46)!
        "hooks": [ //(47)!
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
                "connectionTimeout": "1 second"
            }
        ],
        "waitBeforeKill": "3 seconds"//(48)!
    },
    "logging": {//(49)!
        "type": "LOCAL",//(50)!
        "maxSize": "100m",//(51)!
        "maxFiles": 3,//(52)!
        "compress": true//(53)!
    }
}
```

1. A human readable name for the application. This will remain constant for different versions of the app.
2. A version number. Drove does not enforce any format for this, but it is recommended to increment this for changes in spec.
3. This should be fixed to `SERVICE` for an application/service.
4. Coordinates for the executable. Refer to [Executable Specification](#executable-specification) for details.
5. Right now the only type supported is `DOCKER`.
6. Docker container address
7. Timeout for container pull.
8. The ports to be exposed from the container.
9. A logical name for the port. This will be used to reference this port in other sections.
10. Actual port number as mentioned in Dockerfile.
11. Type of port. Can be: `HTTP`, `HTTPS`, `TCP`, `UDP`.
12. Volumes to be mounted. Refer to [Volume Specification](#volume-specification) for details.
13. Path that will be visible inside the container for this mount.
14. Actual path on the host machine for the mount.
15. Mount mode can be `READ_WRITE` and `READ_ONLY`
16. Configuration to be injected as file inside the container. Please refer to [Config Specification](#config-specification) for details.
17. Type of config. Can be `INLINE`, `EXECUTOR_LOCAL_FILE`, `CONTROLLER_HTTP_FETCH` and `EXECUTOR_HTTP_FETCH`. Specifies how drove will get the contents to be injected..
18. File name for the config inside the container.
19. Serialized form of the data, this and other parameters will vary according to the `type` specified above.
20. List of resources required to run this application. Check [Resource Requirements Specification](#resource-requirements-specification) for more details.
21. Number of CPU cores to be allocated.
22. Amount of memory to be allocated expressed in Megabytes
23. Specifies how the container will be placed on the cluster. Check [Placement Policy](#placement-policy-specification) for details.
24. Type of placement can be `ANY`, `ONE_PER_HOST`, `MATCH_TAG`, `NO_TAG`, `RULE_BASED`, `ANY` and `COMPOSITE`. Rest of the parameters in this section will depend on the type.
25. Health check to ensure service is running fine. Refer to [Check Specification](#check-specification) for details.
26. Mode of health check, can be api call or command.
27. Type of this check spec. Type can be `HTTP` or `CMD`. Rest of the options in this example are HTTP specific.
28. API call protocol. Can be `HTTP`/`HTTPS`
29. Port name as mentioned in the `exposedPorts` section.
30. HTTP path. Include query params here.
31. HTTP method. Can be `GET`,`PUT` or `POST`.
32. Set of HTTP status codes which can be considered as success.
33. Payload to be sent for `POST` and `PUT` calls.
34. Connection timeout for the port.
35. Timeout for the check run.
36. Interval between check runs.
37. Max attempts after which the overall check is considered to be a failure.
38. Time to wait before starting check runs.
39. Readiness check to pass for the container to be considered as ready. Refer to [Check Specification](#check-specification) for details.
40. Key value metadata that can be used in external systems.
41. Custom environment variables. Additional variables are injected by Drove as well. See [Environment Variables](#environment-variables) section for details.
42. Specifies the virtual host on which this container is exposed.
43. FQDN for the virtual host.
44. Port name as specified in `exposedPorts` section.
45. Mode for exposure. Set this to `ALL` for now.
46. Things to do before a container is shutdown. Check [Pre Shutdown Behavior](#configuring-pre-shutdown-bheaviour) for more details.
47. Hooks (HTTP api call or shell command) to run before shutting down the container. Format is same as health/readiness checks. Refer to [HTTP Check Actions](#http-check-options) and [Command Check Options](#command-check-options) for details.
48. Time to wait before killing the container. The container will be in `UNREADY` state during this time and hence won't have api calls routed to it via Drove Gateway.
49. Specify how docker log files are configured. Refer to [Logging Specification](#logging-specification)
50. Log to local file
51. Maximum File Size
52. Number of latest log files to retain
53. Log files will be compressed


{!common_configs.md!}
## Check Specification

One of the cornerstones of managing applications on the cluster is to ensure we keep track of instance health and manage their life cycle depending on their health state. We need to define how to monitor health for containers accordingly. The checks will be executed on Applications and a Check result is generated. The result consists of the following:

* **Status** - Healthy, Unhealthy or Stopped if the container is already in stopping state
* **Message** - Any error message as generated by a specific checker

#### Common Options



| Name          | Option          | Description                                                                                                    |
|--------------------|---------------------|-------------------------------------------------------------------------------------------------------|
| Mode          | `mode`          | The definition of a HTTP call or a Command to be executed in the container. See following sections for details.|
| Timeout       | `timeout`       | Duration for which we wait before declaring a check as failed                                                  |
| Interval      | `interval`      | Interval at which check will be retried                                                                        |
| Attempts      | `attempts`      | Number of times a check is retried before it is declared as a failure                                          |
| Initial Delay | `initialDelay`  | Delay before executing the check for the first time.                                                           |


!!!note
    `initialDelay` is ignored when readiness checks and health checks are run in the recovery path as the container is already running at that point in time.

#### HTTP Check Options


| Name               | Option              | Description                                                                                                          |
|--------------------|---------------------|----------------------------------------------------------------------------------------------------------------------|
| Type               | `type`              | Fixed to HTTP for HTTP checker                                                                                       |
| Protocol           | `protocol`          | HTTP or HTTPS call to be made                                                                                        |
| Port Name          | `portName`          | The name of the container port to make the http call on as specified in the Exposed Ports section in Application Spec|
| Path               | `path`              | The api path to call                                                                                                 |
| HTTP method        | `verb`              | The HTTP Verb/Method to invoke. GET/PUT and POST are supported here                                                  |
| Success Codes      | `successCodes`      | A set of HTTP status codes that we should consider as a success from this API.                                       |
| Payload            | `payload`           | A string payload that we can pass if the Verb is POST or PUT                                                         |
| Connection Timeout | `connectionTimeout` | Maximum time for which the checker will wait for the connection to be set up with the container.                     |
| Insecure           | `insecure`          | Skip hostname and certificate checks for HTTPS ports during checks.                                                  |


#### Command Check Options


| Field      | Option         | Description                                                                                         |
|------------|----------------|-----------------------------------------------------------------------------------------------------|
| Type       | `type`         | Fixed to CMD for command checker                                                                    |
| Command    | `command`      | Command to execute in the container. (Equivalent to `docker exec -it <container> command>`)         |


## Exposure Specification
Exposure spec is used to specify the virtual host Drove Gateway exposes to outside world for communication with the containers.

The following information needs to be specified:

| Name        | Option | Description                                                                                        |
|-------------|--------|----------------------------------------------------------------------------------------------------|
| Virtual Host | `vhost` | The virtual host to be exposed on NGinx. This should be a fully qualified domain name.           |
| Port Name | `portName` | The portname to be exposed on the vhost. Port names are defined in `exposedPorts` section.       |
| Exposure Mode | `mode` | Use `ALL` here for now. Signifies that all healthy instances of the app are exposed to traffic.  |

**Sample:**
```js
{
    "vhost": "teastapp.mydomain",
    "port": "main",
    "mode": "ALL"
}
```

!!!note
    Application instances in any state other than `HEALTHY` are not considered for exposure. Please check [Application Instance State Machine](instances.md#application-instance-state-machine) for an understanding of states of instances.

## Configuring Pre Shutdown Bheaviour
Before a container is shut down, it is desirable to ensure things are spun down properly. This behaviour can be configured in the `preShutdown` section of the configuration.

| Name        | Option | Description                                                               |
|-------------|--------|---------------------------------------------------------------------------|
| Hooks | `hooks` | List of api calls and commands to be run on the container before it is killed. Each hook is either a [HTTP Call Spec](#http-call-specification) or [Command Spec](#command-check-options) |
| Wait Time | `waitBeforeKill` | Time to wait before killing the container.  |

**Sample**
```js
{
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
            "connectionTimeout": "1 second"
        }
    ],
    "waitBeforeKill": "3 seconds"//(48)!
}
```

!!!note
    The `waitBeforeKill` timed wait kicks in _after_ all the hooks have been executed.

{!common_configs_logging.md!}