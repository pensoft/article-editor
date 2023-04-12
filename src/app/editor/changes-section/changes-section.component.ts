import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { interval, Subject, Subscription } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { ServiceShare } from '../services/service-share.service';
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
  selected: boolean,
}
@Component({
  selector: 'app-changes-section',
  templateUrl: './changes-section.component.html',
  styleUrls: ['./changes-section.component.scss']
})


export class ChangesSectionComponent implements OnInit, AfterViewInit, OnDestroy {

  doneRenderingChangesSubject: Subject<any> = new Subject()

  allChanges:changeData[] = [];

  searchForm = new FormControl('');
  searchResults : changeData[];

  rendered
  nOfCommThatShouldBeRendered
  shouldScrollSelected
  initialRender = false;
  subscription = new Subscription();
  tryMoveItemsUp
  displayedChangesPositions: { [key: string]: { displayedTop: number, height: number } } = {}
  lastArticleScrollPosition = 0

  lastSorted: changeData[];
  subjSub
  constructor(
    private changesService: TrackChangesService,
    private ref:ChangeDetectorRef,
    private sharedService:ServiceShare,
    )
    {
      this.subscription.add(this.doneRenderingChangesSubject.subscribe((data) => {
        if (this.rendered < this.nOfCommThatShouldBeRendered) {
          this.rendered++;
        }
        if (this.rendered == this.nOfCommThatShouldBeRendered) {
          this.doneRendering()
        }
      }))
   }


  ngOnInit() {
    this.changesService.getChangesInAllEditors();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    (document.getElementsByClassName('editor-container')[0] as HTMLDivElement).removeAllListeners('scroll');
    (document.getElementsByClassName('changes-wrapper')[0] as HTMLDivElement).removeAllListeners('wheel');
  }

  notRendered = true;
  initialRenderChanges(sortedChanges: changeData[], chContainers: HTMLDivElement[]) {
    this.notRendered = false;
    let lastElementPosition = 0;
    let i = 0;
    while (i < sortedChanges.length) {
      let com = sortedChanges[i]
      let id = com.changeMarkId
      let section = com.section
      let domElement = chContainers.find((element) => {
        return element.getAttribute('changeid') == id
      })
      let h = domElement.getBoundingClientRect().height
      if (lastElementPosition < com.domTop) {
        let pos = com.domTop
        domElement.style.top = pos + 'px';
        domElement.style.opacity = '1';
        this.displayedChangesPositions[id] = { displayedTop: pos, height: h }
        lastElementPosition = pos + h;
      } else {
        let pos = lastElementPosition
        domElement.style.top = pos + 'px';
        domElement.style.opacity = '1';
        this.displayedChangesPositions[id] = { displayedTop: pos, height: h }
        lastElementPosition = pos + h;
      }
      i++
    }
  }

  loopFromTopAndOrderChanges(sortedChanges: changeData[], chContainers: HTMLDivElement[],) {
    let lastElementBottom = 0;
    sortedChanges.forEach((com, index) => {
      let id = com.changeMarkId;
      let domElement = chContainers.find((element) => {
        return element.getAttribute('changeid') == id
      })
      let h = domElement.getBoundingClientRect().height
      if (!this.displayedChangesPositions[id]||(this.displayedChangesPositions[id].height != h || (com.domTop <= this.displayedChangesPositions[id].displayedTop))) { // old and new comment either dont have the same top or comment's height is changed
        if (lastElementBottom < com.domTop) {
          let pos = com.domTop
          domElement.style.top = pos + 'px';
          this.displayedChangesPositions[id] = { displayedTop: pos, height: h }
          lastElementBottom = pos + h;
        } else {
          let pos = lastElementBottom
          domElement.style.top = pos + 'px';
          this.displayedChangesPositions[id] = { displayedTop: pos, height: h }
          lastElementBottom = pos + h;
        }
      } else {
        lastElementBottom = this.displayedChangesPositions[id].displayedTop + this.displayedChangesPositions[id].height
      }
    })
  }

