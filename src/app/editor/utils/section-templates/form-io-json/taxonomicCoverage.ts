export const taxonomicCoverage = {
    'title': 'My Test Form',
    'components': [{
        "label": "Description",
        "tableView": true,
        "key": "description",
        "validate": {
            "required": true,
        },
        "type": "textfield",
        "input": true
    }, {
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
        },
        {
            "scientificName": "",
            "commonName": "",
            "rank": ""
        }
        ],
        "components": [
            {
                "label": "Scientific Name",
                "tableView": true,
                "key": "scientificName",
                "validate": {
                    "required": true,
                    "maxLength": 15,
                    "minLength": 5
                },
                "type": "textfield",
                "input": true
            }, {
                "label": "Common Name",
                "tableView": true,
                "key": "commonName",
                "validate": {
                    "required": true,
                    "pattern": "^[\\s\\S]{3,10}$",
                },
                "type": "textfield",
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
        }
    ],
}