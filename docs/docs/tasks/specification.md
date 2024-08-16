# Task Specification

A task is defined using JSON. We use a sample configuration below to explain the options.

## Sample Task Definition

```js
{
    "sourceAppName": "TEST_APP",//(1)!
    "taskId": "T0012",//(2)!
    "executable": {//(3)!
        "type": "DOCKER", // (4)!
        "url": "ghcr.io/appform-io/test-task",//(5)!
        "dockerPullTimeout": "100 seconds"//(6)!
    },
     "resources": [//(7)!
        {
            "type": "CPU",
            "count": 1//(8)!
        },
        {
            "type": "MEMORY",
            "sizeInMB": 128//(9)!
        }
    ],
    "volumes": [//(10)!
        {
            "pathInContainer": "/data",//(11)!
            "pathOnHost": "/mnt/datavol",//(12)!
            "mode" : "READ_WRITE"//(13)!
        }
    ],
    "configs" : [//(14)!
        {
            "type" : "INLINE",//(15)!
            "localFilename": "/testfiles/drove.txt",//(16)!
            "data" : "RHJvdmUgdGVzdA=="//(17)!
        }
    ],
    "placementPolicy": {//(18)!
        "type": "ANY"//(19)!
    },
    "env": {//(20)!
        "CORES": "8"
    },
    "args" : [] //(27)!
    "tags": { //(21)!
        "superSpecialApp": "yes_i_am",
        "say_my_name": "heisenberg"
    },
    "logging": {//(22)!
        "type": "LOCAL",//(23)!
        "maxSize": "100m",//(24)!
        "maxFiles": 3,//(25)!
        "compress": true//(26)!
    }
}
```

1. Name of the `application` that has started the task. Make sure this is a valid application on the cluster.
2. An unique ID for this task. Uniqueness is up to the user, Drove will scope it in the `sourceAppName` namespace.
3. Coordinates for the executable. Refer to [Executable Specification](#executable-specification) for details.
4. Right now the only type supported is `DOCKER`.
5. Docker container address
6. Timeout for container pull.
7. Volumes to be mounted. Refer to [Volume Specification](#volume-specification) for details.
8. Path that will be visible inside the container for this mount.
9. Actual path on the host machine for the mount.
10. Mount mode can be `READ_WRITE` and `READ_ONLY`
11. Configuration to be injected as file inside the container. Please refer  [Config Specification](#config-specification) for details.
12. Type of config. Can be `INLINE`, `EXECUTOR_LOCAL_FILE`, ONTROLLER_HTTP_FETCH` and `EXECUTOR_HTTP_FETCH`. Specifies how drove will t the contents to be injected..
13. File name for the config inside the container.
14. Serialized form of the data, this and other parameters will vary cording to the `type` specified above.
15. List of resources required to run this application. Check [Resource Requirements Specification](#resource-requirements-specification) for more tails.
16. Number of CPU cores to be allocated.
17. Amount of memory to be allocated expressed in Megabytes
18. Specifies how the container will be placed on the cluster. Check [Placement Policy](#placement-policy-specification) for details.
19. Type of placement can be `ANY`, `ONE_PER_HOST`, `MATCH_TAG`, `NO_TAG`, `RULE_BASED`, `ANY` and `COMPOSITE`. Rest of the parameters in this section will depend on the type.
20. Custom environment variables. Additional variables are injected by Drove  as well. See [Environment Variables](#environment-variables) section for tails.
21. Key value metadata that can be used in external systems.
22. Specify how docker log files are configured. Refer to [Logging Specification](#logging-specification)
23. Log to local file
24. Maximum File Size
25. Number of latest log files to retain
26. Log files will be compressed
27. List of command line arguments. See [Command Line Arguments](#command-line-arguments) for details.

!!!warning
    Please make sure `sourceAppName` is set to a correct application _name_ as specified in the `name` parameter of a running application on the cluster.

    If this is not done, stale task metadata **will not be cleaned up** and your metadata store performance will get affected over time.

{!common_configs.md!}
{!common_configs_logging.md!}
