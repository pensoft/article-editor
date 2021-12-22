import { ThisReceiver } from '@angular/compiler';
import { AfterViewInit, Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { SearchTemplateService } from '@app/editor/services/search-template.service';
import {uuidv4} from "lib0/random";

@Component({
  selector: 'app-choose-manuscript-dialog',
  templateUrl: './choose-manuscript-dialog.component.html',
  styleUrls: ['./choose-manuscript-dialog.component.scss']
})
export class ChooseManuscriptDialogComponent implements OnInit,AfterViewInit {

  showError = false;
  articleTemplates: string[] = ['Biography',
  'Commentary',
  'Correspondence',
  'Policy Brief',
  'Project Report',
  'Review Article',
  'Software Management Plan',
  'Questionnaire'];
  value = undefined
  constructor(
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<ChooseManuscriptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { templates:any },
    public searchService: SearchTemplateService) {

  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.articleTemplates = this.data.templates.data.reduce(
      (prev:any,curr:any,index:number)=>{
        return prev.concat(curr.name)
      },[])
    console.log(this.data.templates);

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
  /* openDialog(): void {
    const dialogRef = this.dialog.open(ChooseManuscriptDialogComponent, {
      width: '563px',
      height: '657px',

    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  } */

  public search(value: any) {
    this.value = value
    /* this.searchService.searchTopics(value).subscribe(result => {
      result;
    }); */
  }
}
