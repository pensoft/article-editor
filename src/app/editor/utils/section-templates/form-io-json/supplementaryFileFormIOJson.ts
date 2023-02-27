export const supplementaryFileJSON = {
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
    }
  ]
}
