export const defaultValues = {
  "taxonomicCoverage": {
    "description": "",
    "taxonomicCoverage": [
      {
        "scientificName": "",
        "commonName": "",
        "rank": ""
      }
    ],
  },
  'collectionData': {
    "collectionName": "",
    "collectionIdentifier": "",
    "parentCollectionIdentifier": "",
    "specimenPreservationMethod": "",
    "curatorialUnit": "",
  }
}
export const formIOSchema = {
  'taxonomicCoverage': {
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
  }, 'collectionData': {
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
};
