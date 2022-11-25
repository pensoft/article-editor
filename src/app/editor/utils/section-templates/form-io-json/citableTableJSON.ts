export const tableJson = {
  "components": [
    {
      "label": "Header : ",
      "autoExpand": false,
      "tableView": true,
      "defaultValue": `<p align="set-align-left" class="set-align-left">Header for the table.</p>`,
      "validate": {
        "required": true
      },
      "properties":{
        "addTableEditor":true
      },
      "key": "tableHeader",
      "type": "textarea",
      "input": true
    },
    {
      "label": "Table content : ",
      "autoExpand": false,
      "tableView": true,
      "defaultValue":
      `<table-container>
      </table-container>`,
      "validate": {
        "required": true
      },
      "properties": {
        "menuType":"fullMenu",
        "addTableEditor":true,
        "rawNodeContent":true
      },
      "key": "tableContent",
      "type": "textarea",
      "input": true
    },{
      "label": "Footer : ",
      "autoExpand": false,
      "tableView": true,
      "defaultValue": `<p align="set-align-left" class="set-align-left">Footer for the table.</p>`,
      "validate": {
        "required": true
      },
      "properties":{
        "addTableEditor":true
      },
      "key": "tableFooter",
      "type": "textarea",
      "input": true
    },{
      "type": "button",
      "label": "Submit",
      "key": "submit",
      "disableOnInvalid": true,
      "input": true,
      "tableView": false
    }
  ]
}
