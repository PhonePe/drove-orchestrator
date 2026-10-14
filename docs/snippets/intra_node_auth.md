### Intra Node Authentication Configuration
Communication between controller and executor is protected by a shared-secret based authentication. The following configuration is meant to configure this. This section consists of a list of 2 members:

* Config for controller to talk to executors
* Config for executors to talk to controller

Each section consists of the following:

| Name      | Option     | Description                                                    |
|-----------|------------|----------------------------------------------------------------|
| Node Type | `nodeType` | Type of node in the cluster. Can be `CONTROLLER` or `EXECUTOR` |
| Secret    | `secret`   | The actual secret to be passed.                                |

**Sample**
```yaml
clusterAuth:
  secrets:
  - nodeType: CONTROLLER
    secret: ControllerSecretValue
  - nodeType: EXECUTOR
    secret: ExecutorSecret
```
