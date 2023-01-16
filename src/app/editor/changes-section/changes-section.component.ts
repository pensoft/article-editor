import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { EditorView } from 'prosemirror-view';
import { Subject, Subscription } from 'rxjs';
import { TrackChangesService } from '../utils/trachChangesService/track-changes.service';

export interface changeData {
  changeMarkId: string,
  pmDocStartPos: number,
  pmDocEndPos: number,
  section: string,
  domTop: number,
  changeTxt: string,
  type:string,
  changeAttrs: any,
  viewRef:EditorView,
  selected: boolean,
}
@Component({
  selector: 'app-changes-section',
  templateUrl: './changes-section.component.html',
  styleUrls: ['./changes-section.component.scss']
})


export class ChangesSectionComponent implements OnInit, AfterViewInit {

  doneRenderingChangesSubject: Subject<any> = new Subject()

  allChanges:changeData[] = [];

  rendered
  nOfCommThatShouldBeRendered
  shouldScrollSelected
  initialRender = false;
  lastSelSub:Subscription
  tryMoveItemsUp
  displayedCommentsPositions: { [key: string]: { displayedTop: number, height: number } } = {}
  lastArticleScrollPosition = 0

  lastSorted: changeData[];

  constructor(
    private changesService: TrackChangesService,
    private ref:ChangeDetectorRef
    ) { }


  ngOnInit() {

    this.changesService.changesChangeSubject.subscribe((msg)=>{
      console.log(msg);
      console.log(this.changesService.changesObj);
    })
    this.changesService.getChangesInAllEditors();
  }



  doneRendering(cause?: string) {


    this.ref.detectChanges()
  }

  ngAfterViewInit(): void {
    this.initialRender = true;
    this.setContainerHeight();
    this.setScrollListener();
    /* this.changesService.changesVisibilityChange.subscribe((changesObj) => {
      this.changesObj = changesObj
      this.changes = (Object.values(this.changesObj) as Array<any>).flat()
    }) */
    this.lastSelSub = this.changesService.lastSelectedChangeSubject.subscribe((data) => {
      if (data.changeMarkId && data.section && data.pmDocStartPos) {
        this.shouldScrollSelected = true;
        console.log(data);
      } else {
        this.tryMoveItemsUp = true
        setTimeout(() => {
          this.doneRendering()
        }, 20)
      }
      setTimeout(() => {
        this.changesService.getChangesInAllEditors()
      }, 200)
    })
    this.changesService.changesChangeSubject.subscribe((msg) => {
      let changesToAdd: changeData[] = []
      let changesToRemove: changeData[] = []
      let allChangesInEditors: changeData[] = []
      let editedChange = false;
      allChangesInEditors.push(...Object.values(this.changesService.changesObj))
      Object.values(this.changesService.changesObj).forEach((incommingChange) => {
        let displayedChange = this.allChanges.find((change) => change.changeAttrs.id == incommingChange.changeAttrs.id)
        if (displayedChange) {
          if (displayedChange.changeTxt != incommingChange.changeTxt) {
            displayedChange.changeTxt = incommingChange.changeTxt
            editedChange = true;
          }
          if (displayedChange.domTop != incommingChange.domTop) {
            displayedChange.domTop = incommingChange.domTop
            editedChange = true;
          }
          if (displayedChange.pmDocEndPos != incommingChange.pmDocEndPos) {
            displayedChange.pmDocEndPos = incommingChange.pmDocEndPos
            editedChange = true;
          }
          if (displayedChange.pmDocStartPos != incommingChange.pmDocStartPos) {
            displayedChange.pmDocStartPos = incommingChange.pmDocStartPos
            editedChange = true;
          }
          if (displayedChange.section != incommingChange.section) {
            displayedChange.section = incommingChange.section
            editedChange = true;
          }
          if (displayedChange.changeMarkId != incommingChange.changeMarkId) {
            displayedChange.changeMarkId = incommingChange.changeMarkId
            editedChange = true;
          }
          if (displayedChange.selected != incommingChange.selected) {
            displayedChange.selected = incommingChange.selected
            editedChange = true;
          }
          if (editedChange) {
            displayedChange.changeAttrs = incommingChange.changeAttrs
          }
        } else {
          changesToAdd.push(incommingChange)
        }
      })

      this.allChanges.forEach((change) => {
        if (!allChangesInEditors.find((ch) => {
          return ch.changeAttrs.id == change.changeAttrs.id
        })) {
          changesToRemove.push(change)
        }
      })
      if (changesToAdd.length > 0) {
        this.allChanges.push(...changesToAdd);
        editedChange = true;
        this.rendered = 0;
        this.nOfCommThatShouldBeRendered = changesToAdd.length;
      }
      if (changesToRemove.length > 0) {
        while (changesToRemove.length > 0) {
          let changeToRemove = changesToRemove.pop();
          let changeIndex = this.allChanges.findIndex((ch) => {
            this.displayedCommentsPositions[changeToRemove.changeAttrs.id] = undefined
            return ch.changeAttrs.id == changeToRemove.changeAttrs.id && ch.section == changeToRemove.section;
          })
          this.allChanges.splice(changeIndex, 1);
        }
        editedChange = true;
      }
      if (this.shouldScrollSelected) {
        editedChange = true;
      }
      if (editedChange /* && commentsToAdd.length == 0 */) {
        setTimeout(() => {
          this.doneRendering()
        }, 50)
      }
      if(!editedChange&&this.initialRender){
        this.initialRender = false;
        setTimeout(() => {
          this.doneRendering()
        }, 50)
      }
      console.log(this.allChanges);
      if (editedChange) {
        this.setContainerHeight()
      }
    })
    this.changesService.getChangesInAllEditors()
  }

