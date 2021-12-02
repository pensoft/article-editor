export const figureJson = {
    "components": [
        {
            "key": "figure-preview",
            "type": "figure-preview",
            "input": false
        },
        {
            "label": "Caption : ",
            "autoExpand": false,
            "tableView": true,
            "defaultValue":`<p align="set-align-left" class="set-align-left">Линкин Парк</p>`,
            "validate": {
                "required": true
            },
            "key": "figureDescription",
            "type": "textarea",
            "input": true
        },
        {
            "label": "Figure components",
            "reorder": true,
            "addAnother": "Add Component",
            "addAnotherPosition": "bottom",
            "defaultOpen": false,
            "layoutFixed": false,
            "enableRowGroups": false,
            "initEmpty": false,
            "tableView": false,
            "defaultValue": [
                {
                    "container": {
                        "url": "https://www.youtube.com/embed/v2H4l9RpkwM",
                        "description": `<p align="set-align-left" class="set-align-left">Линкин Парк е американска музикална група. Повечето критици ги определят като ню метъл. Linkin Park добавят, че главната им цел е да създават нещо между рок и рап.</p>`,
                        "componentType": "video",
                    }
                },
                {
                    "container": {
                        "url": "https://imjeffreyrex.files.wordpress.com/2014/06/linkin-park.png",
                        "description": `<p align="set-align-left" class="set-align-left">Първият им албум се казва „Hybrid Theory“, като издаден.</p>`,
                        "componentType": "image",
                    }
                }
            ],
            "key": "figureComponents",
            "type": "datagrid",
            "input": true,
            "components": [
                {
                    "label": "Container",
                    "tableView": false,
                    "key": "container",
                    "type": "container",
                    "input": true,
                    "components": [
                        {
                            "label": "Columns",
                            "columns": [
                                {
                                    "components": [
                                        {
                                            "label": "URL:",
                                            "placeholder": "Image or video url....",
                                            "tableView": true,
                                            "validate": {
                                                "required": true
                                            },
                                            "key": "url",
                                            "type": "textfield",
                                            "input": true,
                                            "hideOnChildrenHidden": false
                                        }
                                    ],
                                    "width": 6,
                                    "offset": 0,
                                    "push": 0,
                                    "pull": 0,
                                    "size": "md"
                                },
                                {
                                    "components": [
                                        {
                                            "label": "Component type:",
                                            "widget": "choicesjs",
                                            "tableView": true,
                                            "data": {
                                                "values": [
                                                    {
                                                        "label": "video",
                                                        "value": "video"
                                                    },
                                                    {
                                                        "label": "image",
                                                        "value": "image"
                                                    }
                                                ]
                                            },
                                            "selectThreshold": 0.3,
                                            "validate": {
                                                "required": true
                                            },
                                            "key": "componentType",
                                            "type": "select",
                                            "indexeddb": {
                                                "filter": {}
                                            },
                                            "input": true,
                                            "hideOnChildrenHidden": false
                                        }
                                    ],
                                    "width": 6,
                                    "offset": 0,
                                    "push": 0,
                                    "pull": 0,
                                    "size": "md"
                                }
                            ],
                            "key": "columns",
                            "type": "columns",
                            "input": false,
                            "tableView": false
                        },
                        {
                            "label": "Component Description:",
                            "autoExpand": false,
                            "tableView": true,
                            "validate": {
                                "required": true
                            },
                            "key": "description",
                            "type": "textarea",
                            "rows": 1,
                            "input": true
                        }
                    ]
                }
            ]
        },
        {
            "type": "button",
            "label": "Submit",
            "key": "submit",
            "disableOnInvalid": true,
            "input": true,
            "tableView": false
        }
    ]
}