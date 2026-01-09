# drove appinstances

Manage application instances.

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

List instances for an application.

```bash
drove appinstances list <app-id> [--old] [--sort COLUMN] [--reverse]
```

| Option | Description |
|--------|-------------|
| `--old` | Include terminated instances |

---

## drove appinstances info

Show instance details.

```bash
drove appinstances info <app-id> <instance-id>
```

---

## drove appinstances logs

List available log files for an instance.

```bash
drove appinstances logs <app-id> <instance-id>
```

---

## drove appinstances tail

Tail instance logs.

```bash
drove appinstances tail <app-id> <instance-id> [--log FILE]
```

| Option | Description | Default |
|--------|-------------|---------|
| `-l, --log` | Log file name | output.log |

Example:
```bash
drove appinstances tail MY_APP-1 AI-abc123 -l error.log
```

---

## drove appinstances download

Download a log file.

```bash
drove appinstances download <app-id> <instance-id> <file> [--out OUTPUT]
```

---

## drove appinstances replace

Replace instances with fresh ones. Useful for rotating unhealthy instances.

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

Kill specific instances without replacement.

```bash
drove appinstances kill <app-id> <instance-id> [<instance-id> ...] \
    [--parallelism N] [--timeout DURATION] [--wait]
```

!!!warning
    This reduces instance count. Use `replace` to maintain count.
