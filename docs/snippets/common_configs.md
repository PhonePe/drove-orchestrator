## Executable Specification
Right now Drove supports _only_ docker containers. However as engines, both docker and podman are supported. Drove executors will fetch the executable directly from the registry based on the configuration provided.

| Name              | Option              | Description                      |
|-------------------|---------------------|----------------------------------|
| Type              | `type`              | Set type to `DOCKER`.            |
| URL               | `url`               | Docker container URL`.           |
| Timeout           | `dockerPullTimeout` | Timeout for docker image pull.   |

!!!note
    Drove supports docker registry authentication. This can be configured in the executor configuration file.

## Resource Requirements Specification
This section specifies the hardware resources required to run the container. CPU, MEMORY and GPU are supported as resource types that can be reserved for a container.

### CPU Requirements
Specifies number of cores to be assigned to the container.

| Name              | Option            | Description                     |
|-------------------|-------------------|---------------------------------|
| Type              | `type`            | Set type to `CPU` for this.     |
| Count             | `count`           | Number of cores to be assigned.|

### Memory Requirements
Specifies amount of memory to be allocated to a container.

| Name              | Option               | Description                                      |
|-------------------|----------------------|--------------------------------------------------|
| Type              | `type`               | Set type to `MEMORY` for this.                   |
| Count             | `sizeInMB`           | Amount of memory (in Mega Bytes) to be allocated.|

### GPU Requirements
Specifies number of GPU cards to be allocated to a container.

| Name              | Option            | Description                                                       |
|-------------------|-------------------|-------------------------------------------------------------------|
| Type              | `type`            | Set type to `GPU` for this.                                       |
| Count             | `count`           | Number of GPU cards to be allocated.                              |
| GPU Vendor        | `gpuType.vendor`  | Vendor of the GPU. Can be `NVIDIA`, `AMD`, `INTEL`, `GOOGLE_TPU` or `CEREBRAS`. |
| GPU Model         | `gpuType.model`   | Model of the GPU. For example `Tesla T4`. Match is case-insensitive. Optional. |

**Sample**
```js
[
    {
        "type": "CPU",
        "count": 1
    },
    {
        "type": "MEMORY",
        "sizeInMB": 128
    },
    {
        "type": "GPU",
        "count": 1,
        "gpuType": {
            "vendor": "NVIDIA",
            "model": "Tesla T4"
        }
    }
]
```

!!!note
    `CPU` and `MEMORY` configurations are mandatory. `GPU` configuration is optional.

!!!warning "Experimental feature"
    GPU resource scheduling is experimental. Only `NVIDIA` GPUs are discovered and allocated today. Allocation for other vendors, including `AMD`, is not supported yet. AMD support is planned for the next version.

!!!note
    Both `CPU` and `MEMORY` configurations are mandatory.

## Volume Specification
Files and directories can be mounted from the executor host into the container. The `volumes` section contains a list of volumes that need to be mounted.

| Name              | Option            | Description                                                                                                       |
|-------------------|-------------------|-------------------------------------------------------------------------------------------------------------------|
| Path In Container | `pathInContainer` | Path that will be visible inside the container for this mount.                                                    |
| Path On Host      | `pathOnHost`      | Actual path on the host machine for the mount.                                                                    |
| Mount Mode        | `mode`            | Mount mode can be `READ_WRITE` and `READ_ONLY` to allow the containerized process to write or read to the volume. |

!!!info
    We do not support mounting remote volumes as of now.

## Config Specification
Drove supports injection of configuration files into containers. The specifications for the same are discussed below.

### Inline config
Inline configuration can be added in the Application Specification itself. This will manifest as a file inside the container.

The following details are needed for this:

| Name           | Option          | Description                                    |
|----------------|-----------------|------------------------------------------------|
| Type           | `type`          | Set the value to `INLINE`                      |
| Local Filename | `localFilename` | File name for the config inside the container. |
| Data           | `data`          | Base64 encoded string for the data. The value for this will be masked on UI.          |

Config file:
```yaml
port: 8080
logLevel: DEBUG
```
Corresponding config specification:
```js
{
    "type" : "INLINE",
    "localFilename" : "/config/service.yml",
    "data" : "cG9ydDogODA4MApsb2dMZXZlbDogREVCVUcK"
}
```

!!!warning
    The full base 64 encoded config data will get stored in Drove ZK and will be pushed to executors inline. It is *not recommended* to stream large config files to containers using this method. This will probably need additional configuration on your ZK cluster.

### Locally loaded config
Config file from a path on the executor directly. Such files can be distributed to the executor host using existing configuration management systems such as OpenTofu, Salt etc.

The following details are needed for this:

| Name           | Option           | Description                                    |
|----------------|------------------|------------------------------------------------|
| Type           | `type`           | Set the value to `EXECUTOR_LOCAL_FILE`         |
| Local Filename | `localFilename`  | File name for the config inside the container. |
| File path      | `filePathOnHost` | Path to the config file on executor host.      |

Sample config specification:
```js
{
    "type" : "EXECUTOR_LOCAL_FILE",
    "localFilename" : "/config/service.yml",
    "data" : "/mnt/configs/myservice/config.yml"
}
```

### Controller fetched Config
Config file can be fetched from a remote server by the controller. Once fetched, these will be streamed to the executor as part of the instance specification for starting a container.

The following details are needed for this:

| Name           | Option          | Description                                    |
|----------------|-----------------|------------------------------------------------|
| Type           | `type`          | Set the value to `CONTROLLER_HTTP_FETCH`                      |
| Local Filename | `localFilename` | File name for the config inside the container. |
| HTTP Call Details | `http` | HTTP Call related details. Please refer to [HTTP Call Specification](#http-call-specification) for details. |

Sample config specification:
```js
{
    "type" : "CONTROLLER_HTTP_FETCH",
    "localFilename" : "/config/service.yml",
    "http" : {
        "protocol" : "HTTP",
        "hostname" : "configserver.internal.yourdomain.net",
        "port" : 8080,
        "path" : "/configs/myapp",
        "username" : "appuser",
        "password" : "secretpassword"
    }
}
```

!!!note
    The controller will make an API call for every single time it asks an executor to spin up a container. Please make sure to account for this in your configuration management system.

### Executor fetched Config
Config file can be fetched from a remote server by the executor before spinning up a container. Once fetched, the payload will be injected as a config file into the container.

The following details are needed for this:

| Name           | Option          | Description                                    |
|----------------|-----------------|------------------------------------------------|
| Type           | `type`          | Set the value to `EXECUTOR_HTTP_FETCH`                      |
| Local Filename | `localFilename` | File name for the config inside the container. |
| HTTP Call Details | `http` | HTTP Call related details. Please refer to [HTTP Call Specification](#http-call-specification) for details. |

Sample config specification:
```js
{
    "type" : "EXECUTOR_HTTP_FETCH",
    "localFilename" : "/config/service.yml",
    "http" : {
        "protocol" : "HTTP",
        "hostname" : "configserver.internal.yourdomain.net",
        "port" : 8080,
        "path" : "/configs/myapp",
        "username" : "appuser",
        "password" : "secretpassword"
    }
}
```
!!!note
    All executors will make an API call for every single time they spin up a container for this application. Please make sure to account for this in your configuration management system.

### HTTP Call Specification
This section details the options that can set when making http calls to a configuration management system from controllers or executors.

The following options are available for HTTP call:

| Name                 | Option              | Description                                                                                         |
|----------------------|---------------------|-----------------------------------------------------------------------------------------------------|
| Protocol             | `protocol`          | Protocol to use for upstream call. Can be `HTTP` or `HTTPS`.                                        |
| Hostname             | `hostname`          | Host to call.                                                                                       |
| Port                 | `port`              | Provide custom port. Defaults to 80 for http and 443 for https.                                     |
| API Path             | `path`              | Path component of the URL. Include query parameters here. Defaults to `/`                           |
| HTTP Method          | `verb`              | Type of call, use `GET`, `POST` or `PUT`. Defaults to `GET`.                                        |
| Success Code         | `successCodes`      | List of HTTP status codes which is considered as success. Defaults to `[200]`                       |
| Payload              | `payload`           | Data to be used for POST and PUT calls                                                              |
| Connection Timeout   | `connectionTimeout` | Timeout for upstream connection.                                                                    |
| Operation timeout    | `operationTimeout`  | Timeout for actual operation.                                                                       |
| Username             | `username`          | Username to be used basic auth. This field is masked out on the UI.                                 |
| Password             | `password`          | Password to be used for basic auth. This field is masked on the UI.                                 |
| Authorization Header | `authHeader`        | Data to be passed in HTTP `Authorization` header. This field is masked on the UI.                   |
| Additional Headers   | `headers`           | Any other headers to be passed to the upstream in the HTTP calls. This is a map of {string, string} |
| Skip SSL Checks      | `insecure`          | Skip hostname and certification checks during SSL handshake with the upstream.                      |

## Placement Policy Specification

Placement policy governs how Drove deploys containers on the cluster. The following sections discuss the different placement policies available and how they can be configured to achieve optimal placement of containers.

!!!warning
    All policies will work only at a `{appName, version}` combination level. They will **_not_** ensure constraints at an `appName` level. This means that for somethinge like a one per node placement, for the same `appName`, multiple containers can run on the same host if multiple deployments with different `version`s are active in a cluster. Same applies for all policies like N per host and so on.

!!!tip "Important details about executor tagging"
    - All hosts have at-least one tag, it's own hostname.
    - The `TAG` policy _will_ consider them as valid tags. This can be used to place containers on _specific_ hosts if needed.
    - This is handled specially in _all_ other policy types and they will consider executors having only the hostname tag as untagged.
    - A host with a tag (other than host) will not have _any_ containers running if not placed on them specifically using the `MATCH_TAG` policy

### Any Placement

Containers for a `{appName, version}` combination can run on any un-tagged executor host.


| Name        | Option | Description                   |
|-------------|--------|-------------------------------|
| Policy Type | `type` | Put `ANY` as policy. |

**Sample:**
```js
{
    "type" : "ANY"
}
```

!!!tip
    For _most_ use-cases this is the placement policy to use.

### One Per Host Placement
Ensures that _only_ one container for a particular `{appName, version}` combination is running on an executor host at a time.

| Name        | Option | Description                   |
|-------------|--------|-------------------------------|
| Policy Type | `type` | Put `ONE_PER_HOST` as policy. |

**Sample:**
```js
{
    "type" : "ONE_PER_HOST"
}
```

### Max N Per Host Placement

Ensures that at most N containers for a `{appName, version}` combination is running on an executor host at a time.

| Name        | Option | Description                   |
|-------------|--------|-------------------------------|
| Policy Type | `type` | Put `MAX_N_PER_HOST` as policy. |
| Max count | `max` | The maximum num of containers that can run on an executor. Range: 1-64  |

**Sample:**
```js
{
    "type" : "MAX_N_PER_HOST",
    "max": 3
}
```

### Match Tag Placement

Ensures that containers for a `{appName, version}` combination are running on an executor host that has the tags as mentioned in the policy.

| Name        | Option | Description                   |
|-------------|--------|-------------------------------|
| Policy Type | `type` | Put `MATCH_TAG` as policy. |
| Max count | `tag` | The tag to match.  |

**Sample:**
```js
{
    "type" : "MATCH_TAG",
    "tag": "gpu_enabled"
}
```

### No Tag Placement

Ensures that containers for a `{appName, version}` combination are running on an executor host that has no tags.


| Name        | Option | Description                   |
|-------------|--------|-------------------------------|
| Policy Type | `type` | Put `NO_TAG` as policy. |

**Sample:**
```js
{
    "type" : "NO_TAG"
}
```

!!!info
    The NO_TAG policy is mostly for internal use, and does not need to be specified when deploying containers that do not need any special placement logic.
    
### Composite Policy Based Placement
Composite policy can be used to combine policies together to create complicated placement requirements.

| Name        | Option | Description                   |
|-------------|--------|-------------------------------|
| Policy Type | `type` | Put `COMPOSITE` as policy. |
| Polices | `policies` | List of policies to combine |
| Combiner | `combiner` | Can be `AND` and `OR` and signify all-match and any-match logic on the `policies` mentioned. |

**Sample:**
```js
{
    "type" : "COMPOSITE",
    "policies": [
        {
            "type": "ONE_PER_HOST"
        },
        {
            "type": "MATH_TAG",
            "tag": "gpu_enabled"
        }
    ],
    "combiner" : "AND"
}
```
The above policy will ensure that _only_ one container of the relevant `{appName,version}` will run on GPU enabled machines.

!!!tip
    It is easy to go into situations where no executors match complicated placement policies. Internally, we tend to keep things rather simple and use the ANY placement for most cases and _maybe_ tags in a few places with over-provisioning or for hosts having special hardware :slight_smile:

### Rule Based Placement
A rule based policy uses a [CEL](https://cel.dev/){:target="_blank"} expression to select or reject an executor host. The rule must evaluate to a boolean. A host is used only when the rule returns `true`.

| Name        | Option | Description                                      |
|-------------|--------|--------------------------------------------------|
| Policy Type | `type` | Put `RULE_BASED` as policy.                      |
| Rule        | `rule` | The CEL expression. Maximum length is 1000 characters. |

**Sample:**
```js
{
    "type" : "RULE_BASED",
    "rule": "ctx.allocation.node.executorId != 'excluded-host' && 'gpu' in ctx.allocation.node.tags"
}
```

#### Rule context
The CEL expression is evaluated with a single variable `ctx` of type map. The following fields are available:

| Field | Type | Description |
|-------|------|-------------|
| `ctx.session.sessionId` | string | ID of the current scheduling session. All allocations for one operation share the same session ID. |
| `ctx.session.existingAllocations` | map | Current allocations for this session. Maps executor ID to instance ID to the allocation record. |
| `ctx.environment.liveExecutors` | map | Live executors in the cluster. Maps executor ID to executor data. |
| `ctx.environment.variables` | map | Environment variables passed into the scheduling session. |
| `ctx.allocation.spec` | object | The deployment spec being placed: application, task or local service spec. |
| `ctx.allocation.instanceId` | string | Instance ID for which the allocation is being made. |
| `ctx.allocation.node.executorId` | string | Executor ID of the candidate host. |
| `ctx.allocation.node.hostname` | string | Hostname of the candidate host. |
| `ctx.allocation.node.tags` | list | Tags of the candidate host. |
| `ctx.allocation.node.metadata` | map | Metadata of the candidate host. |

#### CEL language support
The following language features are enabled:

| Category | Details |
|----------|---------|
| String functions | `startsWith`, `endsWith`, `contains` and `matches` |
| Bindings | `cel.bind()` for local variables |
| Comprehensions | v2 macros: `filter()`, `map()`, `exists()` and `all()` |
| List operations | Standard list operations. The `range` function is not available. |
| Math functions | `math.greatest()` and `math.least()` |
| Standard macros | Including `has()` |

CEL is not Turing complete. There are no loops, no recursion and no side effects. The following limits protect the controller from bad rules:

| Limit | Value |
|-------|-------|
| Total comprehension iterations per evaluation | 1000 |
| Regex program size | 100 |
| Expression length in code points | 1000 |
| Parse recursion depth | 32 |

If a rule exceeds a limit, evaluation fails. The instance is then marked as failed.

!!!note
    Rules are evaluated per candidate host. The same rule sees a different `ctx.allocation.node` for each host.

!!!tip
    Use the [Placement Simulation API](../apis/cluster.md#simulate-placement) to check what a rule does before you deploy it.

## Environment variables
This config can be used to inject custom environment variables to containers. The values are defined as part of deployment specification, are same across the cluster and immutable to modifications from inside the container (ie any overrides from inside the container will not be visible across the cluster).

**Sample:**
```js
{
    "MY_VARIABLE_1": "fizz",
    "MY_VARIABLE_2": "buzz"
}
```

The following environment variables are injected by Drove to all containers:

| Variable Name                 | Value                                                                                                                                                                                                                                                           |
| DROVE_APP_INSTANCE_AUTH_TOKEN | A JWT string generated by Drove that can be used by this container to call `/apis/v1/internal/...` apis. |
| DROVE_ENV_INFO_FILE           | Path to the injected environment info JSON file inside the container. Defaults to `/etc/drove/environment-info.json`. See [Environment Info Injection](../cluster/environment-info.md) for details. |

!!!warning
    **Do not** pass secrets using environment variables. These variables are all visible on the UI as is. Please use [Configs](#config-specification) to inject secrets files and so on.

## Command line arguments
A list of command line arguments that are sent to the container engine to execute inside the container. This is provides ways for you to configure your container behaviour based off such arguments. Please refer to [docker documentation](https://docs.docker.com/engine/containers/run/#commands-and-arguments){:target="_blank"} for details.

!!!danger
    This might have security implications from a system point of view. As such Drove provides administrators a way to disable passing arguments at the cluster level by setting `disableCmdlArgs` to `true` in the controller configuration. 
