# Setting up Controllers

Controllers are the brains of Drove cluster. For HA, at least 2 controllers should be set up.

Please note the following behaviour about controllers:

- _Only_ one controller is **leader** at a time. A leader controller does not relinquish control till the process is stopped or dies
- A controller process will die when it loses connectivity to Zookeeper
- The process/container for controller should keep restarting till it gets connectivity
- All decisions for the cluster are taken by the leader controller only
- During maintenance and package upgrades etc, it is better to roll changes out on non-leaders first and then do the leader at the end
- The controller process holds all metadata about the cluster, the current states and other information in memory.
    - Some of this information is backed by Zookeeper based storage layer
    - The other information is recreated dynamically based on updates from executors
- Controllers being down does not affect running containers on executors

## Controller Configuration File Reference
The Drove Controller is written on the [Dropwizard](https://www.dropwizard.io/en/release-2.1.x/) framework. The configuration to the service is set using a YAML file which needs to be injected into the container. A typical controller configuration file will look like the following:

```yaml
server: #(1)!
  applicationConnectors: #(2)!
    - type: http
      port: 4000
  adminConnectors: #(3)!
    - type: http
      port: 4001
  applicationContextPath: / #(4)!
  requestLog: #(5)!
    appenders:
      - type: console
        timeZone: ${DROVE_TIMEZONE}
      - type: file
        timeZone: ${DROVE_TIMEZONE}
        currentLogFilename: /logs/drove-controller-access.log
        archivedLogFilenamePattern: /logs/drove-controller-access.log-%d-%i
        archivedFileCount: 3
        maxFileSize: 100MiB


logging: #(6)!
  level: INFO
  loggers:
    com.phonepe.drove: ${DROVE_LOG_LEVEL}

  appenders:
    - type: console #(7)!
      threshold: ALL
      timeZone: ${DROVE_TIMEZONE}
      logFormat: "%(%-5level) [%date] [%logger{0} - %X{appId}] %message%n"
    - type: file #(8)!
      threshold: ALL
      timeZone: ${DROVE_TIMEZONE}
      currentLogFilename: /logs/drove-controller.log
      archivedLogFilenamePattern: /logs/drove-controller.log-%d-%i
      archivedFileCount: 3
      maxFileSize: 100MiB
      logFormat: "%(%-5level) [%date] [%logger{0} - %X{appId}] %message%n"
      archive: true


zookeeper: #(9)!
  connectionString: ${ZK_CONNECTION_STRING}

clusterAuth: #(10)!
  secrets:
  - nodeType: CONTROLLER
    secret: ${DROVE_CONTROLLER_SECRET}
  - nodeType: EXECUTOR
    secret: ${DROVE_EXECUTOR_SECRET}

userAuth: #(11)!
  enabled: true
  users:
    - username: admin
      password: ${DROVE_ADMIN_PASSWORD}
      role: EXTERNAL_READ_WRITE
    - username: guest
      password: ${DROVE_GUEST_PASSWORD}
      role: EXTERNAL_READ_ONLY

instanceAuth: #(12)!
  secret: ${DROVE_INSTANCE_AUTH_SECRET}

options: #(13)!
  maxStaleInstancesCount: 3
  staleCheckInterval: 1m
  staleAppAge: 1d
  staleInstanceAge: 18h
  staleTaskAge: 1d
  clusterOpParallelism: 4

```

1. Server listener configuration. See [Dropwizard Server Configuration](https://www.dropwizard.io/en/release-2.1.x/manual/configuration.html#servers){:target="_blank"} for the different options.
2. Main port configuration. This is where the UI and APIs will be exposed. Check connector configuration [docs](https://www.dropwizard.io/en/release-2.1.x/manual/configuration.html#connectors){:target="_blank"} for details.
3. Admin port. You can take thread dumps, metrics, run healthchecks on the Drove controller on this port.
4. Base path for UI. Keep this as is.
5. Access logs configuration. See `requestLog` [docs](https://www.dropwizard.io/en/release-2.1.x/manual/configuration.html#request-log){:target="_blank"}.
6. Main logging configuration. See [logging docs](https://www.dropwizard.io/en/release-2.1.x/manual/configuration.html#logging){:target="_blank"}.
7. Log to console. Useful in docker-compose.
8. Log to rotating files. Useful for running servers.
9. Configure how to connect to Zookeeper See [Zookeeper Config](#zookeeper-connection-configuration) for details.
10. Configuration for authentication between nodes in the cluster. Please check [intra node auth config](#intra-node-authentication-configuration) for details.
11.  Configure user authentication to access the cluster. Please check [User auth config](#user-authentication-configuration) for details.
12. Signing secret for JWT to be embedded in application and task instances. Check [Instance auth config](#instance-authentication-configuration) for details.
13. Special options to configure controller behaviour. See [Controller Options](#controller-options) for details.

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

!!!danger
    The values are passed in the header as is. Please manage the config file ownership to ensure that the files are not world readable.

!!!tip
    You can use `pwgen -s 32` to generate secure random strings for usage as secrets.

### User Authentication Configuration
This section is used to configure user details for human and other systems that need to call Drove APIs or access the Drove UI. This is implemented using basic auth.

The configuration consists of:

| Name | Option | Description |
|------|--------|-------------|
| Enabled | `enabled` | Enable basic auth for the cluster |
| Encoding | `encoding` | The actual encoding of the password. Can be `PLAIN` or `CRYPT` |
| Caching | `cachingPolicy` | Caching policy for the authentication and authorization of the user. Please check [CaffeineSpec](https://github.com/ben-manes/caffeine/wiki/Specification){:target = "_blank"} docs for more details. Set to `maximumSize=500, expireAfterAccess=30m` by default |
| List of users| `users` | A list of users recognized by the system |

Each entry in the user list consists of:

| Name | Option | Description |
|------|--------|-------------|
| User Name | `username` | The actual login username |
| Password | `password` | The password for the user. Needs to be set to bcrypt string of the actual password if `encoding` is set to `CRYPT` in the parent section. |
| User Role | `role` | The role of the user in the cluster. Can be `EXTERNAL_READ_WRITE` for users who have both read and write permissions or `EXTERNAL_READ_ONLY` for users with read-only permissions. |

**Sample**
```yaml
userAuth:
  enabled: true
  encoding: CRYPT
  users:
    - username: admin
      password: "$2y$10$pfGnPkYrJEGzasvVNPjRu.IJldV9TDa0Vh.u1UdimILWDuhvapc2O"
      role: EXTERNAL_READ_WRITE
    - username: guest
      password: "$2y$10$uCJ7WxIvd13C.1oOTs28p.xpJShGiTWuDLY/sGH9JE8nrkSGBFkc6"
      role: EXTERNAL_READ_ONLY
    - username: noread
      password: "$2y$10$8mr/zXL5rMW/s/jlBcgXHu0UvyzfdDDvyc.etfuoR.991sn9UOX/K"
```

!!!tip "No authentication"
    To configure a cluster without authentication, remove this section entirely.

!!!tip "Operator role"
    If `role` is not set, the user will be able to access the UI, but will _not_ have access to application logs. This comes in handy to provide access to other teams to explore your deployment topology, but not get access to your logs that might contain sensitive information.

!!!danger "Password Hashing"
    We strongly recommend using bcrypt passwords for authentication. You can use the following command to generate hashed password strings:

    ```shell
    htpasswd -nbBC 10 <username> <password>|cut -d ':' -f2
    ```

### Instance Authentication Configuration
All application and task instances, get access to an unique JWT that is injected into it by Drove as the environment variable `DROVE_APP_INSTANCE_AUTH_TOKEN`. This token is signed using a secret. This secret can be configured by setting the `secret` parameter in the `instanceAuth` section.

**Sample**
```yaml
instanceAuth:
  secret: RandomSecret
```

### Controller Options
The following options can be set to influence the behavior of the Drove cluster and the controller.

| Name | Option | Description |
|------|--------|-------------|
| Stale Check Interval | `staleCheckInterval` | Interval at which Drove checks for stale application and task metadata for cleanup. Defaults to 1 hour. Expressed in [duration](units.md#duration). |
| Stale App Age | `staleAppAge` | Apps in `MONITORING` state are cleaned up after some time by Drove. This variable can be used to control the max time for which such apps are maintained in the cluster. Defaults to 7 days. Expressed in [duration](units.md#duration). |
| Stale App Instances Count | `maxStaleInstancesCount` | Maximum number of application instances metadata for stopped or lost instances to be maintained in the cluster. Defaults to 100. |
| Stale Instance Age | `staleInstanceAge` | Maximum age for a stale application instance to be retained. Defaults to 7 days. Expressed in [duration](units.md#duration). |
| Stale Task Age | `staleTaskAge` | Maximum time for which metadata for a finished task is retained on the cluster. Defaults to 2 days. Expressed in [duration](units.md#duration). |
| Event Storage Duration | `maxEventsStorageDuration` | Maximum time for which cluster events are retained on the cluster. Defaults to 1 hour. Expressed in [duration](units.md#duration). |
| Default Operation Timeout | `clusterOpTimeout` | Timeout for operations that are initiated by drove itself. For example, instance spin up in case of executor failure, instance migrations etc. Defaults to 5 minutes. Expressed in [duration](units.md#duration). |
| Operation threads | `clusterOpParallelism` | Signified the parallelism for operations internal to the cluster. Defaults to: 1. Range: 1-32. |
| Audited Methods | `auditedHttpMethods` | Drove prints an audit log with user details when an api is called by an user. Defaults to `["POST", "PUT"]`. |
| Allowed mount directories | `allowedMountDirs` | If provided, Drove will ensure that application and task spec can mount only the directories mentioned in this set on executor host. |
| Disable read-only auth | `disableReadAuth` | When `userAuth` is enabled, setting this option, will enforce authorization only on write operations. |

**Sample**
```yaml
options:
  staleCheckInterval: 5m
  staleAppAge: 2d
  maxStaleInstancesCount: 20
  staleInstanceAge: 1d
  staleTaskAge: 2d
  maxEventsStorageDuration: 30m
  clusterOpParallelism: 32
  allowedMountDirs:
   - /mnt/scratch
```

#### Stale data cleanup
In order to keep internal memory footprint low, reduce the amount of data stored on Zookeeper, and provide a faster experience on the UI,Drove keeps cleaning up data for stale applications, application instances, task instances and cluster events.

The retention for such metadata can be controlled using the following config options:

- `staleAppAge`
- `maxStaleInstancesCount`
- `staleInstanceAge`
- `staleTaskAge`
- `maxEventsStorageDuration`

!!!warning
	Configuration changes done to these parameters will have direct impact on memory usage by the controller and memory and disk utilization on the Zookeeper cluster.

#### Internal Operations
Drove may need to create and issue operations on applications and tasks to manage cluster stability, for maintenance and other reasons. The following parameters can be used to control the speed and parallelism of such operations:

- `clusterOpTimeout`
- `clusterOpParallelism`

!!!tip
	The default value of `1` for the `clusterOpParallelism` parameter is generally too low for most clusters. Unless there is a specific problem, it would be advisable to set this to at least 4. If number of instances is quite high for applications (order of tens or hundreds), feel free to set this to 32.

	> Increasing `clusterOpParallelism` will make recovery faster in case of executor failures, but it will increase cpu utilization on the controller by a little bit.
	
#### Security related options

The `auditedHttpMethods` parameter contains a list of all HTTP methods that need to be audited. This means that if the `auditedHttpMethods` contains `POST` and `PUT`, any drove HTTP POST or PUT apis being called will lead to a audit in the controller logs with the details of the user that made the call.

!!!warning
	It would be advisable to not add `GET` to the list. This is because the UI keeps making calls to `GET` apis on drove to fetch data to render. These calls are automated and happen every few seconds from the browser. This _will_ blow up controller logs size.

The `allowedMountDirs` option whitelists only some directories to be mounted on containers. If this is not provided, containers will be able to mount any directory on the executors. 

!!!danger
	It is **highly** recommended to set `allowedMountDirs` to a designated directory that containers might want to use as scratch space if needed. Keeping this empty _will almost definitely_ cause security issues in the long run.

## Relevant directories
Location for data and logs are as follows:

- `/etc/drove/controller/` - Configuration files
- `/var/log/drove/controller/` - Logs

We shall be volume mounting the config and log directories with the same name.

!!!warning "Prerequisite Setup"
    If not done already, lease complete the [prerequisite setup](prerequisites.md) on all machines earmarked for the cluster.

## Setup the config file

Create a relevant configuration file in `/etc/drove/controller/controller.yml`.

**Sample**
```yaml
server:
  applicationConnectors:
    - type: http
      port: 10000
  adminConnectors:
    - type: http
      port: 10001
  requestLog:
    appenders:
      - type: file
        timeZone: IST
        currentLogFilename: /var/log/drove/controller/drove-controller-access.log
        archivedLogFilenamePattern: /var/log/drove/controller/drove-controller-access.log-%d-%i
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
      currentLogFilename: /var/log/drove/controller/drove-controller.log
      archivedLogFilenamePattern: /var/log/drove/controller/drove-controller.log-%d-%i
      archivedFileCount: 3
      maxFileSize: 100MiB
      logFormat: "%(%-5level) [%date] [%logger{0} - %X{appId}] %message%n"

zookeeper:
  connectionString: "192.168.56.10:2181"

clusterAuth:
  secrets:
  - nodeType: CONTROLLER
    secret: "0v8XvJrDc7r86ZY1QCByPTDPninI4Xii"
  - nodeType: EXECUTOR
    secret: "pOd9sIEXhv0wrGOVc7ebwNvR7twZqyTN"

userAuth:
  enabled: true
  encoding: CRYPT
  users:
    - username: admin
      password: "$2y$10$pfGnPkYrJEGzasvVNPjRu.IJldV9TDa0Vh.u1UdimILWDuhvapc2O"
      role: EXTERNAL_READ_WRITE
    - username: guest
      password: "$2y$10$uCJ7WxIvd13C.1oOTs28p.xpJShGiTWuDLY/sGH9JE8nrkSGBFkc6"
      role: EXTERNAL_READ_ONLY


instanceAuth:
  secret: "bd2SIgz9OMPG2L8wA6zxj21oLVLbuLFC"

options:
  maxStaleInstancesCount: 3
  staleCheckInterval: 1m
  staleAppAge: 2d
  staleInstanceAge: 1d
  staleTaskAge: 1d
  clusterOpParallelism: 4
  allowedMountDirs:
   - /dev/null
```

## Setup required environment variables
Environment variables need to run the drove controller are setup in `/etc/drove/controller/controller.env`.

```unixconfig
CONFIG_FILE_PATH=/etc/drove/controller/controller.yml
JAVA_PROCESS_MIN_HEAP=2g
JAVA_PROCESS_MAX_HEAP=2g
ZK_CONNECTION_STRING="192.168.3.10:2181"
JAVA_OPTS="-Xlog:gc:/var/log/drove/controller/gc.log -Xlog:gc:::filecount=3,filesize=10M -Xlog:gc::time,level,tags -XX:+UseNUMA -XX:+ExitOnOutOfMemoryError -Djava.security.egd=file:/dev/urandom -Dfile.encoding=utf-8 -Djute.maxbuffer=0x9fffff"
```


## Create systemd file
Create a `systemd` file. Put the following in `/etc/systemd/system/drove.controller.service`:

```systemd
[Unit]
Description=Drove Controller Service
After=docker.service
Requires=docker.service

[Service]
User=drove
TimeoutStartSec=0
Restart=always
ExecStartPre=-/usr/bin/docker pull ghcr.io/phonepe/drove-controller:latest
ExecStart=/usr/bin/docker run  \
    --env-file /etc/drove/controller/controller.env \
    --volume /etc/drove/controller:/etc/drove/controller:ro \
    --volume /var/log/drove/controller:/var/log/drove/controller \
    --publish 10000:10000  \
    --publish 10001:10001 \
    --hostname %H \
    --rm \
    --name drove.controller \
    ghcr.io/phonepe/drove-controller:latest

[Install]
WantedBy=multi-user.target
```

Verify the file with the following command:
```shell
systemd-analyze verify drove.controller.service
```

Set permissions
```shell
chmod 664 /etc/systemd/system/drove.controller.service
```

## Start the service on all servers

Use the following to start the service:

```shell
systemctl daemon-reload
systemctl enable drove.controller
systemctl start drove.controller
```

You can tail the logs at `/var/logs/drove/controller/drove-controller.log`.

The console would be available at `http://<ip>:10000` and admin functionality will be available on `http://<ip>:10001` according to the above config.

Health checks can be performed by running a curl as follows:

```shell
curl http://localhost:10001/healthcheck
```

!!!note
	- The healthcheck check api is available on `admin` port.
	- HTTP status is 200/OK if things are fine.

Once controllers are up, one of them will become the leader. You can check the leader by running the following command:

```shell
curl http://<ip>:10000/apis/v1/ping
```

Only on the leader you should get the following response along with a HTTP status 200/OK:
```js
{
	"status":"SUCCESS",
	"data":"pong",
	"message":"success"
}
```