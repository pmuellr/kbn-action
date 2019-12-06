command-line utilities for working with Kibana actions and alerts
===============================================================================

## usage

    kbn-action ls-types
    kbn-action ls
    kbn-action create <action-type-id> <name> <json: config> <json: secrets>
    kbn-action get <action-id>
    kbn-action update <action-id> <name> <json: config> <json: secrets>
    kbn-action delete <action-id>
    kbn-action execute <action-id> <json: params>

    kbn-alert ls-types
    kbn-alert ls
    kbn-alert create <alert-type-id> <name> <interval> <json: params> <json: actions>
    kbn-alert get <alert-id>
    kbn-alert update <alert-id> <name> <interval> <json: params> <json: actions> <throttle>
    kbn-alert delete <alert-id>

Note that for `kbn-alert` subcommands `create` and `update`, the `actions`
parameter should be an array of actions.  However, you can pass a single
object, and that will be used as an array of that element.

options:

    -h --help       print this help
    -v --version    print the version of the program
    -u --urlBase    Kibana base URL
    -s --space      Kibana space to use; default: default

You can also set the env var KBN_URLBASE as the Kibana base URL.

Set the DEBUG environment variable to anything to get diagnostic output.

For the JSON args, the argument should be a single argument (thus, quoted),
and can be "sloppy" via https://github.com/pmuellr/sloppy-json . 

## install

    npm install -g pmuellr/kbn-action

## examples

```console

$ # point to a running Functional Test Server

$ export KBN_URLBASE=http://elastic:changeme@localhost:5620

#-------------------------------------------------------------------------

$ # list the action types

$ kbn-action ls-types
[
    {
        "id": ".server-log",
        "name": "server-log"
    },
    {
        "id": ".slack",
        "name": "slack"
    },
    {
        "id": ".email",
        "name": "email"
    },
    {
        "id": ".index",
        "name": "index"
    }
]

#-------------------------------------------------------------------------

$ # create an email action with the __json service, that just echos input

$ kbn-action create .email "email test" '{from:"pmuellr@gmail.com" service:__json}' '{user:ignored password:ignored}'
{
    "id": "52e8571e-948e-4a94-9951-55fb660bb787"
}

#-------------------------------------------------------------------------

$ # execute the new email action

$ kbn-action execute 52e8571e-948e-4a94-9951-55fb660bb787 '{to:["pmuellr@gmail.com"] subject:hallo message:"# hello\n_italic_ **bold**"}'
{
    "status": "ok",
    "data": {
        "envelope": {
            "from": "pmuellr@gmail.com",
            "to": [
                "pmuellr@gmail.com"
            ]
        },
        "messageId": "<54650a90-95d3-bf93-5831-1db3772f9316@gmail.com>",
        "message": {
            "from": {
                "address": "pmuellr@gmail.com",
                "name": ""
            },
            "to": [
                {
                    "address": "pmuellr@gmail.com",
                    "name": ""
                }
            ],
            "cc": null,
            "bcc": null,
            "subject": "hallo",
            "html": "<h1>hello</h1>\n<p><em>italic</em> <strong>bold</strong></p>\n",
            "text": "# hello\n_italic_ **bold**",
            "headers": {},
            "messageId": "<54650a90-95d3-bf93-5831-1db3772f9316@gmail.com>"
        }
    }
}

#-------------------------------------------------------------------------

$ # create a server log action to use with an alert

$ kbn-action create .server-log "server log" {} {}
{
    "id": "8fe59625-fda4-400b-94a6-cf75938c163b"
}

#-------------------------------------------------------------------------

$ # list alert types, from a functional test server

$ kbn-alert ls-types
[
    {
        "id": "test.always-firing",
        "name": "Test: Always Firing"
    },
    ...
]

#-------------------------------------------------------------------------

$ # alerts are similar to actions, create being wildly different

$ kbn-alert create test.always-firing test 1s '{index:test_alert_from_cli}' "[{group:default id:'8fe59625-fda4-400b-94a6-cf75938c163b' params:{message: 'from alert 1s'}}]"
{
    "id": "0bdbb930-b485-11e9-86c5-c9b4ac6d5f40",
    "name": "test",
    "alertTypeId": "test.always-firing",
    "interval": "1s",
    "actions": [
        {
            "group": "default",
            "params": {
                "message": "from alert 1s"
            },
            "id": "8fe59625-fda4-400b-94a6-cf75938c163b"
        }
    ],
    "params": {
        "index": "test_alert_from_cli"
    },
    "enabled": true,
    "scheduledTaskId": "0c031750-b485-11e9-86c5-c9b4ac6d5f40"
}

#-------------------------------------------------------------------------

$ # update the alert to run every minute instead of every second

$ kbn-alert update 0bdbb930-b485-11e9-86c5-c9b4ac6d5f40 'updated test' 1m '{index:test_alert_from_cli}' "[{group:default id:'8fe59625-fda4-400b-94a6-cf75938c163b' params:{message: 'from alert 1m'}}]" 5m
{
    "id": "0bdbb930-b485-11e9-86c5-c9b4ac6d5f40",
    "name": "updated test"
    "throttle": "5m",
    "interval": "1m",
    "actions": [
        {
            "group": "default",
            "params": {
                "message": "from alert 1m"
            },
            "id": "8fe59625-fda4-400b-94a6-cf75938c163b"
        }
    ],
    "params": {
        "index": "test_alert_from_cli"
    }
}
```

## change log

#### 1.2.0 - 2019-08-01

- update to apis at master, using new http bodies for actions

#### 1.1.0 - 2019-??-??

- some fixes

#### 1.0.0 - 2019-??-??

- initial release
