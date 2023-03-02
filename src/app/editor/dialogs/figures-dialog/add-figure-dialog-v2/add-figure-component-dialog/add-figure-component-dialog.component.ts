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

  typeFromControl = new FormControl('',[Validators.required])
  urlFormControl = new FormControl('',[/* Validators.pattern(`[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)`), */Validators.required]);
  types = ['video','image'];
  videoUrl: string
  urlSubscription: Subscription

  @ViewChild('componentDescription', { read: ElementRef }) componentDescription?: ElementRef;
  @ViewChild('urlInputElement', { read: ElementRef }) urlInputElement?: ElementRef;

  componentDescriptionPmContainer:editorContainer

  constructor(
    private serviceShare:ServiceShare,
    private changeDetectorRef: ChangeDetectorRef,
    private dialogRef: MatDialogRef<AddFigureComponentDialogComponent>,
    private embedService: EmbedVideoService,
    private ref:ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { component?:{
      "description": string,
      "componentType": string,
      "url": string,
      originalUrl:string,
      uploadedFileUrl:string,
      "thumbnail": string,
    }, }
  ) {
    this.urlSubscription = this.urlFormControl.valueChanges.subscribe(url => {
      const videoHtml = this.embedService.embed(url);
      if (!videoHtml) {
        this.videoUrl = url
        return;
      }
      const regex = /src="(.*?)"/;
      const match = regex.exec(videoHtml);
      this.videoUrl = match ? match[1] : '';
      this.uploadedFileUrl = undefined
      this.uploadedFileThumb = undefined

    })
  }


  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges()
    this.ref.detectChanges();
  }

  ngOnInit(): void {
  }

  setComponentDataIfAny(){
    if(this.data&&this.data.component){
      this.urlFormControl.setValue(this.data.component.url)
      this.typeFromControl.setValue(this.data.component.componentType)
      setTimeout(()=>{
        this.uploadedFileUrl = this.data.component.uploadedFileUrl
        this.uploadedFileThumb = this.data.component.thumbnail
      })
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
    /* setTimeout(()=>{
      let view = this.componentDescriptionPmContainer.editorView;
      let size = view.state.doc.content.size;
      view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc,size)));
      view.focus()
    },40) */
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
    this.urlFormControl.setValue(this.videoUrl)
    let newComponent = {
      "description": this.componentDescriptionPmContainer.editorView.dom.innerHTML,
      "componentType": this.typeFromControl.value,
      "url": this.urlFormControl.value,
      originalUrl:this.urlFormControl.value,
      uploadedFileUrl:this.uploadedFileUrl,
      "thumbnail": (this.uploadedFileUrl == this.urlFormControl.value)?this.uploadedFileThumb:this.getVideoThumbnail(this.urlFormControl.value),
    }
    this.dialogRef.close({component:newComponent})
  }

  fileIsUploaded(uploaded){
    if(uploaded.collection&&uploaded.base_url){
      this.uploadedFileInCDN(uploaded)
    }
  }
  uploadedFileUrl
  uploadedFileThumb
  uploadedFileInCDN(fileData:any){
    if(fileData.collection == 'images'){
      this.urlFormControl.setValue(fileData.base_url);
      this.typeFromControl.setValue('image');
    }else if(fileData.collection == 'video'){
      this.urlFormControl.setValue(fileData.base_url);
      this.typeFromControl.setValue('video');
    }else{
      this.urlFormControl.setValue(fileData.thumb);
      this.typeFromControl.setValue('image');
    }
    setTimeout(()=>{
      this.uploadedFileUrl = fileData.base_url
      this.uploadedFileThumb = fileData.thumb
    },30)
  }
}