  loopFromBottomAndOrderChanges(sortedChanges: changeData[], chContainers: HTMLDivElement[], addChContainer: HTMLDivElement) {
    let lastChangeTop = addChContainer.getBoundingClientRect().height;
    let i = sortedChanges.length - 1
    while (i >= 0) {
      let com = sortedChanges[i]
      let id = com.changeMarkId;
      let domElement = chContainers.find((element) => {
        return element.getAttribute('changeid') == id
      })
      let h = domElement.getBoundingClientRect().height
      if (!this.displayedChangesPositions[id]||(this.displayedChangesPositions[id].height != h || (this.displayedChangesPositions[id].displayedTop <= com.domTop))) { // old and new comment either dont have the same top or comment's height is changed
        if (lastChangeTop > com.domTop + h) {
          let pos = com.domTop
          domElement.style.top = pos + 'px';
          this.displayedChangesPositions[id] = { displayedTop: pos, height: h }
          lastChangeTop = pos;
        } else {
          let pos = lastChangeTop - h
          domElement.style.top = pos + 'px';
          this.displayedChangesPositions[id] = { displayedTop: pos, height: h }
          lastChangeTop = pos;
        }
      } else {
        lastChangeTop = this.displayedChangesPositions[id].displayedTop
      }
      i--;
    }
  }

