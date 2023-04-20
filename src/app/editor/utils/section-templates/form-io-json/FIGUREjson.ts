/*
https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image1.jpg

https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image2.jpg

https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image3.jpg

https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image4.jpg

https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image5.jpg

https://s3-pensoft.s3.eu-west-1.amazonaws.com/public/image6.jpg */
export const figureBasicData = {
  "description": "<p class=\"set-align-left\">Caption basic example</p>",
  "components": [],
  "figureID": "fa679ae6-d6af-44fb-aecf-21fd6492603f",
  "figurePlace": "endEditor",
  "viewed_by_citat": "endEditor",
  "canvasData": {
    "a4Pixels": [
      841.89,
      833.385
    ],
    "figRows": [
      [
        {
          "container": {
            "url": "https://ps-cdn.dev.scalewest.com/image/9d436583-e3ae-44a3-9e78-5f1478fe1828",
            "description": "moon",
            "componentType": "image",
            "height": 0.25,
            "h": 208.34625,
            "w": 146.70073033707865
          }
        }
      ],
      [
        {
          "container": {
            "url": "https://ps-cdn.dev.scalewest.com/image/bf7c8b07-0143-47d6-811d-4174685fb2cb",
            "description": "Sunrise",
            "componentType": "image",
            "hpers": 0.21958638564409008,
            "wpers": 0.32664599888346457,
            "h": 183,
            "w": 275
          }
        }
      ],
      [
        {
          "container": {
            "url": "https://ps-cdn.dev.scalewest.com/image/f233515b-dda3-4f6a-b646-2a8e7bb94063",
            "description": "Forest",
            "componentType": "image",
            "hpers": 0.21958638564409008,
            "wpers": 0.32664599888346457,
            "h": 183,
            "w": 275
          }
        }
      ],
      [
        {
          "container": {
            "url": "https://ps-cdn.dev.scalewest.com/image/02a5f079-bde8-40b3-bc3b-60bc0faf5a62",
            "description": "Galaxy",
            "componentType": "image",
            "hpers": 0.16918951025036447,
            "wpers": 0.4240458967323522,
            "h": 141,
            "w": 357
          }
        }
      ]
    ],
    "nOfRows": 4,
    "nOfColumns": 1,
    "maxImgHeightPers": 25,
    "maxImgWidthPers": 100
  }
}

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
              "properties": {
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
                    "url": "https://ps-cdn.dev.scalewest.com/image/9d436583-e3ae-44a3-9e78-5f1478fe1828",
                    "description": `<p align="set-align-left" class="set-align-left">moon</p>`,
                    "componentType": "image",
                    "pdfImgOrigin": "https://ps-cdn.dev.scalewest.com/image/02a5f079-bde8-40b3-bc3b-60bc0faf5a62o",
                  }
                },
                {
                  "container": {
                    "url": "https://ps-cdn.dev.scalewest.com/image/af43b649-c4e1-41a0-9d01-03eedc6f23b5",
                    "description": `<p align="set-align-left" class="set-align-left">Sunrise</p>`,
                    "componentType": "image",
                    "pdfImgOrigin": "https://ps-cdn.dev.scalewest.com/image/02a5f079-bde8-40b3-bc3b-60bc0faf5a62",
                  }
                },
                {
                  "container": {
                    "url": "https://ps-cdn.dev.scalewest.com/image/f233515b-dda3-4f6a-b646-2a8e7bb94063",
                    "description": `<p align="set-align-left" class="set-align-left">Forest</p>`,
                    "componentType": "image",
                    "pdfImgOrigin": "https://ps-cdn.dev.scalewest.com/image/f233515b-dda3-4f6a-b646-2a8e7bb94063",
                  }
                },
                {
                  "container": {
                    "url": "https://ps-cdn.dev.scalewest.com/image/02a5f079-bde8-40b3-bc3b-60bc0faf5a62",
                    "description": `<p align="set-align-left" class="set-align-left">Galaxy</p>`,
                    "componentType": "image",
                    "pdfImgOrigin": "https://ps-cdn.dev.scalewest.com/image/02a5f079-bde8-40b3-bc3b-60bc0faf5a62",
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
                      "properties": {
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

