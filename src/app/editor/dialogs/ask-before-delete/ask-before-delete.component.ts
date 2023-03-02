import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-ask-before-delete',
  templateUrl: './ask-before-delete.component.html',
  styleUrls: ['./ask-before-delete.component.scss']
})
export class AskBeforeDeleteComponent implements OnInit {

  mapping = {
    section:{
      objType:'section',
      objTypeCapital:'Section',
      operation: 'delete',
      operationCapital: 'Delete',
    },
    reference:{
      objType:'reference',
      objTypeCapital:'Reference',
      operation: 'delete',
      operationCapital: 'Delete',
    },
    figure:{
      objType:'figure',
      objTypeCapital:'Figure',
      operation: 'delete',
      operationCapital: 'Delete',
    },
    table:{
      objType:'table',
      objTypeCapital:'Table',
      operation: 'delete',
      operationCapital: 'Delete',
    },
    supplementaryFile:{
      objType:'file',
      objTypeCapital:'File',
      operation: 'delete',
      operationCapital: 'Delete',
    },
    endNote:{
      objType:'note',
      objTypeCapital:'Note',
      operation: 'delete',
      operationCapital: 'Delete',
    },
    comment:{
      objType:'comment',
      objTypeCapital:'Comment',
      operation: 'delete',
      operationCapital: 'Delete',
    },
    reply:{
      objType:'reply',
      objTypeCapital:'Reply',
      operation: 'delete',
      operationCapital: 'Delete',
    },
    currentTaxon:{
      objType:'taxon',
      objTypeCapital:'Taxon',
      operation: 'remove current',
      operationCapital: 'Remove current',
    },
    allOccurrencesTaxon:{
      objType:'taxon',
      objTypeCapital:'Taxon',
      operation: 'remove all occurrences of',
      operationCapital: 'Remove All Occurrences of',
    },
    image:{
      objType:'image',
      objTypeCapital:'Image',
      operation: 'delete',
      operationCapital: 'Delete',
    },
    video:{
      objType:'video',
      objTypeCapital:'Video',
      operation: 'delete',
      operationCapital: 'Delete',
    }
  }

  constructor(
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<AskBeforeDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {objName:string,type:string,  width: string,dontshowType?:boolean},
    ) { }

  ngOnInit(): void {
    this.dialogRef.updateSize('563px');
  }

  cancelDeletion(){
    this.dialogRef.close(undefined)
  }

  confirmDeletion(){
    this.dialogRef.close(true)
  }
}
