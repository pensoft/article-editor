import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmbedVideoService } from 'ngx-embed-video';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-insert-video',
  templateUrl: './insert-video.component.html',
  styleUrls: ['./insert-video.component.scss']
})
export class InsertVideoComponent implements OnInit,AfterViewInit,AfterViewChecked {
  typeFromControl = new FormControl('embedded video',[Validators.required])
  urlFormControl = new FormControl('',[/* Validators.pattern(`[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)`), */Validators.required]);
  types = ['video','embedded video'];
  @ViewChild('urlInputElement', { read: ElementRef }) urlInputElement?: ElementRef;
  urlSubscription: Subscription
  lastSource:'dropzone'|'url'
  videoUrl: string

  constructor(
    public dialogRef: MatDialogRef<InsertVideoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private embedService: EmbedVideoService,
    private ref:ChangeDetectorRef,
  ) {
    this.urlSubscription = this.urlFormControl.valueChanges.subscribe(url => {
      if(this.typeFromControl.value == 'embedded video'){
        const videoHtml = this.embedService.embed(url);
        if (!videoHtml) {
          this.videoUrl = url
          return;
        }
        const regex = /src="(.*?)"/;
        const match = regex.exec(videoHtml);
        this.videoUrl = match ? match[1] : '';
      }
      this.lastSource = 'url'
    })
  }

  ngOnInit(): void {
  }
  onNoClick(): void {
    this.dialogRef.close();
  }
  fileIsUploaded(uploaded){
    if(uploaded.collection&&uploaded.base_url){
      this.uploadedFileInCDN(uploaded)
    }
  }

  ngAfterViewInit(): void {
    this.urlInputElement.nativeElement.focus()
  }

  ngAfterViewChecked(): void {
    this.ref.detectChanges();
  }

  getVideoThumbnail(url: string): string {
    let videoId: string;
    let platform: string;

    if (url.includes('youtube')) {
      videoId = url.match(/embed\/([^#\&\?]*)/)[1];
      platform = 'youtube';
    } else if (url.includes('dailymotion')) {
      videoId = url.match(/video\/([a-zA-Z0-9]+)/)[1];
      platform = 'dailymotion';
    } else if (url.includes('vimeo')) {
      videoId = url.match(/video\/(\d+)/)[1];
      platform = 'vimeo';
    }

    switch (platform) {
      case 'youtube':
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      case 'dailymotion':
        return `https://www.dailymotion.com/thumbnail/video/${videoId}`;
      case 'vimeo':
        return `https://vumbnail.com/${videoId}.jpg`;
      default:
        return '';
    }
  }

  uploadedFileThumb
  uploadedFileInCDN(fileData:any){
    let setData = ()=>{
      this.ref.detectChanges()
      setTimeout(()=>{
        this.uploadedFileThumb = fileData.thumb
        this.lastSource = 'dropzone'
      },30)
    }
    console.log(fileData.collection);
    if(fileData.collection == 'images'){
      this.urlFormControl.setValue(fileData.base_url);
      this.typeFromControl.setValue('image')
      setData()
    }else if(fileData.collection == 'video'){
      this.urlFormControl.setValue(fileData.base_url);
      this.typeFromControl.setValue('video')
      setData()
    }
  }

  submitDialog() {
    this.urlSubscription.unsubscribe()
    if(this.typeFromControl.value == 'embedded video'){
      this.urlFormControl.setValue(this.videoUrl)
    }
    let videoAttrs:any = {
      "url": this.urlFormControl.value,
    }
    if(this.typeFromControl.value == 'video'){
      videoAttrs["componentType"]= this.typeFromControl.value
      if(this.lastSource == 'dropzone'){
        videoAttrs['thumbnail'] = this.uploadedFileThumb
      }else{
        videoAttrs["thumbnail"] = this.getVideoThumbnail(this.urlFormControl.value)
      }
      videoAttrs.pdfImgOrigin = videoAttrs["thumbnail"]
    }else if(this.typeFromControl.value == 'embedded video'){
      videoAttrs["componentType"] = 'video'
      videoAttrs["thumbnail"] = this.getVideoThumbnail(this.urlFormControl.value)
      videoAttrs.pdfImgOrigin = videoAttrs["thumbnail"]
    }
    this.dialogRef.close({videoAttrs})
  }
}
