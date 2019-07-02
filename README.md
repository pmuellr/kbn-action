command-line utilities for working with Kibana actions and alerts
===============================================================================

## usage

    kbn-action ls-types
    kbn-action ls
    kbn-action create <action-type-id> <description> <json: config>
    kbn-action get <action-id>
    kbn-action update <action-id> <json: config>
    kbn-action delete <action-id>
    kbn-action fire <action-id> <json: params>

    kbn-alert ls-types
    kbn-alert ls
    kbn-alert create <alert-type-id> <interval> <json: params> <json: actions>
    kbn-alert get <alert-id>
    kbn-alert update <alert-id> <interval> <json: params> <json: actions>
    kbn-alert delete <alert-id>

Note that for `kbn-alert` subcommands `create` and `update`, the `actions`
parameter should be an array of actions.  However, you can pass a single
object, and that will be used as an array of that element.

options:

    -h --help       print this help
    -v --version    print the version of the program
    -u --urlBase    Kibana base URL

You can also set the env var KBN_URLBASE as the Kibana base URL.

For the JSON args, the argument should be a single argument (thus, quoted),
and can be "sloppy" via https://github.com/pmuellr/sloppy_json_parse . 

## install

    npm install -g pmuellr/kbn-action

## examples

```console

$ # point to a running Functional Test Server

$ export KBN_URLBASE=http://elastic:changeme@localhost:5620

#-------------------------------------------------------------------------

$ kbn-action ls-types
[
    {
        "id": "kibana.server-log",
        "name": "server-log"
    },
    {
        "id": ".slack",
        "name": "slack"
    },
    {
        "id": ".email",
        "name": "email"
    }
]
#-------------------------------------------------------------------------

$ kbn-action create .slack "pmuellr slack" '{"webhookUrl": "https://hooks.slack.com/services/T0CUZ52US/BJWC6520H/{redacted}"}'
{
    "type": "action",
    "id": "d6f1e228-1806-4a72-83ac-e06f3d5c2fbe",
    "attributes": {
        "actionTypeId": ".slack",
        "description": "pmuellr slack",
        "actionTypeConfig": {}
    },
    "references": [],
    "updated_at": "2019-06-26T17:55:42.728Z",
    "version": "WzMsMV0="
}

#-------------------------------------------------------------------------

$ kbn-action create .email "pmuellr email" '{service:gmail, user:pmuellr, password:REDACTED, from:"pmuellr@gmail.com"}'
{
    "type": "action",
    "id": "7db3f1a7-ebac-48b0-a0ce-7a76513ca521",
    "attributes": {
        "actionTypeId": ".email",
        "description": "pmuellr email",
        "actionTypeConfig": {}
    },
    "references": [],
    "updated_at": "2019-06-26T18:00:01.155Z",
    "version": "WzQsMV0="
}

#-------------------------------------------------------------------------

$ kbn-action ls
{
    "page": 1,
    "per_page": 20,
    "total": 2,
    "saved_objects": [
        {
            "type": "action",
            "id": "d6f1e228-1806-4a72-83ac-e06f3d5c2fbe",
            "attributes": {
                "actionTypeId": ".slack",
                "description": "pmuellr slack",
                "actionTypeConfig": {}
            },
            "references": [],
            "updated_at": "2019-06-26T17:55:42.728Z",
            "version": "WzMsMV0="
        },
        {
            "type": "action",
            "id": "7db3f1a7-ebac-48b0-a0ce-7a76513ca521",
            "attributes": {
                "actionTypeId": ".email",
                "description": "pmuellr email",
                "actionTypeConfig": {}
            },
            "references": [],
            "updated_at": "2019-06-26T18:00:01.155Z",
            "version": "WzQsMV0="
        }
    ]
}

#-------------------------------------------------------------------------

$ # post a message to slack

$ kbn-action fire d6f1e228-1806-4a72-83ac-e06f3d5c2fbe '{"message": "hello from the cli using kbn-action"}'
kbn-action: status code 204
body: ""

#-------------------------------------------------------------------------

$ # send an email

$ kbn-action fire 7db3f1a7-ebac-48b0-a0ce-7a76513ca521 '{"to": ["patrick.mueller@elastic.co"], "cc": ["mike.cote@elastic.co"], "subject": "hi", "message": "hello from the cli using kbn-action"}'
kbn-action: status code 204
body: ""

#-------------------------------------------------------------------------

$ kbn-action delete 7db3f1a7-ebac-48b0-a0ce-7a76513ca521
{}
```