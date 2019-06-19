command-line utility for working with Kibana actions
===============================================================================

## usage

    kbn-action ls-types
    kbn-action ls
    kbn-action create <action-type-id> <description> <json: config>
    kbn-action get <action-id>
    kbn-action update <action-id> <json: config>
    kbn-action delete <action-id>
    kbn-action fire <action-id> <json: params>

options:

    -h --help       print this help
    -v --version    print the version of the program
    -u --urlBase    Kibana base URL

You can also set the env var KBN_ACTION_URLBASE as the Kibana base URL.

## examples

```console
$ export KBN_ACTION_URLBASE=http://elastic:changeme@localhost:5603/rzm

#-------------------------------------------------------------------------

$ ./kbn-action.js ls-types
[
    {
        "id": "kibana.server-log",
        "name": "server-log"
    },
    {
        "id": "kibana.email",
        "name": "email"
    }
]

#-------------------------------------------------------------------------

$ ./kbn-action.js create kibana.email "pmuellr email" '{"host":"smtp.gmail.com", "port":465, "user": "{redacted}", "password": "{redacted}"}'
{
    "type": "action",
    "id": "e680a0bf-578a-42f0-a9b7-c90a7606d55c",
    "attributes": {
        "actionTypeId": "kibana.email",
        "description": "pmuellr email",
        "actionTypeConfig": {}
    },
    "references": [],
    "updated_at": "2019-06-19T21:55:56.190Z",
    "version": "WzMsMV0="
}

#-------------------------------------------------------------------------

$ ./kbn-action.js ls
{
    "page": 1,
    "per_page": 20,
    "total": 1,
    "saved_objects": [
        {
            "type": "action",
            "id": "e680a0bf-578a-42f0-a9b7-c90a7606d55c",
            "attributes": {
                "actionTypeId": "kibana.email",
                "description": "pmuellr email",
                "actionTypeConfig": {}
            },
            "references": [],
            "updated_at": "2019-06-19T21:55:56.190Z",
            "version": "WzMsMV0="
        }
    ]
}

#-------------------------------------------------------------------------

$ ./kbn-action.js get e680a0bf-578a-42f0-a9b7-c90a7606d55c
{
    "id": "e680a0bf-578a-42f0-a9b7-c90a7606d55c",
    "type": "action",
    "updated_at": "2019-06-19T21:55:56.190Z",
    "version": "WzMsMV0=",
    "attributes": {
        "actionTypeId": "kibana.email",
        "description": "pmuellr email",
        "actionTypeConfig": {}
    },
    "references": []
}

#-------------------------------------------------------------------------

$ ./kbn-action.js update e680a0bf-578a-42f0-a9b7-c90a7606d55c "pmuellr email 2" '{"host":"smtp.gmail.com", "port":465, "user": "{redacted}", "password": "{redacted}"}'
{
    "id": "e680a0bf-578a-42f0-a9b7-c90a7606d55c",
    "type": "action",
    "updated_at": "2019-06-19T22:05:44.103Z",
    "version": "WzQsMV0=",
    "references": [],
    "attributes": {
        "description": "pmuellr email 2",
        "actionTypeConfig": {},
        "actionTypeId": "kibana.email"
    }
}

#-------------------------------------------------------------------------

$ ./kbn-action.js fire
kbn-action: Error: not yet implemented
    at Object.fire (/Users/pmuellr/Projects/elastic/kbn-action/lib/commands.js:96:9)
    at main (/Users/pmuellr/Projects/elastic/kbn-action/kbn-action.js:41:37)
    ...

#-------------------------------------------------------------------------

$ ./kbn-action.js delete e680a0bf-578a-42f0-a9b7-c90a7606d55c
{}
```