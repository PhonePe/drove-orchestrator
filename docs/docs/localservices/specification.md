# Local Service Specification

A local service is defined using JSON. The structure is similar to application specifications, but deployment semantics are per executor host.

## Sample Local Service Definition

```js
{
    "name": "NODE_EXPORTER", // (1)!
    "version": "1", // (2)!
    "type": "SERVICE", // (3)!
    "executable": { // (4)!
        "type": "DOCKER", // (5)!
        "url": "ghcr.io/appform-io/perf-test-server-httplib", // (6)!
        "dockerPullTimeout": "120 seconds" // (7)!
    },
    "exposedPorts": [ // (8)!
        {
            "name": "metrics", // (9)!
            "port": 9000, // (10)!
            "type": "HTTP" // (11)!
        }
    ],
    "resources": [ // (12)!
        {
            "type": "CPU",
            "count": 1 // (13)!
        },
        {
            "type": "MEMORY",
            "sizeInMB": 256 // (14)!
        }
    ],
    "placementPolicy": { // (15)!
        "type": "LOCAL", // (16)!
        "hostLevel": false // (17)!
    },
    "healthcheck": { // (18)!
        "mode": {
            "type": "HTTP",
            "protocol": "HTTP",
            "portName": "metrics",
            "path": "/health",
            "verb": "GET",
            "successCodes": [
                200
            ],
            "payload": "",
            "connectionTimeout": "1 second"
        },
        "timeout": "2 seconds",
        "interval": "5 seconds",
        "attempts": 3,
        "initialDelay": "0 seconds"
    },
    "readiness": { // (19)!
        "mode": {
            "type": "HTTP",
            "protocol": "HTTP",
            "portName": "metrics",
            "path": "/ready",
            "verb": "GET",
            "successCodes": [
                200
            ],
            "payload": "",
            "connectionTimeout": "1 second"
        },
        "timeout": "2 seconds",
        "interval": "3 seconds",
        "attempts": 3,
        "initialDelay": "0 seconds"
    },
    "volumes": [ // (20)!
        {
            "pathInContainer": "/host/proc",
            "pathOnHost": "/proc",
            "mode": "READ_ONLY"
        }
    ],
    "configs": [ // (21)!
        {
            "type": "INLINE",
            "localFilename": "/config/runtime.yaml",
            "data": "bG9nTGV2ZWw6IElORk8="
        }
    ],
    "env": { // (22)!
        "LOG_LEVEL": "INFO"
    },
    "args": [ // (23)!
        "--scrape-all"
    ],
    "tags": { // (24)!
        "owner": "platform",
        "tier": "infra"
    },
    "logging": { // (25)!
        "type": "LOCAL",
        "maxSize": "100m",
        "maxFiles": 3,
        "compress": true
    },
    "preShutdown": { // (26)!
        "hooks": [
            {
                "type": "HTTP",
                "protocol": "HTTP",
                "portName": "metrics",
                "path": "/shutdown",
                "verb": "POST",
                "successCodes": [
                    200
                ],
                "payload": "",
                "connectionTimeout": "1 second"
            }
        ],
        "waitBeforeKill": "3 seconds"
    }
}
```

1. Human readable local service name.
2. Version for this service specification.
3. Use `SERVICE` for long-running local services.
4. Executable coordinates.
5. Currently supported executable type is `DOCKER`.
6. Docker image URI.
7. Image pull timeout.
8. Ports exposed from container.
9. Logical port name.
10. Container port.
11. Port type (`HTTP`, `HTTPS`, `TCP`, `UDP`).
12. CPU and memory resources.
13. CPU cores per instance.
14. Memory in MB per instance.
15. Placement policy.
16. Local services must use `LOCAL` placement policy.
17. `hostLevel` controls host-level behavior for local services. When `hostLevel=true`, service can run only one instance per executor.
18. Health check configuration.
19. Readiness check configuration.
20. Volume mounts.
21. File/config injection.
22. Custom environment variables.
23. Command line arguments.
24. Metadata tags.
25. Logging behavior.
26. Pre-shutdown hooks.

!!!note
    While application specs control a user service lifecycle, local service specs are used for executor-wide infrastructure workloads.

!!!note
    Number of running instances per executor is controlled at operation time using `instancesPerHost` in create/update operations.

!!!warning
    Only `LOCAL` placement is allowed for local services. Any other placement policy (for example `ANY`, `MATCH_TAG`, `RULE_BASED`) is rejected by controller validation.

!!!note
    `exposedPorts` are mandatory in local service specs because health/readiness checks resolve target ports using port names.

## Host-level mode (`hostLevel: true`)

By default, Drove maps container ports to dynamically selected host ports. This works well for most workloads, but can be inconvenient for node-level infrastructure services that must be reachable on a fixed, well-known host port.

When `placementPolicy.hostLevel` is set to `true`, Drove binds each declared container port to the same port number on the host.

This has two important implications:

1. Only one instance can run per host, otherwise port binding conflicts will occur.
2. Restart-style operations must use stop-first ordering so old instance ports are released before new instances start.

For this reason, host-level services should be operated in stop-first mode for restart/replace flows.

{!common_configs.md!}
{!common_configs_logging.md!}
