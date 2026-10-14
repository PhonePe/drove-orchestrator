# Environment Info

Drove injects runtime details into every container. The executor writes a JSON file inside the container. The executor also sets an environment variable with the file path.

## Environment variable

The executor sets this environment variable in every container:

| Variable          | Description                                  |
|-------------------|----------------------------------------------|
| DROVE_ENV_INFO_FILE | Path to the environment info file inside the container. |

## Executor configuration

The executor controls the file path. Set this option in the executor config:

```yaml
executor:
  environmentInfoPath: /etc/drove/environment-info.json
```

The default path is `/etc/drove/environment-info.json`. The file is mounted into the container at this path.

## File contents

The file contains one JSON object. The sections below describe each field.

```json
{
    "instanceId": "AI-58eb1111-8c2c-4ea2-a159-8fc68010a146",
    "jobType": "SERVICE",
    "executor": {
        "executorId": "a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d",
        "hostname": "ppessdev",
        "tags": [
            "gpu-node"
        ],
        "metadata": {
            "rack": "r1"
        }
    },
    "parameters": {
        "type": "DOCKER",
        "url": "ghcr.io/appform-io/perf-test-server-httplib",
        "args": [],
        "tags": {
            "app": "testapp"
        }
    },
    "io": {
        "ports": [
            {
                "name": "main",
                "specifiedPort": 8000,
                "actualPort": 33857,
                "portType": "HTTP"
            }
        ],
        "vhosts": [
            {
                "vhost": "testapp.local",
                "portName": "main",
                "mode": "ALL"
            }
        ],
        "volumes": [
            {
                "path": "/data",
                "mode": "RW"
            }
        ]
    },
    "runtime": {
        "user": "app",
        "group": "app",
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
        "env": {
            "CORES": "8"
        }
    },
    "creationTime": "2026-10-14T10:00:00Z"
}
```

### Top-level fields

| Field        | Type   | Description                                       |
|--------------|--------|---------------------------------------------------|
| instanceId   | string | Unique ID of this instance.                       |
| jobType      | string | Job type. One of `SERVICE`, `COMPUTATION`, `LOCAL_SERVICE`. |
| executor     | object | Details about the executor that runs the instance.|
| parameters   | object | Details about the executable that runs.           |
| io           | object | Ports, vhosts, and volumes of the instance.       |
| runtime      | object | User, group, resources, and env of the instance.  |
| creationTime | string | Time when the executor created the instance.      |

### executor fields

| Field      | Type                | Description                                    |
|------------|---------------------|------------------------------------------------|
| executorId | string              | Executor ID.                                   |
| hostname   | string              | Hostname of the executor machine.              |
| tags       | list of strings     | Tags of the executor.                          |
| metadata   | map of string       | Metadata of the executor.                      |

### parameters fields

| Field | Type             | Description                                    |
|-------|------------------|------------------------------------------------|
| type  | string           | Executable type. One of `DOCKER`, `XARGS`, `SYSTEMD`. |
| url   | string           | Image URL or command to run.                   |
| args  | list of strings  | Arguments passed to the executable.           |
| tags  | map of string     | Tags of the executable.                        |

### io fields

| Field   | Type           | Description                                          |
|---------|----------------|------------------------------------------------------|
| ports   | list of object | Allocated ports. See the port table below.            |
| vhosts  | list of object | Exposures of the instance. See [exposure spec](../applications/specification.md). |
| volumes | list of object | Mounted volumes. See the volume table below.          |

Port object:

| Field        | Type   | Description                                          |
|--------------|--------|------------------------------------------------------|
| name         | string | Port name from the spec.                             |
| specifiedPort| int    | Port inside the container.                           |
| actualPort   | int    | Port on the executor host.                            |
| portType     | string | One of `HTTP`, `TCP`, `UDP`, `TLS`.                   |

Volume object:

| Field | Type   | Description                                           |
|-------|--------|-------------------------------------------------------|
| path  | string | Mount path inside the container.                      |
| mode  | string | Mount mode. One of `RO`, `RW`.                        |

### runtime fields

| Field    | Type              | Description                                           |
|----------|-------------------|-------------------------------------------------------|
| user     | string            | User that runs the container. Null when not set.      |
| group    | string            | Group that runs the container. Null when not set.     |
| resources| list of object    | Allocated resources. Same format as instance resources.|
| env      | map of string     | Environment variables passed to the container.        |

## Usage

Applications can read the file with the `DROVE_ENV_INFO_FILE` environment variable. The file helps applications discover:

- The executor host and its tags.
- The allocated host ports for the exposed ports.
- The resources allocated to the instance.
- The vhosts through which the instance is exposed.
