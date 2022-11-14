export const tableJson = {
  "components": [

    {
      "label": "Caption : ",
      "autoExpand": false,
      "tableView": true,
      "defaultValue": `<p align="set-align-left" class="set-align-left">Caption basic example</p>`,
      "validate": {
        "required": true
      },
      "properties":{
        "addTableEditor":true
      },
      "key": "tableDescription",
      "type": "textarea",
      "input": true
    },
    {
      "label": "Table content : ",
      "autoExpand": false,
      "tableView": true,
      "defaultValue": `<p align="set-align-left" class="set-align-left">Table content</p>`,
      "validate": {
        "required": true
      },
      "properties": {
        "menuType":"fullMenu",
        "addTableEditor":true
      },
      "key": "tableComponents",
      "type": "textarea",
      "input": true
    }
    ,
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
