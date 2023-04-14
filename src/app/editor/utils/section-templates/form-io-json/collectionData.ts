
export const collectionData = {
    'title': 'Collection Data',
    'components': [{
        "label": "Collection name",
        "tableView": true,
        "key": "collectionName",
        "type": "textarea",
        "properties": {
            "autoFocus": "true"
        },
        "input": true
    },
    {
        "label": "Collection identifier",
        "tableView": true,
        "key": "collectionIdentifier",
        "type": "textarea",
        "input": true
    },
    {
        "label": "Parent collection identifier",
        "tableView": true,
        "key": "parentCollectionIdentifier",
        "type": "textarea",
        "input": true
    },
    {
        "label": "Specimen preservstion method",
        "tableView": true,
        "key": "specimenPreservationMethod",
        "type": "textarea",
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

let collectionDataDF

/*if(!environment.production){
    collectionDataDF = {// form group structure for the section
        "collectionName": "<p align=\"set-align-left\" class=\"set-align-left\">dqwewewewewewewewewewewewewewewewewewewewewewewewewewewewewd</p>",
        "collectionIdentifier": "<p align=\"set-align-left\" class=\"set-align-left\">WWweweweweweweweweweweweweweweweweweweweweweweweweweweweweWW</p>",
        "parentCollectionIdentifier": "<p align=\"set-align-left\" class=\"set-align-left\">EweweweweweweweweweweweweweweweweweweweweweweweweweweweweEE</p>",
        "specimenPreservationMethod": "<p align=\"set-align-left\" class=\"set-align-left\">vbvbvbwewewewewewewewewewewewewewewewewewewewewewewewewewewewevb</p>",
        "curatorialUnit": "<p align=\"set-align-left\" class=\"set-align-left\">eqweqdqwwewewewewewewewewewewewewewewewewewewewewewewewewewewewedqwd</p>",
    }
}else{*/
    collectionDataDF = {// form group structure for the section
        "collectionName": "",
        "collectionIdentifier": "",
        "parentCollectionIdentifier": "",
        "specimenPreservationMethod": "",
        "curatorialUnit": "",
    }
//}

export const collectionDataDefaultValues = collectionDataDF
