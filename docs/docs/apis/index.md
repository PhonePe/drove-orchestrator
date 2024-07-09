# Introduction

This section lists all the APIs that a user can communicate with.

## Making an API call
Use a standard HTTP client in the language of your choice to make a call to the leader controller (the cluster virtual host exposed by drove-nixy-nginx).

!!!tip
    In case you are using Java, we recommend using the [drove-client](https://github.com/PhonePe/drove/packages/2186471) library along with the [http-transport](https://github.com/PhonePe/drove/packages/2186472).
    > If multiple controllers endpoints are provided, the client will track the leader automatically. This will reduce your dependency on [drove-nixy](https://github.com/PhonePe/drove-nixy).

### Authentication

Drove uses basic auth for authentication. (You can extend to use any other auth format like OAuth). The basic auth credentials need to be sent out in the standard format in the `Authorization` header.

### Response format

The response format is standard for all API calls:

```js
{
    "status": "SUCCESS",//(1)!
    "data": {//(2)!
        "taskId": "T0012"
    },
    "message": "success"//(3)!
}
```

1. `SUCCESS` or `FAILURE` as the case may be.
2. Content of this field is contextual to the response.
3. Will contain `success` if the call was successful or relevant error message.

!!!warning
    APIs will return relevant HTTP status codes in case of error (for example `400` for validation errors, `401` for authentication failure). However, you must _always_ ensure that the `status` field is set to `SUCCESS` for assuming the api call is succesful, even when HTTP status code is `2xx`.

APIs in Drove belong to the following major classes:

* [Application Management](application.md)
* [Task Management](task.md)
* [Cluster Management](cluster.md)
* [Log Access](logs.md)

!!!tip
    Response models for these apis can be found in [drove-models](https://github.com/PhonePe/drove/tree/master/drove-models/src/main/java/com/phonepe/drove/models)

!!!note
    There are _no_ publicly accessible APIs exposed by individual executors.