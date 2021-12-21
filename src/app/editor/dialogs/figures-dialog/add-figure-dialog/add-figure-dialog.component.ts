import {
    AfterViewInit,
    ChangeDetectorRef,
    Compiler,
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    ElementRef,
    EventEmitter,
    Inject,
    Input,
    NgModule,
    NO_ERRORS_SCHEMA,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef
  } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { figure, figure_component } from 'src/app/editor/utils/interfaces/figureComponent';
import { figureJson } from '@app/editor/utils/section-templates/form-io-json/FIGUREjson';
import { FiguresControllerService } from '@app/editor/services/figures-controller.service';
import { catchError } from 'rxjs/operators';
import { basicSetup, EditorState, EditorView} from '@codemirror/basic-setup';
import { html } from '@codemirror/lang-html';
import { YdocService } from '@app/editor/services/ydoc.service';
import { Subject } from 'rxjs';
import { BrowserModule } from '@angular/platform-browser';
import { MaterialModule } from '@app/shared/material.module';
import { FormControlNameDirective } from '@app/editor/directives/form-control-name.directive';
import { schema } from '@app/editor/utils/Schema';
import { DOMParser } from 'prosemirror-model';
import { uuidv4 } from 'lib0/random';
import { ProsemirrorEditorsService } from '@app/editor/services/prosemirror-editors.service';
import { C } from '@angular/cdk/keycodes';

let basicFigureHTML = '<block-figure figure_number="0"><figure-components-container contenteditablenode="false"><figure-component component_number="0" contenteditablenode="false"><img src="https://cdn.britannica.com/q:60/91/181391-050-1DA18304/cat-toes-paw-number-paws-tiger-tabby.jpg" alt="" title="default image" contenteditable="false" draggable="true"><img class="ProseMirror-separator"><br></figure-component><figure-component component_number="1" contenteditablenode="false"><img src="https://imjeffreyrex.files.wordpress.com/2014/06/linkin-park.png" alt="" title="default image" contenteditable="false" draggable="true"><img class="ProseMirror-separator"><br></figure-component><figure-component component_number="2" contenteditablenode="false"><img src="https://www.everythingreptiles.com/wp-content/uploads/2020/12/Bearded-dragon-fluffing-beard.jpg" alt="" title="default image" contenteditable="false" draggable="true"><img class="ProseMirror-separator"><br></figure-component><figure-component component_number="3" contenteditablenode="false"><img src="https://static.scientificamerican.com/sciam/cache/file/A4406EF9-FC62-42E4-9628F374B062AE07.jpg" alt="" title="default image" contenteditable="false" draggable="true"><img class="ProseMirror-separator"><br></figure-component></figure-components-container><figure-descriptions-container><h3 tagname="h3" contenteditablenode="false">Figure: 1</h3><figure-description style="display:block;"><p align="set-align-left" class="set-align-left">Caption basic example</p></figure-description><figure-component-description component_number="0" style="display:flex;"><form-field><p align="set-align-left" contenteditablenode="false" class="set-align-left">a:</p></form-field><form-field><p align="set-align-left" class="set-align-left"><br></p></form-field></figure-component-description><figure-component-description component_number="1" style="display:flex;"><form-field><p align="set-align-left" contenteditablenode="false" class="set-align-left">b:</p></form-field><form-field><p align="set-align-left" class="set-align-left"><br></p></form-field></figure-component-description><figure-component-description component_number="2" style="display:flex;"><form-field><p align="set-align-left" contenteditablenode="false" class="set-align-left">c:</p></form-field><form-field><p align="set-align-left" class="set-align-left">bearded dragon</p></form-field></figure-component-description><figure-component-description component_number="3" style="display:flex;"><form-field><p align="set-align-left" contenteditablenode="false" class="set-align-left">d:</p></form-field><form-field><p align="set-align-left" class="set-align-left">dog</p></form-field></figure-component-description></figure-descriptions-container></block-figure>'

