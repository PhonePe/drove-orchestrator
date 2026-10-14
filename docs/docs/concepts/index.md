# Concepts

Drove has two main goals: predictable container performance, and simple operations as the cluster grows. This section explains how Drove works and why.

Each page below explains one concept:

* [Cluster Anatomy](cluster.md) - the parts of a Drove cluster, and what each part does.
* [Scheduling](scheduling.md) - the steps Drove takes, from picking an executor to starting a container.
* [Placement Policies](placement-policies.md) - how Drove picks the executor for an instance.
* [CPU, NUMA and Memory](cpu-numa-memory.md) - how Drove reserves, pins and scales CPU and memory.
* [GPU Scheduling](gpu.md) - how Drove finds GPUs and hands them to containers.
* [Security Profiles](security-profiles.md) - what a container can do on its host.

These pages explain concepts only. The options, defaults and setup steps are in the [Setup](../cluster/setup/planning.md) section. Each concept page links to the page that documents the related options.
