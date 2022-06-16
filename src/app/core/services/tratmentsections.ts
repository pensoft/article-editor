export const treatmentSections = [{
  "label": "Description",
  "key": "description",
  "validate": {
    "required": false
  },
  "properties": {
    "autoFocus": "true",
    "sectionID": "febd07f2-a39f-46af-9511-cf6696f5e264cfv"
  },
  "type": "textarea",
  "input": true,
  "defaultValue": ""
}, {
  "label": "Description Subsection",
  "reorder": true,
  "addAnother": "Add subsection",
  "addAnotherPosition": "bottom",
  "layoutFixed": false,
  "enableRowGroups": false,
  "initEmpty": true,
  "tableView": false,
  "defaultValue": [],
  "key": "descriptionSubsections",
  "type": "datagrid",
  "input": true,
  "components": [
    {
      "label": "Title of subsection",
      "autoExpand": false,
      "tableView": true,
      "validate": {
        "required": false
      },
      "key": "subTitle",
      "type": "textarea",
      "input": true
    },
    {
      "label": "Description of subsection",
      "autoExpand": false,
      "tableView": true,
      "key": "subDescription",
      "type": "textarea",
      "input": true
    }
  ],
  "placeholder": "",
  "prefix": "",
  "customClass": "",
  "suffix": "",
  "multiple": false,
  "protected": false,
  "unique": false,
  "persistent": true,
  "hidden": false,
  "clearOnHide": true,
  "refreshOn": "",
  "redrawOn": "",
  "modalEdit": false,
  "dataGridLabel": false,
  "labelPosition": "top",
  "description": "",
  "errorLabel": "",
  "tooltip": "",
  "hideLabel": false,
  "tabindex": "",
  "disabled": false,
  "autofocus": false,
  "dbIndex": false,
  "customDefaultValue": "",
  "calculateValue": "",
  "calculateServer": false,
  "widget": null,
  "attributes": [],
  "validateOn": "change",
  "validate": {
    "required": false,
    "custom": "",
    "customPrivate": false,
    "strictDateValidation": false,
    "multiple": false,
    "unique": false
  },
  "conditional": {
    "show": null,
    "when": null,
    "eq": ""
  },
  "overlay": {
    "style": "",
    "left": "",
    "top": "",
    "width": "",
    "height": ""
  },
  "allowCalculateOverride": false,
  "encrypted": false,
  "showCharCount": false,
  "showWordCount": false,
  "properties": [],
  "allowMultipleMasks": false,
  "addons": [],
  "tree": true,
  "lazyLoad": false,
  "disableAddingRemovingRows": false,
  "id": "eisf0z88a"
},


  {
    "label": "Diagnosis",
    "key": "diagnosis",
    "validate": {
      "required": false
    },
    "properties": {
      "autoFocus": "true",
      "sectionID": "febd07f2-a39f-46af-9511-cf6696f5e264cf8u"
    },
    "type": "textarea",
    "input": true,
    "defaultValue": ""
  }, {
    "label": "Diagnosis Subsection",
    "reorder": true,
    "addAnother": "Add subsection",
    "addAnotherPosition": "bottom",
    "layoutFixed": false,
    "enableRowGroups": false,
    "initEmpty": true,
    "tableView": false,
    "defaultValue": [],
    "key": "diagnosisSubsections",
    "type": "datagrid",
    "input": true,
    "components": [
      {
        "label": "Title of Diagnosis subsection",
        "autoExpand": false,
        "tableView": true,
        "validate": {
          "required": false
        },
        "key": "subTitle",
        "type": "textarea",
        "input": true
      },
      {
        "label": "Description of Diagnosis subsection",
        "autoExpand": false,
        "tableView": true,
        "key": "subDescription",
        "type": "textarea",
        "input": true
      }
    ],
    "placeholder": "",
    "prefix": "",
    "customClass": "",
    "suffix": "",
    "multiple": false,
    "protected": false,
    "unique": false,
    "persistent": true,
    "hidden": false,
    "clearOnHide": true,
    "refreshOn": "",
    "redrawOn": "",
    "modalEdit": false,
    "dataGridLabel": false,
    "labelPosition": "top",
    "description": "",
    "errorLabel": "",
    "tooltip": "",
    "hideLabel": false,
    "tabindex": "",
    "disabled": false,
    "autofocus": false,
    "dbIndex": false,
    "customDefaultValue": "",
    "calculateValue": "",
    "calculateServer": false,
    "widget": null,
    "attributes": [],
    "validateOn": "change",
    "validate": {
      "required": false,
      "custom": "",
      "customPrivate": false,
      "strictDateValidation": false,
      "multiple": false,
      "unique": false
    },
    "conditional": {
      "show": null,
      "when": null,
      "eq": ""
    },
    "overlay": {
      "style": "",
      "left": "",
      "top": "",
      "width": "",
      "height": ""
    },
    "allowCalculateOverride": false,
    "encrypted": false,
    "showCharCount": false,
    "showWordCount": false,
    "properties": [],
    "allowMultipleMasks": false,
    "addons": [],
    "tree": true,
    "lazyLoad": false,
    "disableAddingRemovingRows": false,
    "id": "eisf0z88bd"
  },


  {
    "label": "Distribution",
    "key": "distribution",
    "validate": {
      "required": false
    },
    "properties": {
      "autoFocus": "true",
      "sectionID": "febd07f2-a39f-46af-9511-cf6696f5e264cf8z"
    },
    "type": "textarea",
    "input": true,
    "defaultValue": ""
  }, {
    "label": "Distribution Subsection",
    "reorder": true,
    "addAnother": "Add subsection",
    "addAnotherPosition": "bottom",
    "layoutFixed": false,
    "enableRowGroups": false,
    "initEmpty": true,
    "tableView": false,
    "defaultValue": [],
    "key": "distributionSubsections",
    "type": "datagrid",
    "input": true,
    "components": [
      {
        "label": "Title of Distribution subsection",
        "autoExpand": false,
        "tableView": true,
        "validate": {
          "required": false
        },
        "key": "subTitle",
        "type": "textarea",
        "input": true
      },
      {
        "label": "Description of Distribution subsection",
        "autoExpand": false,
        "tableView": true,
        "key": "subDescription",
        "type": "textarea",
        "input": true
      }
    ],
    "placeholder": "",
    "prefix": "",
    "customClass": "",
    "suffix": "",
    "multiple": false,
    "protected": false,
    "unique": false,
    "persistent": true,
    "hidden": false,
    "clearOnHide": true,
    "refreshOn": "",
    "redrawOn": "",
    "modalEdit": false,
    "dataGridLabel": false,
    "labelPosition": "top",
    "description": "",
    "errorLabel": "",
    "tooltip": "",
    "hideLabel": false,
    "tabindex": "",
    "disabled": false,
    "autofocus": false,
    "dbIndex": false,
    "customDefaultValue": "",
    "calculateValue": "",
    "calculateServer": false,
    "widget": null,
    "attributes": [],
    "validateOn": "change",
    "validate": {
      "required": false,
      "custom": "",
      "customPrivate": false,
      "strictDateValidation": false,
      "multiple": false,
      "unique": false
    },
    "conditional": {
      "show": null,
      "when": null,
      "eq": ""
    },
    "overlay": {
      "style": "",
      "left": "",
      "top": "",
      "width": "",
      "height": ""
    },
    "allowCalculateOverride": false,
    "encrypted": false,
    "showCharCount": false,
    "showWordCount": false,
    "properties": [],
    "allowMultipleMasks": false,
    "addons": [],
    "tree": true,
    "lazyLoad": false,
    "disableAddingRemovingRows": false,
    "id": "eisf0z88bc"
  },


  {
    "label": "Ecology",
    "key": "ecology",
    "validate": {
      "required": false
    },
    "properties": {
      "autoFocus": "true",
      "sectionID": "febd07f2-a39f-46af-9511-cf6696f5e264cf8y"
    },
    "type": "textarea",
    "input": true,
    "defaultValue": ""
  }, {
    "label": "Ecology Subsection",
    "reorder": true,
    "addAnother": "Add subsection",
    "addAnotherPosition": "bottom",
    "layoutFixed": false,
    "enableRowGroups": false,
    "initEmpty": true,
    "tableView": false,
    "defaultValue": [],
    "key": "ecologySubsections",
    "type": "datagrid",
    "input": true,
    "components": [
      {
        "label": "Title of Ecology subsection",
        "autoExpand": false,
        "tableView": true,
        "validate": {
          "required": false
        },
        "key": "subTitle",
        "type": "textarea",
        "input": true
      },
      {
        "label": "Description of Ecology subsection",
        "autoExpand": false,
        "tableView": true,
        "key": "subDescription",
        "type": "textarea",
        "input": true
      }
    ],
    "placeholder": "",
    "prefix": "",
    "customClass": "",
    "suffix": "",
    "multiple": false,
    "protected": false,
    "unique": false,
    "persistent": true,
    "hidden": false,
    "clearOnHide": true,
    "refreshOn": "",
    "redrawOn": "",
    "modalEdit": false,
    "dataGridLabel": false,
    "labelPosition": "top",
    "description": "",
    "errorLabel": "",
    "tooltip": "",
    "hideLabel": false,
    "tabindex": "",
    "disabled": false,
    "autofocus": false,
    "dbIndex": false,
    "customDefaultValue": "",
    "calculateValue": "",
    "calculateServer": false,
    "widget": null,
    "attributes": [],
    "validateOn": "change",
    "validate": {
      "required": false,
      "custom": "",
      "customPrivate": false,
      "strictDateValidation": false,
      "multiple": false,
      "unique": false
    },
    "conditional": {
      "show": null,
      "when": null,
      "eq": ""
    },
    "overlay": {
      "style": "",
      "left": "",
      "top": "",
      "width": "",
      "height": ""
    },
    "allowCalculateOverride": false,
    "encrypted": false,
    "showCharCount": false,
    "showWordCount": false,
    "properties": [],
    "allowMultipleMasks": false,
    "addons": [],
    "tree": true,
    "lazyLoad": false,
    "disableAddingRemovingRows": false,
    "id": "eisf0z88bb"
  },

  {
    "label": "Conservation",
    "key": "conservation",
    "validate": {
      "required": false
    },
    "properties": {
      "autoFocus": "true",
      "sectionID": "febd07f2-a39f-46af-9511-cf6696f5e264cf8x"
    },
    "type": "textarea",
    "input": true,
    "defaultValue": ""
  }, {
    "label": "Conservation Subsection",
    "reorder": true,
    "addAnother": "Add subsection",
    "addAnotherPosition": "bottom",
    "layoutFixed": false,
    "enableRowGroups": false,
    "initEmpty": true,
    "tableView": false,
    "defaultValue": [],
    "key": "conservationSubsections",
    "type": "datagrid",
    "input": true,
    "components": [
      {
        "label": "Title of Conservation subsection",
        "autoExpand": false,
        "tableView": true,
        "validate": {
          "required": false
        },
        "key": "subTitle",
        "type": "textarea",
        "input": true
      },
      {
        "label": "Description of Conservation subsection",
        "autoExpand": false,
        "tableView": true,
        "key": "subDescription",
        "type": "textarea",
        "input": true
      }
    ],
    "placeholder": "",
    "prefix": "",
    "customClass": "",
    "suffix": "",
    "multiple": false,
    "protected": false,
    "unique": false,
    "persistent": true,
    "hidden": false,
    "clearOnHide": true,
    "refreshOn": "",
    "redrawOn": "",
    "modalEdit": false,
    "dataGridLabel": false,
    "labelPosition": "top",
    "description": "",
    "errorLabel": "",
    "tooltip": "",
    "hideLabel": false,
    "tabindex": "",
    "disabled": false,
    "autofocus": false,
    "dbIndex": false,
    "customDefaultValue": "",
    "calculateValue": "",
    "calculateServer": false,
    "widget": null,
    "attributes": [],
    "validateOn": "change",
    "validate": {
      "required": false,
      "custom": "",
      "customPrivate": false,
      "strictDateValidation": false,
      "multiple": false,
      "unique": false
    },
    "conditional": {
      "show": null,
      "when": null,
      "eq": ""
    },
    "overlay": {
      "style": "",
      "left": "",
      "top": "",
      "width": "",
      "height": ""
    },
    "allowCalculateOverride": false,
    "encrypted": false,
    "showCharCount": false,
    "showWordCount": false,
    "properties": [],
    "allowMultipleMasks": false,
    "addons": [],
    "tree": true,
    "lazyLoad": false,
    "disableAddingRemovingRows": false,
    "id": "eisf0z88ba"
  },


  {
    "label": "Biology",
    "key": "biology",
    "validate": {
      "required": false
    },
    "properties": {
      "autoFocus": "true",
      "sectionID": "febd07f2-a39f-46af-9511-cf6696f5e264cf8x"
    },
    "type": "textarea",
    "input": true,
    "defaultValue": ""
  }, {
    "label": "Biology Subsection",
    "reorder": true,
    "addAnother": "Add subsection",
    "addAnotherPosition": "bottom",
    "layoutFixed": false,
    "enableRowGroups": false,
    "initEmpty": true,
    "tableView": false,
    "defaultValue": [],
    "key": "biologySubsections",
    "type": "datagrid",
    "input": true,
    "components": [
      {
        "label": "Title of Biology subsection",
        "autoExpand": false,
        "tableView": true,
        "validate": {
          "required": false
        },
        "key": "subTitle",
        "type": "textarea",
        "input": true
      },
      {
        "label": "Description of Biology subsection",
        "autoExpand": false,
        "tableView": true,
        "key": "subDescription",
        "type": "textarea",
        "input": true
      }
    ],
    "placeholder": "",
    "prefix": "",
    "customClass": "",
    "suffix": "",
    "multiple": false,
    "protected": false,
    "unique": false,
    "persistent": true,
    "hidden": false,
    "clearOnHide": true,
    "refreshOn": "",
    "redrawOn": "",
    "modalEdit": false,
    "dataGridLabel": false,
    "labelPosition": "top",
    "description": "",
    "errorLabel": "",
    "tooltip": "",
    "hideLabel": false,
    "tabindex": "",
    "disabled": false,
    "autofocus": false,
    "dbIndex": false,
    "customDefaultValue": "",
    "calculateValue": "",
    "calculateServer": false,
    "widget": null,
    "attributes": [],
    "validateOn": "change",
    "validate": {
      "required": false,
      "custom": "",
      "customPrivate": false,
      "strictDateValidation": false,
      "multiple": false,
      "unique": false
    },
    "conditional": {
      "show": null,
      "when": null,
      "eq": ""
    },
    "overlay": {
      "style": "",
      "left": "",
      "top": "",
      "width": "",
      "height": ""
    },
    "allowCalculateOverride": false,
    "encrypted": false,
    "showCharCount": false,
    "showWordCount": false,
    "properties": [],
    "allowMultipleMasks": false,
    "addons": [],
    "tree": true,
    "lazyLoad": false,
    "disableAddingRemovingRows": false,
    "id": "eisf0z88bam"
  },


  {
    "label": "Taxon discussion",
    "key": "taxonDiscussion",
    "validate": {
      "required": false
    },
    "properties": {
      "autoFocus": "true",
      "sectionID": "febd07f2-a39f-46af-9511-cf6696f5e264cf8x"
    },
    "type": "textarea",
    "input": true,
    "defaultValue": ""
  }, {
    "label": "Taxon discussion Subsection",
    "reorder": true,
    "addAnother": "Add subsection",
    "addAnotherPosition": "bottom",
    "layoutFixed": false,
    "enableRowGroups": false,
    "initEmpty": true,
    "tableView": false,
    "defaultValue": [],
    "key": "taxonDiscussionSubsections",
    "type": "datagrid",
    "input": true,
    "components": [
      {
        "label": "Title of Taxon discussion subsection",
        "autoExpand": false,
        "tableView": true,
        "validate": {
          "required": false
        },
        "key": "subTitle",
        "type": "textarea",
        "input": true
      },
      {
        "label": "Description of Taxon discussion subsection",
        "autoExpand": false,
        "tableView": true,
        "key": "subDescription",
        "type": "textarea",
        "input": true
      }
    ],
    "placeholder": "",
    "prefix": "",
    "customClass": "",
    "suffix": "",
    "multiple": false,
    "protected": false,
    "unique": false,
    "persistent": true,
    "hidden": false,
    "clearOnHide": true,
    "refreshOn": "",
    "redrawOn": "",
    "modalEdit": false,
    "dataGridLabel": false,
    "labelPosition": "top",
    "description": "",
    "errorLabel": "",
    "tooltip": "",
    "hideLabel": false,
    "tabindex": "",
    "disabled": false,
    "autofocus": false,
    "dbIndex": false,
    "customDefaultValue": "",
    "calculateValue": "",
    "calculateServer": false,
    "widget": null,
    "attributes": [],
    "validateOn": "change",
    "validate": {
      "required": false,
      "custom": "",
      "customPrivate": false,
      "strictDateValidation": false,
      "multiple": false,
      "unique": false
    },
    "conditional": {
      "show": null,
      "when": null,
      "eq": ""
    },
    "overlay": {
      "style": "",
      "left": "",
      "top": "",
      "width": "",
      "height": ""
    },
    "allowCalculateOverride": false,
    "encrypted": false,
    "showCharCount": false,
    "showWordCount": false,
    "properties": [],
    "allowMultipleMasks": false,
    "addons": [],
    "tree": true,
    "lazyLoad": false,
    "disableAddingRemovingRows": false,
    "id": "eisf0z88bau"
  },



  {
    "label": "Notes",
    "key": "notes",
    "validate": {
      "required": false
    },
    "properties": {
      "autoFocus": "true",
      "sectionID": "febd07f2-a39f-46af-9511-cf6696f5e264cf8x"
    },
    "type": "textarea",
    "input": true,
    "defaultValue": ""
  }, {
    "label": "Notes Subsection",
    "reorder": true,
    "addAnother": "Add subsection",
    "addAnotherPosition": "bottom",
    "layoutFixed": false,
    "enableRowGroups": false,
    "initEmpty": true,
    "tableView": false,
    "defaultValue": [],
    "key": "notesSubsections",
    "type": "datagrid",
    "input": true,
    "components": [
      {
        "label": "Title of Notes subsection",
        "autoExpand": false,
        "tableView": true,
        "validate": {
          "required": false
        },
        "key": "subTitle",
        "type": "textarea",
        "input": true
      },
      {
        "label": "Description of Notes subsection",
        "autoExpand": false,
        "tableView": true,
        "key": "subDescription",
        "type": "textarea",
        "input": true
      }
    ],
    "placeholder": "",
    "prefix": "",
    "customClass": "",
    "suffix": "",
    "multiple": false,
    "protected": false,
    "unique": false,
    "persistent": true,
    "hidden": false,
    "clearOnHide": true,
    "refreshOn": "",
    "redrawOn": "",
    "modalEdit": false,
    "dataGridLabel": false,
    "labelPosition": "top",
    "description": "",
    "errorLabel": "",
    "tooltip": "",
    "hideLabel": false,
    "tabindex": "",
    "disabled": false,
    "autofocus": false,
    "dbIndex": false,
    "customDefaultValue": "",
    "calculateValue": "",
    "calculateServer": false,
    "widget": null,
    "attributes": [],
    "validateOn": "change",
    "validate": {
      "required": false,
      "custom": "",
      "customPrivate": false,
      "strictDateValidation": false,
      "multiple": false,
      "unique": false
    },
    "conditional": {
      "show": null,
      "when": null,
      "eq": ""
    },
    "overlay": {
      "style": "",
      "left": "",
      "top": "",
      "width": "",
      "height": ""
    },
    "allowCalculateOverride": false,
    "encrypted": false,
    "showCharCount": false,
    "showWordCount": false,
    "properties": [],
    "allowMultipleMasks": false,
    "addons": [],
    "tree": true,
    "lazyLoad": false,
    "disableAddingRemovingRows": false,
    "id": "eisf0z88bau"
  },
]
