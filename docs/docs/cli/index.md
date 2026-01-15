# Drove CLI

The Drove CLI (`drove`) provides command-line access to Drove clusters.

## Before you begin

You need:

- Python 3.x or Docker
- Network access to a Drove controller
- Valid credentials (username/password or auth token)

## Install drove-cli

=== "pip"
    ```bash
    pip install drove-cli
    ```

=== "Docker"
    ```bash
    docker pull ghcr.io/phonepe/drove-cli:latest

    # Create wrapper script
    cat > /usr/local/bin/drove << 'EOF'
    #!/bin/sh
    docker run --rm -it --network host \
      -v ${HOME}/.drove:/root/.drove:ro \
      ghcr.io/phonepe/drove-cli:latest "$@"
    EOF
    chmod +x /usr/local/bin/drove
    ```

Verify:
```bash
drove --version
```

## Upgrade drove-cli

=== "pip"
    ```bash
    pip install -U drove-cli
    ```

=== "Docker"
    ```bash
    docker pull ghcr.io/phonepe/drove-cli:latest
    ```

## Configure cluster access

Create `~/.drove`:

```ini
[DEFAULT]
current_cluster = prod

[prod]
endpoint = https://drove.example.com

auth_header = Bearer <token>
# or 
username = admin
password = admin
```

Test connectivity:
```bash
drove cluster ping
```

See [Configuration](configuration.md) for auth options and multi-cluster setup.

## Enabling Command Completion

You can generate shell completions file for `bash`, `zfs` and `tcsh` using the `--print-completion` option.

```shell
drove --print-completion bash > drove.bash.completions
```

To use this osurce the completion file
```shell
source drove.bash.completions
```

!!!tip
    Check your operating system documentation to understand where to store this file to enable completions automatically.

## Common tasks

### View cluster state
```bash
drove cluster summary
drove executor list
```

### Deploy an application
```bash
drove apps create app-spec.json
drove apps scale MY_APP-1 3 --wait
```

### Check application health
```bash
drove apps list
drove describe app MY_APP-1
```

### Debug a failing instance
```bash
drove appinstances list MY_APP-1
drove describe instance MY_APP-1 AI-xxxxx
drove appinstances tail MY_APP-1 AI-xxxxx
```

### Switch clusters
```bash
drove config get-clusters
drove config use-cluster staging
```

## Command groups

| Command | Purpose |
|---------|---------|
| [`appinstances`](commands/appinstances.md) | Instance operations |
| [`apps`](commands/apps.md) | Application lifecycle |
| [`cluster`](commands/cluster.md) | Cluster operations |
| [`config`](commands/config.md) | CLI configuration |
| [`describe`](commands/describe.md) | Detailed resource info |
| [`executor`](commands/executor.md) | Node management |
| [`localservices`](commands/localservices.md) | Per-node services |
| [`lsinstances`](commands/lsinstances.md) | Local service instances |
| [`tasks`](commands/tasks.md) | One-off task execution |

## Get help

```bash
drove -h              # All commands
drove apps -h         # Command group
drove apps scale -h   # Specific command
```
