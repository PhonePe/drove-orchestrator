# drove config

Manage CLI configuration. These commands work offline.

## Synopsis

```bash
drove config <command> [options]
```

## Commands

| Command | Description |
|---------|-------------|
| `get-clusters` | List configured clusters |
| `current-cluster` | Show default cluster |
| `use-cluster` | Set default cluster |
| `view` | Show config file |
| `init` | Create new config |
| `add-cluster` | Add a cluster |
| `delete-cluster` | Remove a cluster |

---

## drove config get-clusters

List all configured clusters.

```bash
drove config get-clusters
```

Output:
```
CURRENT    NAME        ENDPOINT                         AUTH   INSECURE
------------------------------------------------------------------------
*          prod        https://drove.example.com        yes    no
           staging     https://drove-stg.example.com    yes    yes

Current cluster: prod
```

---

## drove config current-cluster

Show the current default cluster.

```bash
drove config current-cluster
```

---

## drove config use-cluster

Set the default cluster.

```bash
drove config use-cluster <cluster-name>
```

Example:
```bash
drove config use-cluster staging
# Switched to cluster "staging".
```

---

## drove config view

Display the config file.

```bash
drove config view [--raw]
```

| Option | Description |
|--------|-------------|
| `-r, --raw` | Show raw file content |

---

## drove config init

Create a new `~/.drove` config file.

```bash
drove config init --endpoint URL [--name NAME] [--username USER] [--password PASS] \
    [--auth-header TOKEN] [--insecure]
```

Example:
```bash
drove config init -e https://drove.example.com -n prod -t "Bearer xxx"
```

!!! note
    If `~/.drove` already exists, this command will fail. Use `drove config add-cluster` to add clusters to an existing config.

---

## drove config add-cluster

Add a cluster to existing config.

```bash
drove config add-cluster <name> --endpoint URL [--username USER] [--password PASS] \
    [--auth-header TOKEN] [--insecure]
```

Example:
```bash
drove config add-cluster staging -e https://drove-stg.example.com -u admin -p secret -i
```

---

## drove config delete-cluster

Remove a cluster from config.

```bash
drove config delete-cluster <name>
```

!!!note
    If you delete the current default cluster, you'll need to set a new default with `use-cluster`.