let figuresHtmlTemplate = `
<block-figure as="dqwd" [attr.viewed_by_citat]="data.viewed_by_citat||''" [attr.figure_number]="data.figureNumber" [attr.figure_id]="data.figureID">
    <figure-components-container >
      <ng-container *ngFor="let figure of data.figureComponents;let i = index">
        <ng-container *ngIf="figure">
            <figure-component [attr.actual_number]="figure.container.componentNumber" [attr.component_number]="i" contenteditablenode="false" [attr.viewed_by_citat]="data.viewed_by_citat||''">
            <code>{{getCharValue(i)}}</code>
            <img *ngIf="figure.container.componentType == 'image'" src="{{figure.container.url}}" alt="" title="default image" contenteditable="false" draggable="true">
               <iframe *ngIf="figure.container.componentType == 'video'" src="{{figure.container.url}}" controls="" contenteditable="false" draggable="true"></iframe>
            </figure-component>
        </ng-container>
      </ng-container>
    </figure-components-container>
    <figure-descriptions-container>
        <h3 tagname="h3" contenteditablenode="false">Figure: {{data.figureNumber+1}}</h3>
        <figure-description *ngIf="data.figureDescription" style="display:block;" innerHTML={{data.figureDescription}}>
        </figure-description>
        <ng-container *ngFor="let figure of data.figureComponents;let i = index">
            <ng-container *ngIf="figure">
                <figure-component-description [attr.actual_number]="figure.container.componentNumber" [attr.viewed_by_citat]="data.viewed_by_citat||''" [attr.component_number]="i" style="display:flex;">
                  <form-field contenteditablenode="false">
                      <p align="set-align-left"  class="set-align-left">{{getCharValue(i)}}:&nbsp;</p>
                  </form-field>
                  <form-field innerHTML={{figure.container.description}}>
                  </form-field>
                </figure-component-description>
            </ng-container >
        </ng-container>
    </figure-descriptions-container>
    <spacer></spacer>
</block-figure>

`
@Component({
    selector: 'app-add-figure-dialog',
    templateUrl: './add-figure-dialog.component.html',
    styleUrls: ['./add-figure-dialog.component.scss']
})
export class AddFigureDialogComponent implements AfterViewInit {
    renderForm = false;
    hidehtml = true;
    sectionContent = JSON.parse(JSON.stringify(figureJson));
    codemirrorHTMLEditor?: EditorView
    @ViewChild('codemirrorHtmlTemplate', { read: ElementRef }) codemirrorHtmlTemplate?: ElementRef;
    @ViewChild('container', { read: ViewContainerRef }) container?: ViewContainerRef;
    figuresTemplatesObj:any

    section = { mode: 'editMode' }
    sectionForm = new FormGroup({})
    figureID?:string 
    constructor(
        private prosemirrorEditorsService:ProsemirrorEditorsService,
        private compiler: Compiler,
        private changeDetectorRef: ChangeDetectorRef,
        private dialogRef: MatDialogRef<AddFigureDialogComponent>,
        private figuresControllerService: FiguresControllerService,
        private ydocService: YdocService,
        @Inject(MAT_DIALOG_DATA) public data: { fig: figure | undefined, updateOnSave: boolean, index: number,figID:string|undefined }
    ) { 

    }

    ngAfterViewInit(): void {
        try {
            this.figureID = this.data.figID||uuidv4();
            if (!this.data.fig) {
                this.renderForm = true
            } else {
                //@ts-ignore
                this.sectionContent.components[1].defaultValue = this.data.fig.description
                let componentsDefaultValues: any = []
                this.data.fig.components.forEach((component) => {
                    let componentDefault = {
                        container: {
                            url: component.url,
                            description: component.description,
                            componentType: component.componentType
                        }
                    }
                    componentsDefaultValues.push(componentDefault)
                })
                this.sectionContent.components[2].defaultValue = componentsDefaultValues;
                this.renderForm = true
            }
            this.renderCodemMirrorEditors(this.figureID!)
        } catch (e) {
            console.error(e);
        }
    }

