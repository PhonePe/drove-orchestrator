# Setting Up The Zookeeper Cluster

We shall be running Zookeeper using the official Docker images. All data volumes etc will be mounted on the host machines.

The following ports will be exposed:

- `2181` - This is the main port for ZK clients to connect to the server
- `2888` - The port used by Zookeeper for in-cluster communications between peers
- `3888` - Port used for internal leader election
- `8080` - Admin server port

We assume the following to be the IP for the 3 zookeeper nodes:

- 192.168.3.10
- 192.168.3.11
- 192.168.3.12

## Setup configuration variables

Let us prepare the configuration. Put the following in a file: `/etc/drove/zk.env`:

```unixconfig
ZOO_TICK_TIME=2000
ZOO_INIT_LIMIT=5
ZOO_SYNC_LIMIT=2
ZOO_STANDALONE_ENABLED=true
ZOO_ADMINSERVER_ENABLED=true

ZOO_AUTOPURGE_PURGEINTERVAL=12
ZOO_AUTOPURGE_SNAPRETAINCOUNT=5

ZOO_MY_ID=1
ZOO_SERVERS=server.1=192.168.3.10:2888:3888;2181 server.2=192.168.3.11:2888:3888;2181 server.3=192.168.3.12:2888:3888;2181
```

!!!warning
    -  The `ZOO_MY_ID` value needs to be different on _every_ server.So it would be:
        - 192.168.3.10 - 1
        - 192.168.3.11 - 2
        - 192.168.3.12 - 3

    - The format for `ZOO_SERVERS` is `server.id=<address1>:<port1>:<port2>[:role];[<client port address>:]<client port>`.

!!!info
    Exhaustive set of options can be found on the [Official Docker Page](https://hub.docker.com/_/zookeeper/#configuration).

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
Description=Drove Zookeeper Container
After=docker.service
Requires=docker.service

[Service]
TimeoutStartSec=0
Restart=always
ExecStartPre=/usr/bin/docker pull zookeeper:3.7
ExecStart=/usr/bin/docker run --env-file /etc/drove/zk.env 
    -v /var/lib/drove/zk/data:/data 
    -v /var/lib/drove/zk/datalog:/datalog
    -v /var/log/drove/zk:/logs
    --network host
    --restart always --name %n zookeeper:3.7

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
