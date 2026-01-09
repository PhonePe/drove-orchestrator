# drove tasks

Manage one-off tasks.

## Synopsis

```bash
drove tasks <command> [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `list` | List active tasks |
| `create` | Create a task |
| `show` | Show task details |
| `kill` | Kill a task |
| `logs` | List log files |
| `tail` | Tail log output |
| `download` | Download log file |

---

## drove tasks list

List active tasks.

```bash
drove tasks list [--app APP] [--sort COLUMN] [--reverse]
```

| Option | Description |
|--------|-------------|
| `-a, --app` | Filter by source application |

---

## drove tasks create

Create a new task from spec file.

```bash
drove tasks create <spec-file>
```

---

## drove tasks show

Show task details.

```bash
drove tasks show <source-app> <task-id>
```

---

## drove tasks kill

Kill a running task.

```bash
drove tasks kill <source-app> <task-id>
```

---

## drove tasks logs

List available log files.

```bash
drove tasks logs <source-app> <task-id>
```

---

## drove tasks tail

Tail task logs.

```bash
drove tasks tail <source-app> <task-id> [--file FILE]
```

---

## drove tasks download

Download a log file.

```bash
drove tasks download <source-app> <task-id> <file> [--out OUTPUT]
```