    async onSubmit(submision?: any) {
        try {
            let escapeHTMLInSubmission= (obj:any)=>{
                Object.keys(obj).forEach((key)=>{
                    if(typeof obj[key] == 'string'){
                        obj[key] = obj[key].replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
                    }else{
                        try{
                            escapeHTMLInSubmission(obj[key])
                        }catch(e){
                            console.error(e);
                        }
                    }
                })
            }
            escapeHTMLInSubmission(submision);
            let tr = this.codemirrorHTMLEditor?.state.update()
            this.codemirrorHTMLEditor?.dispatch(tr!);

            let prosemirrorNewNodeContent = this.codemirrorHTMLEditor?.state.doc.sliceString(0, this.codemirrorHTMLEditor?.state.doc.length);
            
            submision.data.figureID = this.figureID!
            
            submision.data.viewed_by_citat = this.data.figID?this.data.fig?.viewed_by_citat!:"endEditor"
            this.figuresTemplatesObj[this.figureID!] = { html: prosemirrorNewNodeContent }
            this.ydocService.figuresMap?.set('figuresTemplates',this.figuresTemplatesObj)

            submision.data.figureNumber = this.data.index
            let interpolated: any
            interpolated = await this.prosemirrorEditorsService.interpolateTemplate(prosemirrorNewNodeContent!, submision.data,new FormGroup({}));
            let templ = document.createElement('div')
            templ.innerHTML = interpolated
            let Slice = DOMParser.fromSchema(schema).parse(templ.firstChild!)
            let newFigure: figure = {
                figureNumber: this.data.index,
                description: submision.data.figureDescription,
                components: submision.data.figureComponents.reduce((prev: any, curr: any, index: number, array: any) => {
                    let newFigureComponent: figure_component = {
                        description: curr.container.description,
                        componentType: curr.container.componentType,
                        url: curr.container.url,
                    }
                    return prev.concat([newFigureComponent])
                }, []),
                "figureID":submision.data.figureID,
                "figurePlace":this.data.figID?this.data.fig?.figurePlace!:"endEditor",
                "viewed_by_citat":this.data.figID?this.data.fig?.viewed_by_citat!:"endEditor"
            }
            /* if (this.data.updateOnSave) {
                this.figuresControllerService.updateSingleFigure(newFigure, this.data.index)
            } */
            //@ts-ignore
            this.dialogRef.close({ figure: newFigure,figureNode: Slice.content.content[0]})
        } catch (error) {
            console.error(error);
        }
    }

    renderCodemMirrorEditors(figID: string) {
        try {
            this.figuresTemplatesObj = this.ydocService.figuresMap?.get('figuresTemplates')
            let currFigTemplates 
            if (!this.figuresTemplatesObj[figID]) {
                this.figuresTemplatesObj[figID] = { html: figuresHtmlTemplate }
                currFigTemplates = this.figuresTemplatesObj[figID]
            }else{
                currFigTemplates = this.figuresTemplatesObj[figID]
            }
            //this.ydocService.figuresMap?.set('figuresTemplates',figuresTemplatesObj)
            let prosemirrorNodesHtml = currFigTemplates.html

            //prosemirrorNodesHtml = this.formatHTML(prosemirrorNodesHtml)
            this.codemirrorHTMLEditor = new EditorView({
                state: EditorState.create({
                    doc: prosemirrorNodesHtml,
                    extensions: [basicSetup, html()],
                }),
                parent: this.codemirrorHtmlTemplate?.nativeElement,
            })
        } catch (e) {
            console.error(e);
        }
    }

    formatHTML(html: string) {
        var tab = '\t';
        var result = '';
        var indent = '';

        html.split(/>\s*</).forEach(function (element) {
            if (element.match(/^\/\w/)) {
                indent = indent.substring(tab.length);
            }

            result += indent + '<' + element + '>\r\n';

            if (element.match(/^<?\w[^>]*[^\/]$/) && !element.startsWith("input")) {
                indent += tab;
            }
        });

        return result.substring(1, result.length - 3);
    }

    
}
