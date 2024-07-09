# Log Related APIs

## Get list if log files

**Application**
`GET /apis/v1/logfiles/applications/{appId}/{instanceId}/list`

**Task**
`GET /apis/v1/logfiles/tasks/{sourceAppName}/{taskId}/list`


**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/logfiles/applications/TEST_APP-1/AI-5efbb94f-835c-4c62-a073-a68437e60339/list' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Response**
```js
{
    "files": [
        "output.log-2024-07-04",
        "output.log-2024-07-03",
        "output.log"
    ]
}
```

## Download Log Files

**Application**
`GET /apis/v1/logfiles/applications/{appId}/{instanceId}/download/{fileName}`

**Task**
`GET /apis/v1/logfiles/tasks/{sourceAppName}/{taskId}/download/{fileName}`

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/logfiles/applications/TEST_APP-1/AI-5efbb94f-835c-4c62-a073-a68437e60339/download/output.log' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Response**
<file content>

!!!note
    The `Content-Disposition` header is set properly to the actual filename. For the above example it would be set to `attachment; filename=output.log`.

## Read chunks from log

**Application**
`GET /apis/v1/logfiles/applications/{appId}/{instanceId}/read/{fileName}`

**Task**
`GET /apis/v1/logfiles/tasks/{sourceAppName}/{taskId}/read/{fileName}`

| Query Parameter | Validation                            | Description                          |
|-----------------|---------------------------------------|--------------------------------------|
| offset          | Default -1, should be positive number | The offset of the file to read from. |
| length          | Should be a positive number           | Number of bytes to read.             |

**Request**
```shell
curl --location 'http://drove.local:7000/apis/v1/logfiles/applications/TEST_APP-1/AI-5efbb94f-835c-4c62-a073-a68437e60339/read/output.log' \
--header 'Authorization: Basic YWRtaW46YWRtaW4='
```

**Response**
```js
{
    "data": "", //(1)!
    "offset": 43318 //(2)!
}
```

1. Will contain raw data or empty string (in case of first call)
2. Offset to be passed in the next call

### How to tail logs

1. Have a fixed buffer size in ming 1024/4096 etc
2. Make a call to `/read` api with offset=`-1`, length = `buffer size`
3. The call will return no data, but will have a valid offset
4. Pass this offset in the next call, data will be returned if available (or empty). The response will also return the offset to pass in the .ext call.
5. The `data` returned might be empty or less than `length` depending on availability.
6. Keep repeating (4) to keep tailing log

!!!warning
    - Offset = 0 means start of the file
    - First call must be -1 for `tail` type functionality