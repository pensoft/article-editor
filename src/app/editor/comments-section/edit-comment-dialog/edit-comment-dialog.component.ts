import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit-comment-dialog',
  templateUrl: './edit-comment-dialog.component.html',
  styleUrls: ['./edit-comment-dialog.component.scss']
})
export class EditCommentDialogComponent implements AfterViewInit , AfterViewChecked{

  editCommentControl = new FormControl()
  commentmarkId:string;
  constructor(
    public dialogRef: MatDialogRef<EditCommentDialogComponent>,
    private ref:ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  ngAfterViewInit(): void {
    this.commentmarkId = this.data.actualCommentId.commentMarkId
    this.editCommentControl.setValue(this.data.comment)
  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges()
  }

  cancelEdit(){
    this.dialogRef.close(undefined)
  }

  submitEdit = ()=>{
    this.dialogRef.close(this.editCommentControl.value)
  }
}
