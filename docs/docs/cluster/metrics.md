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


