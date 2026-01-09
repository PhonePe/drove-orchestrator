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
| `-c, --count` | Number of events to fetch |

Example:
```bash
# Watch all events
drove cluster events -f

# Filter by type
drove cluster events -t APP_STATE_CHANGE -c 50
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
