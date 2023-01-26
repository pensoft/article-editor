import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../../services/ydoc.service';
import { figure } from '../../utils/interfaces/figureComponent';
import { AddFigureDialogComponent } from './add-figure-dialog/add-figure-dialog.component';
import { Node } from 'prosemirror-model';
import { FormioEventsService } from '@app/editor/formioComponents/formio-events.service';
import { ServiceShare } from '@app/editor/services/service-share.service';
@Component({
  selector: 'app-figures-dialog',
  templateUrl: './figures-dialog.component.html',
  styleUrls: ['./figures-dialog.component.scss']
})
export class FiguresDialogComponent implements AfterViewInit {

  figuresMap?: YMap<any>
  figuresNumbers?: string[]
  figures?: { [key: string]: figure }
  editedFigures: { [key: string]: boolean } = {}
  newFigureNodes: { [key: string]: Node } = {}
  deletedFigures: string[] = []

  constructor(
    private ydocService: YdocService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<FiguresDialogComponent>,
    private formioEventsService: FormioEventsService,
    private serviceShare: ServiceShare
  ) {
    let figuresNumbersArray = ydocService.figuresMap!.get('ArticleFiguresNumbers')
    let figures = ydocService.figuresMap!.get('ArticleFigures')
    this.figuresNumbers = JSON.parse(JSON.stringify(figuresNumbersArray))
    this.figures = JSON.parse(JSON.stringify(figures));
  }

  ngAfterViewInit(): void {
    //this.figures = this.ydocService.figuresMap?.get('ArticleFigures')
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.figuresNumbers!, event.previousIndex, event.currentIndex);
  }

  editFigure(fig: figure, figIndex: number) {
    //this.serviceShare.PmDialogSessionService!.createSubsession();
    this.dialog.open(AddFigureDialogComponent, {
      //width: '100%',
      // height: '90%',
      data: { fig, updateOnSave: false, index: figIndex, figID: fig.figureID },
      disableClose: false
    }).afterClosed().subscribe((result: { figure: figure, figureNode: Node }) => {
      if (result && result.figure && result.figureNode) {
        //this.serviceShare.PmDialogSessionService!.endSubsession(true)
        this.figuresNumbers?.splice(figIndex, 1, result.figure.figureID)
        this.figures![result.figure.figureID] = result.figure
        this.newFigureNodes[result.figure.figureID] = result.figureNode
        this.editedFigures[result.figure.figureID] = true
      } else {
        //this.serviceShare.PmDialogSessionService!.endSubsession(false)
      }
    })
  }

  deleteFigure(fig: figure, figIndex: number) {
    this.figuresNumbers?.splice(figIndex, 1);
    delete this.figures![fig.figureID]
    if (this.editedFigures[fig.figureID]) {
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

  addFigure() {
    //this.serviceShare.PmDialogSessionService!.createSubsession();
    this.dialog.open(AddFigureDialogComponent, {
      //width: '100%',
      // height: '90%',
      data: { fig: undefined, updateOnSave: false, index: this.figuresNumbers?.length },
      disableClose: false
    }).afterClosed().subscribe((result: { figure: figure, figureNode: Node }) => {
      if (result && result.figure && result.figureNode) {
        //this.serviceShare.PmDialogSessionService!.endSubsession(true);
        this.figuresNumbers?.push(result.figure.figureID)
        this.figures![result.figure.figureID] = result.figure
        this.newFigureNodes[result.figure.figureID] = result.figureNode
      } else {
        //this.serviceShare.PmDialogSessionService!.endSubsession(false);
      }
    })
  }

  saveFigures() {
    this.serviceShare.CitableElementsService.writeElementDataGlobal(this.figures!, this.figuresNumbers, 'citation');
    this.dialogRef.close(true)
  }

  cancelFiguresEdit() {
    this.dialogRef.close()
  }
}
