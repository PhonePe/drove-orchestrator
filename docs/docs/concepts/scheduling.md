# Scheduling

Every application, task or local service instance goes through the same steps before it runs. The controller handles some of them, the executor the rest.

## The scheduling pipeline

To start a new instance, Drove works through four steps in this order:

1. **Pick an executor.** The leader controller filters the available executors with the placement policy from the spec. The details are in [Placement Policies](placement-policies.md).
2. **Reserve resources.** The controller picks the cores, memory and GPUs for the instance. It keeps the allocation inside one NUMA node and applies the host performance scaling factors. See [CPU, NUMA and Memory](cpu-numa-memory.md) and [GPU Scheduling](gpu.md).
3. **Pin the container.** The executor starts the container with a `cpuset` and `cpuset-mem`. No other container on that host gets the same cores or memory. See [CPU, NUMA and Memory](cpu-numa-memory.md).
4. **Apply the security profile.** The container starts with the security profile that matches its deployable. See [Security Profiles](security-profiles.md).

Any of these steps can fail. When one fails, the controller moves on to another executor, or it retries the same one. The [operation options](../cluster/setup/controller.md#controller-options) control how long and how often the controller retries.

## Who does what

The split of work between controller and executor is deliberate.

The **controller** owns the cluster view. It tracks the topology and the free and used resources. Only the leader controller places instances. It picks the executor and works out the exact cores, memory and GPUs. It then sends a start message with that data to the executor.

The **executor** owns the containers. It pulls the image and starts the container with the pins the controller sent. It runs the readiness and health checks. It reports every state change back to the controller.

Executors stay stateless because of this split. A restart of an executor does not affect the containers it runs. [Cluster Anatomy](cluster.md) lists the full responsibilities of each component.

## Where to configure what

| Decision | Made by | Where to set it |
|----------|---------|----------------|
| Which executors are eligible | Placement policy | [Application](../applications/specification.md#placement-policy-specification) and [task](../tasks/specification.md#placement-policy-specification) specs |
| How many resources a host reports | Executor | [Resource Configuration](../cluster/setup/executor-setup.md#resource-configuration) |
| How cores and memory are reserved | Controller allocation logic | [CPU, NUMA and Memory](cpu-numa-memory.md) |
| What a container can do on the host | Controller security policies | [Security policies](../cluster/setup/controller.md#security-policies) |
