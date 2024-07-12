# Setting up the prerequisites

On all machines on the drove cluster, we would want to use the same user and have a consistent storage structure for configuration, logs etc.

!!!note
    All commands o be issues as `root`. To get to admin/root mode issue the following command:

    ```shell
    sudo su
    ```

## Setting up user
We shall create an user called `drove` to be used to run all services and containers and assign the file ownership to this user.

```shell
adduser --system --group "drove" --home /var/lib/misc --no-create-home > /dev/null
```
We want to user to be able to run docker containers, so we add the user to the docker group:

```shell
groupadd docker
usermod -aG docker drove
```

## Create directories

We shall use the following locations to store configurations, logs etc:

- `/etc/drove/...` - for configuration
- `/var/log/drove/..` - for all logs

We go ahead and create these locations and setup the correct permissions:

```shell
mkdir -p /etc/drove
chown -R drove.drove /etc/drove
chmod 700 /etc/drove
chmod g+s /etc/drove

mkdir -p /var/lib/drove
chown -R drove.drove /var/lib/drove
chmod 700 /var/lib/drove

mkdir -p /var/log/drove
``` 

!!!danger
	Ensure you run the `chmod` commands to remove read access everyone other than the owner.
