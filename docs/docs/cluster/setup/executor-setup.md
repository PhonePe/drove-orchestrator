# Setting up Executor Nodes

We shall setup the executor nodes by setting up the hardware, operating system first and then the executor service itself.

## Considerations and tuning for hardware and operating system

In the following sections we discus some aspects of scheduling, hardware and settings on the OS to ensure good performance.

### CPU and Memory considerations

The executor nodes are the servers that host and run the actual docker containers. Drove will take into consideration the NUMA topology of these machines to optimize the placement for containers to extract the maximum performance. Along with this, Drove will cpuset the containers to the allocated cores in a non overlapping manner, so that the cores allocated to a container are dedicated to it. Memory allocated to a container is pinned as well and selected from the same NUMA node.

There is an option to disable NUMA and core pinning. There are additional options to introduce core and memory multipliers. Once these are configured, core and memory pinning is turned off. Drove does not do any kind of burst scaling or overcommitment to ensure application performance remains predictable even under load. Instead, the multiplier based config can be used to reduce cpu wastage when running small containers. It needs to be noted here, that multipliers are configured at a executor host level. Hence nodes with multipliers should be properly tagged and deployments be done using `TAG` placement to put small containers on these nodes.

Adopting such a cluster topology will ensure that containers that need high performance run on nodes with NUM/Core pinning enabled and the smaller ones (like for example consoles etc) are run on separate nodes without pinning.

### Hyper-threading
Whether Hyper Threading needs to be enabled or not is a bit dependent on applications deployed and how effectively they can utilize individual CPU cores. For mixed workloads, we recommend Hyper Threading to be enabled on the system.

