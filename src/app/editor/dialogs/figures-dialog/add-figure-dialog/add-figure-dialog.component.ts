import { AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { figure, figure_component } from 'src/app/editor/utils/interfaces/figureComponent';
import { figureJson } from '@app/editor/utils/section-templates/form-io-json/FIGUREjson';
import { FiguresControllerService } from '@app/editor/services/figures-controller.service';

@Component({
    selector: 'app-add-figure-dialog',
    templateUrl: './add-figure-dialog.component.html',
    styleUrls: ['./add-figure-dialog.component.scss']
})
export class AddFigureDialogComponent implements AfterViewInit {
    renderForm = false;

    sectionContent = JSON.parse(JSON.stringify(figureJson));

    section = { mode: 'editMode' }
    sectionForm = new FormGroup({})
    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private dialogRef: MatDialogRef<AddFigureDialogComponent>,
        private figuresControllerService: FiguresControllerService,
        @Inject(MAT_DIALOG_DATA) public data: {fig:figure|undefined,updateOnSave:boolean,index:number}
    ) {

    }

    ngAfterViewInit(): void {
        
        if (!this.data.fig) {
            this.renderForm = true
        } else {
            //@ts-ignore
            this.sectionContent.components[1].defaultValue = this.data.fig.description
            let componentsDefaultValues:any = []
            this.data.fig.components.forEach((component) => {
                let componentDefault = {container:{
                    url:component.url,
                    description:component.description,
                    componentType:component.componentType
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
                    componentType: curr.container.componentType,
                    url: curr.container.url,
                }
                return prev.concat([newFigureComponent])
            }, []),
            path:this.data.fig?.path||'endEditor'
        }
        if(this.data.updateOnSave){
            this.figuresControllerService.updateSingleFigure(newFigure,this.data.index)
        }
        this.dialogRef.close({ figure: newFigure })
    }
}
