# Setting Up Zookeeper

We shall be running Zookeeper using the official Docker images. All data volumes etc will be mounted on the host machines.

The following ports will be exposed:

- `2181` - This is the main port for ZK clients to connect to the server
- `2888` - The port used by Zookeeper for in-cluster communications between peers
- `3888` - Port used for internal leader election
- `8080` - Admin server port. We are going to turn this off.

!!!danger
    The ZK admin server does not shut down cleanly from time to time. And is not needed for anything related to Drove. If not needed, you should turn it off.

We assume the following to be the IP for the 3 zookeeper nodes:

- 192.168.3.10
- 192.168.3.11
- 192.168.3.12

## Relevant directories
Location for data and logs are as follows:

- `/etc/drove/zk` - Configuration files
- `/var/lib/drove/zk/` - Data and data logs
- `/var/log/drove/zk` - Logs

### Important files

The zookeeper container stores snapshots, transaction logs and application logs on `/data`, `/datalog` and `/logs` directories respectively. We shall be volume mounting the following:

- `/var/lib/drove/zk/data` to `/data` on the container
- `/var/lib/drove/zk/datalog` to `/datalog` on the container
- `/var/logs/drove/zk` to `/logs` on the container

Docker will create these directories when container comes up for the first time.

!!!tip
    The zk server id (as set above using the `ZOO_MY_ID`) can _also_ be set by putting the server number in a file named `myid` in the `/data` directory.



!!!warning "Prerequisite Setup"
    If not done already, lease complete the [prerequisite setup](prerequisites.md) on all machines earmarked for the cluster.

## Setup configuration files

Let's create the config directory:

```shell
mkdir -p /etc/drove/zk
```

We shall be creating 3 different configuration files to configure zookeeper:

- `zk.env` - Environment variables to be used by zookeeper container
- `java.env` - Setup JVM related options
- `logbaxk.xml` - Logging configuration

### Setup environment variables

Let us prepare the configuration. Put the following in a file: `/etc/drove/zk/zk.env`:

```unixconfig

#(1)!
ZOO_TICK_TIME=2000
ZOO_INIT_LIMIT=10
ZOO_SYNC_LIMIT=5
ZOO_STANDALONE_ENABLED=false
ZOO_ADMINSERVER_ENABLED=false

#(2)!
ZOO_AUTOPURGE_PURGEINTERVAL=12
ZOO_AUTOPURGE_SNAPRETAINCOUNT=5

#(3)!
ZOO_MY_ID=1
ZOO_SERVERS=server.1=192.168.3.10:2888:3888;2181 server.2=192.168.3.11:2888:3888;2181 server.3=192.168.3.12:2888:3888;2181

```

1. This is cluster level configuration to ensure the cluster topology remains stable through minor flaps
2. This will control how much data we retain
3. This section needs to change per server. Each server should have a different `ZOO_MY_ID` set. And the same numbers get referred to in `ZOO_SERVERS` section.

!!!warning
    -  The `ZOO_MY_ID` value needs to be different on _every_ server.So it would be:
        - 192.168.3.10 - 1
        - 192.168.3.11 - 2
        - 192.168.3.12 - 3

    - The format for `ZOO_SERVERS` is `server.id=<address1>:<port1>:<port2>[:role];[<client port address>:]<client port>`.

