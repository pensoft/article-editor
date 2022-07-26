import { ThrowStmt } from '@angular/compiler';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { uuidv4 } from 'lib0/random';
import { toggleMark } from 'prosemirror-commands';
import { EditorView } from 'prosemirror-view';
import { Subject } from 'rxjs';
import { YMap } from 'yjs/dist/src/internals';
import { MenuService } from '../services/menu.service';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';
import { YdocService } from '../services/ydoc.service';
import { filterSectionsFromBackendWithComplexMinMaxValidations } from '../utils/articleBasicStructure';
import { commentData, CommentsService } from '../utils/commentsService/comments.service';
import { DetectFocusService } from '../utils/detectFocusPlugin/detect-focus.service';
import { isCommentAllowed } from '../utils/menu/menuItems';
import { getDate } from './comment/comment.component';

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
  errorMessages?: any = {} // error messages for editor selections
  selection: any
  lastFocusedEditor?: string
  commentsMap?: YMap<any>
  editorView?: EditorView
  userInfo: any

  rendered = 0;
  nOfCommThatShouldBeRendered = 0

  doneRenderingCommentsSubject: Subject<any> = new Subject()

  constructor(
    private commentsService: CommentsService,
    private menuService: MenuService,
    private ChangeDetectorRef: ChangeDetectorRef,
    private editorsService: ProsemirrorEditorsService,
    private ydocSrevice: YdocService,
    private detectFocus: DetectFocusService,
    public prosemirrorEditorsService: ProsemirrorEditorsService) {



    try {
      this.commentAllowdIn = commentsService.commentAllowdIn
      this.selectedTextInEditors = commentsService.selectedTextInEditors
      this.commentsMap = this.ydocSrevice.getCommentsMap()
      this.addCommentSubject = commentsService.addCommentSubject
      this.addCommentEditorId = commentsService.addCommentData.sectionName!
      this.lastFocusedEditor = detectFocus.sectionName
      if (this.lastFocusedEditor) {
        this.editorView = this.editorsService.editorContainers[this.lastFocusedEditor!].editorView
        this.showAddCommentBox = commentsService.addCommentData.showBox
      }
      this.detectFocus.focusedEditor.subscribe((data: any) => {
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
      this.doneRenderingCommentsSubject.subscribe(() => {
        if (this.rendered < this.nOfCommThatShouldBeRendered) {
          this.rendered++;
        }
        if (this.rendered == this.nOfCommThatShouldBeRendered) {
          this.doneRendering()
        }
      })
    } catch (e) {
      console.error(e);
    }
  }

  ngOnInit() {
    this.commentsObj = this.commentsService.getData()
    this.comments = (Object.values(this.commentsObj) as Array<any>).flat()
  }

  getDate = getDate

  doneRendering() {
    let comments = Array.from(document.getElementsByClassName('comment-container')) as HTMLDivElement[];
    console.log('done rendering');
    console.log(comments);
    let sortedComments = this.allComments.sort((c1, c2) => {
      if (c1.domTop != c2.domTop) {
        return c1.domTop - c2.domTop
      } else {
        return c1.pmDocStartPos - c2.pmDocStartPos
      }
    })
    console.log(sortedComments);
    let lastElement
    let lastElementPosition = 0;
    let spaceBeforeComments: { i: number, space: number, h: number, pos: number }[] = []
    sortedComments
    let i = 0;

    let closeElements = function (elements: commentData[], i: number, prevElementEnd: number, comments: HTMLDivElement[]) {
      let com = elements[i]
      let id = com.commentAttrs.id
      let section = com.section
      let domElement = comments.find((element) => {
        return element.getAttribute('commentid') == id && element.getAttribute('sectionid') == section;
      })
      let h = domElement.getBoundingClientRect().height

      if (prevElementEnd < com.domTop) {
        return 0
      } else {
        return 1 + closeElements(elements, i + 1, prevElementEnd + h, comments);
      }
    }

    while (i < sortedComments.length) {
      let com = sortedComments[i]
      let id = com.commentAttrs.id
      let section = com.section
      let domElement = comments.find((element) => {
        return element.getAttribute('commentid') == id && element.getAttribute('sectionid') == section;
      })
      let h = domElement.getBoundingClientRect().height
      if (lastElementPosition < com.domTop) {
        let pos = com.domTop
        domElement.style.top = pos + 'px';
        spaceBeforeComments.push({ i, space: pos - lastElementPosition, h, pos })
        lastElementPosition = pos + h;
        /* let closeNextElements = closeElements(sortedComments, i + 1, lastElementPosition, comments)
        if (closeNextElements > 0) {
          let closeElementsEnd = closeNextElements + i

          while (i < closeElementsEnd) {
            let comNext = sortedComments[i];
            let id = com.commentAttrs.id
            let section = com.section
            let domElement = comments.find((element) => {
              return element.getAttribute('commentid') == id && element.getAttribute('sectionid') == section;
            })
            i++
          }
        } */
      } else {
        let pos = lastElementPosition
        domElement.style.top = pos + 'px';
        spaceBeforeComments.push({ i, space: 0, h, pos })
        lastElementPosition = pos + h;
      }
      i++
    }
    /* sortedComments.forEach((com,i)=>{
      let id = com.commentAttrs.id
      let section = com.section
      let domElement = comments.find((element)=>{
        return element.getAttribute('commentid') == id && element.getAttribute('sectionid') == section;
      })
      let h = domElement.getBoundingClientRect().height
      if(lastElementPosition<com.domTop){
        let pos = com.domTop
        domElement.style.top = pos+'px';
        spaceBeforeComments.push({i,space:pos-lastElementPosition,h,pos})
        lastElementPosition = pos + h;
      }else{
        let pos = lastElementPosition
        domElement.style.top = pos+'px';
        spaceBeforeComments.push({i,space:0,h,pos})
        lastElementPosition = pos + h;
      }
    })
    console.log(spaceBeforeComments); */

  }

  cancelBtnHandle() {
    this.showAddCommentBox = false
    let sectionName = this.addCommentEditorId
    this.addCommentSubject!.next({ type: 'commentData', sectionName, showBox: false })
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
      userData: this.prosemirrorEditorsService.userInfo.data,
      date: commentDate
    }
    this.commentsMap!.set(commentId, { initialComment: userComment, commentReplies: [] });
    let state = this.editorView?.state;
    let dispatch = this.editorView?.dispatch

    toggleMark(state!.schema.marks.comment, {
      id: commentId,
      date: commentDate,
      userid: this.prosemirrorEditorsService.userInfo.data.id,
      username: this.prosemirrorEditorsService.userInfo.data.name
    })(state!, dispatch);
    this.showAddCommentBox = false
    let sectionName = this.addCommentEditorId
    this.addCommentSubject!.next({ type: 'commentData', sectionName, showBox: false })
  }

  getTime() {
    let date = Date.now()
    return date
  }

  allComments: commentData[] = []

  setScrollListener() {
    let container = document.getElementsByClassName('comments-wrapper')[0] as HTMLDivElement;
    let articleElement = document.getElementsByClassName('editor-container')[0] as HTMLDivElement
    articleElement.addEventListener('scroll', (event) => {
      container.scroll({
        top: articleElement.scrollTop + 57,
        left: 0,
        //@ts-ignore
        behavior: 'instant'
      })
    });
  }

  setContainerHeight() {
    let container = document.getElementsByClassName('all-comments-container')[0] as HTMLDivElement;
    let articleElement = document.getElementById('app-article-element') as HTMLDivElement
    let articleElementRactangle = articleElement.getBoundingClientRect()

    container.style.height = articleElementRactangle.height + "px"
  }

  ngAfterViewInit(): void {
    this.setContainerHeight()
    this.setScrollListener()
    this.userInfo
    this.commentsService.commentsVisibilityChange.subscribe((commentsObj) => {
      this.commentsObj = commentsObj
      this.comments = (Object.values(commentsObj) as Array<any>).flat()
    })
    this.commentsService.commentsChangeSubject.subscribe((msg) => {
      let commentsToAdd: commentData[] = []
      let commentsToRemove: commentData[] = []

      let allCommentsInEditors: commentData[] = []
      let editedComments = false;

      Object.keys(this.commentsService.commentsObj).forEach((sectionid) => {
        let commentsInSection = this.commentsService.commentsObj[sectionid];
        allCommentsInEditors.push(...commentsInSection)
        commentsInSection.forEach((comment) => {
          let displayedCom = this.allComments.find((com) => com.commentAttrs.id == comment.commentAttrs.id)
          if (displayedCom) {
            if (displayedCom.commentTxt != comment.commentTxt) {
              displayedCom.commentTxt = comment.commentTxt
              editedComments = true;
            }
            if (displayedCom.domTop != comment.domTop) {
              displayedCom.domTop = comment.domTop
              editedComments = true;
            }
            if (displayedCom.pmDocEndPos != comment.pmDocEndPos) {
              displayedCom.pmDocEndPos = comment.pmDocEndPos
              editedComments = true;
            }
            if (displayedCom.pmDocStartPos != comment.pmDocStartPos) {
              displayedCom.pmDocStartPos = comment.pmDocStartPos
              editedComments = true;
            }
            if (displayedCom.section != comment.section) {
              displayedCom.section = comment.section
              editedComments = true;
            }
          } else {
            commentsToAdd.push(comment)
          }
        })
      })

      this.allComments.forEach((comment) => {
        if (!allCommentsInEditors.find((com) => {
          return com.commentAttrs.id == comment.commentAttrs.id && com.section == comment.section
        })) {
          commentsToRemove.push(comment)
        }
      })
      if (commentsToAdd.length > 0) {
        this.allComments.push(...commentsToAdd);
        editedComments = true;
        this.rendered = 0;
        this.nOfCommThatShouldBeRendered = commentsToAdd.length;
      }
      if (commentsToRemove.length > 0) {
        while (commentsToRemove.length > 0) {
          let commentToRemove = commentsToRemove.pop();
          let commentIndex = this.allComments.findIndex((com) => {
            return com.commentAttrs.id == commentToRemove.commentAttrs.id && com.section == commentToRemove.section;
          })
          this.allComments.splice(commentIndex, 1);
        }
        editedComments = true;
      }
      if (editedComments && commentsToAdd.length == 0) {
        setTimeout(() => {
          this.doneRendering()
        }, 50)
      }
      if (editedComments) {
        this.setContainerHeight()
        console.log(this.allComments);
      }
    })
  }

}
