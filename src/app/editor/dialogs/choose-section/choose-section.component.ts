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
    @Inject(MAT_DIALOG_DATA) public data: {templates:any[],filter?:'simple'|'complex'} ,
    ) {

  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.sectionTemplates = this.data.templates;
    if(this.data.filter&&this.data.filter == 'simple'){
      this.sectionTemplates = this.sectionTemplates.filter((data)=>data.type == 0)
    }else if(this.data.filter&&this.data.filter == 'complex'){
      this.sectionTemplates = this.sectionTemplates.filter((data)=>data.type == 1)
    }

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
