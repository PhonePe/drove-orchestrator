# Setting up Executor Nodes

We shall setup the executor nodes by setting up the hardware, operating system first and then the executor service itself.

!!!warning "Upgrading from 1.33.x?"
    1.34.x will not start on an old config. Go through the [migration guide](migrating.md#upgrading-from-133x) checklist before rolling out new images.

## Considerations and tuning for hardware and operating system

In the following sections we discus some aspects of scheduling, hardware and settings on the OS to ensure good performance.

### CPU and Memory considerations
The executor nodes are the servers that host and run the actual docker containers. Drove will take into consideration the NUMA topology of these machines to optimize the placement for containers to extract the maximum performance. Along with this, Drove will `cpuset` the containers to the allocated cores in a non overlapping manner, so that the cores allocated to a container are dedicated to it. Memory allocated to a container is pinned as well and selected from the same NUMA node.

Needless to say the minimum amount of CPU that can be given to an application or task is 1. Fractional cpu allocation can be achieved in a predictable manner by configuring over provisioning on executor nodes.

#### Over Provisioning of CPU and Memory

Drove does not do any kind of burst scaling or overcommitment to ensure application performance remains predictable even under load. Instead, in Drove, there is a feature to make executors appear to have more cores (and memory) than it actually has. This can be used to get more utilization out of executor nodes in clusters that do not need guaranteed performance (for example staging or dev testing clusters). This is achieved by enabling **over provisioning**.

Over provisioning needs to be configured in the executor configuration. It primarily consists of two configs:

* CPU Multiplier - an integral multiplier which will be used to multiply the number of available cores
* Memory Multiplier - an integral multiplier which will be used to multiply available memory

VCores (virtual cores) are internal representation of a CPU core on the executor. If over provisioning is disabled, a vcore will correspond to a physical core. If over provisioning is enabled, 1 CPU core will generate `cpu multiplier` number of v cores. Drove does do `cpuset` even on containers running on nodes that have over provisioning enabled, however the physical cores that the containers get bound to are chosen at random, albeit from the same NUMA node. `cpuset-mem` is always done on the same NUMA node as well.

!!!tip "Mixed clusters"
    In some production clusters you might have applications that are non critical in terms of performance and are unable to utilize a full core. These can be tagged to be spun up on some nodes where over provisioning is enabled. Adopting such a cluster topology will ensure that containers that need high performance run on nodes without over provisioning and the smaller apps (like for example operations consoles etc) are run on separate nodes with over provisioning enabled. Just ensure the latter are tagged properly and during app deployment specify this tag in [application spec](../../applications/specification.md) or [task spec](../../tasks/specification.md).

#### Disable NUMA Pinning

There is an option to disable memory and core pinning. In this situation, all cores from all NUM nodes show up as being part of one node. `cpuset-mems` is _not_ called if numa pinning is disabled and therefore you will be leaving some memory performance on the table. We recommend not to dabble with this unless you have tasks and containers that need more than the number of cores available on a single NUMA node. This setting is enabled at executor level by setting `disableNUMAPinning: true`.

#### Hyper-threading
Whether Hyper Threading needs to be enabled or not is a bit dependent on applications deployed and how effectively they can utilize individual CPU cores. For mixed workloads, we recommend Hyper Threading to be enabled on the executor nodes.

#### Isolating container and OS processes
Typically we would not want containers to share CPU resources with processes for the operating system, Drove Executor Service as well as Docker engine (if using docker) and so on. While complete isolation would need creating a full scheduler (and passing `isolcpus` to GRUB parameters), we can get a good middle ground by ensuring such processes utilize only a few CPU cores on the system, and let the Drove executors deploy and pin containers to the rest.

This is achieved in two steps:

- Make changes to systemd to use only specific cores
- Exclude these cores in the drove executor configuration

Let's say our server has 2 NUMA nodes, each with 40 hyper-threaded cores. We want to reserve the first 2 cores from each CPU to the OS processes. So we reserve cores `[0,1,2,3]` for the OS processes.

The following line in `/etc/systemd/system.conf`

```property
#CPUAffinity=
```

needs to be changed to

```property
CPUAffinity=0 1 2 3
```

!!!tip
    Reboot the machine for this to take effect.

The changes can be validated post reboot by running the following command:

```shell
grep Cpus_allowed_list /proc/1/status
```

The expected output should be:
```text
Cpus_allowed_list:	0-3
```
!!!note
    Refer to [this](https://access.redhat.com/solutions/2884991){:target="_blank"} for more details.

### GPU Computation
How GPU discovery and allocation works is explained in [GPU Scheduling](../../concepts/gpu.md).

Nvidia based GPU compute can be enabled at executor level by installing relevant drivers. Please follow the [setup guide](../../concepts/gpu.md) to enable this. Remember to tag these nodes to isolate them from the primary cluster and use tags to deploy apps and tasks that need GPU.

### Storage consideration
On executor nodes the disk might be under pressure if container (re)deployments are frequent or the containers log very heavily. As such, we recommend the logging directory for Drove be mounted on hardware that will be able to handle this load. Similar considerations need to be given to the log and package directory for docker or podman.

## Executor Configuration Reference
The Drove Executor is written on the [Dropwizard](https://www.dropwizard.io/en/release-2.1.x/){:target="_blank"} framework. The configuration to the service is set using a YAML file which needs to be injected into the container. A typical controller configuration file will look like the following:

```yaml
server: #(1)!
  applicationConnectors: #(2)!
    - type: http
      port: 3000
  adminConnectors: #(3)!
    - type: http
      port: 3001
  applicationContextPath: /
  requestLog:
    appenders:
      - type: console
        timeZone: ${DROVE_TIMEZONE}
      - type: file
        timeZone: ${DROVE_TIMEZONE}
        currentLogFilename: /logs/drove-executor-access.log
        archivedLogFilenamePattern: /logs/drove-executor-access.log-%d-%i
        archivedFileCount: 3
        maxFileSize: 100MiB

logging:
  level: INFO
  loggers:
    com.phonepe.drove: ${DROVE_LOG_LEVEL}

  appenders: #(4)!
    - type: console #(5)!
      threshold: ALL
      timeZone: ${DROVE_TIMEZONE}
      logFormat: "%(%-5level) [%date] [%logger{0} - %X{instanceLogId}] %message%n"
    - type: file #(6)!
      threshold: ALL
      timeZone: ${DROVE_TIMEZONE}
      currentLogFilename: /logs/drove-executor.log
      archivedLogFilenamePattern: /logs/drove-executor.log-%d-%i
      archivedFileCount: 3
      maxFileSize: 100MiB
      logFormat: "%(%-5level) [%date] [%logger{0} - %X{appId}] %message%n"
      archive: true

    - type: drove #(7)!
      logPath: "/logs/applogs/"
      archivedLogFileSuffix: "%d"
      archivedFileCount: 3
      threshold: TRACE
      timeZone: ${DROVE_TIMEZONE}
      logFormat: "%(%-5level) | %-23date | %-30logger{0} | %message%n"
      archive: true

clusterAuth: #(9)!
  secrets:
  - nodeType: CONTROLLER
    secret: ${DROVE_CONTROLLER_SECRET}
  - nodeType: EXECUTOR
    secret: ${DROVE_EXECUTOR_SECRET}

resources: #(10)!
  osCores: [ 0, 1 ]
  exposedMemPercentage: 60
  disableNUMAPinning: ${DROVE_DISABLE_NUMA_PINNING}
  nvidiaGPULoaderConfig:
    enabled: ${DROVE_ENABLE_MANAGED_GPU}

options: #(11)!
  cacheImages: true
  maxOpenFiles: 10_000
  logBufferSize: 5m
  cacheFileSize: 10m
  cacheFileCount: 3

controllers: #(12)!
  endpoints:
    - http://controller-1:10000
    - http://controller-2:10000

```

1. Server listener configuration. See [Dropwizard Server Configuration](https://www.dropwizard.io/en/release-2.1.x/manual/configuration.html#servers){:target="_blank"} for the different options.
2. Main port configuration. This is where the UI and APIs will be exposed. Check connector configuration [docs](https://www.dropwizard.io/en/release-2.1.x/manual/configuration.html#connectors){:target="_blank"} for details.
3. Admin port. You can take thread dumps, metrics, run healthchecks on the Drove controller on this port.
4. Logging configuration. See [logging docs](https://www.dropwizard.io/en/release-2.1.x/manual/configuration.html#logging){:target="_blank"}.
5. Log to console. Useful in docker-compose.
6. Log to rotating files. Useful for running servers.
7. Drove application logger configuration. See [drove logger config](#drove-application-logger-configuration) for details.
8. Configuration for authentication between nodes in the cluster. Please check [intra node auth config](#intra-node-authentication-configuration) for details.
9. Resource configuration for this node.
10. Options to configure executor behaviour. Check [executor options](#executor-options) section for details.
11. Controller endpoints. Executors send all updates to controllers over HTTP(S). This section is required.

!!!tip
	In case you do not want to expose admin apis to outside the host, please set `bindHost` in the admin connectors section.

	```yaml
	adminConnectors:
	  - type: http
	    port: 10001
	    bindHost: 127.0.0.1
	```

### Controller Endpoints Configuration
Executors no longer connect to Zookeeper. Zookeeper is used by controllers only. Executors talk to controllers directly over HTTP(S) using the `controllers.endpoints` configuration.

A leftover `zookeeper` key in the executor config is ignored for backwards compatibility. This key can be removed safely from existing executor configuration files.

!!!note
    Ensure `controllers.endpoints` lists all controller endpoints. Executors use these endpoints to register themselves and send all state updates.
{!intra_node_auth.md!}

!!!note
    This section is same across the cluster including both controller and executor.

### Drove Application Logger Configuration
Drove will segregate application and task instance logs in a directory of your choice. The path for such files is set as:
- `<application id>/<instance id>` for Application Instances
- `<sourceAppName>/<task id>` for Task Instances

The Drove Log Appender is based of LogBack's [Sifting Appender](https://logback.qos.ch/manual/appenders.html#SiftingAppender){:target="_blank"}.

The following configuration options are supported:

|Name|Option|Description|
|----|------|-----------|
|Path|`logPath`| Directory to host the logs |
|Archive old logs| `archive` | Whether to enable log rotation |
|Archived File Suffix | `archivedLogFileSuffix` | Suffix for archived log files. |
|Archived File Count|`archivedFileCount` | Count of archived log files. Older files are deleted. |
|File Size| `maxFileSize` | Size of current log file after which it is archived and a new file is created. Unit: [DataSize](units.md#data-size).|
|Total Size|`totalSizeCap` | total size after which deletion takes place. Unit: [DataSize](units.md#data-size).|
|Buffer Size|`bufferSize`|Buffer size for the logger. (Set to 8KB by default). Used if `immediateFlush` is turned off.|
|Immediate Flush| `immediateFlush` | Flush logs immediately. Set to `true` by default (recommended)|

**Sample**
```yaml
logging:
  level: INFO
  ...

  appenders:
    # Setup appenders for the executor process itself first
    ...

    - type: drove
      logPath: "/logs/applogs/"
      archivedLogFileSuffix: "%d"
      archivedFileCount: 3
      threshold: TRACE
      timeZone: ${DROVE_TIMEZONE}
      logFormat: "%(%-5level) | %-23date | %-30logger{0} | %message%n"
      archive: true
```

### Resource Configuration
This section can be used to configure how resources are exposed from an executor to the cluster. We have [discussed](#considerations-and-tuning-for-hardware-and-operating-system) a few of the considerations that will drive the configuration that is being setup.


|Name|Option|Description|
|----|------|-----------|
|OS Cores| `osCores` | A list of cores reserved for use by operating system processes. See the [relevant section](#isolating-container-and-os-processes) for details on the pre-steps needed to achieve this.|
|Exposed Memory|`exposedMemPercentage`| What percentage of the system memory can be used by the containers running on the host collectively. Range: 50-100 `integer`|
|NUMA Pinning|`disableNUMAPinning`| Disable NUMA and CPU core pinning for containers. Pinning is on by default. (default: `false`)|
|Managed GPU Loader| `nvidiaGPULoaderConfig` | Enable managed GPU discovery and allocation. When enabled (`nvidiaGPULoaderConfig.enabled: true`), the executor discovers Nvidia GPUs on the host using `nvidia-smi` (including MIG slices), registers them with the resource manager and allocates them per-container based on the `GPU` resource requirements in the spec. See the [Nvidia setup guide](../../concepts/gpu.md) for driver and toolkit installation.|
|Nvidia GPU (legacy)| `enableNvidiaGpu` | **Deprecated.** Legacy pass-through mode. Makes all available Nvidia GPUs on the current executor machine available to _any_ container running on this executor. GPU resources are not discovered, managed or rationed between containers. Needs to be used in conjunction with tagging (see `tags` below) to ensure only the applications which require a GPU end up on the executor with GPUs. Use `nvidiaGPULoaderConfig` instead.|
|Tags|`tags`| A set of strings that can be used in `TAG` placement policy to route application and task instances to this executor. |
|Over Provisioning|`overProvisioning`|Setup over provisioning configuration. |
|Performance Scaling|`performanceScaling`|Setup performance scaling factors for CPU and memory. See [performance scaling configuration](#performance-scaling-configuration) for details.|

!!!warning "GPU modes are mutually exclusive"
    `enableNvidiaGpu` (legacy pass-through) and `nvidiaGPULoaderConfig` (managed GPU) cannot be enabled at the same time. The executor fails validation if both are enabled.

!!!warning "Experimental feature"
    Managed GPU discovery and allocation (`nvidiaGPULoaderConfig`) is experimental.



!!!warning "Tagging"
    The current hostname is _always_ added as a tag by default and is handled specially to allow for non-tagged deployments to be routed to this executor. If _any_ tag is specified in the `tags` config, this node will receive containers **_only_** when `MATCH_TAG` placement is used. Please check relevant sections to specify correct placement policies for [applications](../../applications/specification.md#placement-policy-specification) and [tasks](../../tasks/specification.md#placement-policy-specification).

**Sample**
```yaml
resources:
  osCores: [0,1,2,3]
  exposedMemPercentage: 90
```

#### Over provisioning configuration
Drove strives to ensure that containers can run unencumbered on CPU cores allocated to them. This means that the _minimum_ allocation unit possible is `1` for cores. It _does not_ support fractional CPU.

However, there are situations where we would want some non-critical applications to run the cluster but not waste CPU. The `overProvisioning` configuration aims to provide user a way to turn off NUMA pinning on the executor and run more containers than it normally would.

To ensure predictability, we do not want pinned and non-pinned containers running on the same host. Hence, an executor host can either be running in pinned mode or in non-pinned mode.

To enable more containers than we could usually deploy and to still retain some level of control on how small you want a container to go, we specify multipliers on CPU and memory.

**Example:**
- Let's say your executor server has 40 cores available. If you set `cpuMultiplier` as 4, this node will now show up as having 160 cores to the controller.
- Let's say your server had 512GB of memory, setting `memoryMultiplier` to 2 will make drove see it as 1TB.


|Name|Option|Description|
|----|------|-----------|
|Enabled|`enabled`|Set this to true to enable over provisioning. Default: `false`|
|CPU Multiplier|`cpuMultiplier`| Multiplier to be applied to enable cpu over provisioning. Default: `1`. Range: 1-20|
|Memory Multiplier|`memoryMultiplier`| Multiplier to be applied to enable memory over provisioning. Default: `1`. Range: 1-20|

**Sample**
```yaml
resources:
  exposedMemPercentage: 90
  overProvisioning:
    enabled: true
    memoryMultiplier: 1
    cpuMultiplier: 3
```

!!!tip
    This feature was developed to allow us to run our development environments cheaper. In such environments there is not much pressure on CPU or memory, but a large number of containers run as developers can spin up containers for features they are working on. There was no point is wasting a full core on containers that get hit twice a minute or less. On production we tend to err on the side of caution and allocate at least one core even to the most trivial applications as of the time of writing this.

#### Performance scaling configuration
Executor hosts in a cluster can have different CPU and memory performance. For example, an Ice Lake host can be 1.5x faster than a Skylake host. The `performanceScaling` configuration tells the controller how much faster (or slower) this host is compared to the cluster baseline.

The controller uses these factors when it allocates resources. The required CPU count and memory are divided by the scaling factor and rounded up. A host that is 1.5x faster than the baseline reserves fewer cores for the same spec. For example, a spec that asks for 3 cores needs only 2 cores on a host with `cpuScalingFactor: 1.5`.

**Example:**
- Baseline host family is Skylake. An Ice Lake host is 1.5x faster. Set `cpuScalingFactor: 1.5` on the Ice Lake hosts.
- A spec that requires 3 cores reserves 2 cores on the Ice Lake host (`ceil(3 / 1.5)`). The same spec reserves 3 cores on a Skylake host.

|Name|Option|Description|
|----|------|-----------|
|CPU Scaling Factor|`cpuScalingFactor`| How many times faster the host CPU is compared to the cluster baseline. The controller divides the required core count by this factor. Default: `1.0`. A value of `0` or missing is treated as `1.0`.|
|Memory Scaling Factor|`memoryScalingFactor`| How many times faster the host memory is compared to the cluster baseline. The controller divides the required memory by this factor. Default: `1.0`. A value of `0` or missing is treated as `1.0`.|

**Sample**
```yaml
resources:
  exposedMemPercentage: 90
  performanceScaling:
    cpuScalingFactor: 1.5
    memoryScalingFactor: 1.2
```

!!!note
    Scaling changes only how many cores and how much memory the controller _reserves_ on a host for a spec. The actual containers see the full allocated cores. A spec that asks for 3 cores always gets 3 cores inside the container.

### Executor Options
| Name | Option | Description |
|------|--------|-------------|
|Hostname|`hostname`| Override the hostname that gets exposed to the controller. Make sure this is resolvable. |
|Cache Images|`cacheImages`| Cache container images. If this is not passed, a container image is removed when a container dies and no other instance is using the image.|
|Command Timeout|`containerCommandTimeout`|Timeout used by the container engine client when issuing container commands to `docker` or `podman`|
|Container Socket Path|`dockerSocketPath`| The path of socket for docker socket. Comes in handy to configure path for socket when using `podman` etc.|
|Max Open Files|`maxOpenFiles`| Override the maximum number of file descriptors a container can open. Default: 470,000|
|Log Buffer Size|`logBufferSize`|The size of the buffer the executor uses to read logs from container. Unit [DataSize](units.md#data-size). Range: 1-128MB. Default: 10MB|
|Cache File Size | `cacheFileSize` | To limit disk usage, configure fixed size log file cache for containers. Unit: [DataSize](units.md#data-size). Range: 10MB-100GB. Default: 20MB. Compression is always enabled.|
|Cache File Count | `cacheFileCount` | To limit disk usage, configure fixed count of log file cache for containers. Unit: `integer`. Max: 1024. Default: 3|
|Default User Spec|`defaultUserSpec`| Default user and group (for example `user: 1000`, `group: 1000`) to run containers as when no user is specified in the spec.|
|Environment Info Path|`environmentInfoPath`| Path inside the container where the environment info JSON file is injected. Default: `/etc/drove/environment-info.json`. See [Environment Info Injection](../environment-info.md) for details.|
|Controller Connect Timeout|`controllerConnectTimeout`| Timeout for connecting to controllers. Default: 1 second.|
|Controller Response Timeout|`controllerResponseTimeout`| Timeout for controller responses. Default: 1 second.|

!!!note
    Executors send all updates to controllers over HTTP(S) using `controllers.endpoints`. The `remoteUpdateMode` option has been removed. A leftover `remoteUpdateMode` key in the config is ignored for backwards compatibility.

**Sample**
```yaml
options:
  logBufferSize: 20m
  cacheFileSize: 30m
  cacheFileCount: 3
  cacheImages: true
```

## Relevant directories
Location for data and logs are as follows:

- `/etc/drove/executor/` - Configuration files
- `/var/log/drove/executor/` - Executor Logs
- `/var/log/drove/executor/instance-logs` - Application/Task Instance Logs

We shall be volume mounting the config and log directories with the same name.

!!!warning "Prerequisite Setup"
    If not done already, please complete the [prerequisite setup](prerequisites.md) on all machines earmarked for the cluster.


## Setup the config file


Create a relevant configuration file in `/etc/drove/executor/executor.yml`.

**Sample**
```yaml
server:
  applicationConnectors:
    - type: http
      port: 11000
  adminConnectors:
    - type: http
      port: 11001
  requestLog:
    appenders:
      - type: file
        timeZone: IST
        currentLogFilename: /var/log/drove/executor/drove-executor-access.log
        archivedLogFilenamePattern: /var/log/drove/executor/drove-executor-access.log-%d-%i
        archivedFileCount: 3
        maxFileSize: 100MiB

logging:
  level: INFO
  loggers:
    com.phonepe.drove: INFO


  appenders:
    - type: file
      threshold: ALL
      timeZone: IST
      currentLogFilename: /var/log/drove/executor/drove-executor.log
      archivedLogFilenamePattern: /var/log/drove/executor/drove-executor.log-%d-%i
      archivedFileCount: 3
      maxFileSize: 100MiB
      logFormat: "%(%-5level) [%date] [%logger{0} - %X{appId}] %message%n"
    - type: drove
      logPath: "/var/log/drove/executor/instance-logs"
      archivedLogFileSuffix: "%d-%i"
      archivedFileCount: 0
      maxFileSize: 1GiB
      threshold: INFO
      timeZone: IST
      logFormat: "%(%-5level) | %-23date | %-30logger{0} | %message%n"
      archive: true

clusterAuth:
  secrets:
  - nodeType: CONTROLLER
    secret: "0v8XvJrDc7r86ZY1QCByPTDPninI4Xii"
  - nodeType: EXECUTOR
    secret: "pOd9sIEXhv0wrGOVc7ebwNvR7twZqyTN"

resources:
  osCores: []
  exposedMemPercentage: 90
  disableNUMAPinning: true
  overProvisioning:
    enabled: true
    memoryMultiplier: 10
    cpuMultiplier: 10

options:
  cacheImages: true
  logBufferSize: 20m
  cacheFileSize: 30m
  cacheFileCount: 3

controllers:
  endpoints:
    - http://controller-1:10000
    - http://controller-2:10000
```

!!!note
    Executors send all updates to controllers over HTTP(S). Configure `controllers.endpoints` so executors can reach all controller nodes directly.

## Setup required environment variables
Environment variables needed to run the drove executor are setup in `/etc/drove/executor/executor.env`.

```unixconfig
CONFIG_FILE_PATH=/etc/drove/executor/executor.yml
JAVA_PROCESS_MIN_HEAP=1g
JAVA_PROCESS_MAX_HEAP=1g
ZK_CONNECTION_STRING="192.168.3.10:2181"
CONTROLLER_SECRET="0v8XvJrDc7r86ZY1QCByPTDPninI4Xii"
EXECUTOR_SECRET="pOd9sIEXhv0wrGOVc7ebwNvR7twZqyTN"
JAVA_OPTS="-Xlog:gc:/var/log/drove/executor/gc.log -Xlog:gc:::filecount=3,filesize=10M -Xlog:gc::time,level,tags -XX:+UseNUMA -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/urandom -Dfile.encoding=utf-8 -Djute.maxbuffer=0x9fffff"
```

!!!note
    The `CONTROLLER_SECRET` and `EXECUTOR_SECRET` values must match the secrets configured on the controllers. See [intra node auth config](#intra-node-authentication-configuration) for details.

### Container environment variables
The executor container entrypoint reads the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `CONFIG_FILE_PATH` | Path to the config file inside the container | `config.yml` |
| `ZK_CONNECTION_STRING` | Kept for compatibility. The container exits if this is not set. Executors talk to controllers directly, not Zookeeper. | – |
| `CONTROLLER_SECRET` | Secret for intra-node authentication, controller side | `ControllerSecret` |
| `EXECUTOR_SECRET` | Secret for intra-node authentication, executor side | `ExecutorSecret` |
| `LOG_LEVEL` | Log level for `com.phonepe.drove` | `INFO` |
| `TZ` | Timezone for logs | `UTC` |
| `DEBUG` | Print environment and diagnostics at startup | `0` |
| `GC_ALGO` | JVM garbage collection algorithm | `UseG1GC` |
| `JAVA_PROCESS_MIN_HEAP` | JVM minimum heap size | `1g` |
| `JAVA_PROCESS_MAX_HEAP` | JVM maximum heap size | `1g` |
| `JAVA_OPTS` | Extra JVM options | – |
| `DISABLE_NUMA_PINNING` | Disable NUMA and CPU core pinning for containers. Maps to `disableNUMAPinning` in the config | `false` |
| `ENABLE_NVIDIA_GPU` | Enable legacy pass-through mode for Nvidia GPUs. Maps to `enableNvidiaGpu` in the config | `false` |
| `EXECUTOR_ID` | Executor identity exposed to the controllers. Defaults to the container IP address | container IP |

!!!danger "Default secrets are rejected"
    The executor container refuses to start when `CONTROLLER_SECRET` or `EXECUTOR_SECRET` is left at its default value. Set both secrets to strong values that match the controllers. You can use `pwgen -s 32` to generate them.

    For dev and test clusters only, set `ALLOW_DEFAULT_SECRETS=true` to explicitly acknowledge the risk and start with default values.

!!!note
    When `DEBUG=1`, the startup log masks the values of all security variables before printing the environment.

{!image_supply_chain.md!}

## Create systemd file
Create a `systemd` file. Put the following in `/etc/systemd/system/drove.executor.service`:
```systemd
[Unit]
Description=Drove Executor Service
After=docker.service
Requires=docker.service

[Service]
User=drove
Group=docker
TimeoutStartSec=0
Restart=always
ExecStartPre=-/usr/bin/docker pull ghcr.io/phonepe/drove-executor:latest
ExecStart=/usr/bin/docker run  \
    --env-file /etc/drove/executor/executor.env \
    --volume /etc/drove/executor:/etc/drove/executor:ro \
    --volume /var/log/drove/executor:/var/log/drove/executor \
    --volume /var/run/docker.sock:/var/run/docker.sock \
    --publish 11000:11000  \
    --publish 11001:11001 \
    --hostname %H \
    --rm \
    --name drove.executor \
    ghcr.io/phonepe/drove-executor:latest

[Install]
WantedBy=multi-user.target
```
Verify the file with the following command:
```shell
systemd-analyze verify drove.executor.service
```

Set permissions
```shell
chmod 664 /etc/systemd/system/drove.executor.service
```

## Start the service on all servers

Use the following to start the service:

```shell
systemctl daemon-reload
systemctl enable drove.executor
systemctl start drove.executor
```

You can tail the logs at `/var/log/drove/executor/drove-executor.log`.

The executor should now show up on the Drove Console.
