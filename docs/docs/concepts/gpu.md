# GPU Scheduling

Drove can find the GPUs on an executor host and hand them to containers. A spec that lists `GPU` resources gets whole GPUs, or MIG slices, reserved for it. GPU allocation is step 2 of the [scheduling pipeline](scheduling.md).

The first part of this page explains how GPU scheduling works. The rest is the setup needed on the host.

## How GPU allocation works

With the managed GPU loader enabled, the executor finds all Nvidia GPUs on the host with `nvidia-smi`. The executor finds MIG slices as well. It registers them with the resource manager. The controller then allocates GPUs per container, based on the `GPU` resource requirements in the spec. Free and used GPU counts flow back to the controller. The executor publishes GPU metrics.

GPU hosts are specialised hosts. Tag them. Then use a `MATCH_TAG` placement policy to send GPU workloads to them. See [Placement Policies](placement-policies.md).

### NUMA locality

A host can have GPUs attached to more than one NUMA node. When the controller allocates GPUs, it prefers the NUMA node that has the most free GPUs local to it. The controller then picks GPUs local to that NUMA node first. This keeps the cores, memory and GPUs of a container on the same NUMA node when possible. See [CPU, NUMA and Memory](cpu-numa-memory.md) for how CPU cores and memory stay NUMA-local.

!!!warning "Experimental feature"
    GPU resource scheduling is experimental. Only `NVIDIA` GPUs are discovered and allocated today. Support for other vendors, including `AMD`, is planned.

## Setting up GPU hosts

Prerequisite: Docker version `19.0.3+`. Check [Docker versions and nvidia](https://github.com/NVIDIA/nvidia-docker/issues/1268){:target="_blank"} for details.

The steps below are for Ubuntu. For other distributions, use the linked guides.

### Install nvidia drivers on hosts

Ubuntu provides packaged drivers for nvidia.
[Driver installation Guide](https://ubuntu.com/server/docs/nvidia-drivers-installation){:target="_blank"}

Recommended
```
ubuntu-drivers list --gpgpu
ubuntu-drivers install --gpgpu nvidia:535-server
```

Alternatively, use `apt`. This method can require additional steps [Manual install](https://ubuntu.com/server/docs/nvidia-drivers-installation#installing-the-kernel-modules){:target="_blank"}
```
# Check for the latest stable version 
apt search nvidia-driver.*server
apt install -y nvidia-driver-535-server  nvidia-utils-535-server 
```

For other distros check [Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html#driver-installation){:target="_blank"}

### Install Nvidia-container-toolkit

Add nvidia repo

```
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg   && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list |     sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#' |     sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

apt install -y nvidia-container-toolkit
```
For other distros check guide [here](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html){:target="_blank"}

Configure docker with nvidia toolkit

```
nvidia-ctk runtime configure --runtime=docker

systemctl restart docker #Restart Docker
```

### Verify installation

On Host
`nvidia-smi -l` 
In docker container
`docker run --rm --runtime=nvidia --gpus all ubuntu nvidia-smi`

```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.86.10    Driver Version: 535.86.10    CUDA Version: 12.2     |
|-------------------------------+----------------------+----------------------+
| GPU  Name                    Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
|  Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  Tesla T4            On   | 00000000:00:1E.0 Off |                    0 |
| N/A   34C    P8     9W /  70W |      0MiB / 15109MiB |      0%      Default |
|                               |                      |                  N/A |
+-----------------------------------------------------------------------------+

+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID  Type    Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|  No running processes found                                                 |
+-----------------------------------------------------------------------------+
```
[Verification guide](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/sample-workload.html){:target="_blank"}

## Enable nvidia support on drove

Drove supports two modes for GPU support on executors. Both modes require the driver and toolkit setup above.

### Managed GPU discovery and allocation (recommended)

Enable the managed GPU loader in `drove-executor.yml` and restart drove-executor:
```
...
resources:
  ...
  nvidiaGPULoaderConfig:
    enabled: true
...
```

With this mode:

- The executor discovers all Nvidia GPUs on the host using `nvidia-smi`, including MIG slices.
- The executor registers the GPUs with the resource manager on the executor.
- The controller allocates GPUs per container to applications and tasks that specify `GPU` resources in their spec. See [Resource Requirements Specification](../applications/specification.md#resource-requirements-specification) for the spec format.
- The executor reports free and used GPU counts to the controller. The UI and APIs show these counts.
- The executor publishes GPU metrics when the loader is enabled. See [Cluster Metrics](../cluster/metrics.md) for details.

### Legacy pass-through mode (deprecated)

Enable Nvidia support in `drove-executor.yml` and restart drove-executor:
```
...
resources:
  ...
  enableNvidiaGpu: true
...
```

In this mode, the executor exposes all available Nvidia GPUs to _every_ container on that executor. The executor does not discover, manage or ration the GPUs between containers. Use this mode only with executor tagging. Then only GPU-requiring applications land on the executor.

!!!warning
    `enableNvidiaGpu` is deprecated. Use `nvidiaGPULoaderConfig` instead. `enableNvidiaGpu` and `nvidiaGPULoaderConfig` cannot be enabled at the same time.