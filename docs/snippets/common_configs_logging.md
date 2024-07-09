## Logging Specification
Can be used to configure how container logs are managed on the system. 

!!!note
    This section affects the docker log driver. Drove will continue to stream logs to it's own logger which can be configured at executor level through the executor configuration file.


### Local Logger configuration
This is used to configure the `json-file` log driver.

| Name           | Option          | Description                                    |
|----------------|-----------------|------------------------------------------------|
| Type           | `type`          | Set the value to `LOCAL`                      |
| Max Size | `maxSize` | Maximum file size. Anything bigger than this will lead to rotation. |
| Max Files | `maxFiles` | Maximum number of logs files to keep. Range: 1-100|
| Compress | `compress` | Enable log file compression. |

!!!tip
    If `logging` section is omitted, the following configuration is applied by default:
    - File size: 10m
    - Number of files: 3
    - Compression: on

### Rsyslog configuration
In case suers want to stream logs to an rsyslog server, the logging configuration needs to be set to RSYSLOG mode.

| Name           | Option          | Description                                    |
|----------------|-----------------|------------------------------------------------|
| Type           | `type`          | Set the value to `RSYSLOG`                     |
| Server         | `server`        | URL for the rsyslog server.                    |
| Tag Prefix     | `tagPrefix`     | Prefix to add at the start of a tag            |
| Tag Suffix     | `tagSuffix`     | Suffix to add at the en of a tag.              |

!!!note
    The default tag is the `DROVE_INSTANCE_ID`. The `tagPrefix` and `tagSuffix` will to before and after this


