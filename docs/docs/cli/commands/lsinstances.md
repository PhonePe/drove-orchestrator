# drove lsinstances

Manage local service instances.

## Synopsis

```bash
drove lsinstances <command> [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `list` | List local service instances |
| `info` | Show local service instance details |
| `logs` | List local service instance log files |
| `tail` | Tail local service instance logs |
| `download` | Download local service instance log file |
| `replace` | Replace local service instances |
| `kill` | Kill local service instances |

---

## drove lsinstances list

List instances for a local service.

```bash
drove lsinstances list <service-id> [--old] [--sort COLUMN] [--reverse]
```

---

## drove lsinstances info

Show instance details.

```bash
drove lsinstances info <service-id> <instance-id>
```

---

## drove lsinstances logs

List available log files.

```bash
drove lsinstances logs <service-id> <instance-id>
```

---

## drove lsinstances tail

Tail instance logs.

```bash
drove lsinstances tail <service-id> <instance-id> [--log FILE] [--skip-chars N]
```

| Option | Description |
|--------|-------------|
| `-l, --log` | Log filename to tail (`output.log` by default) |
| `-S, --skip-chars` | Skip leading characters per line before printing |

---

## drove lsinstances download

Download a log file.

```bash
drove lsinstances download <service-id> <instance-id> <file> [--out OUTPUT]
```

---

## drove lsinstances replace

Replace instances with fresh ones.

```bash
drove lsinstances replace <service-id> <instance-id> [<instance-id> ...] \
    [--stop] [--parallelism N] [--timeout DURATION] [--wait]
```

---

## drove lsinstances kill

Kill specific instances.

```bash
drove lsinstances kill <service-id> <instance-id> [<instance-id> ...] \
    [--parallelism N] [--timeout DURATION] [--wait]
```
