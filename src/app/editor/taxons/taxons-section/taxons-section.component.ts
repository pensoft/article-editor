import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { TextSelection } from 'prosemirror-state';
import { interval, Subject, Subscription } from 'rxjs';
import { debounce } from 'rxjs/operators';
import { taxonMarkData } from '../taxon.service';

@Component({
  selector: 'app-taxons-section',
  templateUrl: './taxons-section.component.html',
  styleUrls: ['./taxons-section.component.scss']
})
export class TaxonsSectionComponent implements OnDestroy, AfterViewInit {
  doneRenderingTaxonsSubject: Subject<any> = new Subject()
  searchForm = new FormControl('');

  subjSub = new Subscription();

  constructor(
    private serviceShare:ServiceShare
  ) {
    this.subjSub.add(this.doneRenderingTaxonsSubject.subscribe((data) => {
      if (this.rendered < this.nOfTaxThatShouldBeRendered) {
        this.rendered++;
      }
      if (this.rendered == this.nOfTaxThatShouldBeRendered) {
        this.doneRendering()
      }
    }))
  }

  ngOnDestroy(): void {
    this.subjSub.unsubscribe();
    (document.getElementsByClassName('editor-container')[0] as HTMLDivElement).removeAllListeners('scroll');
    (document.getElementsByClassName('taxons-wrapper')[0] as HTMLDivElement).removeAllListeners('wheel');
  }

  findTaxonsWithBackendService(){
    this.serviceShare.TaxonService.markTaxonsWithBackendService();
  }
  lastSelSub: Subscription
  initialRender = false;

  endSearch() {
    this.searching = false
    this.searchIndex = 0;
    this.searchResults = []
    this.searchForm.setValue('');
  }
  searching: boolean = false
  searchIndex: number = 0;
  searchResults?: taxonMarkData[]
  setFromControlChangeListener() {
    this.subjSub.add(this.searchForm.valueChanges.pipe(debounce(val => interval(700))).subscribe((val) => {
      if (val && val != "" && typeof val == 'string' && val.trim().length > 0) {
        let searchVal = val.toLocaleLowerCase()
        let foundTaxons = this.allTaxons.filter(x=>x.taxonTxt.toLocaleLowerCase().includes(searchVal))
        if (foundTaxons.length > 0) {
          this.searchResults = foundTaxons
          this.searchIndex = 0;
          this.selectTaxon(foundTaxons[0])
          this.searching = true;
        } else {
          this.searching = false;
        }
      } else {
        this.searching = false;
      }
    }))
  }

