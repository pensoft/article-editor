/*
https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image1.jpg

https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image2.jpg

https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image3.jpg

https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image4.jpg

https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image5.jpg

https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image6.jpg */


export const figureJson = {
  "components": [
    {
      "label": "Columns",
      "columns": [
        {
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
                "addFigureEditor":true
              },
              "key": "figureDescription",
              "type": "textarea",
              "input": true
            },
            {
              "label": "Figure components",
              "reorder": true,
              "addAnother": "Add Component",
              "addAnotherPosition": "bottom",
              "defaultOpen": false,
              "layoutFixed": false,
              "enableRowGroups": false,
              "initEmpty": false,
              "tableView": false,
              "defaultValue": [
                {
                  "container": {
                    "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSBSxBFtvMzHp5meoU4Pe2LXU56WcJg3uU5O5bnpqsWbzMBJmnT",
                    "description": `<p align="set-align-left" class="set-align-left">moon</p>`,
                    "componentType": "image",
                  }
                },
                {
                  "container": {
                    "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSB94GXwEX5gtOMEXM0v-BhpwmGulU6lXJ9rQ&usqp=CAU",
                    "description": `<p align="set-align-left" class="set-align-left">Sunrise</p>`,
                    "componentType": "image",
                  }
                },
                {
                  "container": {
                    "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_BUqnSU-hcr1mMoxzri9l_3cKytZnBNew5g&usqp=CAU",
                    "description": `<p align="set-align-left" class="set-align-left">Forest</p>`,
                    "componentType": "image",
                  }
                },
                {
                  "container": {
                    "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMxAUDn_aEXvgLRsgAg_XcYJcd5DmEjnmtQA&usqp=CAU",
                    "description": `<p align="set-align-left" class="set-align-left">Galaxy</p>`,
                    "componentType": "image",
                  }
                }
              ],
              "key": "figureComponents",
              "type": "datagrid",
              "input": true,
              "components": [
                {
                  "label": "Container",
                  "tableView": false,
                  "key": "container",
                  "type": "container",
                  "input": true,
                  "components": [
                    {
                      "label": "Columns",
                      "columns": [
                        {
                          "components": [
                            {
                              "label": "URL:",
                              "placeholder": "Image or video url....",
                              "tableView": true,
                              "validate": {
                                "required": true
                              },
                              "key": "url",
                              "type": "textfield",
                              "input": true,
                              "hideOnChildrenHidden": false
                            }
                          ],
                          "width": 6,
                          "offset": 0,
                          "push": 0,
                          "pull": 0,
                          "size": "md"
                        },
                        {
                          "components": [
                            {
                              "label": "Component type:",
                              "widget": "choicesjs",
                              "tableView": true,
                              "data": {
                                "values": [
                                  {
                                    "label": "video",
                                    "value": "video"
                                  },
                                  {
                                    "label": "image",
                                    "value": "image"
                                  }
                                ]
                              },
                              "selectThreshold": 0.3,
                              "validate": {
                                "required": true
                              },
                              "key": "componentType",
                              "type": "select",
                              "indexeddb": {
                                "filter": {}
                              },
                              "input": true,
                              "hideOnChildrenHidden": false
                            }
                          ],
                          "width": 6,
                          "offset": 0,
                          "push": 0,
                          "pull": 0,
                          "size": "md"
                        }
                      ],
                      "key": "columns",
                      "type": "columns",
                      "input": false,
                      "tableView": false
                    },
                    {
                      "label": "Component Description:",
                      "autoExpand": false,
                      "tableView": true,
                      "validate": {
                        "required": true
                      },
                      "properties":{
                        "addFigureEditor":true
                      },
                      "key": "description",
                      "type": "textarea",
                      "rows": 1,
                      "input": true
                    }
                  ]
                }
              ]
            }
          ],
          "width": 8,
          "offset": 0,
          "push": 0,
          "pull": 0,
          "size": "md"
        },
        {
          "components": [
            {
              "key": "figure-preview",
              "type": "figure-preview",
              "input": false
            }
          ],
          "width": 4,
          "offset": 0,
          "push": 0,
          "pull": 0,
          "size": "md"
        }
      ],
      "key": "columns",
      "type": "columns",
      "input": false,
      "tableView": false
    }
  ]
}

