# Security Profiles

Every container that Drove starts runs with a **security profile**. The profile decides what the container can do on its host: the directories it can mount, whether it runs privileged, the Linux capabilities it gets, and so on. This is step 4 of the [scheduling pipeline](scheduling.md).

## Why profiles exist

Not all workloads deserve the same trust. A one-off task that runs third-party code, a normal service, and a privileged ML workload have very different needs. The ML workload can need raw device access. One setting for the whole cluster is then too strict for the ML workload, or too loose for the task.

Drove solves this with policies on the controller. Each policy matches a group of deployables and gives them a profile.

## The policy model

A policy has two parts:

* A **match** - a list of rules of the form `(jobtype|*)/(*|name regex)`.
    * `jobtype` is `SERVICE`, `COMPUTATION`, `LOCAL_SERVICE`, or `*` for all.
    * The second part is `*` for all names, or a Java regex.
* A **profile** - the container settings to apply.

The name the regex matches depends on the deployable type:

| Deployable | Match name |
|------------|------------|
| Application | The application `name` from the spec. |
| Task | `sourceAppName/taskId` from the task spec. |
| Local service | The local service `name` from the spec. |

The controller goes through the policies **in order** and applies the first one that matches. Put specific rules before generic ones.

## The default profile

When no policy matches, the controller uses its default profile. The controller builds this profile from three controller options:

* `allowedMountDirs` - the directories that containers can mount.
* `disableCmdlArgs` - whether containers can take command line arguments.
* `enableRawDeviceAccess` - whether containers can access raw devices.

Lock these down on production clusters. Policies can then raise or lower permissions per group of deployables where needed.

## What a profile controls

* Mount directories - the host paths that the container can mount.
* Command line arguments - whether the container accepts arguments.
* Privileged mode - full host access for the containers that need it.
* Raw device access - access to block devices on the host.
* Linux capabilities - added and dropped capabilities, for example `SYS_ADMIN`.
* Open file limit - the maximum number of file descriptors.
* Seccomp profile - a custom seccomp profile for the container.

The full field table and YAML samples are in [Security policies](../cluster/setup/controller.md#security-policies).

## When the controller applies a profile

The controller resolves the profile when it plans the instance start. It sends the profile to the executor in the start message. The executor applies it when starting the container. A profile change does not touch containers that are already running - restart or redeploy instances to pick it up.
