# Local Service Operations

This page discusses operations relevant to local service management. Please read [Local Service States and Operations](index.md#local-service-states-and-operations) and [Local Service Instances](instances.md) before running lifecycle operations.

!!!note
    Please go through [Cluster Op Spec](#cluster-operation-specification) to understand operation parameters.

!!!note
    Only one operation can be active for a specific local service id at a time.

!!!warning
    Only the leader controller accepts write operations. Use the leader endpoint exposed via Drove Gateway.

!!!note
    For services created with `placementPolicy.hostLevel=true`, run restart/replace operations in stop-first mode to avoid host-port conflicts.

!!!tip
    Host-level services checklist:

    - Use `placementPolicy.type=LOCAL` and set `hostLevel=true` only when fixed host ports are required.
    - Keep `instancesPerHost=1` for host-level services.
    - Use `stopFirst=true` for restart/replace operations on host-level services.
    - Use `stopFirst=false` only for non-host-level services when rolling behavior is acceptable.

!!!note
    API operation payloads use the `opSpec` field. Some model classes/OpenAPI annotations may refer to `clusterOpSpec`; use `opSpec` in request JSON.

## How to initiate an operation

All local service lifecycle operations are issued via POST calls to `/apis/v1/localservices/operations` on the leader controller endpoint.

Sample API call:

```shell
curl --location 'http://drove.local:7000/apis/v1/localservices/operations' \
--header 'Content-Type: application/json' \
--header 'Authorization: Basic YWRtaW46YWRtaW4=' \
--data '{
    "type": "DEACTIVATE",
    "serviceId": "NODE_EXPORTER-1"
}'
```

!!!tip
    Use [Drove CLI](../cli/index.md) for manual operations.

{! cluster_ops.md !}

## How to cancel an operation

Operations can be requested to be cancelled asynchronously by calling `/apis/v1/localservices/operations/{serviceId}/cancel`.

```shell
curl --location --request POST 'http://drove.local:7000/apis/v1/localservices/operations/NODE_EXPORTER-1/cancel' \
--header 'Authorization: Basic YWRtaW46YWRtaW4=' \
--data ''
```

!!!warning
    Cancellation is asynchronous. Current execution chunk must complete before cancellation takes effect.

## Create a local service

Creates local service metadata and starts instances based on `instancesPerHost`.

**Preconditions:**

- Service id (`{name}-{version}`) must not already exist.
- Spec placement policy must be `LOCAL`.
- If `placementPolicy.hostLevel=true`, `instancesPerHost` must be `1`.

**State Transition:**

- none -> `INIT` -> `ACTIVATION_REQUESTED` -> `ACTIVE`

=== "Drove CLI"
    ```shell
    drove -c local localservices create sample/test_service.json --instances 1
    ```

=== "JSON"
    ```js
    {
        "type": "CREATE",
        "spec": { ... },
        "instancesPerHost": 1
    }
    ```

## Activate a local service

Starts instances for a previously inactive local service.

**Preconditions:**

- Service should be in `INACTIVE` activation state.

**State Transition:**

- `INACTIVE` -> `ACTIVATION_REQUESTED` -> `ACTIVE`

=== "Drove CLI"
    ```shell
    drove -c local localservices activate NODE_EXPORTER-1
    ```

=== "JSON"
    ```js
    {
        "type": "ACTIVATE",
        "serviceId": "NODE_EXPORTER-1"
    }
    ```

## Deactivate a local service

Stops local service instances without removing service metadata.

**Preconditions:**

- Service should exist.

**State Transition:**

- `ACTIVE` -> `DEACTIVATION_REQUESTED` -> `INACTIVE`

=== "Drove CLI"
    ```shell
    drove -c local localservices deactivate NODE_EXPORTER-1
    ```

=== "JSON"
    ```js
    {
        "type": "DEACTIVATE",
        "serviceId": "NODE_EXPORTER-1"
    }
    ```

## Update instances per host

Updates desired instance count on each executor.

**Preconditions:**

- Service must be in `ACTIVE` state.
- Not allowed for host-level services (`placementPolicy.hostLevel=true`).

**State Transition:**

- `ACTIVE` -> `UPDATING_INSTANCES_COUNT` -> `ADJUSTING_INSTANCES` -> `ACTIVE`

=== "Drove CLI"
    ```shell
    drove -c local localservices update NODE_EXPORTER-1 2
    ```

=== "JSON"
    ```js
    {
        "type": "UPDATE_INSTANCE_COUNT",
        "serviceId": "NODE_EXPORTER-1",
        "instancesPerHost": 2
    }
    ```

## Adjust instances

Triggers a reconciliation pass to align actual running instances with desired `instancesPerHost`.

**Preconditions:**

- Service must exist.

=== "JSON"
    ```js
    {
        "type": "ADJUST_INSTANCES",
        "serviceId": "NODE_EXPORTER-1",
        "opSpec": {
            "timeout": "5m",
            "parallelism": 16,
            "failureStrategy": "STOP"
        }
    }
    ```

## Restart a local service

Restarts all instances for a service.

For host-level services (`hostLevel=true`), use `stopFirst=true`.

**Preconditions:**

- Service must be in `ACTIVE` or `CONFIG_TESTING` state.

=== "Drove CLI"
    ```shell
    drove -c local localservices restart NODE_EXPORTER-1 --parallelism 16 --timeout 5m
    ```

=== "JSON"
    ```js
    {
        "type": "RESTART",
        "serviceId": "NODE_EXPORTER-1",
        "stopFirst": true,
        "opSpec": {
            "timeout": "5m",
            "parallelism": 16,
            "failureStrategy": "STOP"
        }
    }
    ```

!!!note
    With `stopFirst=false`, Drove attempts rolling replacement semantics. Use this only for non-host-level services.

## Replace specific instances

Replaces selected instances with fresh ones.

For host-level services (`hostLevel=true`), set `stopFirst=true`.

**Preconditions:**

- Service must be in `ACTIVE` or `CONFIG_TESTING` state.
- If `instanceIds` are provided, each id must correspond to a healthy instance.

=== "Drove CLI"
    ```shell
    drove -c local lsinstances replace NODE_EXPORTER-1 SI-123 SI-456 --parallelism 4
    ```

=== "JSON"
    ```js
    {
        "type": "REPLACE_INSTANCES",
        "serviceId": "NODE_EXPORTER-1",
        "instanceIds": ["SI-123", "SI-456"],
        "stopFirst": true,
        "opSpec": {
            "timeout": "5m",
            "parallelism": 4,
            "failureStrategy": "STOP"
        }
    }
    ```

## Stop specific instances

Stops selected instances for a local service.

**Preconditions:**

- Service must be in `ACTIVE` or `CONFIG_TESTING` state.
- Each `instanceId` must correspond to a healthy instance.

=== "Drove CLI"
    ```shell
    drove -c local lsinstances kill NODE_EXPORTER-1 SI-123 --parallelism 1
    ```

=== "JSON"
    ```js
    {
        "type": "STOP_INSTANCES",
        "serviceId": "NODE_EXPORTER-1",
        "instanceIds": ["SI-123"],
        "opSpec": {
            "timeout": "5m",
            "parallelism": 1,
            "failureStrategy": "STOP"
        }
    }
    ```

## Deploy test instance

Deploys a test instance for validation workflows.

**Preconditions:**

- Service must be in `INACTIVE` state.

=== "Drove CLI"
    ```shell
    drove -c local localservices conftest NODE_EXPORTER-1
    ```

=== "JSON"
    ```js
    {
        "type": "DEPLOY_TEST_INSTANCE",
        "serviceId": "NODE_EXPORTER-1"
    }
    ```

!!!note
    CLI command name is `conftest`. It maps to the `DEPLOY_TEST_INSTANCE` local service operation.

## Destroy a local service

Permanently removes local service metadata and remaining records.

**Preconditions:**

- Service must be in `INACTIVE` state.

**State Transition:**

- `INACTIVE` -> `DESTROY_REQUESTED` -> `DESTROYED` -> none

=== "Drove CLI"
    ```shell
    drove -c local localservices destroy NODE_EXPORTER-1
    ```

=== "JSON"
    ```js
    {
        "type": "DESTROY",
        "serviceId": "NODE_EXPORTER-1"
    }
    ```

!!!warning
    Destroy removes service metadata from Drove storage. Keep exported specs in source control.
