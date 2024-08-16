# Libraries

Drove is written in Java. We provide a few libraries that can be used to integrate with a Drove cluster.

## Setup
Drove libraries are hosted in Github Package Repository. To use this in Maven use the following repository entry:

```xml
<repositories>
    <!-- Setup other repositories-->
    <repository>
      <id>github</id>
      <url>https://maven.pkg.github.com/phonepe/drove</url>
      <snapshots>
        <enabled>false</enabled>
      </snapshots>
      <releases>
        <enabled>true</enabled>
      </releases>
    </repository>
</repositories>
```

Setup the drove version
```xml
<properties>
    <!--other properties-->
    <drove.version>1.29</drove.version>
</properties>
```

!!!note "Checking the latest version"
    Latest version can be checked at the github packages page [here](https://github.com/PhonePe/drove/packages/2229703){:target="_blank"}

!!!danger "Accessing maven repo on github"
    Public repos on github need authentication.  In order to use these please follow the steps as mentioned below:
    
    - Create a Personal Access Token on github.
        - Go to your account -> Settings -> Developer settings -> Personal access token -> Tokens (classic) -> Generate new token (classic)
    (Basically create a PAT and add your username and password in maven-settings.xml or .m2/settings.xml for the repo `https://maven.pkg.github.com/phonepe/drove`).
        - The only permission needed is `read:packages`.

    - Create a settings file or add required configurations to your `~/.m2/settings.xml`.

    Sample settings file:
    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
            xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
            xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
        <activeProfiles>
            <activeProfile>github</activeProfile>
        </activeProfiles>
        <profiles>
            <profile>
                <id>github</id>
                <repositories>
                    <repository>
                        <id>central</id>
                        <url>https://repo1.maven.org/maven2</url>
                    </repository>
                    <repository>
                        <id>github</id>
                        <url>https://maven.pkg.github.com/phonepe/drove</url>
                        <snapshots>
                            <enabled>false</enabled>
                        </snapshots>
                        <releases>
                            <enabled>true</enabled>
                        </releases>
                    </repository>
                </repositories>
            </profile>
        </profiles>

        <servers>
            <server>
                <id>github</id>
                <username>YOUR GITHUB USERNAME</username>
                <password>YOUR PERSONAL ACCESS TOKEN</password>
            </server>
        </servers>

    </settings>

    ```
    > Your PAT works fine as the repo itself is public.

    To build:
    ```shell
    mvn -s /path/to/settings.xml clean package
    ```
    
    If setting up your github actions, please follow the steps in this excellent [stack-overflow answer](https://stackoverflow.com/questions/64706720/how-to-access-maven-dependency-from-github-packages-on-a-github-actions-workflow){:target="_blank"} to setup your actions correctly.


All libraries are located in sub packages of the top level package `com.phonepe.drove`.

!!!danger "Java Version Compatibility"
    Using Drove libraries would need Java versions 17+.


## Drove Model

The model library for the classes used in request and response. It has dependency on `jackson` and `dropwizard-validation`.

### Dependency

```xml
<dependency>
    <groupId>com.phonepe.drove</groupId>
    <artifactId>drove-models</artifactId>
    <version>${drove.version}</version>
</dependency>
```

## Drove Client

We provide a client library that can be used to connect to a Drove cluster. The cluster accepts controller endpoints as parameter (among other things) and automatically tracks the leader controller. If a single controller endpoint is provided, this functionality is turned off.

Please note that the client does not provide specific functions corresponding to different api calls from the controller, it acts as a simple endpoint discovery mechanism for drove cluster. Please refer to [API](../apis/index.md) section for details on individual apis.

### Transport

The transport layer in the client is used to actually make HTTP calls to the Drove server. A new transport can be used by implementing the `get()`, `post()`, `put()` and `delete()` methods in the `DroveHttpTransport` interface.

By default Drove client uses Java internal HTTP client as a trivial transport implementation. We also provide an [Apache Http Components](https://hc.apache.org/) based implementation.

!!!tip
    Do not use the default transport in production. Please use the HTTP Components based transport or your custom ones.


### Dependencies
```xml
 <dependency>
    <groupId>com.phonepe.drove</groupId>
    <artifactId>drove-client</artifactId>
    <version>${drove.version}</version>
</dependency>
<dependency>
    <groupId>com.phonepe.drove</groupId>
    <artifactId>drove-client-httpcomponent-transport</artifactId>
    <version>${drove.version}</version>
</dependency>
```

### Sample code
```java

public class DroveCluster implements AutoCloseable {

    @Getter
    private final DroveClient droveClient;

    public DroveCluster() {
        final var config = new DroveConfig()
            .setEndpoints(List.of("http://controller1:4000,http://controller2:4000"));

        this.droveClient = new DroveClient(config,
                                      List.of(new BasicAuthDecorator("guest", "guest")),
                                           new DroveHttpComponentsTransport(config.getCluster()));
    }

    @Override
    public void close() throws Exception {
        this.droveClient.close();
    }
}

```

!!!note "RequestDecorator"
    This interface can be implemented to augment requests with special headers like for example Authorization, as well as for other stuff like adding content type etc etc.

## Drove Event Listener
This library provides callbacks that can be used to listen and react to events happening on the Drove cluster.

### Dependencies
```xml
<!--Include Drove client-->
<dependency>
    <groupId>com.phonepe.drove</groupId>
    <artifactId>drove-events-client</artifactId>
    <version>${drove.version}</version>
</dependency>
```

### Sample Code
```java

final var droveClient = ... //build your java transport, client here

//Create and setup your object mapper
final var mapper = new ObjectMapper();
mapper.registerModule(new ParameterNamesModule());
mapper.setSerializationInclusion(JsonInclude.Include.NON_EMPTY);
mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);
mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);
mapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
mapper.enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_ENUMS);

