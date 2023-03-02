import { CdkDrag, CdkDragEnter, CdkDragMove, CdkDropList, CdkDropListGroup, moveItemInArray } from '@angular/cdk/drag-drop';
import { ViewportRuler } from '@angular/cdk/overlay';
import { ClassField } from '@angular/compiler';
import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormioEventsService } from '@app/editor/formioComponents/formio-events.service';
import { editorContainer, ProsemirrorEditorsService } from '@app/editor/services/prosemirror-editors.service';
import { YdocService } from '@app/editor/services/ydoc.service';
import { figure } from '@app/editor/utils/interfaces/figureComponent';
import { PMDomParser, schema } from '@app/editor/utils/Schema';
import { figureBasicData, figureJson } from '@app/editor/utils/section-templates/form-io-json/FIGUREjson';
import { basicSetup, EditorState, EditorView } from '@codemirror/basic-setup';
import { html } from '@codemirror/lang-html';
import { uuidv4 } from 'lib0/random';
import { TextSelection } from 'prosemirror-state';
import { AskBeforeDeleteComponent } from '../../ask-before-delete/ask-before-delete.component';
import { pageDimensionsInPT } from '../../edit-before-export/edit-before-export.component';
import { AddFigureComponentDialogComponent } from './add-figure-component-dialog/add-figure-component-dialog.component';
import { FigurePdfPreviewComponent } from './figure-pdf-preview/figure-pdf-preview.component';

let figuresHtmlTemplate = `
<block-figure [attr.viewed_by_citat]="data.viewed_by_citat||''" [attr.figure_number]="data.figureNumber" [attr.figure_id]="data.figureID" [attr.figure_columns]="data.nOfColumns">
  <figure-components-container contenteditablenode="false">
    <ng-container *ngFor="let figure of data.figureComponents;let i = index">
      <ng-container *ngIf="figure">
        <figure-component [attr.actual_number]="figure.container.componentNumber" [attr.component_number]="i" contenteditablenode="false" [attr.viewed_by_citat]="data.viewed_by_citat||''">
          <code *ngIf="data.figureComponents.length>1">{{getCharValue(i)}}</code>
          <img *ngIf="figure.container.componentType == 'image'" src="{{figure.container.url}}" alt="" title="default image" contenteditable="false" draggable="true" />
          <iframe *ngIf="figure.container.componentType == 'video'" [src]="figure.container.url | safe" controls="" contenteditable="false" draggable="true"></iframe>
        </figure-component>
      </ng-container>
    </ng-container>
  </figure-components-container>
  <figure-descriptions-container>
      <h3 tagname="h3" contenteditablenode="false"><p contenteditablenode="false">Figure: {{data.figureNumber+1}}</p></h3>
      <figure-description *ngIf="data.figureDescription" formControlName="figureDescription" style="display:block;">
      </figure-description>
      <ng-container  formArrayName="figureComponents" >
        <ng-container *ngFor="let control of formGroup.controls.figureComponents.controls;let i = index" formGroupName="{{i}}">
          <figure-component-description [attr.actual_number]="data.figureComponents[i].container.componentNumber" [attr.viewed_by_citat]="data.viewed_by_citat||''" [attr.component_number]="i" style="display:flex;">
            <form-field contenteditablenode="false" *ngIf="data.figureComponents.length>1">
                <p align="set-align-left"  class="set-align-left">{{getCharValue(i)}}:&nbsp;</p>
            </form-field>
            <form-field formControlName="figureComponentDescription">
            </form-field>
          </figure-component-description>
        </ng-container>
      </ng-container>
  </figure-descriptions-container>
  <spacer></spacer>
</block-figure>

`
@Component({
  selector: 'app-add-figure-dialog-v2',
  templateUrl: './add-figure-dialog-v2.component.html',
  styleUrls: ['./add-figure-dialog-v2.component.scss']
})
export class AddFigureDialogV2Component implements AfterViewInit, AfterViewChecked {
  showHTMLEditor = false;

