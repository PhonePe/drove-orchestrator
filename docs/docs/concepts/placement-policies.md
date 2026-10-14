# Placement Policies

A placement policy decides the executor for an instance of an application, task or local service. It is the first step of the [scheduling pipeline](scheduling.md).

## Why placement exists

A cluster has many executors, and Drove has to pick one for every new instance. What counts as a good pick depends on the workload:

* **Spreading load.** If all instances of an application run on one host, one host failure takes the whole application down.
* **Targeting special hardware.** Some hosts have GPUs, fast disks or an unusual CPU family. Instances that need them must land there, not elsewhere.
* **Avoiding special hosts.** Some hosts are set aside for specific workloads. Keep all other workloads off them.

Drove offers the policy types below for applications and tasks. Set the policy per deployable, in the spec. Local services are an exception. They must use the `LOCAL` policy.

## The policy types

* **`ANY`** - any host that has no special tags. The right default for most workloads.
* **`ONE_PER_HOST`** - at most one instance per host for the same `{appName, version}`. Useful for spreading critical services.
* **`MAX_N_PER_HOST`** - at most N instances per host. A softer version of one per host, for small instances.
* **`MATCH_TAG`** - only hosts that carry a given tag. The way to target special hardware.
* **`NO_TAG`** - only hosts with no extra tags. Keeps workloads off specialised hosts.
* **`COMPOSITE`** - a list of policies plus a combiner. The combiner `AND` requires every policy to match. The combiner `OR` requires one policy to match.
* **`RULE_BASED`** - a [CEL](https://cel.dev/){:target="_blank"} expression that looks at the candidate host and returns true or false. The most flexible option, and the easiest one to misuse.

The option tables, samples and the full CEL context reference are in the [Placement Policy Specification](../applications/specification.md#placement-policy-specification).

## Tags

Tags do most of the work in non-trivial placement.

* Every host always carries its own **hostname** as a tag, so `MATCH_TAG` can target one specific host.
* Any other tag turns a host into a **specialised host**. Drove adds a `NO_TAG` condition to `ANY`, `ONE_PER_HOST` and `MAX_N_PER_HOST`. These policies then skip specialised hosts. Use `MATCH_TAG` or a `RULE_BASED` rule to target them.
* Tags are set in the [executor resource configuration](../cluster/setup/executor-setup.md#resource-configuration).

The practical rule that follows: leave general hosts untagged, and tag the hosts that have special hardware or serve a special purpose.

## What a policy covers

All policies work per `{appName, version}` combination. They do not hold across versions of the same application. Two deployments of the same app at different versions can still share a host under `ONE_PER_HOST`. The same applies to N per host and the rest.

## `RULE_BASED` in brief

The rule is a CEL expression. It sees one candidate host at a time through `ctx.allocation.node`. This field gives the rule the executor ID, hostname, tags and metadata. The rule also sees the deployment spec and the current session state. It must return a boolean. Drove uses the host only when the rule returns `true`.

CEL is not Turing complete. There are no loops, no recursion and no side effects. Hard limits on iterations, regex size and expression length keep bad rules from hurting the controller.

Try a rule with the [Placement Simulation API](../apis/cluster.md#simulate-placement) against the live cluster before deploying it.

!!!tip
    It is easy to write a rule so strict that no host matches. Keep rules simple. Most clusters do fine with `ANY` plus a few `MATCH_TAG` targets for special hardware.
