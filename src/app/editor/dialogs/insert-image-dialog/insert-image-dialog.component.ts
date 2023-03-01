import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'insert-image-dialog',
  templateUrl: './insert-image-dialog.component.html',
  styleUrls: ['./insert-image-dialog.component.scss']
})
export class InsertImageDialogComponent implements OnInit,AfterViewInit {

  imgLinkControl = new FormControl('',Validators.required);

  @ViewChild('imgurlInput', { read: ElementRef }) imgurlInput?: ElementRef;
  constructor(
    private dialogRef: MatDialogRef<InsertImageDialogComponent>,
    private ref:ChangeDetectorRef,
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
  ngAfterViewInit(): void {
    this.imgurlInput.nativeElement.focus()
    this.ref.detectChanges();
  }
}
