import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { countSectionFromBackendLevel } from '@app/editor/utils/articleBasicStructure';
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
    @Inject(MAT_DIALOG_DATA) public data: {templates:any[],sectionlevel:number} ,
    ) {

  }

  ngOnInit(): void {

  }

  ngAfterViewInit(): void {
    this.sectionTemplates = this.data.templates
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
