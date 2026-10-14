# Cluster Metrics
Drove components give out important metrics about themselves and the software deployed on the cluster. You should use your favourite metric collector to consume these metrics and push it to your observability stack.

## Types of metrics
The following types of metrics are available from Drove/Dropwizard:

- **Gauges** - These are point in time values. Every time you collect the data for a Gauge, you will get the value of that metric at that point in time. More details available [here](https://metrics.dropwizard.io/4.2.0/manual/core.html#gauges){:target="_blank"}.
- **Counters** - Increasing or decreasing count values. Provides the count value at the time of collection. More details available [here](https://metrics.dropwizard.io/4.2.0/manual/core.html#counters){:target="_blank"}.
- **Histograms** - Distribution of values over percentiles, typically latencies by using reservoir sampling. When data is collected it gives a view of percentiles over the current sliding window. More details available [here](https://metrics.dropwizard.io/4.2.0/manual/core.html#histograms){:target="_blank"}.
- **Meters** - Tracks the rate of events. When data is collected, it provides the rate of happening of any events in the last 1 minute, 15min etc windows in events/second. More details available [here](https://metrics.dropwizard.io/4.2.0/manual/core.html#meters){:target="_blank"}.
- **Timers** - Rates and latencies of occurances. For example how many times a particular API gets called and what are the latencies for response. When data is collected, it provides the rate of happening of any events in the last 1 minute, 15min etc windows in events/second as well at the p50-99.9 latencies in seconds. More details available [here](https://metrics.dropwizard.io/4.2.0/manual/core.html#timers){:target="_blank"}.


!!!note
    Besides the customised metrics added to Drove, dropwizard itself provides internal metrics about many aspects of the system, including the JVM, Jersey, Jetty, Loggers and other Dropwizard internals.

## Checking what metrics are available

Metrics are exposed on the port specified in the `adminConnectors` section in `controller.yml` or `executor.yml`. To query metrics please use the following curl:

```bash
curl http://<IP>:<ADMIN_PORT>/metrics
```

!!!note
    Metics should be collected from every host. Admin ports are not exposed via vhosts on the gateway.

## Cluster resource metrics

The controller reports these gauges for cluster resources.


| Metric                        | Description                                       |
|-------------------------------|---------------------------------------------------|
| cluster.resources.cpu.used     | Number of used CPU cores across the cluster.       |
| cluster.resources.cpu.free     | Number of free CPU cores across the cluster.       |
| cluster.resources.cpu.total    | Total CPU cores in the cluster.                    |
| cluster.resources.gpu.used     | Number of used GPUs across the cluster.            |
| cluster.resources.gpu.free     | Number of free GPUs across the cluster.            |
| cluster.resources.gpu.total    | Total GPUs in the cluster.                         |
| cluster.resources.memory.used_mb    | Used memory in MB across the cluster.         |
| cluster.resources.memory.free_mb   | Free memory in MB across the cluster.         |
| cluster.resources.memory.total_mb  | Total memory in MB in the cluster.            |

The controller reports other gauges as well. These cover executors, applications, and tasks. See `ClusterMetricNames` in `drove-models` for the full list.

## GPU metrics

The executor publishes GPU metrics when you enable `nvidiaGPULoaderConfig` in the executor config. The metrics are absent when the loader is disabled. The executor collects the metrics with `nvidia-smi` every 30 seconds.

All GPU metrics use the prefix `com.phonepe.drove.executor.gpu`. The executor publishes these cluster-wide gauges.

| Metric suffix                            | Description                                                     |
|------------------------------------------|-----------------------------------------------------------------|
| _scrape_success                          | 1 when the last scrape succeeded, else 0.                        |
| _scrape_last_success_epoch_ms            | Epoch time in ms of the last successful scrape.                  |
| _scrape_duration_ms                      | Time in ms the last scrape took.                                 |
| _count                                   | Number of GPUs found.                                            |
| _utilization_average_percentage          | Average GPU utilization in percent across all devices.           |
| _memory_controller_utilization_average_percentage | Average memory controller utilization in percent.        |
| _memory_used_total_bytes                 | Sum of used GPU memory in bytes across all devices.              |
| _memory_total_total_bytes                | Sum of total GPU memory in bytes across all devices.             |
| _memory_temperature_average_celsius      | Average GPU memory temperature in degree Celsius.                |
| _sm_clock_average_mhz                    | Average SM clock in MHz across all devices.                      |
| _thermal_throttled_devices               | Number of devices that are thermal throttled.                    |
| _free_count                              | Number of free GPUs on the executor.                             |
| _used_count                              | Number of used GPUs on the executor.                              |

The executor also publishes these gauges for each device. Replace `<id>` with the GPU UUID.

| Metric suffix                            | Description                                          |
|------------------------------------------|------------------------------------------------------|
| _device_<id>_utilization_percentage       | GPU utilization in percent.                          |
| _device_<id>_memory_controller_utilization_percentage | Memory controller utilization in percent.  |
| _device_<id>_memory_used_bytes            | Used GPU memory in bytes.                            |
| _device_<id>_memory_total_bytes           | Total GPU memory in bytes.                           |
| _device_<id>_memory_utilization_percentage | GPU memory utilization in percent.                  |
| _device_<id>_temperature_celsius          | GPU temperature in degree Celsius.                   |
| _device_<id>_power_draw_watts              | Power draw in watts.                                 |
| _device_<id>_memory_temperature_celsius   | GPU memory temperature in degree Celsius.            |
| _device_<id>_sm_clock_mhz                 | SM clock in MHz.                                     |
| _device_<id>_thermal_throttled            | 1 when the device is thermal throttled, else 0.       |

!!!note
    Only NVIDIA GPUs report these metrics today. AMD support is planned for a later release. See [NVIDIA GPU management](../concepts/gpu.md).

