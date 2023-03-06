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
  lastSource:'dropzone'|'user'
  @ViewChild('imgurlInput', { read: ElementRef }) imgurlInput?: ElementRef;
  constructor(
    private dialogRef: MatDialogRef<InsertImageDialogComponent>,
    private ref:ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.imgLinkControl.valueChanges.subscribe((val)=>{
      this.lastSource = 'user'
    })
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
    let imgUrl = this.imgLinkControl.value
    let imgContainer = document.getElementById('insert-img-in-editor-container');
    let dimensions = imgContainer.getBoundingClientRect()
    let width
    if(this.lastSource == 'dropzone'&&imgUrl.includes('https://ps-cdn.dev.scalewest.com')){
      imgUrl = imgUrl + `/resize/x300`;
      width = '300'
    }else{
      width = `${dimensions.width}`
      if(dimensions.width > 300){
        width = '300'
      }
    }
    this.dialogRef.close({ data,imgURL:imgUrl,width });
  }
  fileIsUploaded(uploaded){
    if(uploaded.collection == "images"&&uploaded.base_url){
      this.uploadedFileInCDN(uploaded)
    }else{
      console.error('File is not an image.');
    }
  }
  uploadedFileInCDN(fileData:any){
    this.imgLinkControl.setValue(fileData.base_url);
    setTimeout(()=>{
      this.lastSource = 'dropzone'
    },30)
  }
  ngAfterViewInit(): void {
    this.imgurlInput.nativeElement.focus()
    this.ref.detectChanges();
  }
}
