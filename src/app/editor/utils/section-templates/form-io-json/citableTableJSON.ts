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
