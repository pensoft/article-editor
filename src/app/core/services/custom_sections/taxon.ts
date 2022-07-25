import {materials} from "@core/services/custom_sections/materials";
import {treatmentSections} from "@core/services/custom_sections/treatment_sections";

export const externalLinks = {
  "id": 9901,
  "name": "[MM] External Links",
  "label": "External Links",
  edit: {active: true, main: true},
  add: {active: false, main: false},
  delete: {active: false, main: false},
  select: {active: false, main: false},
  "schema": {
    "components": [
        {
            "label": "External Links",
            "reorder": false,
            "addAnotherPosition": "bottom",
            "defaultOpen": false,
            "layoutFixed": false,
            "enableRowGroups": false,
            "initEmpty": true,
            "tableView": false,
            "defaultValue": [],
            "clearOnHide": true,
            "key": "externalLinks",
            "type": "datagrid",
            "input": true,
            "components": [
                {
                    "label": "Link type",
                    "widget": "choicesjs",
                    "tableView": true,
                    "data": {
                        "values": [
                            {
                                "label": "Barcode of Life",
                                "value": "Barcode of Life"
                            },
                            {
                                "label": "BHL",
                                "value": "BHL"
                            },
                            {
                                "label": "Catalogue of Life",
                                "value": "Catalogue of Life"
                            },
                            {
                                "label": "Encyclopedia of Life",
                                "value": "Encyclopedia of Life"
                            },
                            {
                                "label": "GBIF",
                                "value": "GBIF"
                            },
                            {
                                "label": "GenBank",
                                "value": "GenBank"
                            },
                            {
                                "label": "MorphBank",
                                "value": "MorphBank"
                            },
                            {
                                "label": "Other URL",
                                "value": "Other URL"
                            },
                            {
                                "label": "Pensoft Taxon Profile",
                                "value": "Pensoft Taxon Profile"
                            },
                            {
                                "label": "Plazi",
                                "value": "Plazi"
                            },
                            {
                                "label": "Species-ID",
                                "value": "Species-ID"
                            },
                            {
                                "label": "ZooBank",
                                "value": "ZooBank"
                            }
                        ]
                    },
                    "selectThreshold": 0.3,
                    "key": "select",
                    "type": "select",
                    "indexeddb": {
                        "filter": {}
                    },
                    "input": true
                },
                {
                    "label": "Label",
                    "placeholder": "Label...",
                    "tableView": true,
                    "key": "label",
                    /* "conditional": {
                        "show": true,
                        "when": "externalLinks.select",
                        "eq": "Other URL"
                    }, */
                    "type": "textfield",
                    "input": true
                },
                {
                    "label": "Link",
                    "placeholder": "Link...",
                    "tableView": true,
                    "key": "link",
                    "type": "textfield",
                    "input": true
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
},
  "sections": null,
  "template": `
  <div class="tableWrapper" *ngIf="formGroup.controls.externalLinks.controls &&formGroup.controls.externalLinks.controls.length && formGroup.controls.externalLinks.controls[0].controls.select.value">
<ol style="min-width: 50px;list-style-type: circle;" formArrayName="externalLinks" contenteditableNode="false" >
	<li *ngFor="let control of formGroup.controls.externalLinks.controls;let i=index" formGroupName="{{i}}"  contenteditableNode="false">
		<p formControlName="select" contenteditablenode="false" commentable="" style="display: inline-block;">
		</p>
		<p contenteditablenode="false" commentable="" style="display: inline-block;">
                &nbsp;
              </p>
		<p style="display: inline-block;" contenteditablenode="false" formControlName="label" *ngIf="formGroup.controls.externalLinks.controls[i].controls.select.value == 'Other URL'" menuType="" commentable="">
		</p>
		<p contenteditablenode="false" commentable="" style="display: inline-block;">
                &nbsp;
              </p>
		<p style="display: inline-block;">
			<a formControlName="link" contenteditablenode="false" href="{{formGroup.controls.externalLinks.controls[i].controls.link.value}}"  commentable="" >
			</a>
		</p>
	</li>
</ol>
</div>`,
  "type": 0,
  "version_id": 309,
  "version": 1,
  "version_pre_defined": false,
  "version_date": "2022-03-30T16:01:37.000000Z",
  "complex_section_settings": null,
  "settings": null,
  "compatibility": null,
  "created_at": "2021-12-08T21:01:21.000000Z"
}

export const taxonSection = {
  "id": 9999,
  "name": "Taxon",
  parent: null,
  select: {active: false, main: false},
  "label": "{{(data.taxonTitle!=''&&data.taxonTitle)?data.taxonTitle:'Taxon'}}",
  "schema": {
    "components": [
      {
        "label": "taxonTitle",
        "hidden": true,
        "tableView": true,
        "key": "taxonTitle",
        "type": "textfield",
        "input": true
      },{
        "label": "Classification",
        "tableView": true,
        "key": "classification",
        "type": "textfield",
        "input": true
      }, {
        "label": "Rank",
        "tableView": true,
        "key": "rank",
        "type": "textfield",
        "input": true
      }, {
        "label": "Kingdom",
        "tableView": true,
        "key": "kingdom",
        "type": "textfield",
        "input": true
      }, {
        "label": "Subkingdom",
        "tableView": true,
        "key": "subkingdom",
        "type": "textfield",
        "input": true
      }, {
        "label": "Phylum",
        "tableView": true,
        "key": "phylum",
        "type": "textfield",
        "input": true
      }, {
        "label": "Subphylum",
        "tableView": true,
        "key": "subphylum",
        "type": "textfield",
        "input": true
      }, {
        "label": "Superclass",
        "tableView": true,
        "key": "superclass",
        "type": "textfield",
        "input": true
      }, {
        "label": "Class",
        "tableView": true,
        "key": "class",
        "type": "textfield",
        "input": true
      }, {
        "label": "Subclass",
        "tableView": true,
        "key": "subclass",
        "type": "textfield",
        "input": true
      }, {
        "label": "Superorder",
        "tableView": true,
        "key": "superorder",
        "type": "textfield",
        "input": true
      }, {
        "label": "Order",
        "tableView": true,
        "key": "order",
        "type": "textfield",
        "input": true
      }, {
        "label": "Suborder",
        "tableView": true,
        "key": "suborder",
        "type": "textfield",
        "input": true
      }, {
        "label": "Infraorder",
        "tableView": true,
        "key": "infraorder",
        "type": "textfield",
        "input": true
      }, {
        "label": "Superfamily",
        "tableView": true,
        "key": "superfamily",
        "type": "textfield",
        "input": true
      }, {
        "label": "Family",
        "tableView": true,
        "key": "family",
        "type": "textfield",
        "input": true
      }, {
        "label": "subfamily",
        "tableView": true,
        "key": "subfamily",
        "type": "textfield",
        "input": true
      }, {
        "label": "Tribe",
        "tableView": true,
        "key": "tribe",
        "type": "textfield",
        "input": true
      }, {
        "label": "Subtribe",
        "tableView": true,
        "key": "tribe",
        "type": "textfield",
        "input": true
      }, {
        "label": "Genus",
        "tableView": true,
        "key": "genus",
        "type": "textfield",
        "input": true
      }, {
        "label": "Subgenus",
        "tableView": true,
        "key": "subgenus",
        "type": "textfield",
        "input": true
      }, {
        "label": "Species",
        "tableView": true,
        "key": "species",
        "type": "textfield",
        "input": true
      }, {
        "label": "Infraspecific",
        "tableView": true,
        "key": "infraspecific",
        "type": "textfield",
        "input": true
      }, {
        "label": "Subspecies",
        "tableView": true,
        "key": "subspecies",
        "type": "textfield",
        "input": true
      }, {
        "label": "Variety",
        "tableView": true,
        "key": "variety",
        "type": "textfield",
        "input": true
      }, {
        "label": "Form",
        "tableView": true,
        "key": "form",
        "type": "textfield",
        "input": true
      }, {
        "label": "Author And Year",
        "tableView": true,
        "key": "authorandyear",
        "type": "textfield",
        "input": true
      }, {
        "label": "Type Of Treatment",
        "tableView": true,
        "key": "typeoftreatment",
        "type": "textfield",
        "input": true
      }, {
        "label": "Groupone",
        "tableView": true,
        "key": "groupone",
        "type": "textfield",
        "defaultValue": 'extant',
        "input": true
      }, {
        "label": "Grouptwo",
        "tableView": true,
        "key": "grouptwo",
        "defaultValue": 'terrestrial',
        "type": "textfield",
        "input": true
      }, {
        "label": "Symbiotic with",
        "tableView": true,
        "key": "symbioticwith",
        "type": "textfield",
        "input": true
      }, {
        "label": "Feeds on",
        "tableView": true,
        "key": "feedson",
        "type": "textfield",
        "input": true
      }, {
        "label": "Parasite of",
        "tableView": true,
        "key": "parasiteof",
        "type": "textfield",
        "input": true
      }, {
        "label": "Host of",
        "tableView": true,
        "key": "hostof",
        "type": "textfield",
        "input": true
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
  "sections": [
    externalLinks,
    {
      "id": 9945,
      "name": "[MM] Nomenclature",
      "label": "Nomenclature",
      edit: {active: true, main: true},
      add: {active: false, main: false},
      delete: {active: false, main: false},
      select: {active: false, main: false},
      "schema": {
        "components": [
          {
            "label": "Text Area",
            "placeholder": "Nomenclature",
            "autoExpand": false,
            "tableView": true,
            "key": "textArea",
            "type": "textfield",
            "input": true,
            "prefix": "",
            "customClass": "",
            "suffix": "",
            "multiple": false,
            "defaultValue": '',
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
            "widget": {
              "type": "input"
            },
            "attributes": [],
            "validateOn": "change",
            "validate": {
              "required": false,
              "custom": "",
              "customPrivate": false,
              "strictDateValidation": false,
              "multiple": false,
              "unique": false,
              "minLength": "",
              "maxLength": "",
              "pattern": "",
              "minWords": "",
              "maxWords": ""
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
            "mask": false,
            "inputType": "text",
            "inputFormat": "html",
            "inputMask": "",
            "displayMask": "",
            "spellcheck": true,
            "truncateMultipleSpaces": false,
            "rows": 3,
            "wysiwyg": false,
            "editor": "",
            "fixedSize": true,
            "id": "e3ijnsa"
          }
        ]
      },
      "sections": null,
      "template": `<ng-container *ngIf="formGroup.controls.textArea.value"><h2 contenteditableNode="false">Nomenclatures</h2>
<form-field  class="set-align-left" formControlName="textArea">
</form-field >
</ng-container>`,
      "type": 0,
      "version_id": 473,
      "version": 3,
      "version_pre_defined": false,
      "version_date": "2022-05-03T04:12:10.000000Z",
      "complex_section_settings": null,
      "settings": null,
      "compatibility": null,
      "created_at": "2022-05-02T21:22:05.000000Z"
    },
    {...materials},
    {...treatmentSections}
  ],
  "template": `<ng-container *ngIf="data.rank">
<inline-block-container *ngIf="data.genus" style="display: inline-block; font-style: italic; font-weight: bold;">
\t<form-field  formControlName="genus" style="word-break: keep-all;display: block">
\t</form-field>
</inline-block-container>
<inline-block-container style="display: inline-block;">&nbsp;</inline-block-container>
<inline-block-container *ngIf="data.subgenus" style="display: inline-block;">
\t<form-field contenteditableNode="false" style="word-break: keep-all">(</form-field>
</inline-block-container>
<inline-block-container *ngIf="data.subgenus" style="display: inline-block; font-style: italic; font-weight: bold;">
\t<form-field style="word-break: keep-all" formControlName="subgenus">
\t</form-field>
</inline-block-container>
<inline-block-container contenteditableNode="false" *ngIf="data.subgenus" style="display: inline-block;">)</inline-block-container>
<inline-block-container *ngIf="data.species" style="display: inline-block;font-weight: bold;">&nbsp;</inline-block-container>
<inline-block-container  *ngIf="data.species" style="display: inline-block;font-weight: bold;">
\t<form-field style="word-break: keep-all;display: block; font-style: italic; font-weight: bold;" formControlName="species">
\t</form-field>
</inline-block-container>
<inline-block-container *ngIf="data.rank === 'variety'" style="display: inline-block;font-weight: bold;" contenteditableNode="false">&nbsp;var.&nbsp;</inline-block-container>
<inline-block-container  *ngIf="data.rank === 'variety'" style="display: inline-block;font-style: italic;font-weight: bold;">
\t<form-field style="word-break: keep-all;display: block;" formControlName="variety">
\t</form-field>
</inline-block-container>
<inline-block-container *ngIf="data.rank === 'form'" style="display: inline-block;font-weight: bold;">&nbsp;f.&nbsp;</inline-block-container>
<inline-block-container  *ngIf="data.rank === 'form'" style="display: inline-block;font-style: italic;font-weight: bold;">
\t<form-field style="word-break: keep-all;display: block;" formControlName="form">
\t</form-field>
</inline-block-container>
<inline-block-container style="display: inline-block;">&nbsp;</inline-block-container>
<inline-block-container style="display: inline-block;font-weight: bold;">
\t<form-field style="word-break: keep-all;display: block;" formControlName="authorandyear">
\t</form-field>
</inline-block-container>
<inline-block-container *ngIf="data.rank === 'species'" style="display: inline-block;font-weight: bold;" contenteditableNode="false">,&nbsp;sp.</inline-block-container>
<inline-block-container *ngIf="data.rank === 'genus' && data.typeoftreatment === 'New taxon'" style="display: inline-block;font-weight: bold;" contenteditableNode="false">&nbsp;,gen.&nbsp;n.</inline-block-container>
</ng-container>`,
  "type": 1,
  "version_id": 471,
  "version": 8,
  "customSection":true,
  "version_pre_defined": false,
  "version_date": "2022-05-03T04:09:09.000000Z",
  "complex_section_settings": [],
  "settings": null,
  "compatibility": {"allow": {"all": false, "values": [58]}, "deny": {"all": false, "values": []}},
  "created_at": "2022-04-20T21:59:48.000000Z"
}

