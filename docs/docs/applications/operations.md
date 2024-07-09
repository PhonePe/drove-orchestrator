# Application Operations

This page discusses operations relevant to Application management. Please go over the [Application State Machine](index.md#application-state-machine) and [Application Instance State Machine](instances.md#application-instance-state-machine) to understand the different states an application (and it's instances) can be in and how operations applied move an application from one state to another.

!!!note
    Please go through [Cluster Op Spec](#cluster-operation-specification) to understand the operation parameters being sent.

!!!note
    Only one operation can be active on a particular `{appName,version}` combination.

!!!warning
    Only the leader controller will accept and process operations. To avoid confusion, use the controller endpoint exposed by Drove Gateway to issue commands.

## How to initiate an operation

!!!tip
    Use the [Drove CLI](https://github.com/PhonePe/drove-cli) to perform all manual operations.

All operations for application lifecycle management need to be issued via a POST HTTP call to the leader controller endpoint on the path `/apis/v1/applications/operations`. API will return HTTP OK/200 and relevant json response as payload.

Sample api call:

```shell
curl --location 'http://drove.local:7000/apis/v1/applications/operations' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic YWRtaW46YWRtaW4=' \
--data '{
    "type": "START_INSTANCES",
    "appId": "TEST_APP-3",
    "instances": 1,
    "opSpec": {
        "timeout": "5m",
        "parallelism": 32,
        "failureStrategy": "STOP"
    }
}'
```
!!!note
    In the above examples, `http://drove.local:7000` is the endpoint of the leader. `TEST_APP-3` is the [Application ID](index.md#application-id). Authorization is basic auth.

{! cluster_ops.md !}

## How to cancel an operation
Operations can be requested to be cancelled asynchronously. A POST call needs to be made to leader controller endpoint on the api `/apis/v1/operations/{applicationId}/cancel` (1) to achieve this.
{ .annotate }

1. `applicationId` is the [Application ID](index.md#application-id) for the application

```shell
curl --location --request POST 'http://drove.local:7000/apis/v1/operations/TEST_APP-3/cancel' \
--header 'Authorization: Basic YWRtaW46YWRtaW4=' \
--data ''
```

!!!warning
    Operation cancellation is not instantaneous. Cancellation will be affected only after current execution of the active operation is complete.

## Create an application
Before deploying containers on the cluster, an application needs to be created.

**Preconditions:**

- App should not exist in the cluster

**State Transition:** 

- none &#8594; `MONITORING`

To create an application, an [Application Spec](specification.md) needs to be created first. 

Once ready, CLI command needs to be issued or the following payload needs to be sent:

=== "Drove CLI"
    ```shell
    drove -c local apps create sample/test_app.json
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

    1. Spec as mentioned in [Application Specification](specification.md)
    2. Operation spec as mentioned in [Cluster Op Spec](#cluster-operation-specification)

    **Sample response**
    ```js
    {
        "data" : {
            "appId" : "TEST_APP-1"
        },
        "message" : "success",
        "status" : "SUCCESS"
    }
    ```
## Starting new instances of an application
New instances can be started by issuing the  `START_INSTANCES` command.

**Preconditions**
- Application must be in one of the following states: `MONITORING`, `RUNNING`

**State Transition:**

- {`RUNNING`, `MONITORING`} &#8594; `RUNNING`


The following command/payload will start `2` new instances of the application.

=== "Drove CLI"
    ```shell
    drove -c local apps deploy TEST_APP-1 2
    ```

=== "JSON"

    **Sample Request Payload**
    ```js
    {
        "type": "START_INSTANCES",
        "appId": "TEST_APP-1",//(1)!
        "instances": 2,//(2)!
        "opSpec": {//(3)!
            "timeout": "5m",
            "parallelism": 32,
            "failureStrategy": "STOP"
        }
    }
    ```

    1. Application ID
    2. Number of instances to be started
    3. Operation spec as mentioned in [Cluster Op Spec](#cluster-operation-specification)

    **Sample response**
    ```js
    {
        "status": "SUCCESS",
        "data": {
            "appId": "TEST_APP-1"
        },
        "message": "success"
    }
    ```
    
## Suspending an application
All instances of an application can be shut down by issuing the  `SUSPEND` command.

**Preconditions**
- Application must be in one of the following states: `MONITORING`, `RUNNING`

**State Transition:**

- {`RUNNING`, `MONITORING`} &#8594; `MONITORING`


The following command/payload will suspend all instances of the application.

=== "Drove CLI"
    ```shell
    drove -c local apps suspend TEST_APP-1
    ```

=== "JSON"

    **Sample Request Payload**
    ```js
    {
        "type": "SUSPEND",
        "appId": "TEST_APP-1",//(1)!
        "opSpec": {//(2)!
            "timeout": "5m",
            "parallelism": 32,
            "failureStrategy": "STOP"
        }
    }
    ```

    1. Application ID
    2. Operation spec as mentioned in [Cluster Op Spec](#cluster-operation-specification)

    **Sample response**
    ```js
    {
        "status": "SUCCESS",
        "data": {
            "appId": "TEST_APP-1"
        },
        "message": "success"
    }
    ```


## Scaling the application up or down
Scaling the application to required number of containers can be achieved using the `SCALE` command. Application can be either scaled up or down using this command.

**Preconditions**
- Application must be in one of the following states: `MONITORING`, `RUNNING`

**State Transition:**

- {`RUNNING`, `MONITORING`} &#8594; `MONITORING` if `requiredInstances` is set to 0
- {`RUNNING`, `MONITORING`} &#8594; `RUNNING` if `requiredInstances` is non 0



=== "Drove CLI"
    ```shell
    drove -c local apps scale TEST_APP-1 2
    ```

=== "JSON"

    **Sample Request Payload**
    ```js
    {
        "type": "SCALE",
        "appId": "TEST_APP-1", //(3)!
        "requiredInstances": 2, //(1)!
        "opSpec": { //(2)!
            "timeout": "1m",
            "parallelism": 20,
            "failureStrategy": "STOP"
        }
    }
    ```

    1. Absolute number of instances to be maintained on the cluster for the application
    2. Operation spec as mentioned in [Cluster Op Spec](#cluster-operation-specification)
    3. Application ID

    **Sample response**
    ```js
    {
        "status": "SUCCESS",
        "data": {
            "appId": "TEST_APP-1"
        },
        "message": "success"
    }
    ```
!!!note
    During scale down, older instances are stopped first

!!!tip
    If implementing automation on top of Drove APIs, just use the `SCALE` command to scale up or down instead of using `START_INSTANCES` or `SUSPEND` separately.
    
## Restarting an application
Application can be restarted by issuing the `REPLACE_INSTANCES` operation. In this case, first `clusterOpSpec.parallelism` number of containers are spun up first and then an equivalent number of them are spun down. This ensures that cluster maintains enough capacity is maintained in the cluster to handle incoming traffic as the restart is underway. 

!!!warning
    If the cluster does not have sufficient capacity to spin up new containers, this operation will get stuck. So adjust your parallelism accordingly.


**Preconditions**
- Application must be in `RUNNING` state.

**State Transition:**

- `RUNNING` &#8594; `REPLACE_INSTANCES_REQUESTED` &#8594; `RUNNING`

=== "Drove CLI"
    ```shell
    drove -c local apps restart TEST_APP-1
    ```

=== "JSON"

    **Sample Request Payload**
    ```js
    {
        "type": "REPLACE_INSTANCES",
        "appId": "TEST_APP-1", //(1)!
        "instanceIds": [], //(2)!
        "opSpec": { //(3)!
            "timeout": "1m",
            "parallelism": 20,
            "failureStrategy": "STOP"
        }
    }
    ```

    1. Application ID
    2. Instances that need to be restarted. This is optional. If nothing is passed, all instances will be replaced.
    3. Operation spec as mentioned in [Cluster Op Spec](#cluster-operation-specification)

    **Sample response**
    ```js
    {
        "status": "SUCCESS",
        "data": {
            "appId": "TEST_APP-1"
        },
        "message": "success"
    }
    ```

!!!tip
    To replace specific instances, pass their application instance ids (starts with `AI-...`) in the `instanceIds` parameter in the JSON payload.

## Stop or replace specific instances of an application
Application instances can be killed by issuing the `STOP_INSTANCES` operation. Default behaviour of Drove is to replace killed instances by new instances. Such new instances are always spun up _before_ the specified(old) instances are stopped. If `skipRespawn` parameter is set to true, the application instance is killed but _no new instances are spun up to replace it_.

!!!warning
    If the cluster does not have sufficient capacity to spin up new containers, and `skipRespawn` is not set or set to `false`, this operation will get stuck.

**Preconditions**
- Application must be in `RUNNING` state.

**State Transition:**

- `RUNNING` &#8594; `STOP_INSTANCES_REQUESTED` &#8594; `RUNNING` if final number of instances is non zero
- `RUNNING` &#8594; `STOP_INSTANCES_REQUESTED` &#8594; `MONITORING` if final number of instances is zero

=== "Drove CLI"
    ```shell
    drove -c local apps appinstances kill TEST_APP-1 AI-601d160e-c692-4ddd-8b7f-4c09b30ed02e
    ```

=== "JSON"

    **Sample Request Payload**
    ```js
    {
        "type": "STOP_INSTANCES",
        "appId" : "TEST_APP-1",//(1)!
        "instanceIds" : [ "AI-601d160e-c692-4ddd-8b7f-4c09b30ed02e" ],//(2)!
        "skipRespawn" : true,//(3)!
        "opSpec": {//(4)!
            "timeout": "5m",
            "parallelism": 1,
            "failureStrategy": "STOP"
        }
    }
    ```

    1. Application ID
    2. Instance ids to be stopped
    3. Do not spin up new containers to replace the stopped ones. This is set ot `false` by default.
    4. Operation spec as mentioned in [Cluster Op Spec](#cluster-operation-specification)

    **Sample response**
    ```js
    {
        "status": "SUCCESS",
        "data": {
            "appId": "TEST_APP-1"
        },
        "message": "success"
    }
    ```

## Destroy an application
To remove an application deployment (`appName`-`version` combo) the `DESTROY` command can be issued.

**Preconditions:**

- App should not exist in the cluster

**State Transition:** 

- `MONITORING` &#8594; `DESTROY_REQUESTED` &#8594; `DESTROYED` &#8594; none

To create an application, an [Application Spec](specification.md) needs to be created first. 

Once ready, CLI command needs to be issued or the following payload needs to be sent:

=== "Drove CLI"
    ```shell
    drove -c local apps destroy TEST_APP_1
    ```
=== "JSON"

    **Sample Request Payload**
    ```js
    {
        "type": "DESTROY",
        "appId" : "TEST_APP-1",//(1)!
        "opSpec": {//(2)!
            "timeout": "5m",
            "parallelism": 2,
            "failureStrategy": "STOP"
        }
    }
    ```

    1. Spec as mentioned in [Application Specification](specification.md)
    2. Operation spec as mentioned in [Cluster Op Spec](#cluster-operation-specification)

    **Sample response**
    ```js
    {
        "status": "SUCCESS",
        "data": {
            "appId": "TEST_APP-1"
        },
        "message": "success"
    }
    ```

!!!warning
    All metadata for an app and it's instances are completely obliterated from Drove's storage once an app is destroyed