  doneRendering(cause?: string) {
    let changes = Array.from(document.getElementsByClassName('change-container')) as HTMLDivElement[];
    let container = document.getElementsByClassName('all-changes-container')[0] as HTMLDivElement;
    let allChangesCopy: changeData[] = JSON.parse(JSON.stringify(this.allChanges));
    let sortedChanges = allChangesCopy.sort((c1, c2) => {
      if (c1.domTop != c2.domTop) {
        return c1.domTop - c2.domTop
      } else {
        return c1.pmDocStartPos - c2.pmDocStartPos
      }
    })/*
    let allCommentsInitioalPositions: { commentTop: number, commentBottom: number, id: string }[] = [];
    let allCommentsPositions: { commentTop: number, commentBottom: number, id: string }[] = []; */
    if (!container || changes.length == 0) {
      this.lastSorted = JSON.parse(JSON.stringify(sortedChanges))
      return
    }
    let selectedChange = this.changesService.lastChangeSelected
    if (this.notRendered) {
      this.initialRenderChanges(sortedChanges, changes)
    } else if (!this.notRendered && sortedChanges.length > 0) {
      if (this.shouldScrollSelected && (!selectedChange.changeMarkId || !selectedChange.pmDocStartPos || !selectedChange.section)) {
        this.shouldScrollSelected = false;
      }
      let idsOldOrder: string[] = []
      let oldPos = this.lastSorted.reduce<{ top: number, id: string }[]>((prev, curr) => { idsOldOrder.push(curr.changeMarkId); return [...prev, { top: curr.domTop, id: curr.changeMarkId }] }, [])
      let idsNewOrder: string[] = []
      let newPos = sortedChanges.reduce<{ top: number, id: string }[]>((prev, curr) => { idsNewOrder.push(curr.changeMarkId); return [...prev, { top: curr.domTop, id: curr.changeMarkId }] }, [])
      // determine what kind of change it is
      if (JSON.stringify(oldPos) != JSON.stringify(newPos) || cause || this.tryMoveItemsUp) {
        if (JSON.stringify(idsOldOrder) == JSON.stringify(idsNewOrder) || cause || this.tryMoveItemsUp) { // comments are in same order
          if (oldPos[oldPos.length - 1]?.top > newPos[newPos.length - 1].top) {  // comments have decreased top should loop from top
            this.loopFromTopAndOrderChanges(sortedChanges, changes)
          } else if (oldPos[oldPos.length - 1]?.top < newPos[newPos.length - 1].top) { // comments have increased top should loop from bottom
            this.loopFromBottomAndOrderChanges(sortedChanges, changes, container)
          } else if (cause == 'change_in_comments_in_ydoc' ) {
            this.loopFromTopAndOrderChanges(sortedChanges, changes)
            this.loopFromBottomAndOrderChanges(sortedChanges, changes, container)
          } else if (this.tryMoveItemsUp) {
            this.loopFromTopAndOrderChanges(sortedChanges, changes)
            this.tryMoveItemsUp = false;
          } else { // moved an existing comment
            this.loopFromBottomAndOrderChanges(sortedChanges, changes, container)
            this.loopFromTopAndOrderChanges(sortedChanges, changes)
          }
        } else { // comments are not in the same order
          if (idsOldOrder.length < idsNewOrder.length) { // added a comment
            let addedChangeId = idsNewOrder.find((comid) => !idsOldOrder.includes(comid))
            let sortedChange = sortedChanges.find((com) => com.changeMarkId == addedChangeId);
            let changeContainer = changes.find((element) => {
              return element.getAttribute('changeid') == addedChangeId
            })
            changeContainer.style.top = sortedChange.domTop + 'px';
            changeContainer.style.opacity = '1';

            this.displayedChangesPositions[addedChangeId] = { displayedTop: sortedChange.domTop, height: changeContainer.getBoundingClientRect().height }
            this.loopFromTopAndOrderChanges(sortedChanges, changes)
          } else if (idsNewOrder.length < idsOldOrder.length) { // removed a comment
            this.loopFromTopAndOrderChanges(sortedChanges, changes)
            this.loopFromBottomAndOrderChanges(sortedChanges, changes, container)
          } else if (idsNewOrder.length == idsOldOrder.length) { // comments are reordered
            this.initialRenderChanges(sortedChanges, changes)
          }
        }
      }
    }
    if (this.shouldScrollSelected && selectedChange.changeMarkId && selectedChange.pmDocStartPos && selectedChange.section) {
      let selectedChangeIndex = sortedChanges.findIndex((com) => {
        return com.changeMarkId == selectedChange.changeMarkId;
      })
      let selectedChangeSorted = sortedChanges[selectedChangeIndex];
      let changeContainer = changes.find((element) => {
        return element.getAttribute('changeid') == selectedChange.changeMarkId
      })
      if(changeContainer) {
        changeContainer.style.top = selectedChangeSorted.domTop + 'px';
        this.displayedChangesPositions[selectedChange.changeMarkId] = { displayedTop: selectedChangeSorted.domTop, height: changeContainer.getBoundingClientRect().height }

        //loop comments up in the group and move them if any
        let lastChangeTop = selectedChangeSorted.domTop;
        let i = selectedChangeIndex - 1
        let changesGroupTopEnd = false
        while (i >= 0 && !changesGroupTopEnd) {
          let chng = sortedChanges[i]
          let id = chng.changeMarkId;
          let domElement = changes.find((element) => {
            return element.getAttribute('changeid') == id
          })
          let h = domElement.getBoundingClientRect().height
          if (lastChangeTop > chng.domTop + h) {
            let pos = chng.domTop
            domElement.style.top = pos + 'px';
            this.displayedChangesPositions[id] = { displayedTop: pos, height: h }
            lastChangeTop = pos;
          } else {
            let pos = lastChangeTop - h
            domElement.style.top = pos + 'px';
            this.displayedChangesPositions[id] = { displayedTop: pos, height: h }
            lastChangeTop = pos;
          }
          i--;
        }
        let lastElementBottom = selectedChangeSorted.domTop + changeContainer.getBoundingClientRect().height;
        let i1 = selectedChangeIndex + 1
        let n = sortedChanges.length
        let changesGroupBottomEnd = false
        while (i1 < n && !changesGroupBottomEnd) {
          let chng = sortedChanges[i1];
          let index = i1
          let id = chng.changeMarkId;
          let domElement = changes.find((element) => {
            return element.getAttribute('changeid') == id
          })
          let h = domElement.getBoundingClientRect().height
          if (lastElementBottom < chng.domTop) {
            let pos = chng.domTop
            domElement.style.top = pos + 'px';
            this.displayedChangesPositions[id] = { displayedTop: pos, height: h }
            lastElementBottom = pos + h;
          } else {
            let pos = lastElementBottom
            domElement.style.top = pos + 'px';
            this.displayedChangesPositions[id] = { displayedTop: pos, height: h }
            lastElementBottom = pos + h;
          }
          i1++
        }
        this.shouldScrollSelected = false;
      }
    }

    changes.forEach(el=>{
      if(el.style.opacity == '0'){
        el.style.opacity = '1'
      }
    })
    this.lastSorted = JSON.parse(JSON.stringify(sortedChanges))

  }

