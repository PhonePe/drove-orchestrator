# Setting up CoreDNS Drove
The Drove Plugin for CoreDNS allows for DNS based service discovery of application endpoints deployed on a drove cluster.

We provide a Docker to deploy Drove plugin enabled CoreDNS easily. More details about this can be found in the [coredns-drove](https://github.com/PhonePe/coredns-drove){:target="_blank"} project.

## CoreDNS Drove plugin options reference
This section discusses the configuration options for the Drove plugin. For detailed coredns options please refer to the [coredns manual](https://coredns.io/manual/toc/).

The plugin configuration is part of the `Corefile`, the configuration file taken as input by CoreDNS. To use the provided container the configuration can be provided in one of two ways:
- For a standard simpler setup, environment variables can be provided to the container to set it up
- For more complicated setups mounting a Corefile is the way to go

We adopt the latter in this section as it provides maximum flexibility.


```kconfig
.:1053 {
    log
	whoami
    cache 30
	ready
	prometheus
	drove {
		endpoint "http://controller1.mydomain:10000,http://controller1.mydomain:10000" # (1)!
		access_token "<DROVE_ACCESS_TOKEN>" # (2)!
		user_pass guest guest # (3)!
		gateway "gateway1.mydomain,gateway2.mydomain" #(4)!
		skip_ssl_check #(5)!
	}
	forward . 1.1.1.1 #(6)!
}
```

1. List of controller endpoints
2. Access token for drove controller if using access token based access control
3. Drove username and password if using basic auth
4. List of Drove Gateway IP addresses or hostnames
5. Skip SSL checking on controller endpoints
6. Coredns option to forward non matching/global requests to upstream

!!!note
    The above config will get the job done, but will forward non-matching requests to upstream (`1.1.1.1` in this case). Please go through coredns manual to create better configuration if you want.



## Relevant directories
Location for data and logs are as follows:

- `/etc/drove/dns/` - Configuration files

We shall be volume mounting the Corefile directly into the container.

!!!warning "Prerequisite Setup"
    If not done already, please complete the [prerequisite setup](prerequisites.md) on all machines earmarked for the cluster.

Go through the following steps to run `drove-dns` as a service.

## Create the Corefile for CoreDNS

Sample config file `/etc/drove/dns/Corefile`:

```kconfig
.:1053 {
    log
	whoami
    cache 30
	ready
	prometheus
	drove {
        # Put correct http(s) endpoints for controllers below
		endpoint "http://controller1.mydomain:10000,http://controller1.mydomain:10000"
		user_pass guest guest

        # Put correct hostname list below
		gateway "gateway1.mydomain,gateway2.mydomain"
		skip_ssl_check
	}
	forward . 1.1.1.1
}

```
!!!note "Port"
    The docker container exposes port `1053` for DNS lookups.

!!!danger "Replace hostnames and IPs"
    Please remember to update `endpoint` and `gateway` values.

## Create systemd file
Create a `systemd` file. Put the following in `/etc/systemd/system/drove.gateway.service`:

```systemd
[Unit]
Description=Drove Enabled CoreDNS Service
After=docker.service
Requires=docker.service

[Service]
User=drove
Group=docker
TimeoutStartSec=0
Restart=always
ExecStartPre=-/usr/bin/docker pull ghcr.io/phonepe/coredns-drove:latest
ExecStart=/usr/bin/docker run  \
    --volume /etc/drove/dns/Corefile:/opt/Corefile:ro \
    --network host \
    --hostname %H \
    --rm \
    --name drove.dns \
    ghcr.io/phonepe/coredns-drove:latest

[Install]
WantedBy=multi-user.target
```


Verify the file with the following command:
```shell
systemd-analyze verify drove.dns.service
```

Set permissions
```shell
chmod 664 /etc/systemd/system/drove.dns.service
```

## Start the service on all servers

Use the following to start the service:

```shell
systemctl daemon-reload
systemctl enable drove.dns
systemctl start drove.dns
``` 

## Checking Logs
You can check logs using:
```shell
journalctl -u drove.dns -f
```

## Testing the setup

You need to test to confirm the setup is working as expected. 

!!!note
    Since this server is not configured system wide, we shall pass `@127.0.0.1` and `-p1053` options to `dig` to test name lookups.

### Test global lookups

We lookup the ip for mozilla.org  using the following command:

```shell
 dig  @127.0.0.1 -p1053 mozilla.org
```

*Sample output:*
```text
; <<>> DiG 9.18.28-0ubuntu0.22.04.1-Ubuntu <<>> @127.0.0.1 -p1053 mozilla.org
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 7871
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;mozilla.org.			IN	A

;; ANSWER SECTION:
mozilla.org.		373	IN	A	35.190.14.201

;; Query time: 8 msec
;; SERVER: 127.0.0.1#1053(127.0.0.1) (UDP)
;; WHEN: Sat Jan 18 00:57:18 UTC 2025
;; MSG SIZE  rcvd: 67
```

As you can see the IP `35.190.14.201` is returned in the `ANSWER SECTION` of the output.

### Test simple application vhost lookup

Let's assume an application is deployed with `testapp.localtest` as the Vhost. We are going to do a simple A record lookup to get the IP.

```shell
 dig  @127.0.0.1 -p1053 testapp.localtest
```

*Sample output:*
```text
; <<>> DiG 9.18.28-0ubuntu0.22.04.1-Ubuntu <<>> @127.0.0.1 -p1053 testapp.localtest
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 51801
;; flags: qr rd ra ad; QUERY: 1, ANSWER: 1, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;testapp.localtest.		IN	A

;; ANSWER SECTION:
testapp.localtest.	30	IN	A	192.168.56.10

;; AUTHORITY SECTION:
.			86400	IN	SOA	a.root-servers.net. nstld.verisign-grs.com. 2025011702 1800 900 604800 86400

;; Query time: 12 msec
;; SERVER: 127.0.0.1#1053(127.0.0.1) (UDP)
;; WHEN: Sat Jan 18 01:01:39 UTC 2025
;; MSG SIZE  rcvd: 154

```

The `ANSWER SECTION` contains one of the gateway ips as provided in the Corefile (`192.168.56.10` in the above example).

### Test SRV lookup
SRV record lookups help clients get the host and port combination for the upstreams defined for a Drove application. The clients can use custom logic to talk directly to such application instances completely bypassing the Drove Gateway, thereby eliminating a single point of failure.

```bash
dig  @127.0.0.1 -p1053 testapp.localtest SRV
```

*Sample output*
```text
; <<>> DiG 9.18.28-0ubuntu0.22.04.1-Ubuntu <<>> @127.0.0.1 -p1053 testapp.localtest SRV
; (1 server found)
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN, id: 57387
;; flags: qr rd ra ad; QUERY: 1, ANSWER: 5, AUTHORITY: 1, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
;; QUESTION SECTION:
;testapp.localtest.		IN	SRV

;; ANSWER SECTION:
testapp.localtest.	30	IN	SRV	1 1 33541 d-exctr.
testapp.localtest.	30	IN	SRV	1 1 40891 d-exctr.
testapp.localtest.	30	IN	SRV	1 1 39427 d-exctr.
testapp.localtest.	30	IN	SRV	1 1 39219 d-exctr.
testapp.localtest.	30	IN	SRV	1 1 37681 d-exctr.

;; AUTHORITY SECTION:
.			86400	IN	SOA	a.root-servers.net. nstld.verisign-grs.com. 2025011702 1800 900 604800 86400

;; Query time: 12 msec
;; SERVER: 127.0.0.1#1053(127.0.0.1) (UDP)
;; WHEN: Sat Jan 18 01:06:37 UTC 2025
;; MSG SIZE  rcvd: 341

```

The `ANSWER SECTION` contains 5 {port:host} combinations corresponding to the 5 instances deployed for this application on the executor named `d-exctr`.

All tests are successful!!

## Using DroveDNS for system wide DNS resolution
Given the above configuration we can use Drove DNS as the resolver across all systems. The following sections use Ubuntu based servers for reference commands, other distributions should have similar course of actions.

In order to achieve system wide DNs resolution, we need to configure `systemd-resolved`. This is achieved by modifying the `/etc/systemd/resolved.conf` file.

Open the `vim /etc/systemd/resolved.conf` file in your favourite text editor and go the section called `[Resolve]`. Add your Drove DNS server(s)' IPs and ports in the `DNS` field.

```conf
# ... other stuff
[Resolve]
# ...
DNS=192.168.56.10:1053
#FallbackDNS=
#...
```

!!!note
    Multiple IP:port combinations can be provided

That's it, the configuration is ready.

Restart the resolver using the following commands:
```shell
service systemd-resolved restart
```

### Validating the setup
Ensure the settings have taken effect by issueing the command:
```shell
resolvectl status
```

In the output of the `Global` section should look something similar to the following:

```shell
Global
         Protocols: -LLMNR -mDNS -DNSOverTLS DNSSEC=no/unsupported
  resolv.conf mode: foreign
Current DNS Server: 192.168.56.10:1053
       DNS Servers: 192.168.56.10:1053
```

If your configured IPs show up, you can run the same set of tests as before without the ip and port to ensure name lookup is working as expected.

```shell
dig mozilla.org #(1)!
dig testapp.localtest #(2)!
dig testapp.localtest SRV #(3)!
```

 1. Global lookup
 2. A record lookup
 3. SRV lookup


