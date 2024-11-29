# Setting up Drove Gateway
The Drove Gateway works as a gateway to expose apps running on a drove cluster to rest of the world.

Drove Gateway container uses [NGinx](https://nginx.org){:target="_blank"} and a modified version of [Nixy](https://github.com/martensson/nixy){:target="_blank"} to track drove endpoints. More details about this can be found in the [drove-gateway](https://github.com/PhonePe/drove-gateway){:target="_blank"} project.

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

# Nginx related config

nginx_config = "/etc/nginx/nginx.conf"#(10)!
nginx_template = "/etc/drove/gateway/nginx.tmpl"#(11)!
nginx_cmd = "nginx"#(12)!
nginx_ignore_check = true#(13)!

# NGinx plus specific options
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
    
    > In this example, the RoutingTag variable will be set to the value specified in the `routing_tag` tag key specified when deploying the Drove Application. For example, if we want to expose the app we can set it to `yes`, and filter the VHost to be exposed in NGinx template when `RoutingTag == "yes"`.

5. Drove Gateway/Nixy works on event polling on controller. This is the polling interval. Especially if number of NGinx nodes is high. Default is `2 seconds`. Unless cluster is really busy with a high rate of change of containers, this strikes a good balance between apps becoming discoverable vs putting the leader controller under heavy load.

6. `user` and `pass` are optional params can be used to set basic auth credentials to the calls made to Drove controllers if basic auth is enabled on the cluster. Leave empty if no basic auth is required.

7. If cluster has some custom header based auth, the following can be used. The contents on this parameter are passed verbatim to the Authorization HTTP header. Leave empty if no token auth is enabled on the cluster.

8. By default drove-gateway will expose all vhost declared in the spec for all drove apps on a cluster (caveat: filtering can be done using RoutingTag as well). If specific vhosts need to be exposed, set the realms parameter to a comma separated list of realms. Optional.

9. Beside perfect vhost matching, Drove Gateway supports suffix based matches as well. A single suffix is supported. Optional.

10. Path to NGinx config.

11. Path to the template file, based on which the template will be generated.

12. NGinx command to use to reload the config. Set this to `openresty` optionally to use openresty.

13. Ignore calling NGinx command to test the config. Set this to false or delete this line on production. Default: false.

14. If using NGinx plus, set the endpoint to the local server here. If left empty, NGinx plus api based vhost update will be disabled.

15. If specific vhosts are exposed, auto-discovery and updation of config (and NGinx reloads) might not be desired as it will cause connection drops. Set the following parameter to true to disable reloads. Nixy will only update upstreams using the nplus APIs. Default: false.

16. Connection parameters for NGinx plus.


!!!danger "NGinx plus"
    NGinx plus is _not_ shipped with this docker. If you want to use NGinx plus, please build nixy from the source tree [here](https://github.com/PhonePe/drove-gateway){:target="_blank"} and build your own container.

## Relevant directories
Location for data and logs are as follows:

- `/etc/drove/gateway/` - Configuration files
- `/var/log/drove/gateway/` - NGinx Logs

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


# Nginx related config
nginx_config = "/etc/nginx/nginx.conf"
nginx_template = "/etc/drove/gateway/nginx.tmpl"
nginx_cmd = "nginx"
nginx_ignore_check = true
```

!!!danger "Replace domain names"
    Please remember to update `mydomain` to a valid domain you want to use.

## Create template for NGinx

Create a NGinx template with the following config in `/etc/drove/gateway/nginx.tmpl`

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

- Set NGinx port to 7000. This is the port exposed on the Docker container for the gateway. **Do not change this.**
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

NGinx logs would be available at `/var/log/drove/gateway`. 

### Log rotation for NGinx
    
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

