export const collectionData = {
    'title': 'Collection Data',
    'components': [{
        "label": "Collection name",
        "tableView": true,
        "key": "collectionName",
        "type": "textfield",
        "input": true
    },
    {
        "label": "Collection identifier",
        "tableView": true,
        "key": "collectionIdentifier",
        "validate": {
            "maxLength": 10,
            "minLength": 3
        },
        "type": "textfield",
        "input": true
    },
    {
        "label": "Parent collection identifier",
        "tableView": true,
        "key": "parentCollectionIdentifier",
        "type": "textfield",
        "input": true
    },
    {
        "label": "Specimen preservstion method",
        "tableView": true,
        "key": "specimenPreservationMethod",
        "type": "textfield",
        "input": true
    },
    {
        "label": "Curatorial unit",
        "tableView": true,
        "key": "curatorialUnit",
        "type": "textarea",
        "input": true
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

export const collectionDataDefaultValues = {
    "collectionName": "",
    "collectionIdentifier": "",
    "parentCollectionIdentifier": "",
    "specimenPreservationMethod": "",
    "curatorialUnit": "",
}