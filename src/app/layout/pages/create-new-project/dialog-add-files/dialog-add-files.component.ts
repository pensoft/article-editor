import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-add-files',
  templateUrl: './dialog-add-files.component.html',
  styleUrls: ['./dialog-add-files.component.scss']
})
export class DialogAddFilesComponent implements OnInit {
  public files: File[] = [];

  constructor(
    public dialogRef: MatDialogRef<DialogAddFilesComponent>
   ) { }

  ngOnInit(): void {
  }

 public onSelectBtn(event:any){
    this.files.push(...event.addedFiles);
  }

  public onSelect(event: { addedFiles: any; }) {
    this.files.push(...event.addedFiles);
  }

  public onRemove(event: File) {
    this.files.splice(this.files.indexOf(event), 1);
  }
  public onNoClick(): void {
    this.dialogRef.close();
  }
}
