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

## Setup configuration variables

Let us prepare the configuration. Put the following in a file: `/etc/drove/zk.env`:

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
ZOO_MY_ID=1 //(2)!
ZOO_SERVERS=server.1=192.168.3.10:2888:3888;2181 server.2=192.168.3.11:2888:3888;2181 server.3=192.168.3.12:2888:3888;2181

#(4)!
JVMFLAGS='-Djute.maxbuffer=0x9fffff -Xmx4g -Xms4g'
```

1. This is cluster level configuration to ensure the cluster topology remains stable through minor flaps
2. This will control how much data we retain
3. This section needs to change per server. Each server should have a different `ZOO_MY_ID` set. And the same numbers get referred to in `ZOO_SERVERS` section.
4. JVM Configuration and other configuration options. Please check notes below.

!!!warning
    -  The `ZOO_MY_ID` value needs to be different on _every_ server.So it would be:
        - 192.168.3.10 - 1
        - 192.168.3.11 - 2
        - 192.168.3.12 - 3

    - The format for `ZOO_SERVERS` is `server.id=<address1>:<port1>:<port2>[:role];[<client port address>:]<client port>`.

!!!info
    Exhaustive set of options can be found on the [Official Docker Page](https://hub.docker.com/_/zookeeper/#configuration).

!!!danger "Configuring Max Data Size"
    Drove data per node can get a bit on the larger side from time to time depending on your application configuration. To be on the safe side, we need to increase the maximum data size per node. This is achieved by setting the JVM option `-Djute.maxbuffer=0x9fffff` on _all_ cluster nodes in Drove. This is 10MB (approx). The actual payload doesn't reach anywhere close. However we shall be picking up payload compression in a future version to stop this variable from needing to be set.
    
    For the Zookeeper Docker, the environment variable `JVMFLAGS` needs to be set to `-Djute.maxbuffer=0x9fffff`.

    Please refer to [Zookeeper Advanced Configuration](https://zookeeper.apache.org/doc/r3.6.2/zookeeperAdmin.html) for further properties that can be tuned.

!!!tip "JVM Size"
    We set 4GB JVM heap size for ZK by adding appropriate options in `JVMFLAGS`. Please make sure you have sized your machines to have 10-16GB of RAM at the very least. Tune the JVM size and machine size according to your needs.

## Data Storage

The zookeeper container stores snapshots, transaction logs and application logs on `/data`, `/datalog` and `/logs` directories respectively. We shall be volume mounting the following:

- `/var/lib/drove/zk/data` to `/data` on the container
- `/var/lib/drove/zk/datalog` to `/datalog` on the container
- `/var/logs/drove/zk` to `/logs` on the container

Docker will create these directories when container comes up for the first time.

!!!tip
    The zk server id (as set above using the `ZOO_MY_ID`) can _also_ be set by putting the server number in a file named `myid` in the `/data` directory.

## Create Systemd File

Create a `systemd` file. Put the following in `/etc/systemd/system/drove.zookeeper.service`:

```systemd
[Unit]
Description=Drove Zookeeper Service
After=docker.service
Requires=docker.service

[Service]
TimeoutStartSec=0
Restart=always
ExecStartPre=/usr/bin/docker pull zookeeper:3.7
ExecStart=/usr/bin/docker run \
    --env-file /etc/drove/zk.env \
    --volume /var/lib/drove/zk/data:/data \
    --volume /var/lib/drove/zk/datalog:/datalog \
    --volume /var/log/drove/zk:/logs \
    --publish 2181:2181 \
    --publish 2888:2888 \
    --publish 3888:3888 \
    --restart always \
    --name %n \
    zookeeper:3.7

[Install]
WantedBy=multi-user.target
```

## Start the service on all servers

Use the following to start the service:

```shell
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
