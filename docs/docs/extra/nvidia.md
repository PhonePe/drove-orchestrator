# Setting up Nvidia GPU computation on executor

Prerequisite: Docker version `19.0.3+`. Check [Docker versions and nvidia](https://github.com/NVIDIA/nvidia-docker/issues/1268){:target="_blank"} for details.

Below steps are for ubuntu primarily for other distros check the associated links.

## Install nvidia drivers on hosts

Ubuntu provides packaged drivers for nvidia.
[Driver installation Guide](https://ubuntu.com/server/docs/nvidia-drivers-installation){:target="_blank"}

Recommended
```
ubuntu-drivers list --gpgpu
ubuntu-drivers install --gpgpu nvidia:535-server
```

Alternatively `apt` can be used, but may require additional steps [Manual install](https://ubuntu.com/server/docs/nvidia-drivers-installation#installing-the-kernel-modules){:target="_blank"}
```
# Check for the latest stable version 
apt search nvidia-driver.*server
apt install -y nvidia-driver-535-server  nvidia-utils-535-server 
```

For other distros check [Guide](https://docs.nvidia.com/cuda/cuda-installation-guide-linux/index.html#driver-installation){:target="_blank"}

## Install Nvidia-container-toolkit

Add nvidia repo

```
curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg   && curl -s -L https://nvidia.github.io/libnvidia-container/stable/deb/nvidia-container-toolkit.list |     sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' |     sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

apt install -y nvidia-container-toolkit
```
For other distros check guide [here](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/install-guide.html){:target="_blank"}

Configure docker with nvidia toolkit

```
nvidia-ctk runtime configure --runtime=docker

systemctl restart docker #Restart Docker
```

## Verify installation

On Host
`nvidia-smi -l` 
In docker container
`docker run --rm --runtime=nvidia --gpus all ubuntu nvidia-smi`

```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.86.10    Driver Version: 535.86.10    CUDA Version: 12.2     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  Tesla T4            On   | 00000000:00:1E.0 Off |                    0 |
| N/A   34C    P8     9W /  70W |      0MiB / 15109MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+

+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|  No running processes found                                                 |
+-----------------------------------------------------------------------------+
```
[Verification guide](https://docs.nvidia.com/datacenter/cloud-native/container-toolkit/latest/sample-workload.html){:target="_blank"}

## Enable nvidia support on drove

Enable Nvidia support in drove-executor.yml and restart drove-executor
```
...
resources:
  ...
  enableNvidiaGpu: true
...
```

