import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'insert-image-dialog',
  templateUrl: './insert-image-dialog.component.html',
  styleUrls: ['./insert-image-dialog.component.scss']
})
export class InsertImageDialogComponent implements OnInit {

  imgLinkControl = new FormControl('',Validators.required);

  constructor(
    private dialogRef: MatDialogRef<InsertImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }

  getErrorMessage(){
    if(this.imgLinkControl.invalid&&this.imgLinkControl.touched){
      return 'This is not a valid img url.'
    }else{
      return ''
    }
  }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  doAction(data: any) {
    this.dialogRef.close({ data,imgURL:this.imgLinkControl.value });
  }
  fileIsUploaded(uploaded){
    if(uploaded.collection == "images"&&uploaded.base_url){
      this.uploadedFileInCDN(uploaded)
    }
  }
  uploadedFileInCDN(fileData:any){
    this.imgLinkControl.setValue(fileData.base_url);
  }
}