final var listener = new DroveRemoteEventListener(droveClient, //Create listener
                                                    mapper,
                                                    new DroveEventPollingOffsetInMemoryStore(),
                                                    Duration.ofSeconds(1));

listener.onEventReceived() //Connect signal handlers
    .connect(events -> {
        log.info("Remote Events: {}", events);
    });

listener.start(); //Start listening


//Once done close the listener
listener.close();

```

!!!tip "Event Types"
    Please check the `com.phonepe.drove.models.events` package for the different event types and classes.

!!!note "Event Polling Offset Store"
    The event poller library uses polling to find new events based on an offset. The event polling offset store is used to store and retrieve this offset. The `DroveEventPollingOffsetInMemoryStore` default store stores this information in-memory. Implement `DroveEventPollingOffsetStore` to a more permanent storage if you want this to be more permanent.

## Drove Hazelcast Cluster Discovery

Drove provides an implementation of the Hazelcast discovery SPI so that containers deployed on a drove cluster can discover each other. This client uses the token injected by drove in the `DROVE_APP_INSTANCE_AUTH_TOKEN` environment variable to get sibling information from the controller.

### Dependencies
```xml
<!--Include Drove client-->
<!--Include Hazelcast-->
<dependency>
    <groupId>com.phonepe.drove</groupId>
    <artifactId>drove-events-client</artifactId>
    <version>${drove.version}</version>
</dependency>
```

### Sample Code
```java

//Setup hazelcast
Config config = new Config();

// Enable discovery
config.setProperty("hazelcast.discovery.enabled", "true");
config.setProperty("hazelcast.discovery.public.ip.enabled", "true");
config.setProperty("hazelcast.socket.client.bind.any", "true");
config.setProperty("hazelcast.socket.bind.any", "false");

//Setup networking
NetworkConfig networkConfig = config.getNetworkConfig();
networkConfig.getInterfaces().addInterface("0.0.0.0").setEnabled(true);
networkConfig.setPort(port); //Port is the port exposed on the container for hazelcast clustering

// Setup Drove discovery
JoinConfig joinConfig = networkConfig.getJoin();

DiscoveryConfig discoveryConfig = joinConfig.getDiscoveryConfig();
DiscoveryStrategyConfig discoveryStrategyConfig =
        new DiscoveryStrategyConfig(new DroveDiscoveryStrategyFactory());
discoveryStrategyConfig.addProperty("drove-endpoint", "http://controller1:4000,http://controller2:4000"); //Controller endpoints
discoveryStrategyConfig.addProperty("port-name", "hazelcast"); // Name of the hazelcast port defined in Application spec
discoveryStrategyConfig.addProperty("transport", "com.phonepe.drove.client.transport.httpcomponent.DroveHttpComponentsTransport");
discoveryStrategyConfig.addProperty("cluster-by-app-name", true); //Cluster container across multiple app versions
discoveryConfig.addDiscoveryStrategyConfig(discoveryStrategyConfig);

//Create hazelcast node
val node = Hazelcast.newHazelcastInstance(config);

//Once connected, node.getCluster() will be non null
```

!!!note "Peer discovery modes"
    By default the containers will _only_ discover and connect to containers from the same [application id](../applications/index.md#application-id). If you need to connect to containers from all versions of the same application please set the `cluster-by-app-name` property to `true` as in the above example.
