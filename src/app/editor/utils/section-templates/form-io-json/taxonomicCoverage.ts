export const taxonomicCoverage = {
    'title': 'My Test Form',
    'components': [{
        "label": "Description",
        "key": "description",
        "validate": {
            "required": true,
        },
        "type": "prosemirror-editor-field",
        "input": true
    },{
        "label": "Taxonomic coverage",
        "reorder": true,
        "addAnother": "Add",
        "addAnotherPosition": "bottom",
        "defaultOpen": false,
        "layoutFixed": false,
        "enableRowGroups": false,
        "initEmpty": false,
        "tableView": false,
        "key": "taxonomicCoverage",
        "type": "datagrid",
        "input": true,
        "defaultValue": [{
            "scientificName": "",
            "commonName": "",
            "rank": ""
        }
        ],
        "components": [
            {
                "label": "Scientific Name",
                "key": "scientificName",
                "properties": {
                    "noLabel": "true"
                },
                "validate": {
                    "required": true,
                    "pattern": 'asd'
                },
                "type": "prosemirror-editor-field",
                "input": true
            }, {
                "label": "Common Name",
                "key": "commonName",
                "properties": {
                    "noLabel": "true"
                },
                "validate": {
                    "required": true,
                },
                "type": "prosemirror-editor-field",
                "input": true
            },
            {
                "label": "Rank",
                "widget": "choicesjs",
                "tableView": true,
                "validate": {
                    "required": true
                },
                "data": {
                    "values": [
                        {
                            "label": "kingdom",
                            "value": "kingdom"
                        },
                        {
                            "label": "phylum",
                            "value": "phylum"
                        },
                        {
                            "label": "class",
                            "value": "class"
                        },
                        {
                            "label": "value4",
                            "value": "value4"
                        },
                        {
                            "label": "value5",
                            "value": "value5"
                        },
                        {
                            "label": "value6",
                            "value": "value6"
                        },
                        {
                            "label": "value7",
                            "value": "value7"
                        }
                    ]
                },
                "selectThreshold": 0.3,
                "key": "rank",
                "type": "select",
                "indexeddb": {
                    "filter": {}
                },
                "input": true
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
    }]
}

export const taxonomicCoverageDefaultValues = {
    "description": "",
    "taxonomicCoverage": [
        {
            "scientificName": "",
            "commonName": "",
            "rank": ""
        },{
            "scientificName": "",
            "commonName": "",
            "rank": ""
        }
    ],
}