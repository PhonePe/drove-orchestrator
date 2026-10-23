# Drove CLI

The Drove CLI (`drove`) gives you command-line access to your Drove clusters. Use it to deploy applications, run one-off tasks, inspect cluster health, and manage nodes — all from your terminal.

## Before you begin

Before you install the CLI, make sure you have:

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

Once the install finishes, confirm that the CLI is available and can reach your cluster:
```bash
pip show drove-cli

drove cluster ping
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

## Global options

These options work with every command. Put them before the command name:

| Option | Description |
|--------|-------------|
| `-f, --file` | Path to a config file (default: `~/.drove`) |
| `-c, --cluster` | Cluster name from the config file |
| `-e, --endpoint` | Drove endpoint URL (for example: `https://drove.test.com`) |
| `-t, --auth-header` | Authorization header value for the endpoint |
| `-u, --username` | Drove cluster username |
| `-p, --password` | Drove cluster password |
| `-i, --insecure` | Do not verify the SSL certificate of the server |
| `-d, --debug` | Print details of errors |
| `--full-help` | Show help for every command and sub-command |
| `--print-completion {bash,zsh,tcsh}` | Print a shell completion script |

## Configure cluster access

The CLI stores its settings in `~/.drove`. Create the file with your cluster endpoint and credentials:

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

Then check that the CLI can reach your cluster:
```bash
drove cluster ping
```

See [Configuration](configuration.md) for auth options and multi-cluster setup.

## AI Agent skill

`drove-cli` ships an AI Agent skill that helps coding agents operate Drove using the correct CLI commands and workflows.

- Skill file: `drove-cli/drove-cli/SKILL.md`
- Covers: apps, app instances, local services, local service instances, tasks, executors, and cluster operations
- Includes recommended sequence for local services (`create -> conftest -> activate`)

Add this skill to your agent setup if you want the agent to run Drove operations reliably, without looking up commands by hand.

## Enabling command completion

The CLI can print a completion script for `bash`, `zsh`, and `tcsh`:

```shell
drove --print-completion bash > drove.bash.completions
```

To use the completions in your current shell, source the file:
```shell
source drove.bash.completions
```

!!!tip
    Check your operating system documentation to understand where to store this file to enable completions automatically.

## Common tasks

Here are the commands you will use most often. Each command group has a full reference page — see [Command groups](#command-groups) below.

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
drove appinstances tail MY_APP-1 AI-xxxxx --log output.log
```

### Switch clusters
```bash
drove config get-clusters
drove config use-cluster staging
```

## Command groups

Each command group has its own reference page:

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

The CLI prints built-in help at every level:

```bash
drove -h              # All commands
drove --full-help     # Help for every command and sub-command
drove apps -h         # Command group
drove apps scale -h   # Specific command
```
