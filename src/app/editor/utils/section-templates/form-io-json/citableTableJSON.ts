export const tableJson = {
  "components": [
    {
      "label": "Header",
      "autoExpand": false,
      "tableView": true,
      "defaultValue": `<p align="set-align-left" class="set-align-left">Header for the table.</p>`,
      "validate": {
        "required": true
      },
      "properties":{
      },
      "key": "tableHeader",
      "type": "textarea",
      "autofocus":true,
      "input": true
    },
    {
      "label": "Table content",
      "autoExpand": false,
      "tableView": true,
      "defaultValue":
      `<form-field><p align="set-align-left" class="set-align-left">Content for the table.</p></form-field>`,
      "validate": {
        "required": true
      },
      "properties": {
      },
      "key": "tableContent",
      "type": "textarea",
      "input": true
    },{
      "label": "Footer",
      "autoExpand": false,
      "tableView": true,
      "defaultValue": `<p align="set-align-left" class="set-align-left">Footer for the table.</p>`,
      "validate": {
        "required": true
      },
      "properties":{
      },
      "key": "tableFooter",
      "type": "textarea",
      "input": true
    }
  ]
}

let CitableElementsSchemasV2Template = {
  "sections": [
    "Tables",
    "SupplementaryMaterials",
    "Footnotes"
  ],
  "override": {
    "categories": {
      "Tables": {
        "components": [
          {
            "label": "Header",
            "autoExpand": false,
            "tableView": true,
            "defaultValue": `<p align="set-align-left" class="set-align-left">Header for the table.</p>`,
            "validate": {
              "required": true
            },
            "properties":{
            },
            "key": "tableHeader",
            "type": "textarea",
            "autofocus":true,
            "input": true
          },
          {
            "label": "Table content",
            "autoExpand": false,
            "tableView": true,
            "defaultValue":
            `<form-field><p align="set-align-left" class="set-align-left">Content for the table.</p></form-field>`,
            "validate": {
              "required": true
            },
            "properties": {
            },
            "key": "tableContent",
            "type": "textarea",
            "input": true
          },{
            "label": "Footer",
            "autoExpand": false,
            "tableView": true,
            "defaultValue": `<p align="set-align-left" class="set-align-left">Footer for the table.</p>`,
            "validate": {
              "required": true
            },
            "properties":{
            },
            "key": "tableFooter",
            "type": "textarea",
            "input": true
          }
        ]
      },
      "SupplementaryMaterials": {
        "components": [
            {
                "label": "Title",
                "tableView": true,
                "validate": {
                    "required": true
                },
                "key": "supplementaryFileTitle",
                "type": "textfield",
                "autofocus":true,
                "input": true
            },
            {
                "label": "Authors",
                "tableView": true,
                "validate": {
                    "required": true
                },
                "key": "supplementaryFileAuthors",
                "type": "textfield",
                "input": true
            },
            {
                "label": "Data type",
                "tableView": true,
                "validate": {
                    "required": true
                },
                "key": "supplementaryFileDataType",
                "type": "textfield",
                "input": true
            },
            {
                "label": "Brief description",
                "autoExpand": false,
                "tableView": true,
                "key": "supplementaryFileBriefDescription",
                "type": "textarea",
                "input": true
            },
            {
                "label": "File URL",
                "tableView": true,
                "validate": {
                    "required": true
                },
                "key": "supplementaryFileURL",
                "type": "textfield",
                "input": true
            }

        ]
      },
      "Footnotes": {
        "components": [
          {
            "label": "End Note",
            "autoExpand": false,
            "tableView": true,
            "validate": {
              "required": true
            },
            "autofocus":true,
            "key": "endNote",
            "type": "textarea",
            "input": true
          }
        ]
      }
    }
  }
}
