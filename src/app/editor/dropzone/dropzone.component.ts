import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { AuthService } from '@app/core/services/auth.service';
import { CONSTANTS } from '@app/core/services/constants';
import { environment } from '@env';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { ServiceShare } from '../services/service-share.service';

@Component({
  selector: 'app-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.scss']
})
export class DropzoneComponent implements AfterViewInit {
  @Output() uploaded = new EventEmitter<any>();
  @Input() fileType: "image/*"|"video/*"|null = null;
  @Input() disabled:boolean = false;
  shouldRender = false;
  private token = this._authservice.getToken();
  public config: DropzoneConfigInterface = {
    chunking: true,
    forceChunking: false,
    autoProcessQueue: true,
    maxFilesize: 400000000,
    chunkSize: 1000000,
    retryChunks: true,
    retryChunksLimit: 3,
    parallelUploads: 1,
    paramName: "file",
    maxFiles: 1,
    clickable: '.dz-message',
    addRemoveLinks: !0,
    createImageThumbnails: false,
    thumbnailWidth: 120,
    thumbnailHeight: 120,
    url: environment.apiUrl+'/cdn/v1/upload',
    capture:'',
    timeout: 0,
    headers: {
      [CONSTANTS.AUTH_HEADER]: `Bearer ${this.token}`
    },
  };
  constructor(
    private serviceShare:ServiceShare,
    private _authservice: AuthService,
    private ref:ChangeDetectorRef
  ) { }


  ngAfterViewInit(): void {
    this.config.acceptedFiles = this.fileType?this.fileType:null
    this.shouldRender = true;
    this.ref.detectChanges()
  }

  public onUploadInit(args: any): void {
    console.log('onUploadInit:', args);
  }

  public onUploadError(args: any): void {
    console.error('onUploadError:', args);
    this.setError(args[1].message);
    this.uploaded.emit(args)
  }

  public onUploadSuccess(args: any): void {
    console.log('onUploadSuccess:', args);
    this.onFileUpload(args[1])
  }

  onSending(data: any) {
    const formData = data[2];
    let room = this.serviceShare.YdocService.roomName;
    // let userData = this._authservice.userInfo
    formData.append('article_id', room);
    // formData.append('user_id', userData?.data.id);
    // formData.append('user_email', userData?.data.email);
    // formData.append('user_name', userData?.data.name);
  }

  onAddFile($event: any) {
  }

  errorMsg = undefined

  onFileUpload(fileInfo:{base_url:string,collection:string,thumb:string,uuid:string}) {
    if(fileInfo.collection&&fileInfo.base_url){
      this.uploaded.emit(fileInfo)
    }else{
      this.setError(`File is not of the correct type.`);
    }
  }

  setError(msg:string){
    this.errorMsg = msg
    setTimeout(()=>{
      this.errorMsg = undefined
    },4000)
  }
}
