import {materialStructure} from "@core/services/custom_sections/materials_structure";

const props = Object.keys(materialStructure.categories).map(key => {
  return materialStructure.categories[key].entries.map(entry => {
     return entry.localName
  })
}).flat();
export const material =  {
  "id": 9933,
  "name": "Material",
  "label": "{{(data&&data.typeStatus!=''&&data.typeStatus)?data.typeStatus:'Material'}}",
  "schema": {
    "components": [
      {
        "label": "materialsHeading",
        "hidden": true,
        "tableView": true,
        "key": "materialsHeading",
        "type": "textfield",
        "props": {tab: "Event"},
        "input": true
    },
      {
        "label": "typeHeading",
        "hidden": true,
        "tableView": true,
        "key": "typeHeading",
        "type": "textfield",
        "input": true
    },
    {
        "label": "listChar",
        "hidden": true,
        "tableView": true,
        "key": "listChar",
        "type": "textfield",
        "input": true
    },{
        "label": "Type status",
        "placeholder": "Type status",
        "autoExpand": false,
        "tableView": true,
        "key": "typeStatus",
        "type": "textarea",
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
        "id": "e3ijnsaaa"
      },
      {
        "label": "Search DarwinCore Term",
        "placeholder": "Search DarwinCore Term",
        "autoExpand": false,
        "tableView": true,
        "key": "searchdarwincore",
        "type": "textarea",
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
        "id": "e3ijnsab"
      },
      ...props.map(el => {
        return {
          "label": el,
          "autoExpand": false,
          "tableView": true,
          "key": el,
          "type": "textarea",
          "input": true
        }
      })

    ]
  },
  "template": `
  <ng-container *ngIf="data.typeStatus">
    <p *ngIf="data.typeHeading&&data.typeHeading!=''" contenteditableNode="false" style="padding-left: 30px">
      <i contenteditableNode="false">
          {{data.typeHeading}}
      </i>
      <i>:</i>
    </p>
<ul contenteditableNode="false" style="padding-left: 40px">
	<li style="list-style:none;">
		<ng-container>
			<p contenteditableNode="false" style="display: inline-block;">{{data.listChar}}.&nbsp;</p>
		</ng-container>
		<ng-container *ngIf="data | keyvalue as formatedData">
			<ng-container *ngFor="let item of formatedData; let index = index">
				<ng-container *ngIf="item.value && item.key!='typeStatus' && item.key!='typeHeading' && item.key!='listChar' && item.key!= 'searchdarwincore'">
					<p contenteditableNode="false" style="display: inline;color: gray;">{{item.key}}:&nbsp;</p>
					<p contenteditableNode="false" style="display: inline;">{{item.value}}</p>
					<p contenteditableNode="false" *ngIf="index < formatedData.length - 3" style="display: inline-block;">{{index}};&nbsp;</p>
				</ng-container>
			</ng-container>
		</ng-container>
	</li>
</ul>
</ng-container>`,
  "type": 0,
  "version_id": 473,
  "version": 3,
  "version_pre_defined": false,
  "version_date": "2022-05-03T04:12:10.000000Z",
  "complex_section_settings": null,
  "settings": null,
  "compatibility": {
    "allow": {
      "all": false,
      "values": [
        44
      ]
    },
    "deny": {
      "all": false,
      "values": []
    }
  },
  "created_at": "2022-05-02T21:22:05.000000Z"
}
