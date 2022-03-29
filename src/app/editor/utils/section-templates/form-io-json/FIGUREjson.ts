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
                    "url": "https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image1.jpg",
                    "description": `<p align="set-align-left" class="set-align-left">dream</p>`,
                    "componentType": "image",
                  }
                },
                {
                  "container": {
                    "url": "https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image2.jpg",
                    "description": `<p align="set-align-left" class="set-align-left">Brain</p>`,
                    "componentType": "image",
                  }
                },
                {
                  "container": {
                    "url": "https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image3.jpg",
                    "description": `<p align="set-align-left" class="set-align-left">metaverse</p>`,
                    "componentType": "image",
                  }
                },
                {
                  "container": {
                    "url": "https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image4.jpg",
                    "description": `<p align="set-align-left" class="set-align-left">dog</p>`,
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
    },
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
export const figureJson1 = {
  "components": [
    {

      "key": "figure-preview",
      "type": "figure-preview",
      "input": false
    },
    {
      "label": "Caption : ",
      "autoExpand": false,
      "tableView": true,
      "defaultValue": `<p align="set-align-left" class="set-align-left"></p>`,
      "validate": {
        "required": true
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
            "url": "",
            "description": `<p align="set-align-left" class="set-align-left"></p>`,
            "componentType": "",
          }
        },
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
              "key": "description",
              "type": "textarea",
              "rows": 1,
              "input": true
            }
          ]
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
    }
  ]
}
