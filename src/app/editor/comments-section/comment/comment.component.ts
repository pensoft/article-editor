import { D, E } from '@angular/cdk/keycodes';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
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
import { commentData, commentYdocSave, ydocComment } from '@app/editor/utils/commentsService/comments.service';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { Subject } from 'rxjs';
import { TextSelection } from 'prosemirror-state';

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
export class CommentComponent implements OnInit ,AfterViewInit{

  @Input() comment?: commentData;

  @Input() doneRenderingCommentsSubject?: Subject<any>;
  @Output() doneRenderingCommentsSubjectChange = new EventEmitter<Subject<any>>();

  @ViewChild('content') elementView: ElementRef | undefined;
  @ViewChild('ReplyDiv') ReplyDiv: ElementRef | undefined;

  @Output() selected = new EventEmitter<boolean>();

  replyInputDisplay = false
  initialShowMore = false;
  repliesShowMore :boolean[]= [];
  moreLessBtnView :any= {};
  MAX_CONTENT_WIDTH = 290;
  contentWidth: number = this.MAX_CONTENT_WIDTH;
  commentsMap?: YMap<any>
  userComment?: commentYdocSave;
  mobileVersion:boolean
  constructor(
    public authService: AuthService,
    private ydocService: YdocService,
    public sharedDialog: MatDialog,
    private prosemirrorEditorService:ProsemirrorEditorsService,
    private sharedService:ServiceShare
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
    this.userComment = this.commentsMap?.get(this.comment!.commentAttrs.id) || {initialComment:undefined,commentReplies:undefined};
    this.prosemirrorEditorService.mobileVersionSubject.subscribe((data)=>{
      // data == true => mobule version
      this.mobileVersion = data
    })

  }

  commentIsChangedInYdoc(){
    console.log(this.userComment);
  }

  checkIfCommentHasChanged(commentInYdoc:commentYdocSave){
    let changed = false;
    if(commentInYdoc){
      if(commentInYdoc.initialComment.comment != this.userComment.initialComment.comment){
        changed = true;
      }
      if(commentInYdoc.commentReplies.length != this.userComment.commentReplies.length){
        changed = true;
      }else{
        commentInYdoc.commentReplies.forEach((reply,index)=>{
          let localReply = this.userComment.commentReplies[index];
          if(localReply.comment!=reply.comment){
            changed = true;
          }
        })
      }
    }else{
      // comment deleted
      changed = true;
    }
    if(changed){
      this.userComment = JSON.parse(JSON.stringify(commentInYdoc))

      setTimeout(()=>{
        this.commentIsChangedInYdoc()
      },20)
    }
  }


  ngAfterViewInit() {
    setTimeout(()=>{
      this.doneRenderingCommentsSubject.next('rendered')
    },10)
    this.sharedService.CommentsService.ydocCommentsChangeSubject.subscribe((commentsObj)=>{
      let ydocCommentInstance = commentsObj[this.comment.commentAttrs.id]
      this.checkIfCommentHasChanged(ydocCommentInstance)
    })
    this.userComment?.commentReplies.forEach((comment,index)=>{
      this.repliesShowMore[index] = false
    })
    let s : HTMLSpanElement = document.createElement('span');
    s.offsetWidth
    this.sharedService.CommentsService.lastSelectedCommentSubject.subscribe((comment)=>{
      if(this.comment.commentAttrs.id == comment.commentId){
        (this.ReplyDiv.nativeElement as HTMLDivElement).style.display = 'block'
        this.selected.emit(true);
      }else{
        (this.ReplyDiv.nativeElement as HTMLDivElement).style.display = 'none'
        this.selected.emit(false);
      }
    })

  }

  selectComment(){
    let view = this.sharedService.ProsemirrorEditorsService.editorContainers[this.comment.section].editorView;
    let actualComment : commentData
    let allComments = this.sharedService.CommentsService.commentsObj
    Object.keys(allComments).forEach((commentid)=>{
        let com = allComments[commentid]
        if(com&&com.commentAttrs.id == this.comment.commentAttrs.id){
          actualComment = com
        }
    })
    if(actualComment){
      //let commentMiddlePos = Math.floor((actualComment.pmDocStartPos+ actualComment.pmDocEndPos)/2)
      view.focus()
      view.dispatch(view.state.tr.setSelection(new TextSelection(view.state.doc.resolve(actualComment.pmDocStartPos),view.state.doc.resolve(actualComment.pmDocEndPos))))
      this.sharedService.ProsemirrorEditorsService.dispatchEmptyTransaction()
    }
  }

  deleteComment() {
    let from = this.comment?.pmDocStartPos;
    let to = this.comment?.pmDocEndPos;
    let viewRef = this.sharedService.ProsemirrorEditorsService.editorContainers[this.comment.section].editorView
    let state = viewRef.state
    let commentsMark = state?.schema.marks.comment

    viewRef.dispatch(state?.tr.removeMark(from!, to!, commentsMark)!)
    this.commentsMap?.delete(this.comment?.commentAttrs.id)
  }

  deleteReply(id:string){
    let commentData: {initialComment:any,commentReplies:any[]} = this.commentsMap?.get(this.comment?.commentAttrs.id);
    commentData.commentReplies.splice(commentData.commentReplies.findIndex((el)=>{return el.id == id}),1);
    this.commentsMap?.set(this.comment?.commentAttrs.id, commentData);
    this.userComment = commentData;
  }

  showHideReply(replyDiv:HTMLDivElement) {
    if(replyDiv.style.display == 'block'){
      this.sharedService.CommentsService.lastSelectedCommentSubject.next({commentId:undefined,pos:undefined,sectionId:undefined})
    }else{
      console.log('selected comment',this.comment);
      this.sharedService.CommentsService.lastSelectedCommentSubject.next({commentId:this.comment.commentAttrs.id,pos:this.comment.pmDocStartPos,sectionId:this.comment.section})
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
    let commentData: {initialComment:any,commentReplies:any[]} = this.commentsMap?.get(this.comment?.commentAttrs.id);
    let commentContent: any = comment;
    const dialogRef = this.sharedDialog.open(AddCommentDialogComponent, { width: 'auto', data: { url: commentContent, type: 'comment' } });
    dialogRef.afterClosed().subscribe(result => {
      commentContent = result;
      if (result) {
        commentData.initialComment.comment = commentContent;
        this.userComment = commentData;
        this.commentsMap?.set(this.comment?.commentAttrs.id, commentData);
        this.contentWidth = this.elementView?.nativeElement.firstChild.offsetWidth;
        this.moreLessBtnView[this.comment!.commentAttrs.id] = this.contentWidth >= this.MAX_CONTENT_WIDTH

      }
    });
  }

  editReply(id: string, comment: string){
    let commentData: {initialComment:any,commentReplies:any[]} = this.commentsMap?.get(this.comment?.commentAttrs.id);
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
        this.commentsMap?.set(this.comment?.commentAttrs.id, commentData);
        this.contentWidth = this.elementView?.nativeElement.firstChild.offsetWidth;
        this.moreLessBtnView[this.comment!.commentAttrs.id] = this.contentWidth >= this.MAX_CONTENT_WIDTH

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
    let commentData: {initialComment:any,commentReplies:any[]} = this.commentsMap?.get(this.comment?.commentAttrs.id);
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
    this.commentsMap?.set(this.comment?.commentAttrs.id, commentData);
    this.userComment = commentData;
    input.value = ''
    replyDiv.style.display = 'none';

  }
}

