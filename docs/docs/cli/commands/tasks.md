# drove tasks

Manage one-off tasks. A task runs once and exits when it completes.

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

List the tasks that are currently active.

```bash
drove tasks list [--app APP] [--sort COLUMN] [--reverse]
```

| Option | Description |
|--------|-------------|
| `-a, --app` | Filter by source application |
| `-s, --sort` | Sort output by column (0-8) |
| `-r, --reverse` | Sort in reverse order |

---

## drove tasks create

Create a new task from a spec file.

```bash
drove tasks create <spec-file>
```

---

## drove tasks show

Show the details of one task.

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

List the log files available for a task.

```bash
drove tasks logs <source-app> <task-id>
```

---

## drove tasks tail

Follow the logs of a task.

```bash
drove tasks tail <source-app> <task-id> [--log FILE]
```

| Option | Description | Default |
|--------|-------------|---------|
| `-l, --log` | Log file name | output.log |

---

## drove tasks download

Download a task log file to your machine.

```bash
drove tasks download <source-app> <task-id> <file> [--out OUTPUT]
```
