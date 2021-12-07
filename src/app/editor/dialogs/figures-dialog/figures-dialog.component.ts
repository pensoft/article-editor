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
  newFigureNodes :{[key:string]:Node} = {}


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
    this.figuresNumbers = figuresControllerService.figuresNumbers
    this.figures = figuresControllerService.figures
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
      this.figuresNumbers?.splice(figIndex,1,result.figure.figureID)
      this.figures![result.figure.figureID] = result.figure
      this.newFigureNodes[result.figure.figureID] = result.figureNode
    })
  }

  addFigure(){
    this.dialog.open(AddFigureDialogComponent, {
      width: '70%',
      height: '70%',
      data:{fig:undefined,updateOnSave:false,index:this.figuresNumbers?.length},
      disableClose: false
    }).afterClosed().subscribe((result:{figure:figure,figureNode:Node}) => {
      this.figuresNumbers?.push(result.figure.figureID)
      this.figures![result.figure.figureID] = result.figure
      this.newFigureNodes[result.figure.figureID] = result.figureNode
    })
  }

  saveFigures(){
    this.figuresControllerService.writeFiguresDataGlobal(this.newFigureNodes)
    this.dialogRef.close()
  }

  cancelFiguresEdit(){
    this.dialogRef.close()
  }
}