### Isolating container and OS processes
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
    Refer to [this](https://access.redhat.com/solutions/2884991) for more details.

### Storage consideration
On executor nodes the disk might be under pressure if container (re)deployments are frequent or the containers log very heavily. As such, we recommend the logging directory for Drove be mounted on hardware that will be able to handle this load. Similar considerations need to be given to the log and package directory for docker or podman.

## Executor Configuration Reference
The Drove Executor is written on the [Dropwizard](https://www.dropwizard.io/en/release-2.1.x/) framework. The configuration to the service is set using a YAML file which needs to be injected into the container. A typical controller configuration file will look like the following:

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

zookeeper: #(8)!
  connectionString: ${ZK_CONNECTION_STRING}

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
  enableNvidiaGpu: ${DROVE_ENABLE_NVIDIA_GPU}

options: #(11)!
  cacheImages: true
  maxOpenFiles: 10_000
  logBufferSize: 5m
  cacheFileSize: 10m
  cacheFileCount: 3

```

1. Server listener configuration. See [Dropwizard Server Configuration](https://www.dropwizard.io/en/release-2.1.x/manual/configuration.html#servers){:target="_blank"} for the different options.
2. Main port configuration. This is where the UI and APIs will be exposed. Check connector configuration [docs](https://www.dropwizard.io/en/release-2.1.x/manual/configuration.html#connectors){:target="_blank"} for details.
3. Admin port. You can take thread dumps, metrics, run healthchecks on the Drove controller on this port.
4. Logging configuration. See [logging docs](https://www.dropwizard.io/en/release-2.1.x/manual/configuration.html#logging){:target="_blank"}.
5. Log to console. Useful in docker-compose.
6. Log to rotating files. Useful for running servers.
7. Drove application logger configuration. See [drove logger config](#drove-application-logger-configuration) for details.
8. Configure how to connect to Zookeeper See [Zookeeper Config](#zookeeper-connection-configuration) for details.
9. Configuration for authentication between nodes in the cluster. Please check [intra node auth config](#intra-node-authentication-configuration) for details.
10. Resource configuration for this node.
11. Options to configure executor behaviour. Check [executor options](#executor-options) section for details.

!!!tip
	In case you do not want to expose admin apis to outside the host, please set `bindHost` in the admin connectors section.

	```yaml
	adminConnectors:
	  - type: http
	    port: 10001
	    bindHost: 127.0.0.1
	```

### Zookeeper Connection Configuration
The following details can be configured.

| Name              | Option             | Description                                                                                    |
|-------------------|--------------------|------------------------------------------------------------------------------------------------|
| Connection String | `connectionString` | The connection string of the form: `zkserver:2181,zkserver2:2181...`                           |
| Data namespace    | `namespace`        | The top level node inside which all Drove data will be scoped. Defaults to `drove` if not set. |

**Sample**

```yaml
zookeeper:
  connectionString: "192.168.3.10:2181,192.168.3.11:2181,192.168.3.12:2181"
  namespace: drovetest
```

!!!note
    This section is same across the cluster including both controller and executor.

### Intra Node Authentication Configuration
Communication between controller and executor is protected by a shared-secret based authentication. The following configuration is meant to configure this. This section consists of a list of 2 members:

* Config for controller to talk to executors
* Config for executors to talk to controller

Each section consists of the following:

| Name      | Option     | Description                                                    |
|-----------|------------|----------------------------------------------------------------|
| Node Type | `nodeType` | Type of node in the cluster. Can be `CONTROLLER` or `EXECUTOR` |
| Secret    | `secret`   | The actual secret to be passed.                                |

**Sample**
```yaml
clusterAuth:
  secrets:
  - nodeType: CONTROLLER
    secret: ControllerSecretValue
  - nodeType: EXECUTOR
    secret: ExecutorSecret
```

!!!note
    This section is same across the cluster including both controller and executor.

### Drove Application Logger Configuration
Drove will segregate application and task instance logs in a directory of your choice. The path for such files is set as:
- `<application id>/<instance id>` for Application Instances
- `<sourceAppName>/<task id>` for Task Instances

The Drove Log Appender is based of LogBack's [Sifting Appender](https://logback.qos.ch/manual/appenders.html#SiftingAppender).

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
|Nvidia GPU| `enableNvidiaGpu` | Enable GPU support on containers. This setting makes all available Nvidia GPUs on the current executor machine available for any container running on this executor. GPU resources are not discovered on the executor, managed and rationed between containers. Needs to be used in conjunction with tagging (see `tags` below) to ensure only the applications which require a GPU end up on the executor with GPUs.|
|Tags|`tags`| A set of strings that can be used in `TAG` placement policy to route application and task instances to this executor. |
|Over Provisioning|`overProvisioning`|Setup over provisioning configuration. If this is provided, `disableNUMAPinning` needs to be set to `true`.|


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

!!!danger "Things turned off"
    The following are **turned off** when `overProvisioning` is enabled:

    - OS cores reservation.
    - Drove will not ensure cores and memory allocated to a container come from same numa node
    - Drove will not be calling cpuset/memset on container to pin containers to cores

**Example:**
- Let's say your executor server has 40 cores available. If you set `cpuMultiplier` as 4, this will blow up to 0-159.
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
  disableNUMAPinning: true
  overProvisioning:
    enabled: true
    memoryMultiplier: 1
    cpuMultiplier: 3
```

!!!tip
    This feature was developed to allow us to run our development environments cheaper. In such environments there is not much pressure on CPU or memory, but a large number of containers run as developers can spin up containers for features they are working on. There was no point is wasting a full core on containers that get hit twice a minute or less. On production we tend to err on the side of caution and allocate at least one core even to the most trivial applications as of the time of writing this.

### Executor Options
The following options can be set to influence the behavior for the Drove executors.

| Name | Option | Description |
|------|--------|-------------|
|Hostname|`hostname`| Override the hostname that gets exposed to the controller. Make sure this is resolvable. |
|Cache Images|`cacheImages`| Cache container images. If this is not passed, a container image is removed when a container dies and no other instance is using the image.|
|Command Timeout|`containerCommandTimeout`|Timeout used by the container engine client when issuing container commands to `docker` or `podman`|
|Container Socket Path|`dockerSocketPath`| The path of socket for docker socket. Comes in handy to configure path for socket when using `podman` etc.|
|Max Open Files|`maxOpenFiles`| Override the maximum number of file descriptors a container can open. Default: 470,000|
|Log Buffer Size|`logBufferSize`|The size of the buffer the executor uses to read logs from container. Unit [DataSize](units.md#data-size). Range: 1-128MB. Default: 10MB|
|Cache File Size | `cacheFileSize` | To limit disk usage, configure fixed size log file cache for containers. Unit: [DataSize](units.md#data-size). Range: 10MB-100GB. Default: 20MB. Compression is always enabled.|
|Cache File Count | `cacheFileSize` | To limit disk usage, configure fixed count of log file cache for containers. Unit: `integer`. Max: 1024. Default: 3|

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


Create a relevant configuration file in `/etc/drove/controller/executor.yml`.

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

zookeeper:
  connectionString: "192.168.56.10:2181"

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
  cacheImages: true

```

## Setup required environment variables
Environment variables need to run the drove controller are setup in `/etc/drove/executor/executor.env`.

```unixconfig
CONFIG_FILE_PATH=/etc/drove/executor/executor.yml
JAVA_PROCESS_MIN_HEAP=1g
JAVA_PROCESS_MAX_HEAP=1g
ZK_CONNECTION_STRING="192.168.56.10:2181"
JAVA_OPTS="-Xlog:gc:/var/log/drove/executor/gc.log -Xlog:gc:::filecount=3,filesize=10M -Xlog:gc::time,level,tags -XX:+UseNUMA -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/urandom -Dfile.encoding=utf-8 -Djute.maxbuffer=0x9fffff"
```

## Create systemd file
Create a `systemd` file. Put the following in `/etc/systemd/system/drove.executor.service`:

```systemd
[Unit]
Description=Drove Executor Service
After=docker.service
Requires=docker.service

[Service]
User=drove
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

You can tail the logs at `/var/logs/drove/executor/drove-executor.log`.

The executor should now show up on the Drove Console.
