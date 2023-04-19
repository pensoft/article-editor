import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { interval, Subject, Subscription } from 'rxjs';
import { debounce } from 'rxjs/operators';

import { uuidv4 } from 'lib0/random';
import { MarkType } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

import { getDate } from './comment/comment.component';
import { ProsemirrorEditorsService } from '../services/prosemirror-editors.service';
import { MenuService } from '../services/menu.service';
import { CommentsService } from '../utils/commentsService/comments.service';
import { DetectFocusService } from '../utils/detectFocusPlugin/detect-focus.service';
import { YdocService } from '../services/ydoc.service';
import { YMap } from 'yjs/dist/src/internals';
import { isCommentAllowed } from '../utils/menu/menuItems';
import { commentData, commentYdocSave } from '../utils/commentsService/commentMarksHelpers';

@Component({
  selector: 'app-comments-section',
  templateUrl: './comments-section.component.html',
  styleUrls: ['./comments-section.component.scss']
})
export class CommentsSectionComponent implements AfterViewInit, OnDestroy {

  commentInputFormControl = new FormControl('')
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
  subjSub = new Subscription();
  
  @ViewChild('input', { read: ElementRef }) commentInput?: ElementRef;
  @ViewChild('commentsInput', { read: ElementRef }) commentsSearchinput?: ElementRef;
  
  searchForm = new FormControl('');
  
  rendered = 0;
  nOfCommThatShouldBeRendered = 0
  
  addCommentBoxIsAlreadyMoved: boolean;
  
