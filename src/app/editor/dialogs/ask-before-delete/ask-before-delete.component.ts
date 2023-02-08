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
      objTypeCapital:'Section'
    },
    reference:{
      objType:'reference',
      objTypeCapital:'Reference'
    }
  }

  constructor(
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<AskBeforeDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {objName:string,type:string}
    ) { }

  ngOnInit(): void {
  }

  cancelDeletion(){
    this.dialogRef.close(undefined)
  }

  confirmDeletion(){
    this.dialogRef.close(true)
  }
}
