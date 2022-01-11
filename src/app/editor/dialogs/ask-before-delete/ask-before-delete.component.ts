import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-ask-before-delete',
  templateUrl: './ask-before-delete.component.html',
  styleUrls: ['./ask-before-delete.component.scss']
})
export class AskBeforeDeleteComponent implements OnInit {

  constructor(
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<AskBeforeDeleteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {sectionName:string}
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
