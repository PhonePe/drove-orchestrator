# Planning your cluster

Running a drove cluster in production for critical workloads involves planning and preparation on factors like Availability, Scale, Security and Access management.
The following issues should be considered while planning your drove cluster.

## Criteria for planning
The simplest form of a drove cluster would run controller, zookeeper, executor and gateway services all on the same machine while a highly available would separate out all components according to following considerations:

- **Availability**: Use of a single node in either executor, controller, gateway or zookeeper has a single point of failure. A typical highly available cluster consists of:
    - Separated controller and executor nodes
    - Multi controller setup - typically minimum 3 controller nodes to provide adequate availability and majority for leader election
    - Multiple gateway nodes to load balance traffic and provide fault tolerance
    - Availability of sufficient executor nodes to follow placement policies suitable for high availability for application instances across executors
    - Multiple node zookeeper cluster to provide adequate availability and quorum. Even number of nodes is not useful. Atleast three zookeeper servers are required.
- **Scale**: You should size your components as per expected amount of traffic to your instances but also have a plan for expected demand growth and ways to scale your cluster accordingly
- **Security and Access management**: You can use authentication for intra-cluster communication and add encryption for secure communications. Access management can be devolved by creating multiple users with either read or write roles.

## Cluster configuration

### Controllers

Controllers will manage the cluster with application instances spread across multiple executors as per different placement policies. Controllers use leader-election to coordinate and will act as a single entity while each executor acts as a single entity that runs many different application instances.

- **Multiple controllers**: For high availability, there should be atleast three controllers. Drove uses leader election to coordinate across the controllers. If the leader fails, the other controllers would elect a leader and takeover.
- **Separate Zookeeper service and snapshots**: The zookeeper service used for state coordination by controller can either be run on same machines as controller or on separate machines. Zookeeper stores the configuration data for the whole cluster and zookeeper snapshots can be used to back up the data.
- **Availability zones**: You can split the controllers and/or zookeeper nodes across availability zones/data centers to improve resilience.
- **Transit encryption and certificate Management**: Controllers and executors can communicate via secure communications. TLS settings and certificates can be added by modifying applicationConnectors and adminConnectors parameters as per  [Dropwizard HTTPS connector configuration](https://www.dropwizard.io/en/release-3.0.x/manual/configuration.html#https)
- **Separate Gateways**: The drove gateways will route and load balance application traffic across application instances. The gateway service can  either be run on same machines as controller or on separate machines.
- **Resources**: The required JVM maximum heap size for drove controller service will increase with the increase in number of executors,applications and application instances in the cluster. The JVM parameters should be reviewed as per your scale.

### Zookeeper

- **Quorum**: For replicated zookeeper, a minimum of three servers are required, and it is recommended that you have an odd number of servers. If you only have two servers, if one of them fails, there are not enough machines to form a majority quorum. Two servers are inherently less stable than a single server, because there are two single points of failure. Refer [Running replicated ZooKeeper in ZooKeeper Getting Started Guide](https://zookeeper.apache.org/doc/r3.9.2/zookeeperStarted.html#sc_RunningReplicatedZooKeeper)
- **zxid rollover**: zxid is the ZooKeeper transaction id and is 64 bit number. The zxid has two parts epoch and a counter which use the high order 32-bits for the epoch and the low order 32-bits for the counter. A zookeeper election is forced when the 32-bit counter rolls over. This will be more frequent as scale increases in your cluster.
- **JVM parameters and resources**: The required JVM maximum heap size for zookeeper  will increase with the increase in number of executors,applications and application instances in the cluster. The JVM parameters should be reviewed as per your scale. Refer [ZooKeeper Administrator's Guide](https://zookeeper.apache.org/doc/r3.8.0/zookeeperAdmin.html)

### Executors

- **Containerisation Engine**: Drove supports the Docker engine and has experimental support for Podman. Choose your engine as per your security, networking and performance considerations.
- **Container Networking**: The container engine and container networking should be configured as per your requirements. It is recommended to use Port forwarding based container networking if you choose to use Drove Gateway to route application traffic. Container engine settings can be modified to manage DNS and proxy parameters for containers.
- **Placement policies and availability**: Drove supports placement policies to set criteria for replication of instances across executors and avoiding single points of failure. Drove tags can be assigned to executors and placement policy can be used to pin certain applications to specific selected executors if you have any hardware or other considerations.
- **Scaling**: As your cluster scale increases, you can continue adding executors to the cluster. Placement policies should be used to manage availability criteria. Controller and ZooKeeper resource requirements will increase as your executor count increases and should be reviewed accordingly.

### Gateways

- **Container Networking**:  It is recommended to use Port forwarding based container networking if you choose to use Drove Gateways to route application traffic
- **Load balancing**: Gateways use Nginx as a web server and can use many different approaches to load balancing among multiple gateway nodes. Some examples include:
    - ***DNS Load balancing***: Multiple gateway IP's can be added as A records to the virtual host domain to let clients use round-robin DNS and split load across gateway nodes
    - ***Anycast/Network Load balancing***: If any sort of anycast/network load balancing functionality is available in your network, it can be used to split traffic across gateway nodes
- **High Availability and Scaling**: Many different methods are available to achieve high availability and scale NGINX. Any method can be used by adequately modifying the template used by Gateway to render Nginx configuration.

