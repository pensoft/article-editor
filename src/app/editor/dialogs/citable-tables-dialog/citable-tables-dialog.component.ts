import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { AfterViewInit, Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { YMap } from 'yjs/dist/src/internals';
import { YdocService } from '../../services/ydoc.service';
import { AddTableDialogComponent } from './add-table-dialog/add-table-dialog.component';
import { Node } from 'prosemirror-model';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { citableTable } from '@app/editor/utils/interfaces/citableTables';
import { AskBeforeDeleteComponent } from '../ask-before-delete/ask-before-delete.component';

@Component({
  selector: 'app-citable-tables-dialog',
  templateUrl: './citable-tables-dialog.component.html',
  styleUrls: ['./citable-tables-dialog.component.scss']
})
export class CitableTablesDialogComponent {

  tablesMap?: YMap<any>
  tablesNumbers?: string[]
  tables?: { [key: string]: citableTable }
  editedTables: { [key: string]: boolean } = {}
  newTableNodes: { [key: string]: Node } = {}
  deletedTables: string[] = []

  constructor(
    private ydocService: YdocService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<CitableTablesDialogComponent>,
    private serviceShare: ServiceShare
  ) {
    let tablesNumbersArray = this.ydocService.tablesMap!.get('ArticleTablesNumbers')
    let tables = ydocService.tablesMap!.get('ArticleTables')
    this.tablesNumbers = JSON.parse(JSON.stringify(tablesNumbersArray))
    this.tables = JSON.parse(JSON.stringify(tables));
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tablesNumbers!, event.previousIndex, event.currentIndex);
  }

  editTable(table: citableTable, tableIndex: number) {
    //this.serviceShare.PmDialogSessionService!.createSubsession();
    this.dialog.open(AddTableDialogComponent, {
      width: '1000px',
      data: { table, updateOnSave: false, index: tableIndex, tableID: table.tableID },
      disableClose: false
    }).afterClosed().subscribe((result: { table: citableTable, tableNode: Node }) => {
      if (result && result.table && result.tableNode) {
        //this.serviceShare.PmDialogSessionService!.endSubsession(true)
        this.tablesNumbers?.splice(tableIndex, 1, result.table.tableID)
        this.tables![result.table.tableID] = result.table
        this.newTableNodes[result.table.tableID] = result.tableNode
        this.editedTables[result.table.tableID] = true
        this.serviceShare.CitableElementsService.writeElementDataGlobal( this.tables!, this.tablesNumbers!,'table_citation');
      } else {
        //this.serviceShare.PmDialogSessionService!.endSubsession(false)
      }
    })
  }

  deleteTable(table: citableTable, tableIndex: number) {
    let dialogRef = this.dialog.open(AskBeforeDeleteComponent, {
      data: { type: 'table', dontshowType:true,objName:'Table №'+(tableIndex+1) },
      panelClass: 'ask-before-delete-dialog',
    })
    dialogRef.afterClosed().subscribe((data: any) => {
      if (data) {
        this.tablesNumbers?.splice(tableIndex, 1);
        delete this.tables![table.tableID]
          if (this.editedTables[table.tableID]) {
            delete this.editedTables[table.tableID]
          }
        this.serviceShare.CitableElementsService.writeElementDataGlobal( this.tables!, this.tablesNumbers!,'table_citation');
      }
    })


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

  addTable() {
    //this.serviceShare.PmDialogSessionService!.createSubsession();
    this.dialog.open(AddTableDialogComponent, {
      width: '1000px',
      data: { fig: undefined, updateOnSave: false, index: this.tablesNumbers?.length },
      disableClose: false
    }).afterClosed().subscribe((result: { table: citableTable, tableNode: Node }) => {
      if (result && result.table && result.tableNode) {
        //this.serviceShare.PmDialogSessionService!.endSubsession(true);
        this.tablesNumbers?.push(result.table.tableID)
        this.tables![result.table.tableID] = result.table
        this.newTableNodes[result.table.tableID] = result.tableNode
        this.serviceShare.CitableElementsService.writeElementDataGlobal( this.tables!, this.tablesNumbers!,'table_citation');
      } else {
        //this.serviceShare.PmDialogSessionService!.endSubsession(false);
      }
    })
  }

  saveTables() {
    //this.CitableTablesService.writeTablesDataGlobal(this.newTableNodes, this.tables!, this.tablesNumbers!, this.editedTables)
    this.dialogRef.close(true)
  }

  cancelTablesEdit() {
    this.dialogRef.close()
  }
}

