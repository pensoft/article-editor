import { ThrowStmt } from '@angular/compiler';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { EditorChange } from 'codemirror';
import { uuidv4 } from 'lib0/random';
import { toggleMark } from 'prosemirror-commands';
import { TextSelection } from 'prosemirror-state';
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
        if (!this.editorView || !this.editorView.state) {
          return;
        } else if (data.type == 'commentData') {
          this.addCommentEditorId = data.sectionName
          //this.showAddCommentBox = this.lastFocusedEditor! == this.addCommentEditorId! && this.commentAllowdIn[this.addCommentEditorId]
          if (this.showAddCommentBox!==data.showBox) {
            setTimeout(()=>{
              this.moveAddCommentBox(this.editorView)
            },0)
          }
          this.showAddCommentBox = data.showBox
        } else if (data.type == 'commentAllownes') {
          if (this.showAddCommentBox && data.allow == false) {
            this.cancelBtnHandle()
          }
          this.commentAllowdIn[data.sectionId] = data.allow && isCommentAllowed(this.editorView.state)
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

  splice() {
    this.allComments.splice(0, 1);
  }

  addCommentBoxTop: number;
  addCommentBoxH: number;

  moveAddCommentBox(view: EditorView) {
    if(!this.showAddCommentBox){
      this.doneRendering('hide_comment_box')
    }else{
      this.doneRendering()
    }
  }

  getDate = getDate
  preservedScroll?: number
  lastSelectedComment: {
    commentId?: string;
    pos?: number;
    sectionId?: string;
    commentMarkId?: string;
  }
  initialRenderComments(sortedComments: commentData[], comContainers: HTMLDivElement[]) {
    console.log('initioalRenderComments');
    this.notRendered = false;
    let lastElementPosition = 0;
    let i = 0;
    while (i < sortedComments.length) {
      let com = sortedComments[i]
      let id = com.commentAttrs.id
      let section = com.section
      let domElement = comContainers.find((element) => {
        return element.getAttribute('commentid') == id
      })
      let h = domElement.getBoundingClientRect().height
      if (lastElementPosition < com.domTop) {
        let pos = com.domTop
        domElement.style.top = pos + 'px';
        domElement.style.opacity = '1';
        this.displayedCommentsPositions[id] = { displayedTop: pos, height: h }
        lastElementPosition = pos + h;
      } else {
        let pos = lastElementPosition
        domElement.style.top = pos + 'px';
        domElement.style.opacity = '1';
        this.displayedCommentsPositions[id] = { displayedTop: pos, height: h }
        lastElementPosition = pos + h;
      }
      i++
    }
  }
  loopFromTopAndOrderComments(sortedComments: commentData[], comContainers: HTMLDivElement[],) {
    console.log('loopFromTopAndOrderComments');
    let lastElementBottom = 0;
    sortedComments.forEach((com, index) => {
      let id = com.commentAttrs.id;
      let domElement = comContainers.find((element) => {
        return element.getAttribute('commentid') == id
      })
      let h = domElement.getBoundingClientRect().height
      if (this.displayedCommentsPositions[id].height != h || (com.domTop <= this.displayedCommentsPositions[id].displayedTop)) { // old and new comment either dont have the same top or comment's height is changed
        if (lastElementBottom < com.domTop) {
          let pos = com.domTop
          domElement.style.top = pos + 'px';
          this.displayedCommentsPositions[id] = { displayedTop: pos, height: h }
          lastElementBottom = pos + h;
        } else {
          let pos = lastElementBottom
          domElement.style.top = pos + 'px';
          this.displayedCommentsPositions[id] = { displayedTop: pos, height: h }
          lastElementBottom = pos + h;
        }
      } else {
        lastElementBottom = this.displayedCommentsPositions[id].displayedTop + this.displayedCommentsPositions[id].height
      }
    })
  }
  loopFromBottomAndOrderComments(sortedComments: commentData[], comContainers: HTMLDivElement[], addComContainer: HTMLDivElement) {
    console.log('loopFromBottomAndOrderComments');
    let lastCommentTop = addComContainer.getBoundingClientRect().height;
    let i = sortedComments.length - 1
    while (i >= 0) {
      let com = sortedComments[i]
      let id = com.commentAttrs.id;
      let domElement = comContainers.find((element) => {
        return element.getAttribute('commentid') == id
      })
      let h = domElement.getBoundingClientRect().height
      if (this.displayedCommentsPositions[id].height != h || (this.displayedCommentsPositions[id].displayedTop <= com.domTop)) { // old and new comment either dont have the same top or comment's height is changed
        if (lastCommentTop > com.domTop + h) {
          let pos = com.domTop
          domElement.style.top = pos + 'px';
          this.displayedCommentsPositions[id] = { displayedTop: pos, height: h }
          lastCommentTop = pos;
        } else {
          let pos = lastCommentTop - h
          domElement.style.top = pos + 'px';
          this.displayedCommentsPositions[id] = { displayedTop: pos, height: h }
          lastCommentTop = pos;
        }
      } else {
        lastCommentTop = this.displayedCommentsPositions[id].displayedTop
      }
      i--;
    }
  }

  lastSorted: commentData[];
  displayedCommentsPositions: { [key: string]: { displayedTop: number, height: number } } = {}
  notRendered = true
  doneRendering(cause?:string) {
    let comments = Array.from(document.getElementsByClassName('comment-container')) as HTMLDivElement[];
    let container = document.getElementsByClassName('all-comments-container')[0] as HTMLDivElement;
    let allCommentCopy: commentData[] = JSON.parse(JSON.stringify(this.allComments));
    let sortedComments = allCommentCopy.sort((c1, c2) => {
      if (c1.domTop != c2.domTop) {
        return c1.domTop - c2.domTop
      } else {
        return c1.pmDocStartPos - c2.pmDocStartPos
      }
    })/*
    let allCommentsInitioalPositions: { commentTop: number, commentBottom: number, id: string }[] = [];
    let allCommentsPositions: { commentTop: number, commentBottom: number, id: string }[] = []; */
    if(!container||comments.length == 0){
      this.lastSorted = JSON.parse(JSON.stringify(sortedComments))
      return
    }
    let selectedComment = this.commentsService.lastCommentSelected
    if (this.notRendered) {
      this.initialRenderComments(sortedComments, comments)
    } else if (cause||!this.shouldScrollSelected || (this.shouldScrollSelected && (!selectedComment.commentId || !selectedComment.commentMarkId || !selectedComment.sectionId))) {
      if (this.shouldScrollSelected && (!selectedComment.commentId || !selectedComment.commentMarkId || !selectedComment.sectionId)) {
        this.shouldScrollSelected = false;
      }
      let idsOldOrder: string[] = []
      let oldPos = this.lastSorted.reduce<{ top: number, id: string }[]>((prev, curr) => { idsOldOrder.push(curr.commentAttrs.id); return [...prev, { top: curr.domTop, id: curr.commentAttrs.id }] }, [])
      let idsNewOrder: string[] = []
      let newPos = sortedComments.reduce<{ top: number, id: string }[]>((prev, curr) => { idsNewOrder.push(curr.commentAttrs.id); return [...prev, { top: curr.domTop, id: curr.commentAttrs.id }] }, [])
      // determine what kind of change it is
      console.log('reorder',idsOldOrder,idsNewOrder);
      if (JSON.stringify(oldPos) != JSON.stringify(newPos)||cause) {
        console.log('dif pos');
        if (JSON.stringify(idsOldOrder) == JSON.stringify(idsNewOrder)||cause) { // comments are in same order
          console.log('same order');
          if (oldPos[oldPos.length - 1].top > newPos[newPos.length - 1].top) {  // comments have decreased top should loop from top
            this.loopFromTopAndOrderComments(sortedComments, comments)
          } else if (oldPos[oldPos.length - 1].top < newPos[newPos.length - 1].top) { // comments have increased top should loop from bottom
            this.loopFromBottomAndOrderComments(sortedComments, comments, container)
          } else if(cause == 'hide_comment_box'){
            this.loopFromTopAndOrderComments(sortedComments, comments)
            this.loopFromBottomAndOrderComments(sortedComments, comments, container)
          }else{ // moved an existing comment
            this.loopFromBottomAndOrderComments(sortedComments, comments, container)
            this.loopFromTopAndOrderComments(sortedComments, comments)
          }
        } else { // comments are not in the same order
          console.log('not in same order ');
          if (idsOldOrder.length < idsNewOrder.length) { // added a comment
            console.log('add comment');
            let addedCommentId = idsNewOrder.find((comid)=>!idsOldOrder.includes(comid))
            console.log(addedCommentId);
            let sortedComment = sortedComments.find((com)=>com.commentAttrs.id == addedCommentId);
            let commentContainer = comments.find((element) => {
              return element.getAttribute('commentid') == addedCommentId
            })

            commentContainer.style.top = sortedComment.domTop+'px';
            commentContainer.style.opacity = '1';
            this.displayedCommentsPositions[addedCommentId] = {displayedTop:sortedComment.domTop,height:commentContainer.getBoundingClientRect().height}
            this.loopFromTopAndOrderComments(sortedComments, comments)
            this.loopFromBottomAndOrderComments(sortedComments, comments, container)
          } else if (idsNewOrder.length < idsOldOrder.length) { // removed a comment
            this.loopFromTopAndOrderComments(sortedComments, comments)
            this.loopFromBottomAndOrderComments(sortedComments, comments, container)
          } else if (idsNewOrder.length == idsOldOrder.length){ // comments are reordered
            //this.loopFromTopAndOrderComments(sortedComments, comments)
            this.loopFromBottomAndOrderComments(sortedComments, comments, container)
            this.loopFromTopAndOrderComments(sortedComments, comments)
          }
        }
      }
    }
    if (this.showAddCommentBox) {
      let addCommentBoxEl = document.getElementsByClassName('add-comment-box')[0] as HTMLDivElement
      let articleElement = document.getElementById('app-article-element') as HTMLDivElement
      let articleElementRactangle = articleElement.getBoundingClientRect()
      let boxH = addCommentBoxEl.getBoundingClientRect().height;
      let newMarkPos = this.editorView.state.selection.from
      let domCoords = this.editorView.coordsAtPos(newMarkPos)
      let boxTop = domCoords.top - articleElementRactangle.top
      this.addCommentBoxTop = boxTop;
      this.addCommentBoxH = boxH;
      addCommentBoxEl.style.top = boxTop + 'px';
      addCommentBoxEl.style.opacity = '1';
      let positionsArr: { id: string, displayedTop: number, height: number }[] = []
      Object.keys(this.displayedCommentsPositions).forEach((key) => {
        let val = this.displayedCommentsPositions[key];
        if (val) {
          positionsArr.push({ id: key, displayedTop: val.displayedTop, height: val.height });
        }
      })
      positionsArr.sort((a, b) => {
        return a.displayedTop - b.displayedTop
      })
      let commentsInBox: { id: string, displayedTop: number, height: number, posArrIndex: number, dir: 'up' | 'down' }[] = []
      let mostLowerThatShouldMoveUp :number;
      let mostHigherThatShouldMoveDown: number;
      let idOfComThatShouldBeBeforeAddBox:string
      let idOfComThatShouldBeAfterAddBox:string
      sortedComments.forEach((com)=>{
        if(com.domTop<boxTop||(com.domTop==boxTop&&com.pmDocStartPos<newMarkPos)){
          idOfComThatShouldBeBeforeAddBox = com.commentAttrs.id
        }
        if(!idOfComThatShouldBeAfterAddBox&&(com.domTop>boxTop||(com.domTop==boxTop&&com.pmDocStartPos>newMarkPos))){
          idOfComThatShouldBeAfterAddBox = com.commentAttrs.id
        }
      })
      positionsArr.forEach((pos, index) => {
        if(pos.id == idOfComThatShouldBeBeforeAddBox){
          commentsInBox[0] = { ...pos, posArrIndex: index, dir: 'up' }
        }
        if(pos.id == idOfComThatShouldBeAfterAddBox){
          commentsInBox[1] = { ...pos, posArrIndex: index, dir: 'down' }
        }
        /* if (
          (pos.displayedTop < boxTop + boxH && pos.displayedTop > boxTop) ||
          (pos.displayedTop + pos.height < boxTop + boxH && pos.displayedTop + pos.height > boxTop)
        ) {
          if ((pos.displayedTop < boxTop + boxH && pos.displayedTop > boxTop) && !(pos.displayedTop + pos.height < boxTop + boxH && pos.displayedTop + pos.height > boxTop)) {
            if(!mostHigherThatShouldMoveDown||(mostHigherThatShouldMoveDown>pos.displayedTop)){
              mostHigherThatShouldMoveDown = pos.displayedTop;
              commentsInBox[1] = { ...pos, posArrIndex: index, dir: 'down' }
            }
          } else if ((pos.displayedTop + pos.height < boxTop + boxH && pos.displayedTop + pos.height > boxTop) && !(pos.displayedTop < boxTop + boxH && pos.displayedTop > boxTop)) {
            if(!mostLowerThatShouldMoveUp||(mostLowerThatShouldMoveUp<pos.displayedTop)){
              mostLowerThatShouldMoveUp = pos.displayedTop
              commentsInBox[0] = { ...pos, posArrIndex: index, dir: 'up' }
            }
          } else {
            if(!mostHigherThatShouldMoveDown||(mostHigherThatShouldMoveDown>pos.displayedTop)){
              mostHigherThatShouldMoveDown = pos.displayedTop;
              commentsInBox[1] = { ...pos, posArrIndex: index, dir: 'down' }
            }
          }
        } else if (pos.displayedTop < boxTop && pos.displayedTop + pos.height > boxTop + boxH ) {
          if(!mostHigherThatShouldMoveDown||(mostHigherThatShouldMoveDown>pos.displayedTop)){
            mostHigherThatShouldMoveDown = pos.displayedTop;
            commentsInBox[1] = { ...pos, posArrIndex: index, dir: 'down' }
          }
        } */
      })
      let newComsPos:  { displayedTop: number, height: number, id: string }[]  = []
      commentsInBox.forEach((pos) => {
        if (pos.dir == 'up') {
          let offset = boxTop - (pos.displayedTop + pos.height);
          let index = pos.posArrIndex
          let comTop: number
          let comBot: number
          while ( index >= 0 &&(offset < 0||pos.displayedTop<sortedComments.find((com)=>com.commentAttrs.id == pos.id).domTop) ) {
            comTop = positionsArr[index].displayedTop
            comBot = positionsArr[index].displayedTop + positionsArr[index].height
            let spaceUntilUpperElement = index == 0 ? 0 : comTop - (positionsArr[index - 1].displayedTop + positionsArr[index - 1].height);
            let newComTop = comTop + offset;
            let newComBot = comBot + offset;
            newComsPos[index] = { displayedTop: newComTop, id: positionsArr[index].id, height: positionsArr[index].height };
            offset += spaceUntilUpperElement;
            index--;
          }

        } else {
          let offset =   boxH+boxTop - pos.displayedTop
          let index = pos.posArrIndex
          let comTop: number
          let comBot: number
          let commN = sortedComments.length;
          while (index < commN&&(offset > 0 ||pos.displayedTop>sortedComments.find((com)=>com.commentAttrs.id == pos.id).domTop) ) {
            comTop = positionsArr[index].displayedTop
            comBot = positionsArr[index].displayedTop + positionsArr[index].height
            let spaceUntilLowerElement = index == commN - 1 ? 0 : positionsArr[index + 1].displayedTop - comBot;
            let newComTop = comTop + offset;
            let newComBot = comBot + offset;
            newComsPos[index] = { displayedTop: newComTop, id: positionsArr[index].id, height: positionsArr[index].height };
            offset -= spaceUntilLowerElement;
            index++;
          }
        }
      })
      newComsPos.forEach((pos,i)=>{
        let id = pos.id;
        this.displayedCommentsPositions[id] = { displayedTop: pos.displayedTop, height: pos.height }
        let domElement = comments.find((element) => {
          return element.getAttribute('commentid') == id
        })
        domElement.style.top = this.displayedCommentsPositions[id].displayedTop+'px'
      })
    }
    this.lastSorted = JSON.parse(JSON.stringify(sortedComments))

    /* {

      let selectedComIndex: number
      this.lastSelectedComment = selectedComment
      let selectedCom = sortedComments.find((com, i) => {
        if (
          selectedComment.commentId == com.commentAttrs.id &&
          selectedComment.commentMarkId == com.commentMarkId &&
          selectedComment.sectionId == com.section
        ) {
          selectedComIndex = i
          return true
        } else {
          return false
        }
      });

      let comActualTop = selectedCom.domTop;
      let selectedCommentTop = allCommentsInitioalPositions[selectedComIndex].commentTop;
      let offset = comActualTop - selectedCommentTop;
      if (offset < 0) { // should move the comment up - lower the top prop
        let i = selectedComIndex
        let comTop: number
        let comBot: number
        while (offset < 0 && i >= 0) {
          comTop = allCommentsInitioalPositions[i].commentTop
          comBot = allCommentsInitioalPositions[i].commentBottom
          let spaceUntilUpperElement = i == 0 ? 0 : comTop - allCommentsInitioalPositions[i - 1].commentBottom;
          let newComTop = comTop + offset;
          let newComBot = comBot + offset;
          allCommentsPositions[i] = { commentTop: newComTop, commentBottom: newComBot, id: allCommentsInitioalPositions[i].id };

          offset += spaceUntilUpperElement;
          i--;
        }
      } else if (offset > 0) { // should move the comment down - increase the top prop
        let i = selectedComIndex
        let comTop: number
        let comBot: number
        let commN = sortedComments.length;
        while (offset > 0 && i < commN) {
          comTop = allCommentsInitioalPositions[i].commentTop
          comBot = allCommentsInitioalPositions[i].commentBottom
          let spaceUntilLowerElement = i == commN - 1 ? 0 : allCommentsInitioalPositions[i + 1].commentTop - comBot;
          let newComTop = comTop + offset;
          let newComBot = comBot + offset;
          allCommentsPositions[i] = { commentTop: newComTop, commentBottom: newComBot, id: allCommentsInitioalPositions[i].id };
          offset -= spaceUntilLowerElement;
          i++;
        }
      }
      allCommentsPositions.forEach((comPos, i) => {
        allCommentsInitioalPositions[i] = comPos
      })
      allCommentsPositions = []
      this.shouldScrollSelected = false;

      if (this.shouldScrollSelected && !selectedComment.commentId && !selectedComment.commentMarkId && !selectedComment.sectionId) {
        this.shouldScrollSelected = false;
      }
      allCommentsInitioalPositions.forEach((comPos, i) => {
        let coment = sortedComments[i];
        let id = coment.commentAttrs.id
        let comContainer = comments.find((element) => {
          return element.getAttribute('commentid') == id
        })
        comContainer.style.top = comPos.commentTop + 'px';
      })
    } */

  }

  cancelBtnHandle() {
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
    let commentmarkid = uuidv4();
    let userComment = {
      id: userCommentId,
      comment: value,
      userData: this.prosemirrorEditorsService.userInfo.data,
      date: commentDate
    }
    this.commentsMap!.set(commentId, { initialComment: userComment, commentReplies: [] });
    let state = this.editorView?.state;
    let dispatch = this.editorView?.dispatch
    let from = state.selection.from
    let to = state.selection.to
    toggleMark(state!.schema.marks.comment, {
      id: commentId,
      date: commentDate,
      commentmarkid,
      userid: this.prosemirrorEditorsService.userInfo.data.id,
      username: this.prosemirrorEditorsService.userInfo.data.name
    })(state!, dispatch);
    let sectionName = this.addCommentEditorId
    this.addCommentSubject!.next({ type: 'commentData', sectionName, showBox: false })
    console.log(commentId);
    setTimeout(() => {
      this.prosemirrorEditorsService.dispatchEmptyTransaction()
      this.editorView.focus()
      this.editorView.dispatch(this.editorView.state.tr.setSelection(new TextSelection(this.editorView.state.doc.resolve(from), this.editorView.state.doc.resolve(to + 2))))
      setTimeout(() => {
        let pluginData = this.commentsService.commentPluginKey.getState(this.editorView.state)
        let sectionName = pluginData.sectionName
        this.commentsService.getCommentsInAllEditors()

        //this.commentsService.setLastSelectedComment(commentId, from, sectionName, commentmarkid)
      }, 10)
    }, 20)
  }

  getTime() {
    let date = Date.now()
    return date
  }

  allComments: commentData[] = []
  lastArticleScrollPosition = 0
  setScrollListener() {
    let container = document.getElementsByClassName('comments-wrapper')[0] as HTMLDivElement;
    let articleElement = document.getElementsByClassName('editor-container')[0] as HTMLDivElement
    articleElement.addEventListener('scroll', (event) => {
      container.scrollTop = container.scrollTop + articleElement.scrollTop - this.lastArticleScrollPosition
      /*  container.scroll({
         top: container.scrollTop + articleElement.scrollTop - this.lastArticleScrollPosition,
         left: 0,
         //@ts-ignore
         behavior: 'instant'
       }) */
      this.lastArticleScrollPosition = articleElement.scrollTop
    });
    container.addEventListener('wheel', (event) => {
      event.preventDefault()
    })
  }

  changeParentContainer(event: boolean, commentContainer: HTMLDivElement) {
    if (event) {
      commentContainer.classList.add('selected-comment')
    } else {
      commentContainer.classList.remove('selected-comment')
    }
  }

  setContainerHeight() {
    let container = document.getElementsByClassName('all-comments-container')[0] as HTMLDivElement;
    let articleElement = document.getElementById('app-article-element') as HTMLDivElement;
    if(!container||!articleElement){
      return;
    }
    let articleElementRactangle = articleElement.getBoundingClientRect();

    container.style.height = articleElementRactangle.height + 1000 + "px"

  }
  shouldScrollSelected = false;
  ngAfterViewInit(): void {
    this.setContainerHeight()
    this.setScrollListener()
    this.userInfo
    this.commentsService.lastSelectedCommentSubject.subscribe((data) => {
      if (data.commentId && data.commentMarkId && data.sectionId) {
        this.shouldScrollSelected = true
      } else {
        if (this.preservedScroll === 0 || this.preservedScroll) {
          let container = document.getElementsByClassName('comments-wrapper')[0] as HTMLDivElement;
          let articleElement = document.getElementsByClassName('editor-container')[0] as HTMLDivElement

          container.scroll({
            top: articleElement.scrollTop,
            left: 0,
            behavior: 'smooth'
          })
          this.preservedScroll = undefined
        }
      }
      setTimeout(() => {
        this.commentsService.getCommentsInAllEditors()
      }, 200)
    })
    this.commentsService.commentsVisibilityChange.subscribe((commentsObj) => {
      this.commentsObj = commentsObj
      this.comments = (Object.values(commentsObj) as Array<any>).flat()
    })
    this.commentsService.commentsChangeSubject.subscribe((msg) => {
      let commentsToAdd: commentData[] = []
      let commentsToRemove: commentData[] = []

      let allCommentsInEditors: commentData[] = []
      let editedComments = false;
      allCommentsInEditors.push(...Object.values(this.commentsService.commentsObj))
      Object.values(this.commentsService.commentsObj).forEach((comment) => {
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
          if (displayedCom.commentMarkId != comment.commentMarkId) {
            displayedCom.commentMarkId = comment.commentMarkId
            editedComments = true;
          }
          if (displayedCom.selected != comment.selected) {
            displayedCom.selected = comment.selected
            editedComments = true;
          }
          if (editedComments) {
            displayedCom.commentAttrs = comment.commentAttrs
          }
        } else {
          commentsToAdd.push(comment)
        }
      })

      this.allComments.forEach((comment) => {
        if (!allCommentsInEditors.find((com) => {
          return com.commentAttrs.id == comment.commentAttrs.id
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
            this.displayedCommentsPositions[commentToRemove.commentAttrs.id] = undefined
            return com.commentAttrs.id == commentToRemove.commentAttrs.id && com.section == commentToRemove.section;
          })
          this.allComments.splice(commentIndex, 1);
        }
        editedComments = true;
      }
      if (this.shouldScrollSelected) {
        editedComments = true;
      }
      if (editedComments /* && commentsToAdd.length == 0 */) {
        setTimeout(() => {
          this.doneRendering()
        }, 50)
      }
      if (editedComments) {
        this.setContainerHeight()
      }
    })

    this.commentsService.getCommentsInAllEditors()
  }

}
