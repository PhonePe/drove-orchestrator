# Migration Guides

This page collects upgrade guides for Drove releases with breaking changes. Go through the checklist for the version you are upgrading to **before** rolling out new container images.

For the recommended rollout sequence across the cluster, see [Updating drove version across the cluster quickly](../maintenance.md#updating-drove-version-across-the-cluster-quickly).

## Upgrading from 1.33.x

1.34.x changes what an existing 1.33.x installation must update before upgrading. Work through the checklist below. All other 1.34.x changes are optional and need no config updates; see [New in 1.34.x](#new-in-134x) at the end of this section.

!!!note
    Zookeeper connectivity for controllers is unchanged. Executors, however, no longer connect to Zookeeper.

### Controllers

#### Remove `options.allowedRuleImportPackages` (startup fails otherwise)

The MVEL rule engine has been removed and `RULE_BASED` placement policies are now evaluated using [CEL](https://cel.dev){:target="_blank"} expressions only. The `options.allowedRuleImportPackages` option is gone along with it. Unlike the executor, the controller does not ignore removed config keys, so **a leftover `allowedRuleImportPackages` in the config makes the controller fail to start** with:

```text
Unrecognized field at: options.allowedRuleImportPackages
```

Remove the key from `options` before upgrading.

#### Set real secrets (container refuses to start otherwise)

The controller container now refuses to start when any security environment variable (`ADMIN_PASSWORD`, `GUEST_PASSWORD`, `CONTROLLER_SECRET`, `EXECUTOR_SECRET`, `INSTANCE_AUTH_SECRET`) is left at its default value. The check runs even if the secrets are configured directly in `controller.yml`. Set all security variables to strong values (`pwgen -s 32`). For dev/test clusters only, set `ALLOW_DEFAULT_SECRETS=true` to explicitly acknowledge the risk and start with the existing default values.

See [Container environment variables](controller.md#container-environment-variables) for the full list of variables and their defaults.

#### Rewrite MVEL/HOPE placement rules as CEL (before upgrading)

Existing MVEL or HOPE `RULE_BASED` placement rules must be rewritten as CEL expressions **before** upgrading, or the affected applications and tasks will fail to place. Test rewritten rules against the live cluster with the [Placement Simulation API](../../apis/cluster.md#simulate-placement) or `drove cluster simulate-placement` before rolling out. The old rules dry-run API (`POST /applications/placementpolicy/rule/dryrun`) has been removed.

### Executors

#### Add `controllers.endpoints` (required, executor fails to start otherwise)

Executors no longer connect to Zookeeper. They now talk to controllers directly over HTTP(S). Zookeeper is used by controllers only. The `controllers` section is **required** — without it the executor fails config validation with `controllers must not be null`:

```yaml
controllers:
  endpoints:
    - http://controller-1:10000
    - http://controller-2:10000
```

List all controller endpoints so executors can reach each controller node directly. See [Controller Endpoints Configuration](executor-setup.md#controller-endpoints-configuration) for details.

#### Remove obsolete config keys

- Remove the `zookeeper` section from the executor config. A leftover `zookeeper` key is ignored for backwards compatibility and does not block startup, but it is dead config and should be removed.
- Remove the `options.remoteUpdateMode` option. Updates always go to controllers over HTTP(S). A leftover key is likewise ignored.
- Remove `ZK_CONNECTION_STRING` from the executor `env` file. The executor container still exits if the variable is unset, but the value is no longer used by the executor process — it must connect to controllers via `controllers.endpoints`, not Zookeeper.

#### Set real secrets (container refuses to start otherwise)

The executor container now refuses to start when `CONTROLLER_SECRET` or `EXECUTOR_SECRET` is left at its default value. The values must match the secrets configured on the controllers. Set both to strong values (`pwgen -s 32`). For dev/test clusters only, set `ALLOW_DEFAULT_SECRETS=true` to explicitly acknowledge the risk and start with the existing default values.

See [Container environment variables](executor-setup.md#container-environment-variables) for the full list of variables and their defaults.

### New in 1.34.x

The following changes are optional and need no action to upgrade:

- `securityPolicies` is new. It is a **top-level** key in `controller.yml` (a sibling of `options`, not inside it) and defines per-deployable container security profiles. The controller default profile is still built from the `allowedMountDirs`, `disableCmdlArgs` and `enableRawDeviceAccess` options. See [Security policies](controller.md#security-policies).
- `options.minScaledCpus` and `options.minScaledMemoryMB` control when [performance scaling](../../concepts/cpu-numa-memory.md#performance-scaling) is applied. These go under `options`.
- `resources.enableNvidiaGpu` is deprecated in favour of `resources.nvidiaGPULoaderConfig`, which enables managed GPU discovery and allocation. The two modes are mutually exclusive. The legacy pass-through mode still works if you need it. See [Resource Configuration](executor-setup.md#resource-configuration) and [GPU Scheduling](../../concepts/gpu.md).
- `resources.performanceScaling` and `options.environmentInfoPath` are new. See [Performance scaling configuration](executor-setup.md#performance-scaling-configuration), [Executor Options](executor-setup.md#executor-options) and [Environment Info Injection](../environment-info.md).
