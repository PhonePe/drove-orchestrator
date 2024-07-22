# Maintaining a Drove Cluster

There are a couple of constructs built into Drove to allow for easy maintenance.

- Cluster Maintenance Mode
- Executor node blacklisting

## Maintenance mode
Drove supports a _maintenance mode_ to allow for software updates without affecting the containers running on the cluster.

!!!danger
    In maintenance mode, outage detection is turned off and container failure for applications are not acted upon even if detected.

### Engaging maintenance mode
Set cluster to maintenance mode.

**Preconditions**
- Cluster must be in the following state: `MAINTENANCE`

=== "Drove CLI"
    ```shell
    drove -c local cluster maintenance-on
    ```
=== "JSON"

    **Sample Request**
    ```shell
    curl --location --request POST 'http://drove.local:7000/apis/v1/cluster/maintenance/set' \
    --header 'Authorization: Basic YWRtaW46YWRtaW4=' \
    --data ''
    ```

    **Sample response**
    ```js
    {
        "status": "SUCCESS",
        "data": {
            "state": "MAINTENANCE",
            "updated": 1721630351178
        },
        "message": "success"
    }
    ```

### Disengaging maintenance mode
Set cluster to normal mode.

**Preconditions**
- Cluster must be in the following state: `MAINTENANCE`

=== "Drove CLI"
    ```shell
    drove -c local cluster maintenance-off
    ```
=== "JSON"

    **Sample Request**

    ```shell
    curl --location --request POST 'http://drove.local:7000/apis/v1/cluster/maintenance/unset' \
    --header 'Authorization: Basic YWRtaW46YWRtaW4=' \
    --data ''
    ```

    **Sample response**
    ```js
    {
        "status": "SUCCESS",
        "data": {
            "state": "NORMAL",
            "updated": 1721630491296
        },
        "message": "success"
    }
    ```

## Updating drove version across the cluster quickly
We recommend the following sequence of steps:

1. Find the `leader` controller for the cluster using `drove ... cluster leader`.
2. Update the controller container on the nodes that are **not** the leader.

    > If you are using the systemd file given [here](controller.md#create-systemd-file), you just need to restart the controller service using `systemctl restart drove.controller`

3. Set cluster to maintenance mode using `drove ... cluster maintenance-on`.
4. Update the leader controller.

    > If you are using the systemd file given [here](controller.md#create-systemd-file), you just need to restart the leader controller service: `systemctl restart drove.controller`

5. Update the executors.

    > If you are using the systemd file given [here](executor-setup.md#create-systemd-file), you just need to restart all executors: `systemctl restart drove.executor`

6. Take cluster out of maintenance mode: `drove ... cluster maintenance-off`

## Executor blacklisting
In cases where we want to take an executor node out of the cluster for planned maintenance, we need to ensure application instances running on the node are replaced by containers on other nodes and the ones running here are shut down cleanly.

This is achieved by _blacklisting_ the node.

!!!tip
    Whenever blacklisting is done, it causes some flux in the application topology due to new container migration from blacklisted to normal nodes. To reduce the number of times this happens, plan to perform multiple operations togeter and blacklist and un-blacklist executors together.

    Drove will optimize bulk blacklisting related app migrations and will migrate containers together for an app only once rather than once for every node.

!!!danger
    Task instances are **not** migrated out. This is because it is impossible for Drove to know if a task can be migrated or not (i.e. killed and spun up on a new node in any order).

To blacklist executors do the following:

=== "Drove CLI"
    ```shell
    drove -c local executor blacklist dd2cbe76-9f60-3607-b7c1-bfee91c15623 ex1 ex2 
    ```
=== "JSON"

    **Sample Request**

    ```shell
    curl --location --request POST 'http://drove.local:7000/apis/v1/cluster/executors/blacklist?id=a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d&id=ex1&id=ex2' \
    --header 'Authorization: Basic YWRtaW46YWRtaW4=' \
    --data ''
    ```

    **Sample response**
    ```js
    {
        "status": "SUCCESS",
        "data": {
            "failed": [
                "ex2",
                "ex1"
            ],
            "successful": [
                "a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d"
            ]
        },
        "message": "success"
    }
    ```

To un-blacklist executors do the following:

=== "Drove CLI"
    ```shell
    drove -c local executor unblacklist dd2cbe76-9f60-3607-b7c1-bfee91c15623 ex1 ex2 
    ```
=== "JSON"

    **Sample Request**

    ```shell
    curl --location --request POST 'http://drove.local:7000/apis/v1/cluster/executors/unblacklist?id=a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d&id=ex1&id=ex2' \
    --header 'Authorization: Basic YWRtaW46YWRtaW4=' \
    --data ''
    ```

    **Sample response**
    ```js
    {
        "status": "SUCCESS",
        "data": {
            "failed": [
                "ex2",
                "ex1"
            ],
            "successful": [
                "a45442a1-d4d0-3479-ab9e-3ed0aa5f7d2d"
            ]
        },
        "message": "success"
    }
    ```

!!!note
    Drove **will not** re-evaluate placement of existing Applications in `RUNNING` state once executors are brought back into rotation.