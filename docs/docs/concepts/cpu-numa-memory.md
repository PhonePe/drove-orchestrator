# CPU, NUMA and Memory

Drove gives every container its own CPU cores, and memory from a single NUMA node. This page explains how that works, and how performance scaling and over provisioning change the picture. It covers steps 2 and 3 of the [scheduling pipeline](scheduling.md).

## NUMA-aware allocation

A modern server has more than one NUMA node, each with its own cores and its own memory. Memory that belongs to another NUMA node is slower to reach.

The executor publishes the NUMA topology of its host to the controller when it starts. When the controller allocates resources for an instance, it takes the cores and the memory from **one** NUMA node. An instance never straddles nodes.

## Core and memory pinning

When the executor starts the container:

* The container gets a `cpuset` with the reserved cores. The cores are **dedicated** - no other container on that host gets them.
* The container gets a `cpuset-mem` with the memory of the same NUMA node.

This is also why the smallest CPU allocation is one core. Drove does not do fractional CPU. A container always runs on cores that it does not share. This rule keeps performance predictable.

## Keeping the operating system out of the way

Container cores must not compete with system processes. Two settings work together for this:

* `osCores` in the executor config lists the cores Drove must **not** hand to containers.
* systemd `CPUAffinity` pins the OS, the executor service and the container engine to those same cores.

The steps for this are in [Isolating container and OS processes](../cluster/setup/executor-setup.md#isolating-container-and-os-processes).

## Hyper-threading

Hyper-threading gives each physical core two hardware threads, and Drove treats each thread as a core. For mixed workloads, keep hyper-threading on. For workloads chasing the last bit of single-thread performance, measure both ways.

## Disabling NUMA pinning

`disableNUMAPinning` turns pinning off. All cores from all NUMA nodes show up as one pool. The container still gets a `cpuset`, but `cpuset-mem` is not set, so memory is no longer NUMA-local. Use this only when a single container needs more cores than one NUMA node has.

## Performance scaling

Hosts in one cluster are rarely equal. An Ice Lake host, for instance, is about 1.5x faster than a Skylake host.

`performanceScaling` tells the controller how much faster this host is than the **cluster baseline**:

* The controller divides the requested core count and memory by the scaling factor and rounds up. A spec asking for 3 cores reserves `ceil(3 / 1.5) = 2` cores on a host with `cpuScalingFactor: 1.5`.
* Scaling changes only what the controller **reserves**. The container always sees the full requested cores and memory.

Set the baseline to the slowest host family in the cluster and give faster hosts factors above 1.0. The options are in [Performance scaling configuration](../cluster/setup/executor-setup.md#performance-scaling-configuration).

## Over provisioning

Over provisioning trades guaranteed performance for density. The executor reports more cores and memory than the host really has:

* `cpuMultiplier` - each physical core produces that many vcores.
* `memoryMultiplier` - the executor multiplies the available memory by this value.

A 40-core host with `cpuMultiplier: 4` reports 160 cores, for example. Containers still get a `cpuset` on real cores from one NUMA node, but those cores are now shared between containers.

An executor runs either in pinned mode or in over-provisioned mode, never both. That keeps performance predictable on the hosts that need it.

Over provisioning fits dev, staging and test clusters well. On production hosts running critical workloads, keep it off. A common pattern for mixed clusters: tag one group of hosts with over provisioning on, and send the small, non-critical apps there with a `MATCH_TAG` policy. See [Placement Policies](placement-policies.md).

## Exposed memory

`exposedMemPercentage` caps how much host memory Drove reports to the controller. The rest stays for the OS, the executor and the container engine. The option is in [Resource Configuration](../cluster/setup/executor-setup.md#resource-configuration).