  setFromControlChangeListener() {
    this.searchForm.valueChanges.pipe(debounce(val => interval(700))).subscribe((val:any) => {
      if (val &&  typeof val == 'string' && val != "" && val.trim().length > 0) {

        let searchVal = val.toLocaleLowerCase()
        let sortedChanges = this.allChanges.sort((c1, c2) => {
          if (c1.domTop != c2.domTop) {
            return c1.domTop - c2.domTop
          } else {
            return c1.pmDocStartPos - c2.pmDocStartPos
          }
        })


        let foundComs = sortedChanges.filter(data =>
          data.changeTxt.toLocaleLowerCase().includes(searchVal) ||
          data.changeAttrs.username.toLocaleLowerCase().includes(searchVal)
        )
        if (foundComs.length > 0) {
          this.searchResults = foundComs
          this.searchIndex = 0;
          this.selectComent(foundComs[0])
          this.searching = true;
        } else {
          this.searching = false;
        }
      } else {
        this.searching = false;
      }
    })
  }

  searching: boolean = false
  searchIndex: number = 0;

  selectComent(change: changeData) {
    let actualMark = this.changesService.changesObj[change.changeMarkId];
    let edView = this.sharedService.ProsemirrorEditorsService.editorContainers[actualMark.section].editorView;
    let st = edView.state
    let doc = st.doc
    let tr = st.tr;
    let textSel = new TextSelection(doc.resolve(actualMark.pmDocStartPos), doc.resolve(actualMark.pmDocEndPos));
    edView.dispatch(tr.setSelection(textSel));
    let articleElement = document.getElementsByClassName('editor-container')[0] as HTMLDivElement;
    articleElement.scroll({
      top: actualMark.domTop - 300,
      left: 0,
      behavior: 'smooth'
    })
    edView.focus()
  }

  endSearch() {
    this.searching = false
    this.searchIndex = 0;
    this.searchResults = []
    this.searchForm.setValue('');
  }

  selectPrevChngFromSearch() {
    this.searchIndex--;
    let com = this.searchResults[this.searchIndex]
    this.selectComent(com)
  }

  selectNextChngFromSearch() {
    this.searchIndex++;
    let com = this.searchResults[this.searchIndex]
    this.selectComent(com)
  }

  ngAfterViewInit(): void {
    this.initialRender = true;
    this.setContainerHeight();
    this.setScrollListener();
    this.setFromControlChangeListener();
    /* this.changesService.changesVisibilityChange.subscribe((changesObj) => {
      this.changesObj = changesObj
      this.changes = (Object.values(this.changesObj) as Array<any>).flat()
    }) */
    this.subscription.add(this.changesService.lastSelectedChangeSubject.subscribe((data) => {
      if (data.changeMarkId && data.section && data.pmDocStartPos) {
        this.shouldScrollSelected = true;
      } else {
        this.tryMoveItemsUp = true
        setTimeout(() => {
          this.doneRendering()
        }, 20)
      }
      setTimeout(() => {
        this.changesService.getChangesInAllEditors()
      }, 200)
    }))
    this.subscription.add(this.changesService.changesChangeSubject.subscribe((msg) => {
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
            this.displayedChangesPositions[changeToRemove.changeAttrs.id] = undefined
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
      if (editedChange) {
        this.setContainerHeight()
      }
    }))
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
    let spaceElement = document.getElementsByClassName('end-article-spase')[0] as HTMLDivElement;
    (document.getElementsByClassName('end-article-spase')[0] as HTMLDivElement).style.minHeight = "500px";
    articleElement.addEventListener('scroll', (event) => {
      this.lastArticleScrollPosition = articleElement.scrollTop
      if (this.lastSorted && this.lastSorted.length > 0) {
        let lastElement = this.lastSorted[this.lastSorted.length - 1];
        let dispPos = this.displayedChangesPositions[lastElement.changeAttrs.id]
        let elBottom = dispPos?.displayedTop + dispPos?.height;
        let containerH = changesContainer?.getBoundingClientRect().height
        if (containerH < elBottom) {
          changesContainer.style.height = (elBottom + 150) + 'px'
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
