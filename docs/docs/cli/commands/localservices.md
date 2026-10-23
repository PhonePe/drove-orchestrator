# drove localservices

Manage local services. A local service runs on every executor in the cluster.

## Synopsis

```bash
drove localservices <command> [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `list` | List local services |
| `summary` | Show service summary |
| `spec` | Get specification |
| `create` | Create service |
| `destroy` | Delete service |
| `activate` | Start service |
| `conftest` | Deploy test instance |
| `deactivate` | Stop service |
| `update` | Update instance count |
| `restart` | Rolling restart |
| `cancelop` | Cancel operation |

---

## drove localservices list

List all local services in the cluster.

```bash
drove localservices list [--sort COLUMN] [--reverse]
```

| Option | Description |
|--------|-------------|
| `-s, --sort` | Sort output by column (0-8) |
| `-r, --reverse` | Sort in reverse order |

---

## drove localservices summary

Show the summary of one local service.

```bash
drove localservices summary <service-id>
```

---

## drove localservices spec

Print the raw JSON specification of a local service.

```bash
drove localservices spec <service-id>
```

---

## drove localservices create

Create a new local service from a spec file.

```bash
drove localservices create <spec-file> [--instances N]
```

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --instances` | Instances per executor | 1 |

---

## drove localservices destroy

Delete a local service. The service must be inactive before you can destroy it.

```bash
drove localservices destroy <service-id>
```

---

## drove localservices activate

Activate a local service. Drove starts instances on all executors.

We recommend that you run `drove localservices conftest <service-id>` first, and then activate.

```bash
drove localservices activate <service-id>
```

---

## drove localservices conftest

Deploy one test instance to validate the service.

Run this before `activate` to verify the spec, config, and checks before a full rollout.

```bash
drove localservices conftest <service-id>
```

---

## drove localservices deactivate

Deactivate a local service. Drove stops all instances.

```bash
drove localservices deactivate <service-id>
```

---

## drove localservices update

Change the number of instances per executor.

```bash
drove localservices update <service-id> <count>
```

---

## drove localservices restart

Restart all instances, one at a time, in a rolling fashion.

```bash
drove localservices restart <service-id> [--stop] [--parallelism N] [--timeout DURATION] [--wait]
```

| Option | Description |
|--------|-------------|
| `-s, --stop` | Stop before starting new |
| `-p, --parallelism` | Parallel tasks for operation |
| `-t, --timeout` | Cluster operation timeout (for example `5m`) |
| `-w, --wait` | Wait until replacement is complete |

---

## drove localservices cancelop

Cancel the operation that is currently running on a local service.

```bash
drove localservices cancelop <service-id>
```