  allTaxons: taxonMarkData[] = []
  lastArticleScrollPosition = 0
  setScrollListener() {
    let container = document.getElementsByClassName('taxons-wrapper')[0] as HTMLDivElement;
    let articleElement = document.getElementsByClassName('editor-container')[0] as HTMLDivElement
    let editorsElement = document.getElementById('app-article-element') as HTMLDivElement
    let ctaxonContainer = document.getElementsByClassName('all-taxons-container')[0] as HTMLElement
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
        let dispPos = this.displayedTaxonsPositions[lastElement.taxonMarkId]
        let elBottom = dispPos.displayedTop + dispPos.height;
        let containerH = ctaxonContainer.getBoundingClientRect().height
        if (containerH < elBottom) {
          ctaxonContainer.style.height = (elBottom + 150) + 'px'
        }
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

  loopFromTopAndOrderTaxons(sortedTaxons: taxonMarkData[], taxContainers: HTMLDivElement[],) {
    let lastElementBottom = 0;
    sortedTaxons.forEach((com, index) => {
      let id = com.taxonMarkId;
      let domElement = taxContainers.find((element) => {
        return element.getAttribute('taxonid') == id
      })
      let h = domElement.getBoundingClientRect().height
      if (!this.displayedTaxonsPositions[id]||(this.displayedTaxonsPositions[id].height != h || (com.domTop <= this.displayedTaxonsPositions[id].displayedTop))) { // old and new taxon either dont have the same top or taxon's height is changed
        if (lastElementBottom < com.domTop) {
          let pos = com.domTop
          domElement.style.top = pos + 'px';
          this.displayedTaxonsPositions[id] = { displayedTop: pos, height: h }
          lastElementBottom = pos + h;
        } else {
          let pos = lastElementBottom
          domElement.style.top = pos + 'px';
          this.displayedTaxonsPositions[id] = { displayedTop: pos, height: h }
          lastElementBottom = pos + h;
        }
      } else {
        lastElementBottom = this.displayedTaxonsPositions[id].displayedTop + this.displayedTaxonsPositions[id].height
      }
    })
  }
  lastSorted: taxonMarkData[]
  displayedTaxonsPositions: { [key: string]: { displayedTop: number, height: number } } = {}
  notRendered = true
  loopFromBottomAndOrderTaxons(sortedTaxons: taxonMarkData[], taxContainers: HTMLDivElement[], addTaxContainer: HTMLDivElement) {
    let lastTaxonTop = addTaxContainer.getBoundingClientRect().height;
    let i = sortedTaxons.length - 1
    while (i >= 0) {
      let com = sortedTaxons[i]
      let id = com.taxonMarkId;
      let domElement = taxContainers.find((element) => {
        return element.getAttribute('taxonid') == id
      })
      let h = domElement.getBoundingClientRect().height
      if (!this.displayedTaxonsPositions[id]||(this.displayedTaxonsPositions[id].height != h || (this.displayedTaxonsPositions[id].displayedTop <= com.domTop))) { // old and new taxon either dont have the same top or taxon's height is changed
        if (lastTaxonTop > com.domTop + h) {
          let pos = com.domTop
          domElement.style.top = pos + 'px';
          this.displayedTaxonsPositions[id] = { displayedTop: pos, height: h }
          lastTaxonTop = pos;
        } else {
          let pos = lastTaxonTop - h
          domElement.style.top = pos + 'px';
          this.displayedTaxonsPositions[id] = { displayedTop: pos, height: h }
          lastTaxonTop = pos;
        }
      } else {
        lastTaxonTop = this.displayedTaxonsPositions[id].displayedTop
      }
      i--;
    }
  }

  initialRenderTaxons(sortedTaxons: taxonMarkData[], taxContainers: HTMLDivElement[]) {
    this.notRendered = false;
    let lastElementPosition = 0;
    let i = 0;
    while (i < sortedTaxons.length) {
      let tax = sortedTaxons[i]
      let id = tax.taxonMarkId
      let section = tax.section
      let domElement = taxContainers.find((element) => {
        return element.getAttribute('taxonid') == id
      })
      if(domElement) {
        let h = domElement.getBoundingClientRect().height
        if (lastElementPosition < tax.domTop) {
          let pos = tax.domTop
          domElement.style.top = pos + 'px';
          domElement.style.opacity = '1';
          this.displayedTaxonsPositions[id] = { displayedTop: pos, height: h }
          lastElementPosition = pos + h;
        } else {
          let pos = lastElementPosition
          domElement.style.top = pos + 'px';
          domElement.style.opacity = '1';
          this.displayedTaxonsPositions[id] = { displayedTop: pos, height: h }
          lastElementPosition = pos + h;
        }
      }
      
      i++
    }
  }

  setContainerHeight() {
    let container = document.getElementsByClassName('all-taxons-container')[0] as HTMLDivElement;
    let articleElement = document.getElementById('app-article-element') as HTMLDivElement;
    if (!container || !articleElement) {
      return;
    }
    let articleElementRactangle = articleElement.getBoundingClientRect();
    if (container.getBoundingClientRect().height < articleElementRactangle.height) {
      container.style.height = articleElementRactangle.height + "px"
    }
  }

  selectTaxon(com: taxonMarkData) {
    let actualMark = this.serviceShare.TaxonService.taxonsMarksObj[com.taxonMarkId];
    let edView = this.serviceShare.ProsemirrorEditorsService.editorContainers[actualMark.section].editorView;
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

  selectPrevComFromSearch() {
    this.searchIndex--;
    let com = this.searchResults[this.searchIndex]
    this.selectTaxon(com)
  }

  selectNextComFromSearch() {
    this.searchIndex++;
    let com = this.searchResults[this.searchIndex]
    this.selectTaxon(com)
  }

  changeParentContainer(event: boolean, taxonContainer: HTMLDivElement, taxon: taxonMarkData) {
    if (event) {
      taxonContainer.classList.add('selected-taxon')
    } else {
      taxonContainer.classList.remove('selected-taxon');
    }
  }
  preventRerenderUntilTaxonAdd = { bool: false, id: '' }

  doneRendering(cause?: string) {
    (document.getElementsByClassName('end-article-spase')[0] as HTMLDivElement).style.minHeight = "500px";
    let taxons = Array.from(document.getElementsByClassName('taxon-container')) as HTMLDivElement[];
    let container = document.getElementsByClassName('all-taxons-container')[0] as HTMLDivElement;
    let allTaxonsCopy: taxonMarkData[] = JSON.parse(JSON.stringify(this.allTaxons));
    let sortedTaxons = allTaxonsCopy.sort((c1, c2) => {
      if (c1.domTop != c2.domTop) {
        return c1.domTop - c2.domTop
      } else {
        return c1.pmDocStartPos - c2.pmDocStartPos
      }
    })
    if ((!container || taxons.length == 0) && cause != 'show_taxon_box') {
      this.lastSorted = JSON.parse(JSON.stringify(sortedTaxons))
      return
    }
    let selectedTaxon = this.serviceShare.TaxonService.lastTaxonMarkSelected
    if (this.notRendered) {
      this.initialRenderTaxons(sortedTaxons, taxons)
    } else if (!this.notRendered && sortedTaxons.length > 0) {
      if (this.shouldScrollSelected && (!selectedTaxon.sectionId || !selectedTaxon.taxonMarkId || !selectedTaxon.pos)) {
        this.shouldScrollSelected = false;
      }
      let idsOldOrder: string[] = []
      let oldPos = this.lastSorted.reduce<{ top: number, id: string }[]>((prev, curr) => { idsOldOrder.push(curr.taxonMarkId); return [...prev, { top: curr.domTop, id: curr.taxonMarkId }] }, [])
      let idsNewOrder: string[] = []
      let newPos = sortedTaxons.reduce<{ top: number, id: string }[]>((prev, curr) => { idsNewOrder.push(curr.taxonMarkId); return [...prev, { top: curr.domTop, id: curr.taxonMarkId }] }, [])
      if (this.preventRerenderUntilTaxonAdd.bool) {
        let newComId = this.preventRerenderUntilTaxonAdd.id;
        if (!idsNewOrder.includes(newComId)) {
          return
        } else {
          this.preventRerenderUntilTaxonAdd.bool = false
        }
      }
      // determine what kind of change it is
      if (JSON.stringify(oldPos) != JSON.stringify(newPos) || cause || this.tryMoveItemsUp) {
        if (JSON.stringify(idsOldOrder) == JSON.stringify(idsNewOrder) || cause || this.tryMoveItemsUp) { // taxons are in same order
          if (oldPos[oldPos.length - 1]&&oldPos[oldPos.length - 1].top > newPos[newPos.length - 1].top) {  // taxons have decreased top should loop from top
            this.loopFromTopAndOrderTaxons(sortedTaxons, taxons)
          } else if (oldPos[oldPos.length - 1]&&oldPos[oldPos.length - 1].top < newPos[newPos.length - 1].top) { // taxons have increased top should loop from bottom
            this.loopFromBottomAndOrderTaxons(sortedTaxons, taxons, container)
          } else if (this.tryMoveItemsUp) {
            this.loopFromTopAndOrderTaxons(sortedTaxons, taxons)
            this.tryMoveItemsUp = false;
          } else { // moved an existing taxon
            this.loopFromBottomAndOrderTaxons(sortedTaxons, taxons, container)
            this.loopFromTopAndOrderTaxons(sortedTaxons, taxons)
          }
        } else { // taxons are not in the same order
          if (idsOldOrder.length < idsNewOrder.length) { // added a taxon
            let addedTaxonIds = idsNewOrder.filter((comid) => !idsOldOrder.includes(comid))
            addedTaxonIds.forEach((addedTaxonId)=>{
              let sortedTaxon = sortedTaxons.find((com) => com.taxonMarkId == addedTaxonId);
              let taxonContainer = taxons.find((element) => {
                return element.getAttribute('taxonid') == addedTaxonId
              })
              taxonContainer.style.top = sortedTaxon.domTop + 'px';
              taxonContainer.style.opacity = '1';

              this.displayedTaxonsPositions[addedTaxonId] = { displayedTop: sortedTaxon.domTop, height: taxonContainer.getBoundingClientRect().height }
            })
            this.loopFromTopAndOrderTaxons(sortedTaxons, taxons)
          } else if (idsNewOrder.length < idsOldOrder.length) { // removed a taxon
            this.loopFromTopAndOrderTaxons(sortedTaxons, taxons)
            this.loopFromBottomAndOrderTaxons(sortedTaxons, taxons, container)
          } else if (idsNewOrder.length == idsOldOrder.length) { // taxons are reordered
            this.initialRenderTaxons(sortedTaxons, taxons)
          }
        }
      }
    }
    if (this.shouldScrollSelected && selectedTaxon.taxonMarkId && selectedTaxon.pos && selectedTaxon.sectionId) {
      let selectedTaxonIndex = sortedTaxons.findIndex((com) => {
        return com.taxonMarkId == selectedTaxon.taxonMarkId;
      })
      let selectedTaxonSorted = sortedTaxons[selectedTaxonIndex];
      let taxonContainer = taxons.find((element) => {
        return element.getAttribute('taxonid') == selectedTaxon.taxonMarkId
      })
      taxonContainer.style.top = selectedTaxonSorted.domTop + 'px';
      this.displayedTaxonsPositions[selectedTaxon.taxonMarkId] = { displayedTop: selectedTaxonSorted.domTop, height: taxonContainer.getBoundingClientRect().height }

      //loop taxons up in the group and move them if any
      let lastTaxonTop = selectedTaxonSorted.domTop;
      let i = selectedTaxonIndex - 1
      let taxonsGrouTopEnd = false
      while (i >= 0 && !taxonsGrouTopEnd) {
        let com = sortedTaxons[i]
        let id = com.taxonMarkId;
        let domElement = taxons.find((element) => {
          return element.getAttribute('taxonId') == id
        })
        let h = domElement.getBoundingClientRect().height
        if (lastTaxonTop > com.domTop + h) {
          let pos = com.domTop
          domElement.style.top = pos + 'px';
          this.displayedTaxonsPositions[id] = { displayedTop: pos, height: h }
          lastTaxonTop = pos;
        } else {
          let pos = lastTaxonTop - h
          domElement.style.top = pos + 'px';
          this.displayedTaxonsPositions[id] = { displayedTop: pos, height: h }
          lastTaxonTop = pos;
        }
        i--;
      }
      let lastElementBottom = selectedTaxonSorted.domTop + taxonContainer.getBoundingClientRect().height;
      let i1 = selectedTaxonIndex + 1
      let n = sortedTaxons.length
      let taxonsGrouBottomEnd = false
      while (i1 < n && !taxonsGrouBottomEnd) {
        let com = sortedTaxons[i1];
        let index = i1
        let id = com.taxonMarkId;
        let domElement = taxons.find((element) => {
          return element.getAttribute('taxonid') == id
        })
        let h = domElement.getBoundingClientRect().height
        if (lastElementBottom < com.domTop) {
          let pos = com.domTop
          domElement.style.top = pos + 'px';
          this.displayedTaxonsPositions[id] = { displayedTop: pos, height: h }
          lastElementBottom = pos + h;
        } else {
          let pos = lastElementBottom
          domElement.style.top = pos + 'px';
          this.displayedTaxonsPositions[id] = { displayedTop: pos, height: h }
          lastElementBottom = pos + h;
        }
        i1++
      }
      this.shouldScrollSelected = false;
    }
    this.lastSorted = JSON.parse(JSON.stringify(sortedTaxons))
  }
  rendered = 0;
  nOfTaxThatShouldBeRendered = 0
  shouldScrollSelected = false;
  tryMoveItemsUp = false;
  ngAfterViewInit(): void {
    this.initialRender = true;
    this.setFromControlChangeListener()
    this.setContainerHeight()
    this.setScrollListener()
    this.subjSub.add(this.serviceShare.TaxonService.lastSelectedTaxonMarkSubject.subscribe((data) => {
      if (data.taxonMarkId && data.sectionId) {
        this.shouldScrollSelected = true
      } else {
        this.tryMoveItemsUp = true
        setTimeout(() => {
          this.doneRendering()
        }, 20)
      }
      setTimeout(() => {
        this.serviceShare.TaxonService.getTaxonsInAllEditors()
      }, 200)
    }))

    this.subjSub.add(this.serviceShare.TaxonService.taxonsMarksObjChangeSubject.subscribe((msg) => {
      let taxonsToAdd: taxonMarkData[] = []
      let taxonsToRemove: taxonMarkData[] = []
      let allTaxonsInEditors: taxonMarkData[] = []
      let editedTaxons = false;
      allTaxonsInEditors.push(...Object.values(this.serviceShare.TaxonService.taxonsMarksObj))
      Object.values(this.serviceShare.TaxonService.taxonsMarksObj).forEach((taxon) => {
        let displayedTax = this.allTaxons.find((tax) => tax.taxonMarkId == taxon.taxonMarkId)
        if (displayedTax) {
          if (displayedTax.taxonTxt != taxon.taxonTxt) {
            displayedTax.taxonTxt = taxon.taxonTxt
            editedTaxons = true;
          }
          if (displayedTax.domTop != taxon.domTop) {
            displayedTax.domTop = taxon.domTop
            editedTaxons = true;
          }
          if (displayedTax.pmDocEndPos != taxon.pmDocEndPos) {
            displayedTax.pmDocEndPos = taxon.pmDocEndPos
            editedTaxons = true;
          }
          if (displayedTax.pmDocStartPos != taxon.pmDocStartPos) {
            displayedTax.pmDocStartPos = taxon.pmDocStartPos
            editedTaxons = true;
          }
          if (displayedTax.section != taxon.section) {
            displayedTax.section = taxon.section
            editedTaxons = true;
          }
          if (displayedTax.selected != taxon.selected) {
            displayedTax.selected = taxon.selected
            editedTaxons = true;
          }
          if (editedTaxons) {
            displayedTax.taxonAttrs = taxon.taxonAttrs
          }
        } else {
          taxonsToAdd.push(taxon)
        }
      })

      this.allTaxons.forEach((taxon) => {
        if (!allTaxonsInEditors.find((tax) => {
          return tax.taxonMarkId == taxon.taxonMarkId
        })) {
          taxonsToRemove.push(taxon)
        }
      })
      if (taxonsToAdd.length > 0) {
        this.allTaxons.push(...taxonsToAdd);
        editedTaxons = true;
        this.rendered = 0;
        this.nOfTaxThatShouldBeRendered = taxonsToAdd.length;
      }
      if (taxonsToRemove.length > 0) {
        while (taxonsToRemove.length > 0) {
          let taxonToRemove = taxonsToRemove.pop();
          let taxonIndex = this.allTaxons.findIndex((taxon) => {
            this.displayedTaxonsPositions[taxonToRemove.taxonMarkId] = undefined
            return taxon.taxonMarkId == taxonToRemove.taxonMarkId && taxon.section == taxonToRemove.section;
          })
          this.allTaxons.splice(taxonIndex, 1);
        }
        editedTaxons = true;
      }
      if (this.shouldScrollSelected) {
        editedTaxons = true;
      }
      if (editedTaxons) {
        setTimeout(() => {
          this.doneRendering()
        }, 50)
      }
      if(!editedTaxons&&this.initialRender){
        this.initialRender = false;
        setTimeout(() => {
          this.doneRendering('show_taxon_box')
        }, 50)
      }
      if (editedTaxons) {
        this.setContainerHeight()
      }
    }))

    this.serviceShare.TaxonService.getTaxonsInAllEditors()
  }
}
