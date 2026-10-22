# Setting up Drove Gateway
The Drove Gateway works as a gateway to expose apps running on a drove cluster to rest of the world.

Drove Gateway supports both [NGINX](https://nginx.org){:target="_blank"} and HAProxy as the proxy layer, using Nixy to track Drove endpoints. More details are available in the [drove-gateway](https://github.com/PhonePe/drove-gateway){:target="_blank"} project.

!!!note
    This page uses **NGINX-based examples** (`nginx_*` options and `nginx.tmpl`). For HAProxy mode, configure `proxy_platform="haproxy"` and the corresponding `haproxy_*` options as documented in the drove-gateway README.

## Drove Gateway Nixy Configuration Reference
The nixy running inside the gateway container is configured using a custom TOML file. This section looks into this file:

```toml

address = "127.0.0.1"# (1)!
port = "6000"


# Drove Options
drove = [#(2)!
  "http://controller1.mydomain:10000",
   "http://controller1.mydomain:10000"
   ]

leader_vhost = "drove-staging.mydomain"#(3)!
event_refresh_interval_sec = 5#(5)!
user = ""#(6)!
pass = ""
access_token = ""#(7)!

# Parameters to control which apps are exposed as VHost
routing_tag = "externally_exposed"#(4)!
realm = "api.mydomain,support.mydomain"#(8)!
realm_suffix = "-external.mydomain"#(9)!

# NGINX related config

nginx_config = "/etc/nginx/nginx.conf"#(10)!
nginx_template = "/etc/drove/gateway/nginx.tmpl"#(11)!
nginx_cmd = "nginx"#(12)!
nginx_ignore_check = true#(13)!

# NGINX Plus specific options
nginxplusapiaddr="127.0.0.1"#(14)!
nginx_reload_disabled=true#(15)!
maxfailsupstream = 0#(16)!
failtimeoutupstream = "1s"
slowstartupstream = "0s"

```

1. Nixy listener configuration. Endpoint for nixy itself.

2. List of Drove controllers. Add all controller nodes here. Nixy will automatically determine and track the current leader. 
    
    > _Auto detection is disabled if a single endpoint is specified._

3. Helps create a vhost entry that tracks the leader on the cluster. Use this to expose the Drove endpoint to users. The value for this will be available to the template engine as the `LeaderVHost` variable.

4. If some special routing behaviour needs to be implemented in  the template based on some tag metadata of the deployed apps, set the routing_tag option to set the tag name to be used. The actual value is derived from app instances and exposed to the template engine as the variable: `RoutingTag`. Optional.
    
    > In this example, the RoutingTag variable will be set to the value specified in the `routing_tag` tag key specified when deploying the Drove Application. For example, if we want to expose the app we can set it to `yes`, and filter the VHost to be exposed in NGINX template when `RoutingTag == "yes"`.

5. Drove Gateway/Nixy works on event polling on controller. This is the polling interval. Especially if number of NGINX nodes is high. Default is `2 seconds`. Unless cluster is really busy with a high rate of change of containers, this strikes a good balance between apps becoming discoverable vs putting the leader controller under heavy load.

6. `user` and `pass` are optional params can be used to set basic auth credentials to the calls made to Drove controllers if basic auth is enabled on the cluster. Leave empty if no basic auth is required.

7. If cluster has some custom header based auth, the following can be used. The contents on this parameter are passed verbatim to the Authorization HTTP header. Leave empty if no token auth is enabled on the cluster.

8. By default drove-gateway will expose all vhost declared in the spec for all drove apps on a cluster (caveat: filtering can be done using RoutingTag as well). If specific vhosts need to be exposed, set the realms parameter to a comma separated list of realms. Optional.

9. Beside perfect vhost matching, Drove Gateway supports suffix based matches as well. A single suffix is supported. Optional.

10. Path to NGINX config.

11. Path to the template file, based on which the template will be generated.

12. NGINX command to use to reload the config. Set this to `openresty` optionally to use openresty.

13. Ignore calling NGINX command to test the config. Set this to false or delete this line on production. Default: false.

14. If using NGINX Plus, set the endpoint to the local server here. If left empty, NGINX Plus api based vhost update will be disabled.

15. If specific vhosts are exposed, auto-discovery and updation of config (and NGINX reloads) might not be desired as it will cause connection drops. Set the following parameter to true to disable reloads. Nixy will only update upstreams using the nplus APIs. Default: false.

16. Connection parameters for NGINX Plus.


!!!danger "NGINX Plus"
    NGINX Plus is _not_ shipped with this docker. If you want to use NGINX Plus, please build nixy from the source tree [here](https://github.com/PhonePe/drove-gateway){:target="_blank"} and build your own container.

## Relevant directories
Location for data and logs are as follows:

- `/etc/drove/gateway/` - Configuration files
- `/var/log/drove/gateway/` - NGINX Logs

We shall be volume mounting the config and log directories with the same name.

!!!warning "Prerequisite Setup"
    If not done already, please complete the [prerequisite setup](prerequisites.md) on all machines earmarked for the cluster.

Go through the following steps to run `drove-gateway` as a service.

## Create the TOML config for Nixy

Sample config file `/etc/drove/gateway/gateway.toml`:

```toml
address = "127.0.0.1"
port = "6000"


# Drove Options
drove = [
  "http://controller1.mydomain:10000",
   "http://controller1.mydomain:10000"
   ]

leader_vhost = "drove-staging.mydomain"
event_refresh_interval_sec = 5
user = "guest"
pass = "guest"


# NGINX related config
nginx_config = "/etc/nginx/nginx.conf"
nginx_template = "/etc/drove/gateway/nginx.tmpl"
nginx_cmd = "nginx"
nginx_ignore_check = true
```

!!!danger "Replace domain names"
    Please remember to update `mydomain` to a valid domain you want to use.

## Create template for NGINX

Create an NGINX template with the following config in `/etc/drove/gateway/nginx.tmpl`

```nginx
# Generated by drove-gateway {{datetime}}

user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    use epoll;
    worker_connections 2048;
    multi_accept on;
}
http {
    server_names_hash_bucket_size  128;
    add_header X-Proxy {{ .Xproxy }} always;
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log warn;
    server_tokens off;
    client_max_body_size 128m;
    proxy_buffer_size 128k;
    proxy_buffers 4 256k;
    proxy_busy_buffers_size 256k;
    proxy_redirect off;
    map $http_upgrade $connection_upgrade {
        default upgrade;
        ''      close;
    }
    # time out settings
    proxy_send_timeout 120;
    proxy_read_timeout 120;
    send_timeout 120;
    keepalive_timeout 10;

    server {
        listen       7000 default_server;
        server_name  _;
        # Everything is a 503
        location / {
            return 503;
        }
    }
    {{if and .LeaderVHost .Leader.Endpoint}}
    upstream {{.LeaderVHost}} {
        server {{.Leader.Host}}:{{.Leader.Port}};
    }
    server {
        listen 7000;
        server_name {{.LeaderVHost}};
        location / {
            proxy_set_header HOST {{.Leader.Host}};
            proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
            proxy_connect_timeout 30;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_pass http://{{.LeaderVHost}};
        }
    }
    {{end}}
    {{- range $id, $app := .Apps}}
    upstream {{$app.Vhost}} {
        {{- range $app.Hosts}}
        server {{ .Host }}:{{ .Port }};
        {{- end}}
    }
    server {
        listen 7000;
        server_name {{$app.Vhost}};
        location / {
            proxy_set_header HOST $host;
            proxy_next_upstream error timeout invalid_header http_500 http_502 http_503 http_504;
            proxy_connect_timeout 30;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_pass http://{{$app.Vhost}};
        }
    }
    {{- end}}
}
```

The above template will do the following:

- Set NGINX port to 7000. This is the port exposed on the Docker container for the gateway. **Do not change this.**
- Sets up error and access logs to `/var/log/nginx`. Log rotation is setup for this path already.
- Set up a Vhost `drove-staging.mydomain` that will get auto-updated with the current leader of the Drove cluster
- Setup automatically updated virtual hosts for all apps on the cluster.

## Create environment file
We want to configure the drove gateway container using the required environment variables. To do that, put the following in `/etc/drove/gateway/gateway.env`:

```unixconfig
CONFIG_FILE_PATH=/etc/drove/gateway/gateway.toml
TEMPLATE_FILE_PATH=/etc/drove/gateway/nginx.tmpl
```

## Create systemd file
Create a `systemd` file. Put the following in `/etc/systemd/system/drove.gateway.service`:

```systemd
[Unit]
Description=Drove Gateway Service
After=docker.service
Requires=docker.service

[Service]
User=drove
Group=docker
TimeoutStartSec=0
Restart=always
ExecStartPre=-/usr/bin/docker pull ghcr.io/phonepe/drove-gateway:latest
ExecStart=/usr/bin/docker run  \
    --env-file /etc/drove/gateway/gateway.env \
    --volume /etc/drove/gateway:/etc/drove/gateway:ro \
    --volume /var/log/drove/gateway:/var/log/nginx \
    --network host \
    --hostname %H \
    --rm \
    --name drove.gateway \
    ghcr.io/phonepe/drove-gateway:latest
    
[Install]
WantedBy=multi-user.target
```


Verify the file with the following command:
```shell
systemd-analyze verify drove.gateway.service
```

Set permissions
```shell
chmod 664 /etc/systemd/system/drove.gateway.service
```

## Start the service on all servers

Use the following to start the service:

```shell
systemctl daemon-reload
systemctl enable drove.gateway
systemctl start drove.gateway
``` 

## Checking Logs
You can check logs using:
```shell
journalctl -u drove.gateway -f
```

Gateway proxy logs would be available at `/var/log/drove/gateway` in this NGINX-based setup.

### Log rotation for NGINX
    
The gateway sets up log rotation for the access and errors logs with the following config:
```logrotate
/var/log/nginx/*.log {
    rotate 5
    size 10M
    dateext
    dateformat -%Y-%m-%d
    missingok
    compress
    delaycompress
    sharedscripts
    notifempty
    postrotate
        test -r /var/run/nginx.pid && kill -USR1 `cat /var/run/nginx.pid`
    endscript
}
```

> This will rotate both error and access logs when they hit 10MB and keep 5 logs.

Configure the above if you want and volume mount your config to `/etc/logrotate.d/nginx` to use different scheme as per your requirements.

## Template functions

The template engine provides these functions. Use them inside `nginx.tmpl` or `haproxy.tmpl`.

| Function  | Signature            | Description                                                            |
|-----------|----------------------|------------------------------------------------------------------------|
| hostport  | hostport host port   | Returns `host:port` with correct IPv6 brackets. Example: `[2001:db8::1]:8080`. |
| hasPrefix | hasPrefix s prefix   | Checks whether the string starts with the prefix.                       |
| hasSuffix | hasSuffix s suffix   | Checks whether the string ends with the suffix.                         |
| contains | contains s substr     | Checks whether the string contains the substring.                        |
| split     | split s sep          | Splits the string into a list.                                          |
| join      | join list sep        | Joins a list into a string.                                             |
| trim      | trim s cutset        | Removes the cutset characters from both ends.                           |
| replace   | replace s old new n  | Replaces the first `n` occurrences.                                    |
| tolower   | tolower s           | Converts the string to lower case.                                     |
| getenv    | getenv key           | Reads an environment variable.                                          |
| datetime  | datetime             | Returns the current time.                                               |

!!!warning "IPv6 support"
    Templates must use `hostport` to build server addresses. Do not use `{{ .Host }}:{{ .Port }}`. Direct concatenation breaks IPv6 addresses.

    ```nginx
    # Correct - works with IPv4 and IPv6
    server {{ hostport .Host .Port }};

    # Incorrect - breaks IPv6 addresses
    server {{ .Host }}:{{ .Port }};
    ```

All bundled templates use `hostport`. Update your custom templates the same way.

## Advanced usage

This section covers advanced gateway options. The drove-gateway README on GitHub has the full reference.

### State persistence

The gateway keeps its datamanager state in memory. It also writes the state to disk. This helps the gateway recover after a restart.

| Option                             | Default               | Description                                                        |
|------------------------------------|-----------------------|--------------------------------------------------------------------|
| state_persistence_enabled          | true                  | Write the last successful state to disk. The gateway reconciles from this file when controllers are unavailable. |
| state_persistence_dir              | /var/lib/drove-gateway | Directory for the persisted state file `datamanager-state.json`.   |
| startup_controller_sync_tries      | 2                     | Number of full fresh-sync attempts on startup before the gateway uses the persisted state. |
| startup_controller_sync_retry_delay_sec | 1                | Delay in seconds between startup sync attempts. Values less than 1 use 1. |

### Signal handling

The gateway systemd unit sends signals to the gateway process. The signals trigger reconciliation.

- `SIGUSR1`: Sent by `ExecStartPre` and `ExecReload`. Prepares the gateway state.
- `SIGUSR2`: Sent by `ExecStartPost` and `ExecReload`. Triggers a full reconciliation. The gateway re-adds dynamic upstreams through the runtime API.

See the `examples` directory in the drove-gateway repo for the systemd drop-in config.

### HAProxy server state file management

When you disable HAProxy reloads, dynamic servers are lost on HAProxy restart. The gateway can persist and restore them.

| Option                                | Default | Description                                                        |
|---------------------------------------|---------|--------------------------------------------------------------------|
| haproxy_manage_global_server_state_file | false | Write HAProxy `show servers state` output to the state file after each successful reconcile. |
| haproxy_global_server_state_file_path | ""      | Path to the HAProxy state file. Required when the option above is enabled. The path must match `server-state-file` in `haproxy.cfg`. |

How this works:

1. After each successful reconcile, the gateway writes the HAProxy state to the state file.
2. The command `nixy -sync-haproxy-state-config` reads the state file. It fills the `#DROVE-SERVERS-BEGIN` and `#DROVE-SERVERS-END` blocks in `haproxy.cfg`.
3. HAProxy loads the servers with `load-server-state-from-file` when it starts.

!!!warning
    When state file management is enabled together with `haproxy_reload_disabled = true`, you must add at least one `#DROVE-SERVERS-BEGIN`/`#DROVE-SERVERS-END` block in `haproxy.cfg`. The gateway refuses to start without it.

    The backend name after `#DROVE-SERVERS-BEGIN` must match the backend the servers belong to. HAProxy ignores these comment lines. The config stays valid when a block is empty.

### Building from source

Refer to `BUILD.md` and `PACKAGING.md` in the drove-gateway repo for build and packaging steps. The repo supports Debian and RPM packages.

## Health and metrics

The nixy listener inside the gateway exposes a health endpoint and a Prometheus metrics endpoint. Both are on the nixy `address`/`port` listener, not the proxy port.

- `/v1/health`: Returns the gateway health as JSON. The response is HTTP 200 when the gateway is healthy and HTTP 500 when it is not.
- `/v1/metrics`: Exposes Prometheus metrics.

The health endpoint reports these conditions:

- Template rendering and config generation health
- DNS resolver health
- Upstream update health for the proxy runtime API
- HAProxy global server state file update health
- Proxy control plane responsiveness within the configured timeout
- Disk I/O health for state persistence
- Endpoint health per namespace, including whether all endpoints of a namespace are down

Key metrics exposed on `/v1/metrics`:

| Metric | Type | Description |
|--------|------|-------------|
| `drove_gateway_proxy_control_plane_healthy` | gauge | 1 if the proxy control plane responds within the configured timeout, 0 otherwise. |
| `drove_gateway_server_state_file_update_healthy` | gauge | 1 if HAProxy global server state file updates complete, 0 otherwise. |
| `drove_gateway_disk_io_healthy` | gauge | 1 if disk reads and writes for state persistence complete within the configured timeout, 0 otherwise. |
| `drove_gateway_proxy_control_plane_timeout_breaches_total` | counter | Number of times the proxy control plane did not respond within the configured timeout. |
| `drove_gateway_reloads_failed` / `drove_gateway_reloads_successful` | counter | Failed and successful proxy reloads. |
| `drove_gateway_reload_duration` | histogram | Proxy reload duration. |
| `drove_gateway_configured_endpoints_total` / `drove_gateway_healthy_endpoints_total` | gauge | Configured and healthy endpoints per namespace. |

### API timeout

| Option | Default | Description |
|--------|---------|-------------|
| `api_timeout` | 10 | Timeout in seconds for calls to the proxy runtime API and to the Drove controllers. |