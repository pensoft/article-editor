import { endNoteJSON } from "./endNoteFormIOJSON"
import { supplementaryFileJSON } from "./supplementaryFileFormIOJson"

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
      "properties": {
        "addTableEditor": true,
        "menuType": "[['toggleStrong','toggleEm','undoItem','redoItem']]",
        "allowedTags": "{'nodes': ['headings'],'marks': ['em','strong','code','underline','subscript','superscript','comment']}"
      },
      "key": "tableHeader",
      "type": "textarea",
      "autofocus": true,
      "input": true
    },
    {
      "label": "Table content",
      "autoExpand": false,
      "tableView": true,
      "defaultValue": "",
      "validate": {
        "required": true
      },
      "properties": {
        "allowedTags": "{'nodes':['video','citable-figures','headings','page_break','tables','reference-citation','citable-tables'],'marks':['em','underline','subscript','superscript']}"
      },
      "key": "tableContent",
      "type": "textarea",
      "input": true
    }, {
      "label": "Footer",
      "autoExpand": false,
      "tableView": true,
      "defaultValue": `<p align="set-align-left" class="set-align-left">Footer for the table.</p>`,
      "validate": {
        "required": true
      },
      "properties": {
        "addTableEditor": true
      },
      "key": "tableFooter",
      "type": "textarea",
      "input": true
    },
  ]
}

export let CitableElementsSchemasV2Template = {
  "sections": [
    "Tables",
    "SupplementaryMaterials",
    "Footnotes"
  ],
  "override": {
    "categories": {
      "Tables": tableJson,
      "SupplementaryMaterials": supplementaryFileJSON,
      "Footnotes": endNoteJSON,
    }
  }
}
