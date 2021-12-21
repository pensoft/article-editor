import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FiguresControllerService } from '@app/editor/services/figures-controller.service';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../../services/ydoc.service';
import { figure } from '../../utils/interfaces/figureComponent';
import { AddFigureDialogComponent } from './add-figure-dialog/add-figure-dialog.component';
import { Node } from 'prosemirror-model';
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
      width: '70%',
      height: '70%',
      data: {fig,updateOnSave:false,index:figIndex,figID:fig.figureID},
      disableClose: false
    }).afterClosed().subscribe((result:{figure:figure,figureNode:Node}) => {
      if(result&&result.figure&&result.figureNode){
        this.figuresNumbers?.splice(figIndex,1,result.figure.figureID)
        this.figures![result.figure.figureID] = result.figure
        this.newFigureNodes[result.figure.figureID] = result.figureNode
        this.editedFigures[result.figure.figureID] = true
      }
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
      width: '70%',
      height: '70%',
      data:{fig:undefined,updateOnSave:false,index:this.figuresNumbers?.length},
      disableClose: false
    }).afterClosed().subscribe((result:{figure:figure,figureNode:Node}) => {
      if(result&&result.figure&&result.figureNode){
        this.figuresNumbers?.push(result.figure.figureID)
        this.figures![result.figure.figureID] = result.figure
        this.newFigureNodes[result.figure.figureID] = result.figureNode
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