!!!info
    Exhaustive set of options can be found on the [Official Docker Page](https://hub.docker.com/_/zookeeper/#configuration).


### Setup JVM parameters
Put the following in `/etc/drove/zk/java.env`

```shell
export SERVER_JVMFLAGS='-Djute.maxbuffer=0x9fffff -Xmx4g -Xms4g -Dfile.encoding=utf-8 -XX:+UseG1GC -XX:+UseNUMA -XX:+ExitOnOutOfMemoryError'
```

!!!danger "Configuring Max Data Size"
    Drove data per node can get a bit on the larger side from time to time depending on your application configuration. To be on the safe side, we need to increase the maximum data size per node. This is achieved by setting the JVM option `-Djute.maxbuffer=0x9fffff` on _all_ cluster nodes in Drove. This is 10MB (approx). The actual payload doesn't reach anywhere close. However we shall be picking up payload compression in a future version to stop this variable from needing to be set.
    
    For the Zookeeper Docker, the environment variable `SERVER_JVMFLAGS` needs to be set to `-Djute.maxbuffer=0x9fffff`.

    Please refer to [Zookeeper Advanced Configuration](https://zookeeper.apache.org/doc/r3.6.2/zookeeperAdmin.html) for further properties that can be tuned.

!!!tip "JVM Size"
    We set 4GB JVM heap size for ZK by adding appropriate options in `SERVER_JVMFLAGS`. Please make sure you have sized your machines to have 10-16GB of RAM at the very least. Tune the JVM size and machine size according to your needs.
q
!!!danger "`JVMFLAGS` environment variable"
    Do not set this variable in `zk.env`. Couple of reasons:

    - This will affect _both_ the zk server _as well as_ the client.
    - There is an [issue](https://stackoverflow.com/questions/56497140/zookeeper-ignores-jvmflags) and the flag (nor the `SERVER_JVMFLAGS`) are _not_ used properly by the startup scripts.

### Configure logging
We want to have physical log files on disk for debugging and audits and want the container to be ephemeral to allow for easy updates etc. To achieve this, put the following in `/etc/drove/zk/logback.xml`:

```xml
<!--
 Copyright 2022 The Apache Software Foundation

 Licensed to the Apache Software Foundation (ASF) under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  The ASF licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 Define some default values that can be overridden by system properties
-->
<configuration>
  <!-- Uncomment this if you would like to expose Logback JMX beans -->
  <!--jmxConfigurator /-->

  <property name="zookeeper.console.threshold" value="INFO" />

  <property name="zookeeper.log.dir" value="/logs" />
  <property name="zookeeper.log.file" value="zookeeper.log" />
  <property name="zookeeper.log.threshold" value="INFO" />
  <property name="zookeeper.log.maxfilesize" value="256MB" />
  <property name="zookeeper.log.maxbackupindex" value="20" />

  <!--
    console
    Add "console" to root logger if you want to use this
  -->
  <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
    <encoder>
      <pattern>%d{ISO8601} [myid:%X{myid}] - %-5p [%t:%C{1}@%L] - %m%n</pattern>
    </encoder>
    <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
      <level>${zookeeper.console.threshold}</level>
    </filter>
  </appender>

  <!--
    Add ROLLINGFILE to root logger to get log file output
  -->
  <appender name="ROLLINGFILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <File>${zookeeper.log.dir}/${zookeeper.log.file}</File>
    <encoder>
      <pattern>%d{ISO8601} [myid:%X{myid}] - %-5p [%t:%C{1}@%L] - %m%n</pattern>
    </encoder>
    <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
      <level>${zookeeper.log.threshold}</level>
    </filter>
    <rollingPolicy class="ch.qos.logback.core.rolling.FixedWindowRollingPolicy">
      <maxIndex>${zookeeper.log.maxbackupindex}</maxIndex>
      <FileNamePattern>${zookeeper.log.dir}/${zookeeper.log.file}.%i</FileNamePattern>
    </rollingPolicy>
    <triggeringPolicy class="ch.qos.logback.core.rolling.SizeBasedTriggeringPolicy">
      <MaxFileSize>${zookeeper.log.maxfilesize}</MaxFileSize>
    </triggeringPolicy>
  </appender>

  <!--
    Add TRACEFILE to root logger to get log file output
    Log TRACE level and above messages to a log file
  -->
  <!--property name="zookeeper.tracelog.dir" value="${zookeeper.log.dir}" />
  <property name="zookeeper.tracelog.file" value="zookeeper_trace.log" />
  <appender name="TRACEFILE" class="ch.qos.logback.core.FileAppender">
    <File>${zookeeper.tracelog.dir}/${zookeeper.tracelog.file}</File>
    <encoder>
      <pattern>%d{ISO8601} [myid:%X{myid}] - %-5p [%t:%C{1}@%L] - %m%n</pattern>
    </encoder>
    <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
      <level>TRACE</level>
    </filter>
  </appender-->

  <!--
    zk audit logging
  -->
  <property name="zookeeper.auditlog.file" value="zookeeper_audit.log" />
  <property name="zookeeper.auditlog.threshold" value="INFO" />
  <property name="audit.logger" value="INFO, RFAAUDIT" />

  <appender name="RFAAUDIT" class="ch.qos.logback.core.rolling.RollingFileAppender">
    <File>${zookeeper.log.dir}/${zookeeper.auditlog.file}</File>
    <encoder>
      <pattern>%d{ISO8601} %p %c{2}: %m%n</pattern>
    </encoder>
    <filter class="ch.qos.logback.classic.filter.ThresholdFilter">
      <level>${zookeeper.auditlog.threshold}</level>
    </filter>
    <rollingPolicy class="ch.qos.logback.core.rolling.FixedWindowRollingPolicy">
      <maxIndex>10</maxIndex>
      <FileNamePattern>${zookeeper.log.dir}/${zookeeper.auditlog.file}.%i</FileNamePattern>
    </rollingPolicy>
    <triggeringPolicy class="ch.qos.logback.core.rolling.SizeBasedTriggeringPolicy">
      <MaxFileSize>10MB</MaxFileSize>
    </triggeringPolicy>
  </appender>

  <logger name="org.apache.zookeeper.audit.Slf4jAuditLogger" additivity="false" level="${audit.logger}">
    <appender-ref ref="RFAAUDIT" />
  </logger>

  <root level="INFO">
    <appender-ref ref="CONSOLE" />
    <appender-ref ref="ROLLINGFILE" />
  </root>
</configuration>
```

!!!tip
    This is a customization of the original file from [Zookeeper source tree](https://github.com/apache/zookeeper/blob/branch-3.8/conf/logback.xml). Please refer to [documentation](https://zookeeper.apache.org/doc/r3.8.0/zookeeperAdmin.html#sc_logging) to configure logging.

## Create Systemd File

Create a `systemd` file. Put the following in `/etc/systemd/system/drove.zookeeper.service`:

```systemd
[Unit]
Description=Drove Zookeeper Service
After=docker.service
Requires=docker.service

[Service]
User=drove
TimeoutStartSec=0
Restart=always
ExecStartPre=-/usr/bin/docker pull zookeeper:3.8
ExecStart=/usr/bin/docker run \
    --env-file /etc/drove/zk/zk.env \
    --volume /var/lib/drove/zk/data:/data \
    --volume /var/lib/drove/zk/datalog:/datalog \
    --volume /var/log/drove/zk:/logs \
    --volume /etc/drove/zk/logback.xml:/conf/logback.xml \
    --volume /etc/drove/zk/java.env:/conf/java.env \
    --publish 2181:2181 \
    --publish 2888:2888 \
    --publish 3888:3888 \
    --rm \
    --name drove.zookeeper \
    zookeeper:3.8

[Install]
WantedBy=multi-user.target
```

Verify the file with the following command:
```shell
systemd-analyze verify drove.zookeeper.service
```

Set permissions
```shell
chmod 664 /etc/systemd/system/drove.zookeeper.service
```

## Start the service on all servers

Use the following to start the service:

```shell
systemctl daemon-reload
systemctl enable drove.zookeeper
systemctl start drove.zookeeper
```

You can check server status using the following:

```shell
echo srvr | nc localhost 2181
```

!!!tip
    Replace `localhost` on the above command with the actual ZK server IPs to test remote connectivity.

!!!note
    You can access the ZK client from the container using the following command:

    ```shell
    docker exec -it drove.zookeeper bin/zkCli.sh
    ```

    To connect to remote host you can use the following:
    ```shell
    docker exec -it drove.zookeeper bin/zkCli.sh -server <server name or ip>:2181
    ```