  doneRenderingCommentsSubject: Subject<any> = new Subject()
  newCommentMarkId:string
  constructor(
    private commentsService: CommentsService,
    private menuService: MenuService,
    private ChangeDetectorRef: ChangeDetectorRef,
    private editorsService: ProsemirrorEditorsService,
    private ydocSrevice: YdocService,
    private detectFocus: DetectFocusService,
    public prosemirrorEditorsService: ProsemirrorEditorsService) {

      this.newCommentMarkId = uuidv4()

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

      this.subjSub.add(this.commentsService.lastSelectedCommentSubject.subscribe((data) => {        
        if (data.commentId && data.commentMarkId && data.sectionId) {
          this.shouldScrollSelected = true
        } else {
          this.tryMoveItemsUp = true
          setTimeout(() => {
            this.doneRendering()
          }, 20)
        }
        setTimeout(() => {
          this.commentsService.getCommentsInAllEditors()
        }, 200)
      }))
      this.subjSub.add(this.doneRenderingCommentsSubject.subscribe((data) => {
        if (this.rendered < this.nOfCommThatShouldBeRendered) {
          this.rendered++;
        }
        if (data == 'replay_rerender') {
          this.doneRendering('replay_rerender')
          return;
        }
        if(data == 'change_in_comments_in_ydoc'){
          this.doneRendering('change_in_comments_in_ydoc')
        }
        if(data == 'show_more_less_click'){
          this.doneRendering('show_more_less_click');
        }
        if (this.rendered == this.nOfCommThatShouldBeRendered) {
          this.doneRendering();
        }
      }))
    } catch (e) {
      console.error(e);
    }
  }

  splice() {
    this.allComments.splice(0, 1);
  }

  addCommentBoxTop: number;
  addCommentBoxH: number;

  moveAddCommentBox(view: EditorView) {
    if (!this.showAddCommentBox && !this.addCommentBoxIsAlreadyMoved) {
      this.doneRendering('hide_comment_box')
      if(this.commentInput && this.commentInput.nativeElement){
        this.commentInput.nativeElement.value = ''
      }
    } else if(!this.addCommentBoxIsAlreadyMoved){
      this.addCommentBoxIsAlreadyMoved = true;
      this.newCommentMarkId = uuidv4();
      this.doneRendering('show_comment_box')
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
    this.notRendered = false;
    let lastElementPosition = 0;
    let i = 0;
    while (i < sortedComments.length) {
      let com = sortedComments[i]
      let id = com.commentAttrs.id
      let section = com.section
      let domElement = comContainers[i]
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
    let lastElementBottom = 0;
    sortedComments.forEach((com, i) => {
      let id = com.commentAttrs.id;
      let domElement = comContainers[i];
      let h = domElement.getBoundingClientRect().height
      if (!this.displayedCommentsPositions[id]||(this.displayedCommentsPositions[id].height != h || (com.domTop <= this.displayedCommentsPositions[id].displayedTop))) { // old and new comment either dont have the same top or comment's height is changed
        if (lastElementBottom < com.domTop) {
          let pos = com.domTop
          domElement.style.top = pos + 'px';
          if(!this.searching){
            domElement.style.opacity = "1";
          }
          this.displayedCommentsPositions[id] = { displayedTop: pos, height: h }
          lastElementBottom = pos + h;
        } else {
          let pos = lastElementBottom
          domElement.style.top = pos + 'px';
          if(!this.searching){
            domElement.style.opacity = "1";
          }
          this.displayedCommentsPositions[id] = { displayedTop: pos, height: h }
          lastElementBottom = pos + h;
        }
      } else {
        lastElementBottom = this.displayedCommentsPositions[id].displayedTop + this.displayedCommentsPositions[id].height
      }
    })
  }
  loopFromBottomAndOrderComments(sortedComments: commentData[], comContainers: HTMLDivElement[], addComContainer: HTMLDivElement) {
    let lastCommentTop = addComContainer.getBoundingClientRect().height;
    let i = sortedComments.length - 1
    while (i >= 0) {
      let com = sortedComments[i]
      let id = com.commentAttrs.id;
      let domElement = comContainers[i]
      let h = domElement.getBoundingClientRect().height
      if (!this.displayedCommentsPositions[id]||(this.displayedCommentsPositions[id].height != h || (this.displayedCommentsPositions[id].displayedTop <= com.domTop))) { // old and new comment either dont have the same top or comment's height is changed
        if (lastCommentTop > com.domTop + h) {
          let pos = com.domTop
          domElement.style.top = pos + 'px';
          if(!this.searching){
            domElement.style.opacity = "1";
           }
          this.displayedCommentsPositions[id] = { displayedTop: pos, height: h }
          lastCommentTop = pos;
        } else {
          let pos = lastCommentTop - h
          domElement.style.top = pos + 'px';
          if(!this.searching){
           domElement.style.opacity = "1";
          }
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
  doneRendering(cause?: string) {
    let comments = (Array.from(document.getElementsByClassName('comment-container')) as HTMLDivElement[])
    .sort((a, b) => {
      if(a.style.top && b.style.top) {
         return parseFloat(a.style.top) - parseFloat(b.style.top) 
        }
      });
    (document.getElementsByClassName('end-article-spase')[0] as HTMLDivElement).style.minHeight = "500px";
    let container = document.getElementsByClassName('all-comments-container')[0] as HTMLDivElement;
    let allCommentCopy: commentData[] = JSON.parse(JSON.stringify(this.allComments));
    let sortedComments = allCommentCopy.sort((c1, c2) => {
      if (c1.domTop != c2.domTop) {
        return c1.domTop - c2.domTop
      } else {
        return c1.pmDocStartPos - c2.pmDocStartPos
      }
    })
    /*
    let allCommentsInitioalPositions: { commentTop: number, commentBottom: number, id: string }[] = [];
    let allCommentsPositions: { commentTop: number, commentBottom: number, id: string }[] = []; */
    if ((!container || comments.length == 0) && cause != 'show_comment_box') {
      this.lastSorted = JSON.parse(JSON.stringify(sortedComments))
      return
    }
    let selectedComment = this.commentsService.lastCommentSelected
    if (this.notRendered) {
      this.initialRenderComments(sortedComments, comments)
    } else if (!this.notRendered && sortedComments.length > 0) {
      if (this.shouldScrollSelected && (!selectedComment.commentId || !selectedComment.commentMarkId || !selectedComment.sectionId)) {
        this.shouldScrollSelected = false;
      }
      let idsOldOrder: string[] = []

      let oldPos = 
      this.lastSorted.reduce<{ top: number, id: string }[]>((prev, curr) => { 
        idsOldOrder.push(curr.commentAttrs.id);
        return [...prev, { top: curr.domTop, id: curr.commentAttrs.id }] 
      }, [])

      let idsNewOrder: string[] = []
      let newPos = sortedComments.reduce<{ top: number, id: string }[]>((prev, curr) => {
        idsNewOrder.push(curr.commentAttrs.id); 
        return [...prev, { top: curr.domTop, id: curr.commentAttrs.id }] 
      }, [])

      if (this.preventRerenderUntilCommentAdd.bool) {
        let newComId = this.preventRerenderUntilCommentAdd.id;
        if (!idsNewOrder.includes(newComId)) {
          return
        } else {
          this.preventRerenderUntilCommentAdd.bool = false
        }
      }
      // determine what kind of change it is
      if (JSON.stringify(oldPos) != JSON.stringify(newPos) || cause || this.tryMoveItemsUp) {
        if (JSON.stringify(idsOldOrder) == JSON.stringify(idsNewOrder) || cause || this.tryMoveItemsUp) { // comments are in same order
          if (oldPos.length > 0 && oldPos[oldPos.length - 1].top > newPos[newPos.length - 1].top) {  // comments have decreased top should loop from top
            this.loopFromTopAndOrderComments(sortedComments, comments)
          } else if (oldPos.length > 0 && oldPos[oldPos.length - 1].top < newPos[newPos.length - 1].top) { // comments have increased top should loop from bottom
            this.loopFromBottomAndOrderComments(sortedComments, comments, container)
          } else if (cause == 'hide_comment_box' || cause == 'replay_rerender' || cause == 'change_in_comments_in_ydoc' || cause == 'show_more_less_click') {
            this.loopFromTopAndOrderComments(sortedComments, comments)
            this.loopFromBottomAndOrderComments(sortedComments, comments, container)
          } else if (this.tryMoveItemsUp) {
            this.loopFromTopAndOrderComments(sortedComments, comments)
            this.tryMoveItemsUp = false;
          } else { // moved an existing comment
            this.loopFromBottomAndOrderComments(sortedComments, comments, container)
            this.loopFromTopAndOrderComments(sortedComments, comments)
          }
        } else { // comments are not in the same order
          if (idsOldOrder.length < idsNewOrder.length) { // added a comment
            let addedCommentId = idsNewOrder.find((comid) => !idsOldOrder.includes(comid))
            let sortedComment = sortedComments.find((com) => com.commentAttrs.id == addedCommentId);
            let commentContainer = comments.find((element) => {
              return element.getAttribute('commentid') == addedCommentId
            })
            if(commentContainer) {
              commentContainer.style.top = sortedComment.domTop + 'px';
              if(!this.searching) {
                commentContainer.style.opacity = '1';
              }
              this.displayedCommentsPositions[addedCommentId] = { displayedTop: sortedComment.domTop, height: commentContainer.getBoundingClientRect().height }
              this.loopFromTopAndOrderComments(sortedComments, comments)
            }
          } else if (idsNewOrder.length < idsOldOrder.length) { // removed a comment
            this.loopFromTopAndOrderComments(sortedComments, comments)
            this.loopFromBottomAndOrderComments(sortedComments, comments, container)
          } else if (idsNewOrder.length == idsOldOrder.length) { // comments are reordered
            //this.loopFromTopAndOrderComments(sortedComments, comments)
            //this.loopFromBottomAndOrderComments(sortedComments, comments, container)
            //this.loopFromTopAndOrderComments(sortedComments, comments)
            this.initialRenderComments(sortedComments, comments)
          }
        }
      }
    }
    if (this.shouldScrollSelected && selectedComment.commentId && selectedComment.commentMarkId && selectedComment.sectionId) {
      let selectedCommentIndex = sortedComments.findIndex((com) => {
        return com.commentAttrs.id == selectedComment.commentId;
      })
      let selectedCommentSorted = sortedComments[selectedCommentIndex];
      let commentContainer = comments.find((element) => {
        return element.getAttribute('commentid') == selectedComment.commentId
      })
      if(commentContainer) {
        commentContainer.style.top = selectedCommentSorted.domTop + 'px';
        this.displayedCommentsPositions[selectedComment.commentId] = { displayedTop: selectedCommentSorted.domTop, height: commentContainer.getBoundingClientRect().height }

        //loop comments up in the group and move them if any
        let lastCommentTop = selectedCommentSorted.domTop;
        let i = selectedCommentIndex - 1
        let commentsGrouTopEnd = false
        while (i >= 0 && !commentsGrouTopEnd) {
          let com = sortedComments[i]
          let id = com.commentAttrs.id;
          let domElement = comments.find((element) => {
            return element.getAttribute('commentid') == id
          })
          let h = domElement.getBoundingClientRect().height
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
          i--;
        }
        let lastElementBottom = selectedCommentSorted.domTop + commentContainer.getBoundingClientRect().height;
        let i1 = selectedCommentIndex + 1
        let n = sortedComments.length
        let commentsGrouBottomEnd = false
        while (i1 < n && !commentsGrouBottomEnd) {
          let com = sortedComments[i1];
          let index = i1
          let id = com.commentAttrs.id;
          let domElement = comments.find((element) => {
            return element.getAttribute('commentid') == id
          })
          let h = domElement.getBoundingClientRect().height
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
          i1++
        }
        this.shouldScrollSelected = false;
      }
    }
    if (this.showAddCommentBox) {
      let addCommentBoxEl = document.getElementsByClassName('add-comment-box')[0] as HTMLDivElement
      let articleElement = document.getElementById('app-article-element') as HTMLDivElement
      let editorContainer = document.getElementsByClassName("editor-container")[0] as HTMLDivElement;
      let editorRectangle = editorContainer.getBoundingClientRect();
      let articleElementRactangle = articleElement.getBoundingClientRect()
      let boxH = addCommentBoxEl.getBoundingClientRect().height;
      let newMarkPos = this.editorView.state.selection.from
      let domCoords = this.editorView.coordsAtPos(newMarkPos)
      let boxTop = domCoords.top - articleElementRactangle.top - (boxH / 2);
      this.addCommentBoxTop = boxTop;
      this.addCommentBoxH = boxH;
      addCommentBoxEl.style.top = boxTop + 'px';
      addCommentBoxEl.style.opacity = '1';
      let inputElement = document.getElementsByClassName('comment-input')[0] as HTMLInputElement;
      setTimeout(()=>{
        inputElement.focus();       
      },100)
        setTimeout(() => {
          let scroll = 0;
          if(editorContainer.scrollTop >= 0) {
            scroll = 1;
          }     
          if(editorRectangle.height - editorContainer.scrollTop  < 0) {
            scroll = -1
          }
          editorContainer.scrollBy({
            top: scroll,
            behavior: "smooth"
          })
        }, 200);
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
      let mostLowerThatShouldMoveUp: number;
      let mostHigherThatShouldMoveDown: number;
      let idOfComThatShouldBeBeforeAddBox: string
      let idOfComThatShouldBeAfterAddBox: string
      sortedComments.forEach((com) => {
        if (com.domTop < boxTop || (com.domTop == boxTop && com.pmDocStartPos < newMarkPos)) {
          idOfComThatShouldBeBeforeAddBox = com.commentAttrs.id
        }
        if (!idOfComThatShouldBeAfterAddBox && (com.domTop > boxTop || (com.domTop == boxTop && com.pmDocStartPos > newMarkPos))) {
          idOfComThatShouldBeAfterAddBox = com.commentAttrs.id
        }
      })
      positionsArr.forEach((pos, index) => {
        if (pos.id == idOfComThatShouldBeBeforeAddBox) {
          commentsInBox[0] = { ...pos, posArrIndex: index, dir: 'up' }
        }
        if (pos.id == idOfComThatShouldBeAfterAddBox) {
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
      let newComsPos: { displayedTop: number, height: number, id: string }[] = []
      commentsInBox.forEach((pos) => {
        if (pos.dir == 'up') {
          let offset = boxTop - (pos.displayedTop + pos.height);
          let index = pos.posArrIndex
          let comTop: number
          let comBot: number
          while (index >= 0 && (offset < 0 || pos.displayedTop < sortedComments.find((com) => com.commentAttrs.id == pos.id).domTop)) {
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
          let offset = boxH + boxTop - pos.displayedTop
          let index = pos.posArrIndex
          let comTop: number
          let comBot: number
          let commN = sortedComments.length;
          while (index < commN && (offset > 0 || pos.displayedTop > sortedComments.find((com) => com.commentAttrs.id == pos.id).domTop)) {
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
      newComsPos.forEach((pos, i) => {
        let id = pos.id;
        this.displayedCommentsPositions[id] = { displayedTop: pos.displayedTop, height: pos.height }
        let domElement = comments[i]
        domElement.style.top = this.displayedCommentsPositions[id].displayedTop + 'px'
        if(!this.searching) {
          domElement.style.opacity = "1";
        }
        
      })
    }
    
    // comments.forEach((val)=>{
    //   if(val.style.opacity == '0'){
    //     val.style.opacity = '1'
    //   }
    // })
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

  toggleMark(markType: MarkType, attrs: any) {
    return function(state: EditorState, dispatch: any) {
      //@ts-ignore
      let { ranges } = state.selection;
      if (dispatch) {
        let has = false, tr = state.tr, isOverlap = false;
        for (let i = 0; !has && i < ranges.length; i++) {
          let {$from, $to} = ranges[i]
          has = state.doc.rangeHasMark($from.pos, $to.pos, markType)
        }
        for (let i = 0; i < ranges.length; i++) {
          let {$from, $to} = ranges[i];
          if (has) {
            isOverlap = true
            let from = $from.pos, to = $to.pos, start = $from.nodeAfter, end = $to.nodeBefore;
            let spaceStart = start && start.isText ? /^\s*/.exec(start.text)[0].length : 0;
            let spaceEnd = end && end.isText ? /\s*$/.exec(end.text)[0].length : 0;
            if (from + spaceStart < to) { from += spaceStart; to -= spaceEnd };
            tr.addMark(from, to, state.schema.marks['overlapComment'].create(attrs));
          } else {
            let from = $from.pos, to = $to.pos, start = $from.nodeAfter, end = $to.nodeBefore;
            let spaceStart = start && start.isText ? /^\s*/.exec(start.text)[0].length : 0;
            let spaceEnd = end && end.isText ? /\s*$/.exec(end.text)[0].length : 0;
            if (from + spaceStart < to) { from += spaceStart; to -= spaceEnd };
            tr.addMark(from, to, markType.create(attrs));
          }
        }
        dispatch(tr.scrollIntoView());
        return isOverlap;
      }
    }
  }

  cancelBtnHandle() {
    let sectionName = this.addCommentEditorId;
    if(this.commentInput && this.commentInput.nativeElement){
      this.commentInput.nativeElement.value = ''
    }
    this.addCommentSubject!.next({ type: 'commentData', sectionName, showBox: false })
  }
  preventRerenderUntilCommentAdd = { bool: false, id: '' }
  commentBtnHandle = (input: HTMLInputElement, value: string)=> {
    if (value.length == 0) {
      return
    }
    let commentDate = Date.now()
    let commentId = uuidv4()
    let userCommentId = uuidv4()
    let commentmarkid = this.newCommentMarkId;
    let userComment = {
      id: userCommentId,
      comment: value,
      userData: {...this.prosemirrorEditorsService.userInfo.data,userColor:this.prosemirrorEditorsService.userInfo.color.userColor},
      date: commentDate
    }
    this.commentsMap!.set(commentId, { initialComment: userComment, commentReplies: [] });
    let state = this.editorView?.state;
    let dispatch = this.editorView?.dispatch
    let from = state.selection.from
    let to = state.selection.to

    const isOverlap = this.toggleMark(state!.schema.marks.comment, {
      id: commentId,
      date: commentDate,
      commentmarkid,
      userid: this.prosemirrorEditorsService.userInfo.data.id,
      username: this.prosemirrorEditorsService.userInfo.data.name,
      userColor: this.prosemirrorEditorsService.userInfo.color.userColor,
      userContrastColor: this.prosemirrorEditorsService.userInfo.color.userContrastColor,
    })(state!, dispatch);

    let sectionName = this.addCommentEditorId
    this.addCommentSubject!.next({ type: 'commentData', sectionName, showBox: false })
    this.preventRerenderUntilCommentAdd.bool = true
    this.preventRerenderUntilCommentAdd.id = commentId
    setTimeout(() => {
      this.editorView.focus()
      if(isOverlap) {
        this.editorView.dispatch(this.editorView.state.tr.setSelection(new TextSelection(this.editorView.state.doc.resolve(to - 5), this.editorView.state.doc.resolve(to - 5))));
      } else {
        this.editorView.dispatch(this.editorView.state.tr.setSelection(new TextSelection(this.editorView.state.doc.resolve(from), this.editorView.state.doc.resolve(from))));
      }
      input.value = ''

      setTimeout(() => {
        let pluginData = this.commentsService.commentPluginKey.getState(this.editorView.state)
        let sectionName = pluginData.sectionName
        this.commentsService.getCommentsInAllEditors()

        setTimeout(() => {
          this.commentsService.setLastSelectedComment(commentId, from, sectionName, commentmarkid, true)
        }, 300)
      }, 20)
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
    let editorsElement = document.getElementById('app-article-element') as HTMLDivElement
    let commentsContainer = document.getElementsByClassName('all-comments-container')[0] as HTMLElement
    let spaceElement = document.getElementsByClassName('end-article-spase')[0] as HTMLDivElement
    articleElement.addEventListener('scroll', (event) => {
      //container.scrollTop = container.scrollTop + articleElement.scrollTop - this.lastArticleScrollPosition
      /*  container.scroll({
         top: container.scrollTop + articleElement.scrollTop - this.lastArticleScrollPosition,
         left: 0,
         //@ts-ignore
         behavior: 'instant'
       }) */
      this.lastArticleScrollPosition = articleElement.scrollTop
      if (this.lastSorted && this.lastSorted.length > 0) {
        let lastElement = this.lastSorted[this.lastSorted.length - 1];
        let dispPos = this.displayedCommentsPositions[lastElement.commentAttrs.id]
        let elBottom = dispPos.displayedTop + dispPos.height;
        let containerH = commentsContainer.getBoundingClientRect().height
        if (containerH < elBottom) {
          commentsContainer.style.height = (elBottom + 150) + 'px'
        }/* else if(containerH > elBottom+100){
          commentsContainer.style.height = (elBottom + 30) + 'px'
        } */
        let editorH = editorsElement.getBoundingClientRect().height
        let spaceElementH = spaceElement.getBoundingClientRect().height
        let actualEditorH = editorH - spaceElementH
        if (editorH < elBottom) {
          spaceElement.style.height = ((elBottom + 150) - actualEditorH) + 'px'
        } else if (editorH > elBottom + 100 && spaceElementH > 0) {
          let space = ((elBottom + 150) - actualEditorH) < 0 ? 0 : ((elBottom + 150) - actualEditorH)
          spaceElement.style.height = space + 'px'

        }
      }
      container.scrollTop = articleElement.scrollTop
      /* container.scroll({
        top:articleElement.scrollTop,
        left:0,
        //@ts-ignore
        behavior: 'instant'
      }) */
    });
    container.scrollTop = articleElement.scrollTop
    let canScrollIn = ['auto-complete-container','text-autocomplete','user-option']
    container.addEventListener('wheel', (event) => {
      let eventPath = event.composedPath()
      if(!eventPath.some((el)=>{
        return (el instanceof HTMLElement && canScrollIn.some(x=>el.classList.contains(x)))
      })){
        event.preventDefault()
      }
    })
  }

  changeParentContainer(event: boolean, commentContainer: HTMLDivElement, comment: commentData) {
    if (event) {
      commentContainer.classList.add('selected-comment')
    } else {
      commentContainer.classList.remove('selected-comment');
    }
  }

  setContainerHeight() {
    let container = document.getElementsByClassName('all-comments-container')[0] as HTMLDivElement;
    let articleElement = document.getElementById('app-article-element') as HTMLDivElement;
    if (!container || !articleElement) {
      return;
    }
    let articleElementRactangle = articleElement.getBoundingClientRect();
    if (container.getBoundingClientRect().height < articleElementRactangle.height) {
      container.style.height = articleElementRactangle.height + "px"
    }
  }
  shouldScrollSelected = false;
  tryMoveItemsUp = false;

  selectComent(com: commentData) {
    let actualMark = this.commentsService.commentsObj[com.commentAttrs.id];
    let edView = this.prosemirrorEditorsService.editorContainers[actualMark.section].editorView;
    let st = edView.state
    let doc = st.doc
    let tr = st.tr;
    let textSel = new TextSelection(doc.resolve(actualMark.pmDocStartPos), doc.resolve(actualMark.pmDocStartPos));
    edView.dispatch(tr.setSelection(textSel));
    let articleElement = document.getElementsByClassName('editor-container')[0] as HTMLDivElement;
    articleElement.scroll({
      top: actualMark.domTop - 300,
      left: 0,
      behavior: 'smooth'
    })
    edView.focus()
  }

  setFromControlChangeListener() {
    this.searchForm.valueChanges.pipe(debounce(val => interval(700))).subscribe((val) => {
      let comments = (Array.from(document.getElementsByClassName('comment-container')) as HTMLDivElement[]);
      
      if (val && val != "" && typeof val == 'string' && val.trim().length > 0) {          
        let searchVal = val.toLocaleLowerCase()
        let comsInYdocMap = this.commentsService.getCommentsFromYdoc();
        let commentsInYdocFiltered: { inydoc: commentYdocSave, pmmark: commentData }[] = []
        let sortedComments = this.allComments.sort((c1, c2) => {
          if (c1.domTop != c2.domTop) {
            return c1.domTop - c2.domTop
          } else {
            return c1.pmDocStartPos - c2.pmDocStartPos
          }
        })
        sortedComments.forEach(com => {
          commentsInYdocFiltered.push({ inydoc: comsInYdocMap[com.commentAttrs.id], pmmark: com })
        })
        let foundComs = commentsInYdocFiltered.filter(data =>
          data.inydoc.initialComment.comment.toLocaleLowerCase().includes(searchVal) ||
          data.inydoc.initialComment.userData.email.toLocaleLowerCase().includes(searchVal) ||
          data.inydoc.initialComment.userData.name.toLocaleLowerCase().includes(searchVal) ||
          data.inydoc.commentReplies.reduce((prev, curr) => {
            return prev ||
              curr.comment.toLocaleLowerCase().includes(searchVal) ||
              curr.userData.email.toLocaleLowerCase().includes(searchVal) ||
              curr.userData.name.toLocaleLowerCase().includes(searchVal)
          }, false)
        )

        if (foundComs.length > 0) {
          comments.forEach(com => {
            if(!foundComs.find(c => c.pmmark.commentAttrs.id == com.getAttribute('commentId'))) {
              com.style.opacity = "0";
            } else {
              com.style.opacity = "1";
            }
          })
          this.selectComent(foundComs[0].pmmark);

          setTimeout(() => {
            this.commentsSearchinput?.nativeElement.focus();
          }, 10);
          
          this.searchResults = foundComs;
          this.searchIndex = 0;
          this.searching = true;
        } else {
          comments.forEach(com => {
            com.style.opacity = "0";
          })
          this.searchResults = foundComs;
          this.searchIndex = -1;
          this.searching = true;
        }
      } else {
        comments.forEach(com => {
            com.style.opacity = "1";
          })
        this.searching = false;
      }
    })
  }

  searching: boolean = false
  searchIndex: number = 0;
  searchResults?: { inydoc: commentYdocSave, pmmark: commentData }[]

  selectPrevComFromSearch() {
    this.searchIndex--;
    let com = this.searchResults[this.searchIndex]
    this.selectComent(com.pmmark)
  }

  selectNextComFromSearch() {
    this.searchIndex++;
    let com = this.searchResults[this.searchIndex]
    this.selectComent(com.pmmark)
  }

  endSearch() {
    this.searching = false
    this.searchIndex = 0;
    this.searchResults = []
    this.searchForm.setValue('');
  }

  initialRender = false;
  ngAfterViewInit(): void {
    this.initialRender = true;
    this.setFromControlChangeListener()
    this.setContainerHeight()
    this.setScrollListener()

   this.subjSub.add(this.addCommentSubject.subscribe((data) => {
      this.lastFocusedEditor = this.detectFocus.sectionName;
      this.editorView = this.editorsService.editorContainers[this.lastFocusedEditor]?.editorView;
      if(!this.lastFocusedEditor || !this.editorView || !this.editorView.state) return;
      
      if (data.type == 'commentData') {
        this.addCommentEditorId = data.sectionName

        if (data.showBox) {
          this.addCommentBoxIsAlreadyMoved = false;
        } else {
          this.addCommentBoxIsAlreadyMoved = true;
        }
        
        setTimeout(() => {            
          
          
          this.moveAddCommentBox(this.editorView)
        }, 0)
        this.showAddCommentBox = data.showBox
        if(!this.showAddCommentBox&&this.commentInput && this.commentInput.nativeElement){
          this.commentInput.nativeElement.value = ''
        }
      } else if (data.type == 'commentAllownes'&&this.addCommentEditorId == data.sectionId) {
        if (this.showAddCommentBox && data.allow == false) {
          
          
          this.cancelBtnHandle()
        }
        this.commentAllowdIn[data.sectionId] = data.allow && isCommentAllowed(this.editorView.state)
        this.selectedTextInEditors[data.sectionId] = data.text
        this.errorMessages[data.sectionId] = data.errorMessage
      }else if(this.lastFocusedEditor != this.addCommentEditorId){
        
        this.cancelBtnHandle()
      }
    }))

    this.subjSub.add(this.commentsService.commentsChangeSubject.subscribe((msg) => {
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
      if(!editedComments&&this.initialRender){
        this.initialRender = false;
        setTimeout(() => {
          this.doneRendering()
        }, 50)
      }
      if (editedComments) {
        this.setContainerHeight()
      }
    }))

    this.commentsService.getCommentsInAllEditors()
  }

  clickOutsideHandler(event, autocomplete) {
    if(event.target.tagName !== "INPUT" && event.target.tagName !== "MAT-ICON"){
      autocomplete.hideResults();
    }
  }

  ngOnDestroy(): void {
    this.subjSub.unsubscribe();
    (document.getElementsByClassName('editor-container')[0] as HTMLDivElement).removeAllListeners('scroll');
    (document.getElementsByClassName('comments-wrapper')[0] as HTMLDivElement).removeAllListeners('wheel');
  }
}
