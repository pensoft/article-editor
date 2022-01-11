import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { uuidv4 } from 'lib0/random';
import { toggleMark } from 'prosemirror-commands';
import { EditorView } from 'prosemirror-view';
import { Subject } from 'rxjs';
import { YMap } from 'yjs/dist/src/internals';
import { MenuService } from '../services/menu.service';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';
import { YdocService } from '../services/ydoc.service';
import { CommentsService } from '../utils/commentsService/comments.service';
import { DetectFocusService } from '../utils/detectFocusPlugin/detect-focus.service';
import { isCommentAllowed } from '../utils/menu/menuItems';

@Component({
  selector: 'app-comments-section',
  templateUrl: './comments-section.component.html',
  styleUrls: ['./comments-section.component.scss']
})
export class CommentsSectionComponent implements AfterViewInit, OnInit {

  comments: any[] = [];
  commentsObj: any;
  addCommentEditorId?: any   // id of the editor where the Comment button was clicked in the menu
  addCommentSubject?: Subject<any>
  showAddCommentBox = false;
  commentAllowdIn?: any = {} // editor id where comment can be made RN equals ''/undefined if there is no such editor RN
  selectedTextInEditors?: any = {} // selected text in every editor
  errorMessages?:any = {} // error messages for editor selections
  selection: any
  lastFocusedEditor?: string
  commentsMap?: YMap<any>
  editorView?: EditorView

  constructor(
    private commentsService: CommentsService,
    private menuService: MenuService,
    private ChangeDetectorRef: ChangeDetectorRef,
    private editorsService: ProsemirrorEditorsService,
    private ydocSrevice: YdocService,
    private detectFocus: DetectFocusService,
    private prosemirrorEditorsService:ProsemirrorEditorsService) {



      try{
        this.commentAllowdIn = commentsService.commentAllowdIn
        this.selectedTextInEditors = commentsService.selectedTextInEditors
        this.commentsMap = this.ydocSrevice.getCommentsMap()
        this.addCommentSubject = commentsService.addCommentSubject
        this.addCommentEditorId = commentsService.addCommentData.sectionName!
        this.lastFocusedEditor = detectFocus.sectionName
        if(this.lastFocusedEditor){
          this.editorView = this.editorsService.editorContainers[this.lastFocusedEditor!].editorView
          this.showAddCommentBox =  commentsService.addCommentData.showBox
        }
        this.detectFocus.focusedEditor.subscribe((data:any) => {
          if (data) {
            this.lastFocusedEditor = data
            this.editorView = this.editorsService.editorContainers[data].editorView;


          }
        })
        this.addCommentSubject.subscribe((data) => {
          if (data.type == 'commentData') {
            this.addCommentEditorId = data.sectionName
            //this.showAddCommentBox = this.lastFocusedEditor! == this.addCommentEditorId! && this.commentAllowdIn[this.addCommentEditorId]
            this.showAddCommentBox = data.showBox
          } else if (data.type == 'commentAllownes') {
            this.commentAllowdIn[data.sectionId] = data.allow && isCommentAllowed(this.editorView?.state!)
            this.selectedTextInEditors[data.sectionId] = data.text
            this.errorMessages[data.sectionId] = data.errorMessage
          }
        })
      }catch(e){
        console.error(e);
      }
  }

  ngOnInit() {
    this.commentsObj = this.commentsService.getData()
    this.comments = (Object.values(this.commentsObj) as Array<any>).flat()
  }

  cancelBtnHandle() {
    this.showAddCommentBox = false
    let sectionName = this.addCommentEditorId
    this.addCommentSubject!.next({ type: 'commentData',sectionName , showBox: false })
  }

  commentBtnHandle(value: string) {
    if (value.length == 0) {
      return
    }
    let commentDate = Date.now()
    let commentId = uuidv4()
    let userCommentId = uuidv4()
    let userComment = {
      id: userCommentId,
      comment: value,
      userData:this.prosemirrorEditorsService.userInfo.data,
      date:commentDate
    }
    this.commentsMap!.set(commentId, {initialComment:userComment,commentReplies:[]});
    let state = this.editorView?.state;
    let dispatch = this.editorView?.dispatch

    toggleMark(state!.schema.marks.comment, {
      id: commentId,
      date:commentDate,
      userid:this.prosemirrorEditorsService.userInfo.data.id,
      username:this.prosemirrorEditorsService.userInfo.data.name
    })(state!, dispatch);
    this.showAddCommentBox = false
    let sectionName = this.addCommentEditorId
    this.addCommentSubject!.next({ type: 'commentData',sectionName , showBox: false })
  }

  ngAfterViewInit(): void {

    this.commentsService.commentsVisibilityChange.subscribe((commentsObj) => {
      this.commentsObj = commentsObj
      this.comments = (Object.values(commentsObj) as Array<any>).flat()
    })
  }

}
