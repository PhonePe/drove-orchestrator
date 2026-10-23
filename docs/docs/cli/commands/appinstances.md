# drove appinstances

Manage the individual instances of your applications.

## Synopsis

```bash
drove appinstances <command> [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `list` | List instances |
| `info` | Show instance details |
| `logs` | List log files |
| `tail` | Tail log output |
| `download` | Download log file |
| `replace` | Replace instances |
| `kill` | Kill instances |

---

## drove appinstances list

List the instances of an application.

```bash
drove appinstances list <app-id> [--old] [--sort COLUMN] [--reverse]
```

| Option | Description |
|--------|-------------|
| `--old` | Include terminated instances |
| `-s, --sort` | Sort output by column (0-6) |
| `-r, --reverse` | Sort in reverse order |

---

## drove appinstances info

Show the details of a single instance.

```bash
drove appinstances info <app-id> <instance-id>
```

---

## drove appinstances logs

List the log files available for an instance.

```bash
drove appinstances logs <app-id> <instance-id>
```

---

## drove appinstances tail

Follow the logs of an instance.

```bash
drove appinstances tail <app-id> <instance-id> [--log FILE] [--skip-chars N]
```

| Option | Description | Default |
|--------|-------------|---------|
| `-l, --log` | Log file name | output.log |
| `-S, --skip-chars` | Skip N leading characters per log line before printing | 0 |

Example:
```bash
drove appinstances tail MY_APP-1 AI-abc123 -l error.log

# Hide the drove log prefix on each line
drove appinstances tail MY_APP-1 AI-abc123 --skip-chars 67
```

---

## drove appinstances download

Download a log file to your machine.

```bash
drove appinstances download <app-id> <instance-id> <file> [--out OUTPUT]
```

---

## drove appinstances replace

Replace instances with fresh ones. Use this to rotate unhealthy instances while keeping the instance count unchanged.

```bash
drove appinstances replace <app-id> <instance-id> [<instance-id> ...] \
    [--parallelism N] [--timeout DURATION] [--wait]
```

Example:
```bash
drove appinstances replace MY_APP-1 AI-abc123 AI-def456 -w
```

---

## drove appinstances kill

Kill specific instances without replacing them.

```bash
drove appinstances kill <app-id> <instance-id> [<instance-id> ...] \
    [--parallelism N] [--timeout DURATION] [--wait]
```

!!!warning
    This reduces instance count. Use `replace` to maintain count.
