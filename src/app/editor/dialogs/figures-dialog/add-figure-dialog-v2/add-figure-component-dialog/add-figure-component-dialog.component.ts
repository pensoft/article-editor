import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { editorContainer } from '@app/editor/services/prosemirror-editors.service';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { PMDomParser, schema } from '@app/editor/utils/Schema';
import { EmbedVideoService } from 'ngx-embed-video';
import { TextSelection } from 'prosemirror-state';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-figure-component-dialog',
  templateUrl: './add-figure-component-dialog.component.html',
  styleUrls: ['./add-figure-component-dialog.component.scss']
})
export class AddFigureComponentDialogComponent implements OnInit,AfterViewInit,AfterViewChecked {

  typeFromControl = new FormControl('image',[Validators.required])
  urlFormControl = new FormControl('',[/* Validators.pattern(`[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)`), */Validators.required]);
  types = ['video','image','embedded video'];
  videoUrl: string
  urlSubscription: Subscription

  @ViewChild('componentDescription', { read: ElementRef }) componentDescription?: ElementRef;
  @ViewChild('urlInputElement', { read: ElementRef }) urlInputElement?: ElementRef;

  componentDescriptionPmContainer:editorContainer
  lastSource:'dropzone'|'url'
  constructor(
    private serviceShare:ServiceShare,
    private dialogRef: MatDialogRef<AddFigureComponentDialogComponent>,
    private embedService: EmbedVideoService,
    private ref:ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { component?:{
      "description": string,
      "componentType": string,
      "url": string,
      "pdfImageUrl":string,
      "originalFileUrl":string,
      "thumbnail":string,
    }, }
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


  ngAfterViewChecked(): void {
    this.ref.detectChanges();
  }

  ngOnInit(): void {
  }

  setComponentDataIfAny(){
    if(this.data&&this.data.component){
      this.urlFormControl.setValue(this.data.component.url)
      this.typeFromControl.setValue(this.data.component.componentType)
      let descContainer = document.createElement('div');
      descContainer.innerHTML = this.data.component.description;
      let prosemirrorNode = PMDomParser.parse(descContainer);
      let descPmView = this.componentDescriptionPmContainer.editorView;
      let state = descPmView.state;
      descPmView.dispatch(state.tr.replaceWith(0, state.doc.content.size, prosemirrorNode.content));
    }
  }

  ngAfterViewInit(){
    let header = this.componentDescription?.nativeElement
    this.componentDescriptionPmContainer = this.serviceShare.ProsemirrorEditorsService.renderSeparatedEditorWithNoSync(header, 'pm-pdf-menu-container', schema.nodes.paragraph.create({},schema.text('Type component description here.')))
    this.setComponentDataIfAny()
    this.urlInputElement.nativeElement.focus()
  }

  closeDialog(){
    this.dialogRef.close()
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

  submitDialog() {
    this.urlSubscription.unsubscribe()
    if(this.typeFromControl.value == 'embedded video'){
      this.urlFormControl.setValue(this.videoUrl)
    }
    let newComponent:any = {
      "description": this.componentDescriptionPmContainer.editorView.dom.innerHTML,
      "url": this.urlFormControl.value,
    }
    if(this.data&&this.data.component&&this.urlFormControl.value == this.data.component.url){
      newComponent = JSON.parse(JSON.stringify(this.data.component));
      newComponent.description = this.componentDescriptionPmContainer.editorView.dom.innerHTML
      this.dialogRef.close({component:newComponent})
    }
    if(this.typeFromControl.value == 'image'){
      newComponent["componentType"]= this.typeFromControl.value
      if(this.lastSource == 'dropzone'){
        newComponent['thumbnail'] = this.uploadedFileThumb
      }else{
        newComponent['thumbnail'] = this.typeFromControl.value
      }
      newComponent.pdfImgOrigin = this.urlFormControl.value
    }else if(this.typeFromControl.value == 'video'){
      newComponent["componentType"]= this.typeFromControl.value
      if(this.lastSource == 'dropzone'){
        newComponent['thumbnail'] = this.uploadedFileThumb
      }else{
        newComponent["thumbnail"] = this.getVideoThumbnail(this.urlFormControl.value)
      }
      newComponent.pdfImgOrigin = newComponent["thumbnail"]
    }else if(this.typeFromControl.value == 'embedded video'){
      newComponent["componentType"] = 'video'
      newComponent["thumbnail"] = this.getVideoThumbnail(this.urlFormControl.value)
      newComponent.pdfImgOrigin = newComponent["thumbnail"]
    }
    this.dialogRef.close({component:newComponent})
  }

  fileIsUploaded(uploaded){
    if(uploaded.collection&&uploaded.base_url){
      this.uploadedFileInCDN(uploaded)
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
}
