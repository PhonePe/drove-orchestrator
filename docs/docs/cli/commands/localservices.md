# drove localservices

Manage local services. Local services run on every executor in the cluster.

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

List all local services.

```bash
drove localservices list [--sort COLUMN] [--reverse]
```

---

## drove localservices summary

Show service summary.

```bash
drove localservices summary <service-id>
```

---

## drove localservices spec

Print raw JSON specification.

```bash
drove localservices spec <service-id>
```

---

## drove localservices create

Create a new local service.

```bash
drove localservices create <spec-file> [--instances N]
```

| Option | Description | Default |
|--------|-------------|---------|
| `-i, --instances` | Instances per executor | 1 |

---

## drove localservices destroy

Delete an inactive local service.

```bash
drove localservices destroy <service-id>
```

---

## drove localservices activate

Activate a local service. Starts instances on all executors.

Recommended sequence: run `drove localservices conftest <service-id>` first, then activate.

```bash
drove localservices activate <service-id>
```

---

## drove localservices conftest

Deploy one test instance for validation.

This is recommended before `activate` to verify spec/config/checks before full rollout.

```bash
drove localservices conftest <service-id>
```

---

## drove localservices deactivate

Deactivate a local service. Stops all instances.

```bash
drove localservices deactivate <service-id>
```

---

## drove localservices update

Update instances per executor.

```bash
drove localservices update <service-id> <count>
```

---

## drove localservices restart

Rolling restart of all instances.

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

Cancel the currently running operation.

```bash
drove localservices cancelop <service-id>
```
