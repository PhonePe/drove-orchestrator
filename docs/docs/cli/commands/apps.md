# drove apps

Manage the lifecycle of your applications.

## Synopsis

```bash
drove apps <command> [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `list` | List applications |
| `summary` | Show app summary |
| `spec` | Get app specification |
| `create` | Create new app |
| `destroy` | Delete app |
| `deploy` | Add instances |
| `scale` | Set instance count |
| `suspend` | Stop all instances |
| `restart` | Rolling restart |
| `cancelop` | Cancel running operation |

---

## drove apps list

List all applications in the cluster.

```bash
drove apps list [--sort COLUMN] [--reverse]
```

| Option | Description |
|--------|-------------|
| `-s, --sort` | Sort output by column (0-8) |
| `-r, --reverse` | Sort in reverse order |

---

## drove apps summary

Show the details of one application.

```bash
drove apps summary <app-id>
```

Example:
```bash
drove apps summary PAYMENT_SERVICE-1
```

---

## drove apps spec

Print the raw JSON specification of an application.

```bash
drove apps spec <app-id>
```

---

## drove apps create

Create a new application from a spec file.

```bash
drove apps create <spec-file>
```

Example:
```bash
drove apps create payment-service.json
```

The app starts in monitoring state. Use `deploy` or `scale` to start instances. Refer to [Application Lifecycle](../../applications/index.md#application-state-machine) to understand more about application states.

---

## drove apps deploy

Add new instances to an application.

```bash
drove apps deploy <app-id> <count> [--parallelism N] [--timeout DURATION] [--wait]
```

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --parallelism` | Concurrent operations | 1 |
| `-t, --timeout` | Operation timeout | 5m |
| `-w, --wait` | Wait for completion | false |

Example:
```bash
# Deploy 5 instances, 2 at a time
drove apps deploy PAYMENT_SERVICE-1 5 -p 2 -w
```

---

## drove apps scale

Scale an application to an exact instance count. The command adds or removes instances as needed.

```bash
drove apps scale <app-id> <count> [--parallelism N] [--timeout DURATION] [--wait]
```

Example:
```bash
# Scale to 10 instances
drove apps scale PAYMENT_SERVICE-1 10 -w

# Scale down to 2
drove apps scale PAYMENT_SERVICE-1 2 -w
```

---

## drove apps suspend

Stop all instances of an application (scale to 0).

```bash
drove apps suspend <app-id> [--parallelism N] [--timeout DURATION] [--wait]
```

---

## drove apps restart

Restart all instances, one at a time, in a rolling fashion.

```bash
drove apps restart <app-id> [--parallelism N] [--timeout DURATION] [--wait]
```

Example:
```bash
# Restart with parallelism of 3
drove apps restart PAYMENT_SERVICE-1 -p 3 -w
```

---

## drove apps destroy

Delete an application. The app must have zero instances before you can destroy it.

```bash
drove apps destroy <app-id>
```

---

## drove apps cancelop

Cancel the operation that is currently running on an application.

```bash
drove apps cancelop <app-id>
```
