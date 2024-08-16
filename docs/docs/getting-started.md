# Getting started with Drove

To get a trivial cluster up and running on a machine, the [compose file](https://raw.githubusercontent.com/PhonePe/drove-orchestrator/master/compose/compose.yaml) can be used.

Usage:

```shell
git clone git@github.com:PhonePe/drove-orchestrator.git
git submodule init
git submodule update
```
## Update etc hosts to interact wih nginx
Add the following lines to `/etc/hosts`
```
127.0.0.1   drove.local
127.0.0.1   testapp.local
```

## Download the compose file

```shell
wget https://raw.githubusercontent.com/PhonePe/drove-orchestrator/master/compose/compose.yaml
```

## Bringing up a demo cluster
```shell
cd compose
docker-compose up
```
This will start zookeeper,drove controller, executor and nginx/drove-gateway.
The following ports are used:

- Zookeeper - 2181
- Executor - 3000
- Controller - 4000
- Gateway - 7000

Drove credentials would be `admin/admin` and `guest/guest` for read-write and read-only permissions respectively.

You should be able to access the UI at [http://drove.local:7000](http://drove.local:7000)

## Install drove-cli
Install the CLI for drove
```
pip install drove-cli
```

## Create Client Configuration
Put the following in `${HOME}/.drove`

```conf
[local]
endpoint = http://drove.local:4000
username = admin
password = admin
```

## Deploy an app
```shell
drove -c local apps create sample/test_app.json
```
 
## Scale the app
```
drove -c local apps scale TEST_APP-1 1 -w
```
This would expose the app as `testapp.local`. Endpoint would be: [http://testapp.local:7000](http://testapp.local:7000).

You can test the app by running the following commands:

```shell
curl http://testapp.local:7000/
curl http://testapp.local:7000/files/drove.txt
```

## Suspend and destroy the app
```shell
drove -c local apps scale TEST_APP-1 0 -w
drove -c local apps destroy TEST_APP-1
```