  setContainerHeight() {
    let container = document.getElementsByClassName('all-changes-container')[0] as HTMLDivElement;
    let articleElement = document.getElementById('app-article-element') as HTMLDivElement;
    if (!container || !articleElement) {
      return;
    }
    let articleElementRactangle = articleElement.getBoundingClientRect();
    if (container.getBoundingClientRect().height < articleElementRactangle.height) {
      container.style.height = articleElementRactangle.height + "px"
    }
  }

  setScrollListener() {
    let container = document.getElementsByClassName('changes-wrapper')[0] as HTMLDivElement;
    let articleElement = document.getElementsByClassName('editor-container')[0] as HTMLDivElement
    let editorsElement = document.getElementById('app-article-element') as HTMLDivElement
    let changesContainer = document.getElementsByClassName('all-changes-container')[0] as HTMLElement
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
        let dispPos = this.displayedCommentsPositions[lastElement.changeAttrs.id]
        let elBottom = dispPos.displayedTop + dispPos.height;
        let containerH = changesContainer.getBoundingClientRect().height
        if (containerH < elBottom) {
          changesContainer.style.height = (elBottom + 30) + 'px'
        }/* else if(containerH > elBottom+100){
          commentsContainer.style.height = (elBottom + 30) + 'px'
        } */
        let editorH = editorsElement.getBoundingClientRect().height
        let spaceElementH = spaceElement.getBoundingClientRect().height
        let actualEditorH = editorH - spaceElementH
        if (editorH < elBottom) {
          spaceElement.style.height = ((elBottom + 30) - actualEditorH) + 'px'
        } else if (editorH > elBottom + 100 && spaceElementH > 0) {
          let space = ((elBottom + 30) - actualEditorH) < 0 ? 0 : ((elBottom + 30) - actualEditorH)
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

    container.addEventListener('wheel', (event) => {
      event.preventDefault()
    })
  }

  changeParentContainer(event: boolean, commentContainer: HTMLDivElement, change: changeData) {
    if (event) {
      commentContainer.classList.add('selected-change')
    } else {
      commentContainer.classList.remove('selected-change');
    }
  }
}
