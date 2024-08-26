# Uber repo for the Drove Container Orchestrator

Usage:

```shell
git clone git@github.com:PhonePe/drove-orchestrator.git
git submodule init
git submodule update
```

# Bringing up a demo cluster
```shell
cd compose
docker-compose up
```
This will start zookeeper,drove controller, executor and nginx/drove-gateway.
The following ports are used:
- Zookeeper - 2181
- Executor - 3000
- Controller - 4000
- nignx - 7000

Drove credentials would be `admin/admin` and `guest/guest` for read-write and read-only permissions respectively.

# Update etc hosts to interact wih nginx
Add the following lines to `/etc/hosts`
```
127.0.0.1   drove.local
127.0.0.1   testapp.local
```

You should be able to access the UI at [http://drove.local:7000](http://drove.local:7000)

# Install drove-cli
Install the CLI for drove
```
pip install drove-cli
```

# Deploy an app
```shell
drove -e http://drove.local:7000 apps create sample/test_app.json
```
 
# Scale the app
```
drove -e http://drove.local:7000 apps scale TEST_APP-1 1 -w
```
This would expose the app as `testapp.local`. Endpoint would be: [http://testapp.local:7000](http://testapp.local:7000).

You can test the app by running the following commands:

```shell
curl http://testapp.local:7000/
curl http://testapp.local:7000/files/drove.txt
```

# Suspend and destroy the app
```shell
drove -e http://drove.local:7000 apps scale TEST_APP-1 0 -w
drove -e http://drove.local:7000 apps destroy TEST_APP-1
```

# MAC OS specific changes 

## Rancher desktop preferences
Please select below preferences in the Rancher desktop

| Hardware         | Volumes  |                         Emulation |
|:-----------------|:--------:|----------------------------------:|
| Memory (GB): 4GB | virtiofs |          Virtual Machine Type: VZ |
| # CPUs     : 4   |          | VZ Option: Enable Rosetta support |

# Update etc hosts for lima-rancher-desktop
Add below line to `/etc/hosts`
```
127.0.0.1	lima-rancher-desktop
```

