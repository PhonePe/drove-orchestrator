# drove describe

Show detailed, human-readable information about Drove resources.

## Synopsis

```bash
drove describe <resource> [options]
```

## Resources

| Resource | Description |
|----------|-------------|
| `cluster` | Cluster overview with executors |
| `executor` | Executor details with instances |
| `app` | Application with spec and instances |
| `instance` | Application instance details |
| `task` | Task details |
| `localservice` | Local service with instances |
| `lsinstance` | Local service instance details |

All commands support `--json` for machine-readable output.

---

## drove describe cluster

Show cluster state, resources, and all executors.

```bash
drove describe cluster [--json]
```

Output:
```
Cluster Overview:
-----------------
  State:             NORMAL
  Leader:            drove-ctrl-1:4000

Resource Utilization:
---------------------
  CPU:
    Total:           256
    Used:            115
    Free:            141
    Utilization:     44.9%
  Memory:
    Total:           512,000 MB
    Used:            317,440 MB
    Free:            194,560 MB
    Utilization:     62.0%

Executors (8):
--------------
  [OK] exec-001
      Host: drove-exec-001:3000
      CPU: 32/64 used
      Memory: 48,000/64,000 MB used
  ...
```

---

## drove describe executor

Show executor resources, running instances, and tasks.

```bash
drove describe executor <executor-id> [--json]
```

---

## drove describe app

Show application details including spec, health, and all instances.

```bash
drove describe app <app-id> [--json]
```

Output:
```
Application Details:
--------------------
  ID:                PAYMENT_SERVICE-1
  Name:              PAYMENT_SERVICE
  State:             RUNNING
  Created:           08/01/2026, 10:15:21
  Updated:           08/01/2026, 14:32:45

Instance Summary:
-----------------
  Required:          5
  Healthy:           5
  Total CPU:         10
  Total Memory:      2,560 MB

Specification:
--------------
  Executable Type:   DOCKER
  Docker Image:      myregistry/payment-service:v2.3.1
  CPU per Instance:  2
  Memory per Inst:   512 MB

Instances (5):
--------------
  [OK] AI-abc123...
      Host: drove-exec-001
      State: HEALTHY
      Created: 08/01/2026, 10:15:30
  ...
```

---

## drove describe instance

Show application instance details including ports and resources.

```bash
drove describe instance <app-id> <instance-id> [--json]
```

---

## drove describe task

Show task details including execution state and result.

```bash
drove describe task <source-app> <task-id> [--json]
```

---

## drove describe localservice

Show local service details and instances across executors.

```bash
drove describe localservice <service-id> [--json]
```

---

## drove describe lsinstance

Show local service instance details.

```bash
drove describe lsinstance <service-id> <instance-id> [--json]
```
