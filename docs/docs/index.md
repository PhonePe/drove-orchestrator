# Introduction

Drove is a container orchestrator built at [PhonePe](https://phonepe.com). It is focussed on simplicity, container performance and easy operations.

![Drove Home](images/drove-home.png)

## Features
The following sections go over the features.

### Functional
* **Application** (service) and application container lifecycle management including *mandated* readiness checks, health checks, pre-shutdown hooks to enable operators to take containers out of rotation easily and shut them down ggracefully if needed.
* Ensures the required(specified) number of containers will always be present in the cluster. It will detect **failures** across the cluster and bring containers up/down to maintain required instance count.
* Provides **endpoint** information to be consumed by routers like nixy+nginx/traefik etc to expose containers over vhost.
* Supports short lived container based **tasks**. This help folks build newer systems that can spin up containers as needed on the cluster. (See [epoch](https://github.com/PhonePe/epoch)).
* Provides functionality for real-time **log streaming and log download** for all instances.
* Log generation is handled by Drove in a file layout suitable for existing log shipping mechanisms as well as for streaming to rsyslog servers (if needed).
* Provides a functional read-only web-based console for checking cluster, application, task and instance states, log streaming etc.
* Provides **APIs** for both read and write operations
* Supports **discovery for sibling containers** to support dynamic cluster reconfiguration in frameworks like hazelcast.
* Support extra metadata in the form of **tags** on instances. This can be used in external systems for routing or other use-cases as this information is avaliable in endpoint as well.
* [**CLI**](https://github.com/PhonePe/drove-cli) system for easy deployments and app/task lifecycle management.
* NGinx based router called [drove-nixy](https://github.com/PhonePe/drove-nixy) for efficient communication with the cluster itself and containers deployed on it.


### Operations
* Only two components (controller and executor) to make a cluster (plus Zookeeper for coordination, drove-nixy for routing if needed).
* All components **dockerised** to allow for easy deployment as well as upgrades
* Simple single file YAML based configuration for the controller and executor. 
* Cluster can be set to **maintenance mode** where it pauses making changes to the cluster and turns off safeguards around ensuring the required number of containers get reported from the executor nodes. This will allow the SRE team to do seamless software updates across the whole cluster in a few minutes,  irrespective of the size.
* **Blacklisting** of the executor nodes will automatically move all the running application containers to other nodes and prevent any further allocations to this node. This allows the node to be taken down for maintenance that needs longer periods of time to complete OS/patch application, hardware maintenance etc.
* Detect and kill any **zombie** container nodes. On mesos, SRE team needs to be involved to manually kill such containers.

### Performance
* Scheduler needs to be aware of NUMA hardware topology of the node and prevent containers from being split across nodes.
* Scheduler will **pin containers** to specific cores on a NUMA node so as to stop containers from stepping on each other’s toes during peak hours and allow them to fully utilise the multi-level caches associated with the allocated CPU cores. Some balance is anyways gained by enabling hyper-threading on the executor nodes. This should be sufficient to provide a significant boost to the application performance.
* Allows for **specialised nodes** in the cluster. For example, there might be nodes with GPU available. We would want to run ML models that can utilise such hardware rather than allocate generic service containers on such nodes. To this end, the scheduler supports tagging and allows for containers to be explicitly mapped to tagged nodes.
* Allows for different **placement policies** to provide some flexibility to users in where they want to place their container nodes. This sometimes helps developers deploy specific apps to specific nodes where they might have been granted special privileges to perform deeper than usual investigations of running service containers (for example, take heap-dumps to specific mounted volumes etc).
* Allows for **configuration injection** at container startup. Such configuration can be stream in as part of the dpeloyment specification, mounted in from executor hosts or fetched via API calls by the controllers or executors.
* Provides provisions to allow for extension of the scheduler to implement different scheduling algorithms in the code later on.
* Sometimes, NUMA localization and cpu pinning are overkill for clusters that don't need to extract the last bit of performance. For example, testing/staging clusters. To this end, drove supports the following features:
    * Allows turning off NUMA and core pinning at executor level
    * Allows to specify multipliers for available CPU/memory to accommodate for over provisioning on the cluster.
* Because the above are set at an executor level, the cluster can have different types of nodes with different required performance characteristics appropriately tagged. Relevant apps can be deployed based on performance requirements.

### Resilience
* **Small** number of **moving pieces**. Keeps the minimal amount of dependencies in the system. This reduces the exposure for failures by effectively reducing the number of external dependencies and possible failure points.
* Controller stores state on external system (Zookeeper) for now.
* Executor stores all container specific state in container metadata itself. No other state is maintained/needed by executor.
* Containers keep running even when most of the system is down. This means even when the cluster coordinators, executors, state storage etc are down, the already deployed containers keep on running as is. If a service discovery mechanism is implemented properly, this effectively protects the system against service disruptions even in the face of failure of critical cluster components. At PhonePe we use [Ranger](https://github.com/appform-io/ranger) for service discovery. 
* **Container state reconciliation** is part of the executor system, so that executor service can be restarted easily without affecting application or task deployments. In other words, the executor needs to recognise the containers started by itself on restarts and report their state as usual to the controller.
* Keeps things as simple as possible. Drove uses a few simple constructs (scale up/scale down) and implement all application/task features using that.
* **Multi-mode cluster messaging** ensures that faster updates will be sent to controller via sync channels, while the controller(s) keep refreshing the cluster state periodically irrespective of the last synced data. Drove assumes that communication failures would happen. Even if new changes can’t be propagated from executor to controller, it tries to keep existing topology as updated as possible.
* Built in safeguards to detect and kill any rogue (zombie) container instances that have remained back for some reason (maybe some bug in the orchestrator etc).
* Controller is **highly available** with one leader active at a time. Any communication issues with zookeeeper will leader to quick death of the controller so that another controller can take up it's place as quickly as possible.
* Leader can be tracked using the `ping` api and is used by components such as [drove-nixy](https://github.com/PhonePe/drove-nixy) to provide a Virtual Host that can be used to interact with the cluster via the ui or the CLI and other tools.

### Security
* Clearly designate roles for read and write operations. Write operations include cluster maintenance and app and task lifecycle maintenance.
* Authentication system is easily extensible
* Supports basic auth as the minimal auth requirement. User credentials stored in bcrypt format in controller config files.
* Support a no auth mode for starter clusters
* Provides audit logs for events in the system. Such logs can get aggregated and/or shipped out  independently by existing log aggregation systems like logrotate-+rsync or (r)syslog etc by configuring the appropirate loggers in the controller configuration file.
* Separate authentication system for intra-cluster authentication and for edge. This will mean that even if external auth is compromised (or vice versa), the system keeps working as is.
* Shared secret is used for intra cluster authentication.
* **Dynamically generated tokens** are injected into container instances for seamless sibling discovery. This provides a way for developers to implement clustering mechanisms for frameworks like Hazelcast (provided already).

### Observability
* **Real-time event stream** from the controller can be used for any other event driven system like nixy etc to refresh upstream topology.
* **Metrics** available on admin ports for both the controllers and executors. Something like telegraf can be used to collect and send them to the centralised metrics management system of your choice. (At PhonePe we use telegraf, which pushed the metrics to our custom metrics collection service backed by a modified version of OpenTSDB. We use grafana to visualize the same metrics).
* Published metrics from controllers includes system health metrics around themselves.
* Published metrics from executors contains system health metrics as well as other metrics around the containers running on them. This includes but is not limited to CPU, Memory and network usage.

### Unsupported Features
* *Auto-scaling of containers:* In PhonePe we have an extensive metrics ingestion system and an auto-scaler that works on a proprietary algorithm to scale containers up and down based on the same. This works independent of the orchestration system in play (we were on Drove and Mesos both at the same time during the transition period) and calls apis on the deployment system that handles scaling operations independently. Any implementation at the orchestration level will not work as the contributors to the metrics might be running on different clusters and scaling them independently will bring in more complexities rather than solving for simplicity.
* *Network level traffic control:* At PhonePe network security is handled at VRF level and container level access control is not needed. All services are already integrated with the OAuth2 compliant internal authentication and authorization system and perform security checks for the same at the application layer. As a matter of fact, we want containers to be as close to the raw network level as possible to ensure we can extract the highest level of network performance possible, other things being constant.
* *End to end configuration management:* At this point of time, app/task configuration is maintained independently at PhonePe, subject to our apporval workflows based on the compliance domain for the application, can be static or dynamic and may be tied to deployments.
* *Multi-DC clusters* - We have not tested a single Drove cluster spanning across multiple data centers.


## Terminology
Before we delve into the details, let's get acquainted with the required terminology:

- **Application** - A service running on the cluster. Such a service can have an exposed port and will have an automatically configured virtual host on Drove Gateway.
- **Task** - A transient container based task.
- **Controller Nodes** - The brains of the cluster. Only one cluster is the leader and hence the decision maker in the system.
- **Executor Nodes** - The workhorse nodes of the cluster where the actual containers are run.
- **Drove CLI** - A command line client to interact with the cluster.
- **Drove Gateway** - Used to provide ingress to the leader and containers running on the cluster.
- **Epoch** - A cron type scheduler to spin up *tasks* on a Drove cluster based on pre-defined schedules.

## Github Repositories

- Uber Repo - [https://github.com/PhonePe/drove-orchestrator](https://github.com/PhonePe/drove-orchestrator)
- Drove Orchestrator Code - [https://github.com/PhonePe/drove](https://github.com/PhonePe/drove)
- Drove CLI - [https://github.com/PhonePe/drove-cli](https://github.com/PhonePe/drove-cli)
- Drove Gateway - [https://github.com/PhonePe/drove-nixy](https://github.com/PhonePe/drove-nixy)
- Epoch - [https://github.com/PhonePe/epoch](https://github.com/PhonePe/epoch)

## License
Apache 2
