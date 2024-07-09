# Outage Detection and Recovery
Drove tracks all instances for an app deployment in the cluster. It will ensure the required number of containers is _always_ running on the cluster.

## Instance health detection and tracking

Executor runs periodic health checks on the container according to [check spec](specification.md#check-specification) configuration.
- Runs _readiness checks_ to ensure container is started properly before declaring it healthy
- Runs _health checks_ on the container at regular intervals to ensure it is in operating condition

Behavior for both is configured by setting the appropriate options in the [application specification](specification.md).

Result of such health checks (both success and failure) are reported to the controller. Appropriate action is taken to shut down containers that fail readiness or health checks. 

## Container crash
If container for an application crashes, Drove will automatically spin up a container in it's place.

## Executor node hardware failure
If an executor node fails, instances running on that node will be lost. This is detected by the outage detector and new containers are spun up on other parts of the cluster.

## Executor service temporary unavailability
On restart, executor service reads the metadata embedded in the container and registers them. It performs a reconciliation with the leader controller to kill any local containers if the unavailability was too long and controller has already spun up new alternatives.

## Zombie (container) detection and cleanup
Executor service keeps track of all containers it is _supposed_ to run by running periodic reconciliation with the leader controller. Any mismatch gets handled:

- if a container is found that is _not_ supposed to be running, it is killed
- If a container that is supposed to be running is not found, it is marked as _lost_ and reported to the controller. This triggers the controller to spin up an alternative container on the cluster.