  @ViewChild('codemirrorHtmlTemplate', { read: ElementRef }) codemirrorHtmlTemplate?: ElementRef;
  @ViewChild('container', { read: ViewContainerRef }) container?: ViewContainerRef;
  @ViewChild('gridContainer', { read: ElementRef }) gridContainer?: ElementRef;
  @ViewChild('figureDescription', { read: ElementRef }) figureDescription?: ElementRef;
  figureDescriptionPmContainer: editorContainer

  figureID?: string
  figuresTemplatesObj: any
  codemirrorHTMLEditor?: EditorView
  sectionContent = JSON.parse(JSON.stringify(figureJson));
  figData = figureBasicData
  figNewComponents: any[] = []

  figureComponentsInPrevew = []
  // offset is in persentage
  rowOrder :number[] = [];
  displayPreviewComponents = false
  figureCanvasData :any

  columns = [1, 2, 3, 4]
  columnsFormControl = new FormControl()
  columnWidth:number

  showPdfView = false;
  figureRows:any[][] = []
  maxImgHeightPers
  rowTemplate:any[] = []
  maxImgWidthPers?:number;
  bottomOffset = 0.30; // offset the figures images from the bottom of the list in preview- figure description space

  constructor(
    private prosemirrorEditorsService: ProsemirrorEditorsService,
    private changeDetectorRef: ChangeDetectorRef,
    private dialogRef: MatDialogRef<AddFigureDialogV2Component>,
    private ydocService: YdocService,
    public dialog: MatDialog,
    private ref: ChangeDetectorRef,
    private viewportRuler: ViewportRuler,
    private formioEventsService: FormioEventsService,
    @Inject(MAT_DIALOG_DATA) public data: { fig: figure | undefined, updateOnSave: boolean, index: number, figID: string | undefined }
  ) { }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges()
  }

  ngAfterViewInit(): void {
    try {
      this.figureID = this.data.figID || uuidv4();

      this.renderCodemMirrorEditor(this.figureID!)
      this.renderProsemirrorEditor()
      this.columnsFormControl.valueChanges.subscribe((columns) => {
        let gridParent = this.gridContainer.nativeElement as HTMLDivElement


        //this.columnWidth = gridParent.getBoundingClientRect().width / columns;

        gridParent.setAttribute('data-cols', columns);
        setTimeout(()=>{
          this.updatePreview(false)
        })
      })
      this.updatePreview(false)
      if (!this.data.fig) {
        this.columnsFormControl.setValue(2)
      } else {
        let nOfColumns = this.data.fig.canvasData.nOfColumns
        this.columnsFormControl.setValue(nOfColumns)
        this.figData = this.data.fig
        let descContainer = document.createElement('div');
        descContainer.innerHTML = this.data.fig.description;
        let prosemirrorNode = PMDomParser.parse(descContainer);
        let descPmView = this.figureDescriptionPmContainer.editorView;
        let state = descPmView.state;
        descPmView.dispatch(state.tr.replaceWith(0, state.doc.content.size, prosemirrorNode.content));
      }
      this.figNewComponents = JSON.parse(JSON.stringify(this.figData.components));
    } catch (e) {
      console.error(e);
    }
  }

  renderProsemirrorEditor() {
    let header = this.figureDescription?.nativeElement
    this.figureDescriptionPmContainer = this.prosemirrorEditorsService.renderSeparatedEditorWithNoSync(header, 'popup-menu-container', schema.nodes.paragraph.create({}, schema.text('Type component description here.')))
    setTimeout(()=>{
      let view = this.figureDescriptionPmContainer.editorView;
      let size = view.state.doc.content.size;
      console.log('set sel');
      view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc,size)));
      view.focus()
      this.ref.detectChanges();
    },40)
  }

  renderCodemMirrorEditor(figID: string) {
    try {
      this.figuresTemplatesObj = this.ydocService.figuresMap?.get('figuresTemplates')
      let currFigTemplates
      if (!this.figuresTemplatesObj[figID]) {
        this.figuresTemplatesObj[figID] = { html: figuresHtmlTemplate }
        currFigTemplates = this.figuresTemplatesObj[figID]
      } else {
        currFigTemplates = this.figuresTemplatesObj[figID]
      }
      this.ydocService.figuresMap?.set('figuresTemplates',this.figuresTemplatesObj)
      let prosemirrorNodesHtml = currFigTemplates.html

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

  submitFigure() {
    let figureForSubmit = {
      canvasData:this.figureCanvasData,
      components:this.figNewComponents,
      description:this.figureDescriptionPmContainer.editorView.dom.innerHTML,
      figureID:this.figureID,
      figureNumber:this.data.index,
      figurePlace:this.data.fig?this.data.fig.figurePlace:'endEditor',
      viewed_by_citat:this.data.fig?this.data.fig.viewed_by_citat:'endEditor'
    }
    this.dialogRef.close({figure:figureForSubmit})
  }


  editComponent(component: any, i: number) {
    this.dialog.open(AddFigureComponentDialogComponent, {
      width: '620px',
      data: { component },
      disableClose: false
    }).afterClosed().subscribe((result: { component: any }) => {
      if (result) {
        this.figNewComponents.splice(i, 1, result.component)
        this.updatePreview(false)
      } else {
      }
    })
  }

  deleteComponent(component: any, i: number) {
    let dialogRef = this.dialog.open(AskBeforeDeleteComponent, {
      data: { type: component.componentType, hideDescription: true },
      panelClass: 'ask-before-delete-dialog',
    })
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.figNewComponents.splice(i, 1);
        this.updatePreview(false)
      }
    })
  }

  addComponent() {
    this.dialog.open(AddFigureComponentDialogComponent, {
      width: '620px',
      disableClose: false
    }).afterClosed().subscribe((result: { component: any }) => {
      if (result) {
        this.figNewComponents.push(result.component)
        this.updatePreview(false)
      } else {
      }
    })
  }

  dragEntered(event: CdkDragEnter<number>) {
    const drag = event.item;
    const dropList = event.container;
    const dragIndex = drag.data;
    const dropIndex = dropList.data;

    const phContainer = dropList.element.nativeElement;
    const phElement = phContainer.querySelector('.cdk-drag-placeholder');
    phContainer.removeChild(phElement);
    phContainer.parentElement.insertBefore(phElement, phContainer);

    moveItemInArray(this.figNewComponents, dragIndex, dropIndex);
    this.updatePreview(false)
  }

  getMappedComponentsForPreviw(){
    return JSON.parse(JSON.stringify(
      this.figNewComponents.map((x)=>{return {container:x}})
    ))
  }

  updatePreview(checkDiff:boolean){
    let hasEmptyFields = false;
    let differrance = false;
    this.getMappedComponentsForPreviw().forEach((comp: any, i: number) => {
      let { componentType, url, description } = comp.container;
      if (componentType == '' || url == '' || description == '') {
        hasEmptyFields = true;
      }
      if(!this.figureComponentsInPrevew){
        differrance = true
      }
      else if (this.figureComponentsInPrevew[i]) {
        let { componentTypePrev, urlPrev, descriptionPrev } = this.figureComponentsInPrevew[i].container
        if(componentTypePrev!==componentType||urlPrev!==url||descriptionPrev!==description){
          differrance = true
        }
      }else{
        differrance = true
      }

    })
    let key = 'A4'
    let a4Pixels = [pageDimensionsInPT[key][0], pageDimensionsInPT[key][1]-(pageDimensionsInPT[key][1]*this.bottomOffset)];
    if(differrance||!checkDiff){
      if(!hasEmptyFields){
        this.figureComponentsInPrevew = this.getMappedComponentsForPreviw()
        this.rowOrder = [];
        this.figureComponentsInPrevew.forEach((figure:any,index:number)=>{

          if(index<4){
            this.rowOrder.push(index+1);
          }
        })
        let rows = this.figureComponentsInPrevew.length/this.columnsFormControl.value
        if(rows%1){
          rows = Math.floor((this.figureComponentsInPrevew.length/this.columnsFormControl.value)+1)
        }
        let r = 0;
        let i = 0;
        let iInR = 0;
        this.figureRows = []
        while (i<this.figureComponentsInPrevew.length&&r<rows) {
          if(!this.figureRows[r]){
            this.figureRows[r] = [];
          }
          this.figureRows[r].push(this.figureComponentsInPrevew[i]);
          i++;
          iInR++;
          if(iInR == this.columnsFormControl.value){
            iInR = 0;
            r++;
          }
        }
        this.rowTemplate = []
        for(let i = 0 ; i < this.columnsFormControl.value;i++){
          this.rowTemplate.push(i);
        }
        let rowsN = rows;
        let collsN = this.columnsFormControl.value;

        let maxImgHeight = a4Pixels[1]/rowsN;
        let maxImgWidth = a4Pixels[0]/collsN;
        this.maxImgHeightPers = maxImgHeight*100/a4Pixels[1];
        this.maxImgWidthPers = maxImgWidth*100/a4Pixels[0];

        let calcImgPersentageFromFullA4 = (img:HTMLImageElement,maxImgHeight:number,maxImgWidth:number,a4PixelRec:number[],figComp:any) => {
          if(img.naturalHeight<maxImgHeight&&img.naturalWidth<maxImgWidth){
            let heightPersent = img.naturalHeight/a4PixelRec[1];
            let widthPersent = img.naturalWidth/a4PixelRec[0];
            figComp.container.hpers = heightPersent
            figComp.container.wpers = widthPersent

            figComp.container.h = img.naturalHeight
            figComp.container.w = img.naturalWidth
          }else if(img.naturalHeight/maxImgHeight > img.naturalWidth/maxImgWidth){
            figComp.container.height = maxImgHeight/a4PixelRec[1];

            let scalePers = maxImgHeight/img.naturalHeight;
            figComp.container.h = maxImgHeight
            figComp.container.w = scalePers*img.naturalWidth
          }else if(img.naturalHeight/maxImgHeight < img.naturalWidth/maxImgWidth){
            figComp.container.width = maxImgWidth/a4PixelRec[0];

            let scalePers = maxImgWidth/img.naturalWidth;
            figComp.container.h = scalePers*img.naturalHeight;
            figComp.container.w = maxImgWidth
          }else if(img.naturalHeight/maxImgHeight == img.naturalWidth/maxImgWidth){
            figComp.container.height = maxImgHeight/a4PixelRec[1];
            figComp.container.width = maxImgWidth/a4PixelRec[0];

            figComp.container.h = maxImgHeight
            figComp.container.w = maxImgWidth
          }
        }
        for(let i = 0;i<this.figureRows.length;i++){
          for(let j = 0;j<this.figureRows[i].length;j++){
            let image = this.figureRows[i][j];
            let newImg = new Image();
            newImg.addEventListener('load',()=>{
              calcImgPersentageFromFullA4(newImg,maxImgHeight,maxImgWidth,a4Pixels,image);
            })
            newImg.src = image.container.url;
          }
        }
        this.figureCanvasData = {
          a4Pixels,
          figRows:this.figureRows,
          nOfRows:rowsN,
          nOfColumns:collsN,
          maxImgHeightPers:this.maxImgHeightPers,
          maxImgWidthPers:this.maxImgWidthPers,
        }
        this.displayPreviewComponents = true;
      }
    }
  }

  openFigurePdfPreview(){
    this.dialog.open(FigurePdfPreviewComponent, {
      width: '620px',
      disableClose: false,
      data:{
        figureRows:this.figureRows,
        maxImgHeightPers:this.maxImgHeightPers,
        rowTemplate:this.rowTemplate,
        maxImgWidthPers:this.maxImgWidthPers,
        bottomOffset:this.bottomOffset,
      },
    })
  }
}
