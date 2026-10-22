# drove cluster

Manage and monitor Drove clusters.

## Synopsis

```bash
drove cluster <command> [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `ping` | Check cluster connectivity |
| `summary` | Show cluster resources |
| `leader` | Show current leader |
| `endpoints` | List exposed endpoints |
| `events` | Stream cluster events |
| `simulate-placement` | Simulate placement for a deployable spec |
| `maintenance-on` | Enable maintenance mode |
| `maintenance-off` | Disable maintenance mode |

---

## drove cluster ping

Check if the cluster is reachable.

```bash
drove cluster ping
```

---

## drove cluster summary

Show cluster resource utilization.

```bash
drove cluster summary
```

Output:
```
State                         NORMAL
Leader Controller             drove-ctrl-1:4000
Cores                         Utilization: 45% (Total: 256 Used: 115 Free: 141)
Memory                        Utilization: 62% (Total: 512,000 MB Used: 317,440 MB Free: 194,560 MB)
Number of live executors      8
Applications                  Active: 23 Total: 31
```

---

## drove cluster leader

Show the current cluster leader.

```bash
drove cluster leader
```

---

## drove cluster endpoints

List all exposed application endpoints. Useful for debugging routing.

```bash
drove cluster endpoints [--vhost VHOST]
```

| Option | Description |
|--------|-------------|
| `-v, --vhost` | Filter by virtual host |

Example:
```bash
drove cluster endpoints -v myapp.example.com
```

---

## drove cluster events

Stream cluster events in real-time.

```bash
drove cluster events [--follow] [--type TYPE] [--count COUNT]
```

| Option | Description |
|--------|-------------|
| `-f, --follow` | Stream continuously |
| `-t, --type` | Filter by event type |
| `-c, --count` | Number of events to fetch at a time (default: 1024) |
| `-s, --textfmt` | Python format string for each event (default: `{type: <25} | {id: <36} | {time: <20} | {metadata}`) |

Example:
```bash
# Watch all events
drove cluster events -f

# Filter by type
drove cluster events -t APP_STATE_CHANGE -c 50
```

---

## drove cluster simulate-placement

Simulate placement for a deployable spec. The command sends the spec to the cluster simulation API. The cluster does not change.

```bash
drove cluster simulate-placement SPEC_FILE [--num-instances N] [--placement-policy FILE] [--detail] [--json]
```

| Option | Description |
|--------|-------------|
| `spec_file` | Path to a spec file. The spec can be an application, task, or local service. |
| `-n, --num-instances` | Number of instances to simulate. The default is 1. |
| `--placement-policy` | Path to a JSON file with a placement policy. The policy overrides the spec policy. |
| `--detail` | Show per-instance placements. |
| `--json` | Print the raw JSON response. |

Example:
```bash
drove cluster simulate-placement app-spec.json -n 4 --detail
```

---

## drove cluster maintenance-on

Put cluster in maintenance mode. New operations are rejected.

```bash
drove cluster maintenance-on
```

!!!warning
    Running applications continue but no new deployments or scaling operations are accepted.

---

## drove cluster maintenance-off

Exit maintenance mode.

```bash
drove cluster maintenance-off
```
