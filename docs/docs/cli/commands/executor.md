# drove executor

Manage executor nodes.

## Synopsis

```bash
drove executor <command> [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `list` | List all executors |
| `info` | Show executor details |
| `appinstances` | List app instances on executor |
| `tasks` | List tasks on executor |
| `lsinstances` | List local service instances |
| `blacklist` | Remove from rotation |
| `unblacklist` | Add back to rotation |

---

## drove executor list

List all executors with resource usage.

```bash
drove executor list
```

---

## drove executor info

Show detailed executor information.

```bash
drove executor info <executor-id>
```

---

## drove executor appinstances

List application instances running on an executor.

```bash
drove executor appinstances <executor-id> [--sort COLUMN] [--reverse]
```

---

## drove executor tasks

List tasks running on an executor.

```bash
drove executor tasks <executor-id> [--sort COLUMN] [--reverse]
```

---

## drove executor lsinstances

List local service instances on an executor.

```bash
drove executor lsinstances <executor-id> [--sort COLUMN] [--reverse]
```

---

## drove executor blacklist

Remove executors from scheduling rotation. Existing workloads continue running.

```bash
drove executor blacklist <executor-id> [<executor-id> ...]
```

Example:
```bash
# Blacklist for maintenance
drove executor blacklist exec-001 exec-002
```

---

## drove executor unblacklist

Add executors back to rotation.

```bash
drove executor unblacklist <executor-id> [<executor-id> ...]
```
