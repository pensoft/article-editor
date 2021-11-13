import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { figure, figure_component } from 'src/app/editor/utils/interfaces/figureComponent';

@Component({
    selector: 'app-add-figure-dialog',
    templateUrl: './add-figure-dialog.component.html',
    styleUrls: ['./add-figure-dialog.component.scss']
})
export class AddFigureDialogComponent implements AfterViewInit {
    renderForm = false;

    sectionContent = {
        "components": [
            {
                "key": "figure-preview",
                "type": "figure-preview",
                "input": false
            },
            {
                "label": "Figure description : ",
                "autoExpand": false,
                "tableView": true,
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
                            "description": "",
                            "componentType": "",
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

    section = { mode: 'editMode' }
    sectionForm = new FormGroup({})
    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private dialogRef: MatDialogRef<AddFigureDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public figure: figure
    ) {

    }

    ngAfterViewInit(): void {
        if (!this.figure) {
            this.renderForm = true
        } else {
            //@ts-ignore
            this.sectionContent.components[1].defaultValue = this.figure.description
            let componentsDefaultValues:any = []
            this.figure.components.forEach((component) => {
                let componentDefault = {"container":{
                    "url":component.url,
                    "description":component.description,
                    "componentType":component.type
                }}
                componentsDefaultValues.push(componentDefault)
            })
            this.sectionContent.components[2].defaultValue = componentsDefaultValues;
            this.renderForm = true
        }
    }

    onSubmit(submision?: any) {
        let newFigure: figure = {
            description: submision.data.figureDescription,
            components: submision.data.figureComponents.reduce((prev: any, curr: any, index: number, array: any) => {
                let newFigureComponent: figure_component = {
                    description: curr.container.description,
                    type: curr.container.componentType,
                    url: curr.container.url,
                }
                return prev.concat([newFigureComponent])
            }, [])
        }
        this.dialogRef.close({ figure: newFigure })
    }
}
