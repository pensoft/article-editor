import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FiguresControllerService } from '@app/editor/services/figures-controller.service';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../../services/ydoc.service';
import { figure } from '../../utils/interfaces/figureComponent';
import { AddFigureDialogComponent } from './add-figure-dialog/add-figure-dialog.component';
import { Node } from 'prosemirror-model';
import { FormioEventsService } from '@app/editor/formioComponents/formio-events.service';
@Component({
  selector: 'app-figures-dialog',
  templateUrl: './figures-dialog.component.html',
  styleUrls: ['./figures-dialog.component.scss']
})
export class FiguresDialogComponent implements AfterViewInit {

  figuresMap ?:YMap<any>
  figuresNumbers ?: string[]
  figures ?: {[key:string]:figure}
  editedFigures:{[key:string]:boolean} ={}
  newFigureNodes :{[key:string]:Node} = {}
  deletedFigures : string[] = []

  constructor(
    private ydocService:YdocService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<FiguresDialogComponent>,
    private formioEventsService:FormioEventsService,
    private figuresControllerService:FiguresControllerService
  ) {
    let figuresNumbersArray = ydocService.figuresMap!.get('ArticleFiguresNumbers')
    let figures = ydocService.figuresMap!.get('ArticleFigures')
    figuresControllerService.figuresNumbers = figuresNumbersArray
    figuresControllerService.figures = figures
    this.figuresNumbers = JSON.parse(JSON.stringify(figuresNumbersArray))
    this.figures = JSON.parse(JSON.stringify(figures));

  }

  ngAfterViewInit(): void {
    //this.figures = this.ydocService.figuresMap?.get('ArticleFigures')
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.figuresNumbers!, event.previousIndex, event.currentIndex);
  }

  editFigure(fig:figure,figIndex:number){
    this.dialog.open(AddFigureDialogComponent, {
      width: '100%',
      height: '90%',
      data: {fig,updateOnSave:false,index:figIndex,figID:fig.figureID},
      disableClose: false
    }).afterClosed().subscribe((result:{figure:figure,figureNode:Node}) => {
      if(result&&result.figure&&result.figureNode){
        this.figuresNumbers?.splice(figIndex,1,result.figure.figureID)
        this.figures![result.figure.figureID] = result.figure
        this.newFigureNodes[result.figure.figureID] = result.figureNode
        this.editedFigures[result.figure.figureID] = true
        this.getFigureRowsOrderData()
      }
    })
  }

  getFigureRowsOrderData(){
    let data = this.formioEventsService.figureData

    let figs = data.figRows;
    let rows = data.nOfRows;
    let columns = data.nOfColumns;

    let pixDimensions = data.a4Pixels//[width,height]

    let loadPromises:Promise<any>[] = [];

    for(let i = 0 ; i < rows ; i++){
      for(let j = 0 ; j < columns ; j++){
        if(figs[i][j]){
          let figure = figs[i][j].container;
          let height:any
          let width:any
          if(figure.height&&figure.width){
            height = figure.height*pixDimensions[1]
            width = figure.width*pixDimensions[0]
          }else if(figure.height){
            height = figure.height*pixDimensions[1]
          }else if(figure.width){
            width = figure.width*pixDimensions[0]
          }else if(figure.hpers&&figure.wpers){
            height = figure.hpers*pixDimensions[1]
            width = figure.wpers*pixDimensions[0]
          }
          let img = new Image(width,height);
          loadPromises.push(new Promise((resolve,reject)=>{
            img.addEventListener('load',((img,height,width,i,j,figure)=>{
              return ()=>{

                let h = height;
                let w = width;

                let naturalHeight = img.naturalHeight
                let naturalWidth = img.naturalWidth;

                if(height&&!width){
                  w = (naturalWidth*height)/naturalHeight;
                }else if(!height&&width){
                  h = (naturalHeight*width)/naturalWidth
                }

                figure.h = h;
                figure.w = w;

                resolve(true)
              }
            })(img,height,width,i,j,figure))
          }))
          img.src = figure.url
        }

      }
    }

    Promise.all(loadPromises).then(()=>{
      console.log(figs);
      let rowsH:number[] = []
      for(let i = 0 ; i < rows ; i++){
        let rowH = 0;
        for(let j = 0 ; j < columns ; j++){
          if(figs[i][j]){
            let cel = figs[i][j].container;
            if(rowH<cel.h){
              rowH = cel.h;
            }
          }
        }
        rowsH.push(rowH)
      }
      let canvasHeight = rowsH.reduce((prev,curr,i,arr)=>{return prev+=curr},0);
      let canvasWidth = pixDimensions[0];
      console.log(pixDimensions,canvasHeight,canvasWidth);

      let canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;

      let ctx = canvas.getContext("2d");
    })

  }

  deleteFigure(fig:figure,figIndex:number){
    this.figuresNumbers?.splice(figIndex,1);
    delete this.figures![fig.figureID]
    if(this.editedFigures[fig.figureID]){
      delete this.editedFigures[fig.figureID]
    }
    /* if(!Object.keys(this.newFigureNodes).includes(fig.figureID)){
      this.deletedFigures.push(fig.figureID)
    }else{
      delete this.newFigureNodes[fig.figureID]
    } */
    /* let figuresNumbersArray = this.ydocService.figuresMap!.get('ArticleFiguresNumbers')
    let figures = this.ydocService.figuresMap!.get('ArticleFigures')
    let citatsBySections = this.ydocService.figuresMap!.get('articleCitatsObj')

    figuresNumbersArray.splice(figIndex,1);
    figures[fig.figureID] = undefined;
    Object.keys(citatsBySections).forEach((sectionID)=>{
      Object.keys(citatsBySections[sectionID]).forEach((citatID)=>{

        let citat = citatsBySections[sectionID][citatID]

        if(citat&&citat.figureIDs&&citat.figureIDs.filter((figID:string)=>{return figID == fig.figureID}).length>0){
          if(citat.figureIDs.filter((figID:string)=>{return figID == fig.figureID}).length>1){
            citat.figureIDs = citat.figureIDs.filter((figID:string)=>{return figID !== fig.figureID})
          }
        }
        if(citat&&citat.displaydFiguresViewhere&&citat.displaydFiguresViewhere.filter((figID:string)=>{return figID == fig.figureID}).length>0){
          citat.displaydFiguresViewhere = citat.displaydFiguresViewhere.filter((figID:string)=>{return figID !== fig.figureID})
        }

      })
    }) */

  }

  addFigure(){
    this.dialog.open(AddFigureDialogComponent, {
      width: '100%',
      height: '90%',
      data:{fig:undefined,updateOnSave:false,index:this.figuresNumbers?.length},
      disableClose: false
    }).afterClosed().subscribe((result:{figure:figure,figureNode:Node}) => {
      if(result&&result.figure&&result.figureNode){
        this.figuresNumbers?.push(result.figure.figureID)
        this.figures![result.figure.figureID] = result.figure
        this.newFigureNodes[result.figure.figureID] = result.figureNode
        this.getFigureRowsOrderData()
      }
    })
  }

  saveFigures(){
    this.figuresControllerService.writeFiguresDataGlobal(this.newFigureNodes,this.figures!,this.figuresNumbers!,this.editedFigures)
    this.dialogRef.close()
  }

  cancelFiguresEdit(){
    this.dialogRef.close()
  }
}
