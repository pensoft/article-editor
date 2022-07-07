import { D } from '@angular/cdk/keycodes';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DateSelectionModelChange } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { uuidv4 } from 'lib0/random';
import { indexOf } from 'lodash';
import { EditorView } from 'prosemirror-view';
import { YMap } from 'yjs/dist/src/internals';
import { AddCommentDialogComponent } from '../../add-comment-dialog/add-comment-dialog.component';
import { ProsemirrorEditorsService } from '../../services/prosemirror-editors.service';
import { YdocService } from '../../services/ydoc.service';
import {AuthService} from "@core/services/auth.service";

export function getDate(date:number){
  let timeOffset = (new Date()).getTimezoneOffset()*60*1000;
  let d = new Date(+date/*+timeOffset  * 1000 */)
  //d.setTime(d.getTime()/*+ (2*60*60*1000) */);
  let timeString = d.getHours() + ":" + (`${d.getMinutes()}`.length==1?`0${d.getMinutes()}`:d.getMinutes()) + " " + ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][d.getDay()-1] +" " +d.getDate() +"/"+ d.getMonth() + "/" + d.getFullYear();
  return timeString
}

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {

  @Input() comment?: {
    from: number,
    to: number,
    text: string,
    section: string,
    attrs: any,
    viewRef: EditorView
  };
  @ViewChild('content') elementView: ElementRef | undefined;

  replyInputDisplay = false
  initialShowMore = false;
  repliesShowMore :boolean[]= [];
  moreLessBtnView :any= {};
  MAX_CONTENT_WIDTH = 290;
  contentWidth: number = this.MAX_CONTENT_WIDTH;
  commentsMap?: YMap<any>
  userComment?: {initialComment:any,commentReplies:any[]};
  mobileVersion:boolean
  constructor(
    public authService: AuthService,
    private ydocService: YdocService,
    public sharedDialog: MatDialog,
    private prosemirrorEditorService:ProsemirrorEditorsService,
    ) {
    if(this.ydocService.editorIsBuild){
      this.commentsMap = this.ydocService.getCommentsMap()
    }
    this.ydocService.ydocStateObservable.subscribe((event) => {
      if (event == 'docIsBuild') {
        this.commentsMap = this.ydocService.getCommentsMap()

      }
    });
    this.mobileVersion = prosemirrorEditorService.mobileVersion
  }

  ngOnInit(): void {
    this.userComment = this.commentsMap?.get(this.comment!.attrs.id) || {initialComment:undefined,commentReplies:undefined};
    this.prosemirrorEditorService.mobileVersionSubject.subscribe((data)=>{
      // data == true => mobule version
      this.mobileVersion = data
    })
  }

  ngAfterViewInit() {

    this.userComment?.commentReplies.forEach((comment,index)=>{
      this.repliesShowMore[index] = false
    })
    let s : HTMLSpanElement = document.createElement('span');
    s.offsetWidth
  }

  deleteComment() {
    console.log('deleting');
    let from = this.comment?.from;
    let to = this.comment?.to;
    let state = this.comment?.viewRef.state
    let commentsMark = state?.schema.marks.comment

    this.comment?.viewRef.dispatch(state?.tr.removeMark(from!, to!, commentsMark)!)
    this.commentsMap?.delete(this.comment?.attrs.id)
  }

  deleteReply(id:string){
    let commentData: {initialComment:any,commentReplies:any[]} = this.commentsMap?.get(this.comment?.attrs.id);
    commentData.commentReplies.splice(commentData.commentReplies.findIndex((el)=>{return el.id == id}),1);
    this.commentsMap?.set(this.comment?.attrs.id, commentData);
    this.userComment = commentData;
  }

  showHideReply(replyDiv:HTMLDivElement) {
    if(replyDiv.style.display == 'block'){
      replyDiv.style.display = 'none';
    }else{
      replyDiv.style.display = 'block';
    }

    /*  let commentsArray = this.commentsMap.get(this.comment?.attrs.id);
     let commentContent;
     let userCommentId = uuidv4();
     const dialogRef = this.sharedDialog.open(AddCommentDialogComponent, { width: 'auto', data: { url: commentContent, type: 'comment' } });
     dialogRef.afterClosed().subscribe(result => {
       commentContent = result
       if (result) {
         let userComment = {
           id: userCommentId,
           comment: commentContent
         }
         this.commentsMap.set(this.comment?.attrs.id, [userComment, ...commentsArray]);
         this.userComments = [userComment, ...commentsArray];
       }
     }); */
  }

  editComment(id: string, comment: string) {
    let commentData: {initialComment:any,commentReplies:any[]} = this.commentsMap?.get(this.comment?.attrs.id);
    let commentContent: any = comment;
    const dialogRef = this.sharedDialog.open(AddCommentDialogComponent, { width: 'auto', data: { url: commentContent, type: 'comment' } });
    dialogRef.afterClosed().subscribe(result => {
      commentContent = result;
      if (result) {
        commentData.initialComment.comment = commentContent;
        this.userComment = commentData;
        this.commentsMap?.set(this.comment?.attrs.id, commentData);
        this.contentWidth = this.elementView?.nativeElement.firstChild.offsetWidth;
        this.moreLessBtnView[this.comment!.attrs.id] = this.contentWidth >= this.MAX_CONTENT_WIDTH

      }
    });
  }

  editReply(id: string, comment: string){
    let commentData: {initialComment:any,commentReplies:any[]} = this.commentsMap?.get(this.comment?.attrs.id);
    let commentContent: any = comment;
    const dialogRef = this.sharedDialog.open(AddCommentDialogComponent, { width: 'auto', data: { url: commentContent, type: 'comment' } });
    dialogRef.afterClosed().subscribe(result => {
      commentContent = result;
      if (result) {
        commentData.commentReplies.forEach((userComment, index, array) => {
          if (userComment.id == id) {
            array[index].comment = commentContent;
          }
        })
        this.userComment = commentData;
        this.commentsMap?.set(this.comment?.attrs.id, commentData);
        this.contentWidth = this.elementView?.nativeElement.firstChild.offsetWidth;
        this.moreLessBtnView[this.comment!.attrs.id] = this.contentWidth >= this.MAX_CONTENT_WIDTH

      }
    });
  }

  cancelReplyBtnHandle(replyDiv:HTMLDivElement) {

    replyDiv.style.display = 'none';

  }

  getDate = getDate

  commentReplyBtnHandle(input: HTMLInputElement,replyDiv:HTMLDivElement) {
    if (!input.value) {
      return
    }
    let commentData: {initialComment:any,commentReplies:any[]} = this.commentsMap?.get(this.comment?.attrs.id);
    let commentContent;
    let userCommentId = uuidv4();
    let commentDate = Date.now()

    commentContent = input.value

    let userComment = {
      id: userCommentId,
      comment: commentContent,
      userData:this.prosemirrorEditorService.userInfo.data,
      date:commentDate
    }
    commentData.commentReplies.push(userComment);
    this.commentsMap?.set(this.comment?.attrs.id, commentData);
    this.userComment = commentData;
    input.value = ''
    replyDiv.style.display = 'none';

  }
}

