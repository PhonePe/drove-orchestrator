# Outage Detection and Recovery

Drove continuously tracks local service instances and reconciles actual state against desired service state.

## Instance health detection and tracking

Executor runs periodic readiness and health checks according to [local service specification](specification.md).

- Readiness checks gate transition into ready/healthy states.
- Health checks run periodically for already running instances.

Results of these checks (success/failure) are reported to controller and can trigger stop/replace/reconcile flows based on service state and active operation.

## Container crash

If a local service instance crashes, Drove reconciliation detects drift and attempts to restore desired instances per host.

## Executor node failure

When an executor becomes unavailable, instances on that node are marked lost from cluster perspective. On recovery, executor-controller reconciliation decides whether to keep or clean up containers based on current cluster truth.

## Executor service temporary unavailability

On restart, executor recovers container metadata and reports back to controller. Any stale or unexpected containers are handled through reconciliation.

## Zombie container detection and cleanup

Executor periodically reconciles local containers against controller state:

- containers running without corresponding desired metadata are cleaned up
- desired instances missing on host are marked lost and replaced according to service policy

## Behavior in maintenance and host blacklisting windows

- In maintenance mode, new write operations are rejected by leader controller.
- During executor blacklisting, local service placement/reconciliation may defer changes on affected nodes until cluster is in a stable state.

!!!note
    For planned node work, deactivate or adjust local services in advance to reduce unnecessary churn.
