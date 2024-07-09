### Cluster Operation Specification
When an operation is submitted to the cluster, a _cluster op spec_ needs to be specified. This is needed to control different aspects of the operation, including parallelism of an operation or increase the timeout for the operation and so on. 

The following aspects of an operation can be configured:

| Name             | Option            | Description                                                               |
|------------------|-------------------|---------------------------------------------------------------------------|
| Timeout          | `timeout`         | The duration after which Drove considers the operation to have timed out. |
| Parallelism      | `parallelism`     | Parallelism of the task. (Range: 1-32)                                    |
| Failure Strategy | `failureStrategy` | Set this to `STOP`.                                                       |

!!!note
    For internal recovery operations, Drove generates it's own operations. For that, Drove applies the following cluster operation spec:

    - **timeout** - 300 seconds
    - **parallelism** - 1
    - **failureStrategy** - `STOP`

    > The default operation spec can be configured in the controller configuration file. It is recommended to set this to a something like 8 for faster recovery.
