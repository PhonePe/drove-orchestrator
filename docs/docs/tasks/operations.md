# Task Operations

This page discusses operations relevant to Task management. Please go over the [Task State Machine](index.md#task-state-machine) to understand the different states a task  can be in and how operations applied (and external changes) move a task from one state to another.

!!!note
    Please go through [Cluster Op Spec](#cluster-operation-specification) to understand the operation parameters being sent.

    For tasks only the `timeout` parameter is relevant.

!!!note
    Only one operation can be active on a particular task identified by a `{sourceAppName,taskId}` at a time.

!!!warning
    Only the leader controller will accept and process operations. To avoid confusion, use the controller endpoint exposed by Drove Gateway to issue commands.

{!cluster_ops.md!}


## How to initiate an operation

!!!tip
    Use the [Drove CLI](https://github.com/PhonePe/drove-cli) to perform all manual operations.

All operations for task lifecycle management need to be issued via a POST HTTP call to the leader controller endpoint on the path `/apis/v1/tasks/operations`. API will return HTTP OK/200 and relevant json response as payload.

Sample api call:

```shell
curl --location 'http://drove.local:7000/apis/v1/tasks/operations' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic YWRtaW46YWRtaW4=' \
--data '{
    "type": "KILL",
    "sourceAppName" : "TEST_APP",
    "taskId" : "T0012",
    "opSpec": {
        "timeout": "5m",
        "parallelism": 1,
        "failureStrategy": "STOP"
    }
}'
```
!!!note
    In the above examples, `http://drove.local:7000` is the endpoint of the leader. `TEST_APP` is the `name` of the [application](../applications/index.md) that started this task and `taskId` is a unique client generated id. Authorization is basic auth.

!!!warning
    Task operations are not cancellable.

## Create a task
A task can be created issuing the following command.

**Preconditions:**
- Task with same `{sourceAppName,taskId}` should not exist on the cluster.

**State Transition:**

- none &#8594; `PENDING` &#8594; `PROVISIONING` &#8594; `STARTING` &#8594; `RUNNING` &#8594; `RUN_COMPLETED` &#8594; `DEPROVISIONING` &#8594; `STOPPED`

To create a task a [Task Spec](specification.md) needs to be created first.

Once ready, CLI command needs to be issued or the following payload needs to be sent:

=== "Drove CLI"
    ```shell
    drove -c local tasks create sample/test_task.json
    ```
=== "JSON"

    **Sample Request Payload**
    ```js
    {
        "type": "CREATE",
        "spec": {...}, //(1)!
        "opSpec": { //(2)!
            "timeout": "5m",
            "parallelism": 1,
            "failureStrategy": "STOP"
        }
    }
    ```

    1. Spec as mentioned in [Task Specification](specification.md)
    2. Operation spec as mentioned in [Cluster Op Spec](#cluster-operation-specification)

    **Sample response**
    ```js
    {
        "status": "SUCCESS",
        "data": {
            "taskId": "TEST_APP-T0012"
        },
        "message": "success"
    }
    ```

!!!warning
    There are no separate create/run steps in a task. Creation will start execution _automatically and immediately_.

## Kill a task
A task can be created issuing the following command.

**Preconditions:**
- Task with same `{sourceAppName,taskId}` needs to exist on the cluster.

**State Transition:**

- `RUNNING` &#8594; `RUN_COMPLETED` &#8594; `DEPROVISIONING` &#8594; `STOPPED`

CLI command needs to be issued or the following payload needs to be sent:

=== "Drove CLI"
    ```shell
    drove -c local tasks kill TEST_APP T0012
    ```
=== "JSON"

    **Sample Request Payload**
    ```js
    {
        "type": "KILL",
        "sourceAppName" : "TEST_APP",//(1)!
        "taskId" : "T0012",//(2)!
        "opSpec": {//(3)!
            "timeout": "5m",
            "parallelism": 1,
            "failureStrategy": "STOP"
        }
    }
    ```

    1. Source app name as mentioned in spec during task creation
    2. Task ID as mentioned in the spec
    3. Operation spec as mentioned in [Cluster Op Spec](#cluster-operation-specification)

    **Sample response**
    ```js
    {
        "status": "SUCCESS",
        "data": {
            "taskId": "T0012"
        },
        "message": "success"
    }
    ```

!!!note
    Task metadata _will_ remain on the cluster for some time. Metadata cleanup for tasks is automatic and can be configured in the controller configuration.

