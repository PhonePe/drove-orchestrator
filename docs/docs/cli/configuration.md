# Configuration

This page explains how to configure the drove CLI for single and multi-cluster access.

## Config file location

The CLI reads its config from `~/.drove` by default. Use `-f` to point it at a different file:

```bash
drove -f /path/to/config cluster ping
```

## Single cluster setup

A minimal config looks like this:

```ini
[DEFAULT]

[mycluster]
endpoint = https://drove.example.com
auth_header = Bearer eyJhbGc...
# or
username = admin
password = admin
```

## Multi-cluster setup

With more than one cluster, set `current_cluster` to choose the default:

```ini
[DEFAULT]
current_cluster = prod

[staging]
endpoint = https://drove-staging.example.com
username = admin
password = admin123
insecure = true

[prod]
endpoint = https://drove.example.com
auth_header = Bearer eyJhbGc...
```

Switch clusters:

```bash
drove config use-cluster staging
drove cluster summary  # Now hits staging

drove -c prod cluster summary  # One-off override
```

## Authentication

The CLI supports two auth methods:

| Method | Config |
|--------|--------|
| Basic | `username` + `password` |
| Token | `auth_header` |

Basic auth:
```ini
[mycluster]
endpoint = https://drove.example.com
username = myuser
password = mypass
```

Token auth:
```ini
[mycluster]
endpoint = https://drove.example.com
auth_header = Bearer eyJhbGc...
```

!!!note
    If both are set, basic auth takes precedence.

## Variable interpolation

Use interpolation to avoid repeating tokens:

```ini
[DEFAULT]
current_cluster = prod
prod_token = Bearer eyJhbGc...

[prod]
endpoint = https://drove.example.com
auth_header = %(prod_token)s

[prod-readonly]
endpoint = https://drove.example.com
auth_header = %(prod_token)s
```

## SSL verification

Set `insecure = true` to skip certificate verification on internal clusters:

```ini
[internal]
endpoint = https://drove.internal
insecure = true
```

## Command line overrides

You can override any config option on the command line:

```bash
drove -e https://drove.example.com -u admin -p secret cluster ping
drove -c prod --insecure cluster summary
```

## Manage config with drove

The CLI can manage its own config file:

```bash
# Initialize new config
drove config init -e https://drove.example.com -n prod -t "Bearer xxx"

# Add cluster
drove config add-cluster staging -e https://staging.example.com -u admin -p pass

# List clusters
drove config get-clusters

# Switch default
drove config use-cluster staging

# View config
drove config view
```
