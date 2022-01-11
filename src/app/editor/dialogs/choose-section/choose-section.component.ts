import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ChooseManuscriptDialogComponent } from '../choose-manuscript-dialog/choose-manuscript-dialog.component';

@Component({
  selector: 'app-choose-section',
  templateUrl: './choose-section.component.html',
  styleUrls: ['./choose-section.component.scss']
})
export class ChooseSectionComponent implements OnInit {

  showError = false;
  sectionTemplates: any[] = [];
  value = undefined
  constructor(
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<ChooseManuscriptDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {templates:any[]} ,
    ) {

  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    console.log(this.data);
    this.sectionTemplates = this.data.templates;

  }

  chooseSection(val:any){
    if(!val){
      this.showError = true
      setTimeout(()=>{
        this.showError = false
      },1000)
    }else{
      this.dialogRef.close(val)
    }
  }

  closeSectionChoose(){
    this.dialogRef.close()
  }

  public search(value: any) {
    this.value = value
  }

}
