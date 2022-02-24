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
            "defaultValue":`<p align="set-align-left" class="set-align-left">Caption basic example</p>`,
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
                        "url": "https://static.scientificamerican.com/sciam/cache/file/DB41BE97-01C6-496F-873B5B4E3360B3A5_source.jpg",
                        "description": `<p align="set-align-left" class="set-align-left">dream</p>`,
                        "componentType": "image",
                    }
                },
                {
                    "container": {
                        "url": "https://static.scientificamerican.com/sciam/cache/file/5366EE82-A0FE-4690-885904445F73D44A.jpg",
                        "description": `<p align="set-align-left" class="set-align-left">Brain</p>`,
                        "componentType": "image",
                    }
                },
                {
                    "container": {
                        "url": "https://static.scientificamerican.com/sciam/cache/file/9B084B0E-73C7-45A9-A004F4543EED300F.jpg",
                        "description": `<p align="set-align-left" class="set-align-left">metaverse</p>`,
                        "componentType": "image",
                    }
                },
                {
                    "container": {
                        "url": "https://static.scientificamerican.com/sciam/cache/file/A4406EF9-FC62-42E4-9628F374B062AE07.jpg",
                        "description": `<p align="set-align-left" class="set-align-left">dog</p>`,
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
export const figureJson1 = {
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
            "defaultValue":`<p align="set-align-left" class="set-align-left"></p>`,
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
                        "url": "",
                        "description": `<p align="set-align-left" class="set-align-left"></p>`,
                        "componentType": "",
                    }
                },
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
