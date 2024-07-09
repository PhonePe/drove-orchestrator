# Setting up Executor Nodes

We shall setup the executor nodes by setting up the hardware, operating system first and then the executor service itself.

## CPU considerations

The executor nodes are the servers that host and run the actual docker containers. Drove will use the NUMA topology of these machines to optimize the placement for containers to extract the maximum performance.

### Hyper-threading
Whether Hyper Threading needs to be enabled or not is a bit dependent on applications deployed and how effectively they can utilize individual CPU cores. For mixed workloads, we recommend Hyper Threading to be enabled on the system.

### Isolating container and OS processes
Typically we would not want containers to share CPU resources with processes for the operating system, Drove Executor Service as well as Docker engine (if using docker) and so on. While complete isolation would need creating a full scheduler (and passing `isolcpus` to GRUB parameters), we can get a good middle ground by ensuring such processes utilize only a few CPU cores on the system, and let the Drove executors deploy and pin containers to the rest.

This is achieved in two steps:

- Make changes to systemd to use only specific cores
- Exclude these cores in the drove executor configuration

Let's say our server has 2 NUMA nodes, each with 40 hyper-threaded cores. We want to reserve the first 2 cores from each CPU to the OS processes. So we reserve cores `[0,1,2,3]` for the OS processes.

The following line in `/etc/systemd/system.conf`

```property
#CPUAffinity=
```

needs to be changed to

```property
CPUAffinity=0 1 2 3
```

!!!tip
    Reboot the machine for this to take effect.

The changes can be validated post reboot by running the following command:

```shell
grep Cpus_allowed_list /proc/1/status
```

The expected output should be:
```text
Cpus_allowed_list:	0-3
```
!!!note
    Refer to [this](https://access.redhat.com/solutions/2884991) for more details.

<!-- Once this is done, we can configure Drove executor YAML to skip these cores during container allocation by adding the following:

```yaml
resources:
  ...
  osCores: [ 0, 1, 2, 3 ]
  ...
```

!!!tip
    Restart the executor service for this to take effect.

    ```shell
    systemctl restart drove-executor
    ``` -->

## Storage consideration
On executor nodes the disk might be under pressure if container (re)deployments are frequent or the containers log very heavily. As such, we recommend the logging directory for Drove be mounted on hardware that will be able to handle this load. Similar considerations need to be given to the log and package directory for docker or podman.