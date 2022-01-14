import { ThisReceiver } from '@angular/compiler';
import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {uuidv4} from "lib0/random";

@Component({
  selector: 'app-choose-manuscript-dialog',
  templateUrl: './choose-manuscript-dialog.component.html',
  styleUrls: ['./choose-manuscript-dialog.component.scss']
})
export class ChooseManuscriptDialogComponent implements OnInit,AfterViewInit {

  showError = false;
  articleTemplates: any[] = [];
  value = undefined
  constructor(
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<ChooseManuscriptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { templates:any },
    ) {

  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.articleTemplates = this.data.templates.data
  }

  createManuscript(val:any){
    if(!val){
      this.showError = true
      setTimeout(()=>{
        this.showError = false
      },1000)
    }else{
      this.dialogRef.close(val)
    }
  }

  closeManuscriptChoose(){
    this.dialogRef.close()
  }

  public search(value: any) {
    this.value = value
  }
}
