export const templates = {
    'AdvancedTemplate':{
      "components": [
          {
              "label": "Tabs",
              "components": [
                  {
                      "label": "tab1",
                      "key": "tab1",
                      "components": [
                          {
                              "label": "Table",
                              "cellAlignment": "left",
                              "key": "table",
                              "type": "table",
                              "input": false,
                              "tableView": false,
                              "rows": [
                                  [
                                      {
                                          "components": [
                                              {
                                                  "label": "Text Field",
                                                  "tableView": true,
                                                  "key": "textField1",
                                                  "type": "textfield",
                                                  "input": true
                                              },
                                              {
                                                  "label": "Password",
                                                  "tableView": false,
                                                  "key": "password",
                                                  "type": "password",
                                                  "input": true,
                                                  "protected": true
                                              }
                                          ]
                                      },
                                      {
                                          "components": [
                                              {
                                                  "label": "Checkbox",
                                                  "tableView": false,
                                                  "key": "checkbox",
                                                  "type": "checkbox",
                                                  "input": true
                                              }
                                          ]
                                      },
                                      {
                                          "components": [
                                              {
                                                  "label": "Select Boxes",
                                                  "optionsLabelPosition": "right",
                                                  "tableView": false,
                                                  "defaultValue": {
                                                      "": false
                                                  },
                                                  "values": [
                                                      {
                                                          "label": "1",
                                                          "value": "1",
                                                          "shortcut": ""
                                                      },
                                                      {
                                                          "label": "2",
                                                          "value": "22",
                                                          "shortcut": ""
                                                      },
                                                      {
                                                          "label": "3",
                                                          "value": "3",
                                                          "shortcut": ""
                                                      }
                                                  ],
                                                  "key": "selectBoxes1",
                                                  "type": "selectboxes",
                                                  "input": true,
                                                  "inputType": "checkbox"
                                              }
                                          ]
                                      }
                                  ],
                                  [
                                      {
                                          "components": [
                                              {
                                                  "label": "Number",
                                                  "mask": false,
                                                  "spellcheck": true,
                                                  "tableView": false,
                                                  "delimiter": false,
                                                  "requireDecimal": false,
                                                  "inputFormat": "plain",
                                                  "key": "number",
                                                  "type": "number",
                                                  "input": true
                                              }
                                          ]
                                      },
                                      {
                                          "components": [
                                              {
                                                  "label": "Text Area",
                                                  "autoExpand": false,
                                                  "tableView": true,
                                                  "key": "textArea",
                                                  "type": "textarea",
                                                  "input": true
                                              }
                                          ]
                                      },
                                      {
                                          "components": [
                                              {
                                                  "label": "Radio",
                                                  "optionsLabelPosition": "right",
                                                  "inline": false,
                                                  "tableView": false,
                                                  "values": [
                                                      {
                                                          "label": "1",
                                                          "value": "1",
                                                          "shortcut": ""
                                                      },
                                                      {
                                                          "label": "2",
                                                          "value": "3322",
                                                          "shortcut": ""
                                                      }
                                                  ],
                                                  "key": "radio1",
                                                  "type": "radio",
                                                  "input": true
                                              }
                                          ]
                                      }
                                  ],
                                  [
                                      {
                                          "components": [
                                              {
                                                  "label": "Day",
                                                  "hideInputLabels": false,
                                                  "inputsLabelPosition": "top",
                                                  "useLocaleSettings": false,
                                                  "tableView": false,
                                                  "fields": {
                                                      "day": {
                                                          "hide": false
                                                      },
                                                      "month": {
                                                          "hide": false
                                                      },
                                                      "year": {
                                                          "hide": false
                                                      }
                                                  },
                                                  "key": "day",
                                                  "type": "day",
                                                  "input": true,
                                                  "defaultValue": "00/00/0000"
                                              }
                                          ]
                                      },
                                      {
                                          "components": [
                                              {
                                                  "label": "Signature",
                                                  "tableView": false,
                                                  "key": "signature",
                                                  "type": "signature",
                                                  "input": true
                                              }
                                          ]
                                      },
                                      {
                                          "components": [
                                              {
                                                  "label": "Phone Number",
                                                  "tableView": true,
                                                  "key": "phoneNumber",
                                                  "type": "phoneNumber",
                                                  "input": true
                                              }
                                          ]
                                      }
                                  ]
                              ]
                          }
                      ]
                  },
                  {
                      "label": "2",
                      "key": "2",
                      "components": [
                          {
                              "theme": "primary",
                              "collapsible": false,
                              "key": "panel",
                              "type": "panel",
                              "label": "Panel",
                              "input": false,
                              "tableView": false,
                              "components": [
                                  {
                                      "label": "Text Field",
                                      "tableView": true,
                                      "key": "textField",
                                      "type": "textfield",
                                      "input": true
                                  }
                              ]
                          }
                      ]
                  }
              ],
              "key": "tabs",
              "type": "tabs",
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
  },
    'TaxonTreatmentsMaterial':{
        "label": "Tabs",
        "components": [
          {
            "label": "RecordLevel",
            "key": "RecordLevel",
            "components": [
              {
                "label": "Text Field3",
                "tableView": true,
                "key": "textField4",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Text Field2",
                "tableView": true,
                "key": "id|textField3",
                "type": "textfield",
                "input": true
              }
            ]
          },
          {
            "label": "Event",
            "key": "Event",
            "components": [
              {
                "label": "Text Field",
                "tableView": true,
                "key": "textField16",
                "type": "textfield",
                "input": true
              },
              {
                "label": "Text Field",
                "tableView": true,
                "key": "textField15",
                "type": "textfield",
                "input": true
              }
            ]
          },
          {
            "label": "Tab 3 ",
            "key": "tab3",
            "components": [
              {
                "label": "Text Area",
                "autoExpand": false,
                "tableView": true,
                "key": "textArea2",
                "type": "textarea",
                "input": true
              },
              {
                "label": "Text Area",
                "autoExpand": false,
                "tableView": true,
                "key": "textArea3223",
                "type": "textarea",
                "input": true
              }
            ]
          }
        ],
        "key": "tabs",
        "type": "tabs",
        "input": false,
        "tableView": false
      }
}