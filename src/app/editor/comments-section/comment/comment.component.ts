import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { uuidv4 } from 'lib0/random';
import { EditorView } from 'prosemirror-view';
import { YMap } from 'yjs/dist/src/internals';
import { AddCommentDialogComponent } from '../../add-comment-dialog/add-comment-dialog.component';
import { YdocService } from '../../services/ydoc.service';

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
  showMore = false;
  MAX_CONTENT_HEIGHT = 30;
  contentHeight: number = this.MAX_CONTENT_HEIGHT;
  commentsMap?: YMap<any>
  userComments?: any[];

  constructor(private ydocService: YdocService, public sharedDialog: MatDialog) {
    if(this.ydocService.editorIsBuild){
      this.commentsMap = this.ydocService.getCommentsMap()
    }
    this.ydocService.ydocStateObservable.subscribe((event) => {
      if (event == 'docIsBuild') {
        this.commentsMap = this.ydocService.getCommentsMap()

      }
    });
  }

  ngOnInit(): void {
    this.userComments = this.commentsMap?.get(this.comment!.attrs.id) || [];
  }

  ngAfterViewInit() {
    this.contentHeight = this.elementView?.nativeElement.offsetHeight;
  }

  deleteComment() {
    let from = this.comment?.from;
    let to = this.comment?.to;
    let state = this.comment?.viewRef.state
    let commentsMark = state?.schema.marks.comment

    this.comment?.viewRef.dispatch(state?.tr.removeMark(from!, to!, commentsMark)!)
    this.commentsMap?.delete(this.comment?.attrs.id)
  }

  showHideReply(replyDiv:HTMLDivElement) {
    console.log(replyDiv);
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

  editComment(id: any, comment: string) {
    let commentsArray: any[] = this.commentsMap?.get(this.comment?.attrs.id);
    let commentContent: any = comment;
    const dialogRef = this.sharedDialog.open(AddCommentDialogComponent, { width: 'auto', data: { url: commentContent, type: 'comment' } });
    dialogRef.afterClosed().subscribe(result => {
      commentContent = result;
      if (result) {
        commentsArray.forEach((userComment, index, array) => {
          if (userComment.id == id) {
            array[index].comment = commentContent;
          }
        })
        this.userComments = commentsArray;
        this.commentsMap?.set(this.comment?.attrs.id, [...commentsArray]);
      }
    });
  }

  cancelReplyBtnHandle(replyDiv:HTMLDivElement) {
    
    replyDiv.style.display = 'none';

  }

  commentReplyBtnHandle(input: HTMLInputElement,replyDiv:HTMLDivElement) {
    if (!input.value) {
      return
    }
    let commentsArray = this.commentsMap?.get(this.comment?.attrs.id);
    let commentContent;
    let userCommentId = uuidv4();

    commentContent = input.value

    let userComment = {
      id: userCommentId,
      comment: commentContent
    }
    this.commentsMap?.set(this.comment?.attrs.id, [userComment, ...commentsArray]);
    this.userComments = [userComment, ...commentsArray];
    input.value = ''
    replyDiv.style.display = 'none';


  }
}
