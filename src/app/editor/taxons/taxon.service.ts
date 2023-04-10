import { Injectable, OnDestroy } from '@angular/core';
import { uuidv4 } from 'lib0/random';
import { Fragment, Mark, Node, Slice } from 'prosemirror-model';
import { AllSelection, EditorState, Plugin, PluginKey, Selection, TextSelection } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { Subject } from 'rxjs';
import { ServiceShare } from '../services/service-share.service';
import { articlePosOffset } from '../utils/commentsService/comments.service';
import { articleSection } from '../utils/interfaces/articleSection';
import { schema } from '../utils/Schema';

export interface ydocTaxon {
  description: string,
  img: string,
  title: string
}

export interface ydocTaxonsObj { [key: string]: ydocTaxon }

export interface taxonMarkData {
  pmDocStartPos: number,
  pmDocEndPos: number,
  domTop: number,
  section: string,
  taxonAttrs: any,
  taxonTxt:string
  taxonMarkId: string,
  selected: boolean
}

@Injectable({
  providedIn: 'root'
})
export class TaxonService implements OnDestroy {
  taxonPlugin: Plugin
  taxonPluginKey = new PluginKey('taxonPlugin');

  canTagSelectionSubject = new Subject<boolean>()
  tagCreateData?: { view: EditorView }

  taxonsDataObj: ydocTaxonsObj
  taxonsDataObjSubject = new Subject()

  canShowTaxonButtons: Subject<boolean> = new Subject();

  TaxonObjChange = () => {
    this.taxonsDataObj = this.serviceShare.YdocService.TaxonsMap.get('taxonsDataObj');
    this.taxonsDataObjSubject.next(this.taxonsDataObj);
  }

  setUpTaxonDataObjListener() {
    this.serviceShare.YdocService.TaxonsMap.observe(this.TaxonObjChange)
    this.TaxonObjChange()
  }

  ngOnDestroy(): void {
    this.serviceShare.YdocService.TaxonsMap.unobserve(this.TaxonObjChange);
  }

  taxonMarkInSelection = (actualMark: Mark, pos: number,sectionId:string) => {
    if (this.sameAsLastSelectedTaxonMark( pos, sectionId, actualMark.attrs.taxmarkid)) {
      return
    } else {
      this.setLastSelectedTaxonMark( pos, sectionId, actualMark.attrs.taxmarkid)
      this.lastSelectedMarks[actualMark.attrs.taxmarkid] = {
        taxonMarkId: actualMark.attrs.taxmarkid,
        sectionId: sectionId,
        pos
      }
    }
  }

  thereIsTaxonInSel(view: EditorView,sectionId:string) {
    let { from, to, $from, $to } = view.state.selection;
    let taxonInSel = false;
    let taxonMark:Mark
    let markPos:number
    let hasOtherMark = false;
    view.state.doc.nodesBetween(from, to, (node, pos, parent, i) => {
      if(node &&
        node.marks && 
        node.marks.find((mark) => mark.type.name == 'comment' || 
        mark.type.name == 'insertion' || 
        mark.type.name == 'deletion')
      ) {
        hasOtherMark = true;
      } 

      if (
        node.marks &&
        node.marks.length > 0 &&
        node.marks.some((mark) => mark.type.name == 'taxon')
      ) {
        taxonInSel = true;
        taxonMark = node.marks.find((mark) => mark.type.name == 'taxon')
        markPos = pos
      }
    })

    if (!hasOtherMark && !taxonInSel && !(view.state.selection instanceof AllSelection) && view  && view.hasFocus() ) {
      let sel = view.state.selection
      let nodeAfterSelection = sel.$to.nodeAfter
      let nodeBeforeSelection = sel.$from.nodeBefore
      
      if (nodeAfterSelection && nodeAfterSelection.marks) {
        let pos = sel.to;
        taxonMark = nodeBeforeSelection?.marks.find(mark => mark.type.name == 'taxon');
        hasOtherMark = !!nodeBeforeSelection?.marks.find(mark => mark.type.name == "comment" || mark.type.name == "insertion" || mark.type.name == "deletion");

        if (taxonMark) {
          taxonInSel = true;
          markPos = pos
        }
      }

      if (nodeBeforeSelection  && nodeAfterSelection) {
        let pos = sel.from - nodeBeforeSelection.nodeSize;
        taxonMark = nodeBeforeSelection?.marks.find(mark => mark.type.name == 'taxon');
        hasOtherMark = !!nodeBeforeSelection?.marks.find(mark => mark.type.name == "comment" || mark.type.name == "insertion" || mark.type.name == "deletion");

        if (taxonMark) {
          taxonInSel = true;
          markPos = pos
        }
      }

      if(!hasOtherMark && nodeBeforeSelection && nodeAfterSelection) {
        hasOtherMark = !!nodeBeforeSelection?.marks.find(mark => mark.type.name == "comment" || mark.type.name == "insertion" || mark.type.name == "deletion");

        if(!hasOtherMark) {
        hasOtherMark = !!nodeAfterSelection?.marks.find(mark => mark.type.name == "comment" || mark.type.name == "insertion" || mark.type.name == "deletion");
        }
      }
    }

    if(taxonInSel && taxonMark && !hasOtherMark && (taxonMark.attrs.removedtaxon == 'false' || taxonMark.attrs.removedtaxon == false) && view.hasFocus()){
      this.taxonMarkInSelection(taxonMark,markPos,sectionId);
    } else if(taxonInSel && taxonMark && ( taxonMark.attrs.removedtaxon == true || taxonMark.attrs.removedtaxon == 'true') && view.hasFocus()){
      taxonInSel = false;
    } else if (!taxonInSel && !(view.state.selection instanceof AllSelection) && view  && view.hasFocus() ) {
      this.setLastSelectedTaxonMark(undefined, undefined, undefined);
    }

    return taxonInSel
  }

  updateAllTaxonsMarks() {
    this.getTaxonsInAllEditors()
    this.updateTimestamp = Date.now();
  }

  updateTimestamp = 0;
  updateTimeout

  changeInEditors = () => {
    let now = Date.now();
    if (!this.updateTimestamp) {
      this.updateTimestamp = Date.now();
      this.updateAllTaxonsMarks()
    }
    if (this.updateTimeout) {
      clearTimeout(this.updateTimeout);
    }
    if (now - this.updateTimestamp > 500) {
      this.updateAllTaxonsMarks()
    }
    this.updateTimeout = setTimeout(() => {
      this.updateAllTaxonsMarks()
    }, 500)
  }

  addInlineDecoration(state: EditorState, pos: number) {
    const node = state.doc.nodeAt(pos)
    if (!node) return;

    const mark = node.marks.find((mark) => mark.type.name === 'taxon' && !mark.attrs.removedtaxon);    
    if (!mark || 
      node.marks
      .find((m) => m.type.name == "insertion" || 
      m.type.name == "deletion" || 
      m.type.name == "comment"
      )) return;

    let from: number;
    let to: number;

    const nodeSize = state.doc.content.size;
    state.doc.nodesBetween(0, nodeSize, (node, pos, parent, i) => {
      const mark2 = node?.marks.find(mark => mark.type.name == 'taxon');
      if(mark2 && mark2.attrs.taxmarkid == mark.attrs.taxmarkid && !from) {
        from = pos;
      }
      if(mark2 && mark2.attrs.taxmarkid == mark.attrs.taxmarkid){
        to = pos + node.nodeSize;
      }
    })

    return { from, to };
  }

  lastSelectedTaxonMarkSubject:Subject<{
    taxonMarkId?: string, sectionId?: string,pos?:number
  }> = new Subject()
  lastTaxonMarkSelected: { taxonMarkId?: string, sectionId?: string,pos?:number}
  constructor(
    private serviceShare: ServiceShare
  ) {
    const self = this;
    this.lastSelectedTaxonMarkSubject.subscribe((data) => {
      this.lastTaxonMarkSelected.pos = data.pos
      this.lastTaxonMarkSelected.sectionId = data.sectionId
      this.lastTaxonMarkSelected.taxonMarkId = data.taxonMarkId
    })
    this.serviceShare.shareSelf('TaxonService', this)
    let lastSelectedMarks: { [key: string]: {  taxonMarkId: string, sectionId: string,pos:number  } } = {}
    let lastTaxonMarkSelected: { taxonMarkId?: string, sectionId?: string,pos?:number} = {}
    this.lastTaxonMarkSelected = lastTaxonMarkSelected
    this.lastSelectedMarks = lastSelectedMarks
    let init = () => {
      this.setUpTaxonDataObjListener()
      this.taxonPlugin = new Plugin({
        key: this.taxonPluginKey,
        state: {
          init: (_: any, state) => {
            let getPluginData: () => { sectionName: string, view: undefined | EditorView } = () => {
              return { sectionName: _.sectionName, view: undefined }
            }
            return getPluginData();
          },
          apply: (tr, prev, oldState, newState) => {
            if (!prev.view) {
              if (serviceShare.ProsemirrorEditorsService.editorContainers[prev.sectionName]) {
                prev.view = serviceShare.ProsemirrorEditorsService.editorContainers[prev.sectionName].editorView
              }
            }
            let thereIsTaxonInSel
            if(prev.view && prev.view.hasFocus()){
              thereIsTaxonInSel = this.thereIsTaxonInSel(prev.view,prev.sectionName)
            }
            if (
              tr.selection instanceof TextSelection &&
              !tr.selection.empty &&
              prev.view &&
              prev.view.hasFocus() &&
              !thereIsTaxonInSel
            ) {
              this.canTagSelectionSubject.next(true);
              this.tagCreateData = {
                view: prev.view
              }
            } else if (prev.view.hasFocus()) {
              this.canTagSelectionSubject.next(false);
              this.tagCreateData = undefined
            }
            if (!(newState.selection instanceof AllSelection) /* && view.hasFocus() && tr.steps.length > 0 */) {
              this.changeInEditors()
            }
            return prev
          },
        },
        props: {
          decorations: (state: EditorState) => {
            const pluginState = this.taxonPluginKey.getState(state);
            const focusedEditor = this.serviceShare.DetectFocusService.sectionName;
            const currentEditor = pluginState.sectionName;
            const { from, to } = state.selection;
  
            if (currentEditor != focusedEditor) return DecorationSet.empty;
            
            const markInfo = self.addInlineDecoration(state, from);
            
            if(!markInfo) return DecorationSet.empty;
            
            return DecorationSet.create(state.doc, [
              Decoration.inline(markInfo.from, markInfo.to, {class: 'active-taxon'})
            ])
          }
        },
        view: function () {
          return {
            update: (view, prevState) => {
              if (JSON.stringify(view.state.doc) == JSON.stringify(prevState.doc) && !view.hasFocus()) {
                return;
              }

              self.showHideTaxonButtons(view);
            },
            destroy: () => { }
          }
        },
      });
    }
    if (this.serviceShare.YdocService.editorIsBuild) {
      init();
    } else {
      this.serviceShare.YdocService.ydocStateObservable.subscribe((event) => {
        if (event == 'docIsBuild') {
          init();
        }
      });
    }
  }

  getPlugin() {
    return this.taxonPlugin;
  }

  tagText(allOccurrence: boolean) {
    this.serviceShare.DetectFocusService.setSelectionDecorationOnLastSelecctedEditor()
    if (allOccurrence) {
      this.tagAllOccurrenceOfTextInCurrSelection()
    } else {
      this.tagOnlyTextInCurrSelection()
    }
  }

  addTaxonToYdocIfNotAdded(taxonKey: string) {
    if (!this.taxonsDataObj[taxonKey]) {
      this.taxonsDataObj[taxonKey] = {
        description: 'Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Pellentesque in ipsum id orci porta dapibus. Nulla quis lorem ut libero malesuada feugiat. Curabitur aliquet quam id dui posuere blandit. Vestibulum ac diam sit amet quam vehicula elementum sed sit amet dui. Donec rutrum congue leo eget malesuada. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent sapien massa, convallis a pellentesque nec, egestas non nisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec velit neque, auctor sit amet aliquam vel, ullamcorper sit amet ligula. Nulla quis lorem ut libero malesuada feugiat. Curabitur non nulla sit amet nisl tempus convallis quis ac lectus.',
        img: 'https://media.licdn.com/dms/image/C560BAQHMnA03XDdf3w/company-logo_200_200/0/1519855918965?e=2147483647&v=beta&t=J3kUMZwIphc90TFKH5oOO9Sa9K59fimgJf-s_okU3zs',
        title: uuidv4()
      }
      this.serviceShare.YdocService.TaxonsMap.set('taxonsDataObj', this.taxonsDataObj);
    }
  }

  markTextAsTaxon(from: number, to: number, taxonKey: string) {
    const view = this.tagCreateData.view;
    view.dispatch(
      view.state.tr.addMark(from, to, schema.mark('taxon', {
      taxmarkid: uuidv4(),
      removedtaxon: false,
    })))

    this.tagCreateData.view.focus()
    this.setTextSelection(from);
  }

  setTextSelection(from: number) {
    this.tagCreateData.view.dispatch(
      this.tagCreateData.view.state.tr.setSelection(
      new TextSelection(this.tagCreateData.view.state.doc.resolve(from), this.tagCreateData.view.state.doc.resolve(from))
    ))
  }

  tagOnlyTextInCurrSelection() {
    if (this.tagCreateData) {
      let view = this.tagCreateData.view
      let state = view.state
      let { from, to } = state.selection
      let taxonKey = state.doc.textBetween(from, to);
      this.addTaxonToYdocIfNotAdded(taxonKey);
      this.markTextAsTaxon(from, to, taxonKey)
    }
  }

  tagAllOccurrenceOfTextInCurrSelection() {
    if (this.tagCreateData) {
      let view = this.tagCreateData.view
      let state = view.state
      let { from, to } = state.selection
      let taxonKey = state.doc.textBetween(from, to);
      this.addTaxonToYdocIfNotAdded(taxonKey);
      this.markAllOccurrencesOfTextInAllEditors([taxonKey])
    }
  }

  markAllOccurrencesOfTextInAllEditors(taxonKey: string[]) {
    let treeScructure = this.serviceShare.TreeService.articleSectionsStructure;
    let editorContainers = this.serviceShare.ProsemirrorEditorsService.editorContainers;
    let loop = (sections: articleSection[], callback: (view: EditorView, taxonKey: string[],manual?:boolean) => any) => {
      sections.forEach((sec) => {
        if (sec.type == 'complex' && sec.children && sec.children.length) {
          loop(sec.children, callback);
        }
        if (editorContainers[sec.sectionID] && editorContainers[sec.sectionID].editorView) {
          callback(editorContainers[sec.sectionID].editorView, taxonKey,true)
        }
      })
    }
    loop(treeScructure, this.markAllOccurrencesOfTextInEditor)
  }

  getCountOfTagableText(doc: Node, taxonKeys: string[],manual?:boolean) {
    let count = 0;
    let docSize = doc.content.size;
    let allMatches = [];
    let taxonsIntervals:{from:number,to:number,attrs:any}[] = []
    doc.nodesBetween(0,docSize,(node,pos,parent,index)=>{
      let taxon:Mark = node.marks.find(m=>m.type.name == 'taxon')
      if(taxon){
        taxonsIntervals.push({from:pos,to:node.nodeSize+pos,attrs:taxon.attrs});
      }
    })
    doc.nodesBetween(0, docSize, (node, pos, parent, index) => {
      if (node.type.isTextblock) {
        let match
        let str = node.textContent;
        let matchArr = []
        let matchObj = {}
        taxonKeys.forEach((taxon)=>{
          let re = new RegExp(taxon,'gm')
          while ((match = re.exec(str)) != null) {
            matchArr.push(match);
            matchObj[match.index] = true;
            matchObj[match.index + match[0].length] = true;
          }
        })
        if(matchArr.length == 0) return false;
        // map plain text positions of matches to pm position
        let positionsWithTaxons = []


        let plainTextPos = 0;
        let addition = 0;
        let loopDescendents = (node1:Node,level) => {
          let nodeTxt = node1.textContent
          if(node1.type.name == 'text'){

            for(let i = 0 ; i < nodeTxt.length+1;i++){
              if(matchObj[plainTextPos]){
                matchObj[plainTextPos] = plainTextPos+addition
              }
              plainTextPos++;
            }
          }
          if(node1.childCount>0){
            addition+=1
            node1.descendants((child,posOfChild)=>{
              loopDescendents(child,level+1);
              return false;
            })
            addition+=1
          }
        }
        if(node.childCount>0){
          addition+=1;
          node.descendants((child,posOfChild)=>{
            loopDescendents(child,1);
            return false;
          })
        }
        matchArr.forEach((match)=>{
          let newTaxFrom = matchObj[match.index] + pos
          let newTaxTo = matchObj[match.index+match[0].length]+pos
          let taxonInNewTaxonPosition = taxonsIntervals.find((x)=>{return (
            (newTaxFrom<x.from&&newTaxTo>x.from)||
            (newTaxFrom<x.to&&newTaxTo>x.to)||
            (newTaxFrom>x.from&&newTaxFrom<x.to)||
            (newTaxTo>x.from&&newTaxTo<x.to)||
            (newTaxFrom==x.from&&newTaxTo==x.to)
            )})
          if(manual && (
            !taxonInNewTaxonPosition||
            (taxonInNewTaxonPosition&&(taxonInNewTaxonPosition.attrs.removedtaxon == 'true'||taxonInNewTaxonPosition.attrs.removedtaxon == true))
          )){
            allMatches.push({
              from:newTaxFrom,
              to:newTaxTo,
              taxon:match[0]
            })
          }else if(!manual && !taxonInNewTaxonPosition){
            allMatches.push({
              from:newTaxFrom,
              to:newTaxTo,
              taxon:match[0]
            })
          }
        })
        return false;
      }
      return true;
    })
    let taxonsInEditor:{form:number,to:number,removedTaxon:boolean}[] = []
    doc.nodesBetween(0, docSize, (node, pos, parent, index) => {
      let taxonMarkOnNode = node.marks.find(x=>x.type.name == 'taxon');
      if(taxonMarkOnNode){
        taxonsInEditor.push({form:pos,to:pos+node.nodeSize,removedTaxon:taxonMarkOnNode.attrs.removedtaxon});
      }
    })

    return allMatches.sort((a,b)=>b.from-a.from);
  }

  markAllOccurrencesOfTextInEditor = (view: EditorView, taxonKeys: string[],manual?:boolean) => {
    let countOfTextOccurrencesThanCanBeMarkedAsTaxons = this.getCountOfTagableText(view.state.doc, taxonKeys,manual);
    if(countOfTextOccurrencesThanCanBeMarkedAsTaxons.length>0){
      let tr = view.state.tr;
      countOfTextOccurrencesThanCanBeMarkedAsTaxons.forEach((taxPos)=>{
        tr = tr.addMark(taxPos.from,taxPos.to,schema.marks.taxon.create({removedtaxon: false,taxmarkid:uuidv4()}))
      })
      view.dispatch(tr);
    }
  }

  taxonsMarksObj: { [key: string]: taxonMarkData } = {}
  taxonsMarksObjChangeSubject: Subject<any> = new Subject()

  getTaxonsInAllEditors = () => {
    this.taxonsMarksObj = {}
    let edCont = this.serviceShare.ProsemirrorEditorsService.editorContainers
    Object.keys(edCont).filter(x=>x!='headEditor').forEach((sectionId) => {
      let view = edCont[sectionId].editorView;
      this.getTaxonsInEditor(view, sectionId);
    })
    this.taxonsMarksObjChangeSubject.next('taxons pos calc for all sections');
  }

  lastSelectedMarks: { [key: string]: {  taxonMarkId: string, sectionId: string,pos:number } }
  getTaxonsInEditor = (view: EditorView, sectionId: string) => {
    let taxonMark = view.state.schema.marks.taxon
    let doc = view.state.doc
    let docSize: number = doc.content.size;
    doc.nodesBetween(0, docSize - 1, (node, pos, parent, index) => {
      const actualMark = node.marks.find(mark => mark.type === taxonMark);
      if (actualMark && (
        actualMark.attrs.removedtaxon == 'false'||
        actualMark.attrs.removedtaxon == false
        )) {
      // should get the top position , the node document position , the section id of this view
        let articleElement = document.getElementById('app-article-element') as HTMLDivElement
        let articleElementRactangle = articleElement.getBoundingClientRect()
        let domCoords = view.coordsAtPos(pos)
        let markIsLastSelected = false

        let selTaxon = this.lastSelectedMarks[actualMark.attrs.taxmarkid];
        if (selTaxon) {
          if (!this.serviceShare.ProsemirrorEditorsService.editorContainers[selTaxon.sectionId]) {
            this.lastSelectedMarks[actualMark.attrs.id] = undefined
          } else if (selTaxon.pos == pos&& selTaxon.taxonMarkId == actualMark.attrs.taxmarkid && selTaxon.sectionId == sectionId) {
            markIsLastSelected = true
          }
        }
        let lastSelected: true | undefined
        if (
          this.lastTaxonMarkSelected.taxonMarkId == actualMark.attrs.taxmarkid &&
          this.lastTaxonMarkSelected.sectionId == sectionId&&
          this.lastTaxonMarkSelected.pos == pos
        ) {
          lastSelected = true
        }
        if (lastSelected) {
        }
        if (markIsLastSelected || lastSelected || (!(markIsLastSelected || lastSelected) && !this.taxonsMarksObj[actualMark.attrs.taxmarkid])) {
          this.taxonsMarksObj[actualMark.attrs.taxmarkid] = {
            taxonMarkId: actualMark.attrs.taxmarkid,
            pmDocStartPos: pos,
            pmDocEndPos: pos + node.nodeSize,
            section: sectionId,
            taxonTxt: this.getallTaxonOccurrences(actualMark.attrs.taxmarkid, view),
            domTop: domCoords.top - articleElementRactangle.top - articlePosOffset - 45,
            taxonAttrs: actualMark.attrs,
            selected: markIsLastSelected,
          }
        }
      }
    })
  }

  getallTaxonOccurrences(taxonId: string, view: EditorView) {
    let nodeSize = view.state.doc.content.size;
    let textContent = '';

    view.state.doc.nodesBetween(0, nodeSize, (node: Node) => {
      const actualMark = node.marks.find(mark => mark.type.name === "taxon");
      if(actualMark && actualMark.attrs.taxmarkid == taxonId) {
        textContent += node.textContent;
      }
    })

    return textContent;
  }

  sameAsLastSelectedTaxonMark = (pos?:number,sectionId?: string, taxonMarkId?: string ) => {
    if (
      this.lastTaxonMarkSelected.sectionId != sectionId ||
      this.lastTaxonMarkSelected.taxonMarkId != taxonMarkId ||
      this.lastTaxonMarkSelected.pos!=pos
    ) {
      return false;
    } else {
      return true;
    }
  }

  setLastSelectedTaxonMark = ( pos?: number, sectionId?: string, taxonMarkId?: string,focus?:true) => {
    if (!this.sameAsLastSelectedTaxonMark( pos, sectionId, taxonMarkId)||focus) {
      this.lastSelectedTaxonMarkSubject.next({ pos, sectionId, taxonMarkId })
    }
  }

  markTaxonsWithBackendService(){
    this.serviceShare.ProsemirrorEditorsService.spinSpinner();
    let articleTxt:{[key:string]:{txt:string,taxons?:string[]}} = {}
    let edCont = this.serviceShare.ProsemirrorEditorsService.editorContainers
    Object.keys(edCont).filter(x=>x!='headEditor').forEach((sectionId) => {
      articleTxt[sectionId] = {txt:edCont[sectionId].editorView.state.doc.textContent};
    })
    let newFormData = new FormData();
    newFormData.append('text',Object.values(articleTxt).map(x=>x.txt).join(''))
    newFormData.append('format','json')
    newFormData.append('returnContent','true')
    newFormData.append('unique','true')
    this.serviceShare.httpClient.post('https://gnrd.globalnames.org/find',newFormData).subscribe((results:any)=>{
      let taxonNames:string[] = results.names.map((x)=>x.name/* .replace(' ','( | )') */);
      Object.keys(articleTxt).forEach((key)=>{
        articleTxt[key].taxons = taxonNames/* .filter((name)=>articleTxt[key].txt.includes(name)); */
        let view = edCont[key].editorView;
        this.markAllOccurrencesOfTextInEditor(view,articleTxt[key].taxons)
      })
      this.serviceShare.ProsemirrorEditorsService.stopSpinner();
    })
  }

  removeSingleTaxon(taxon:taxonMarkData){
    let view = this.serviceShare.ProsemirrorEditorsService.editorContainers[taxon.section].editorView;
    let markAttr = taxon.taxonAttrs;
    markAttr.removedtaxon = true;
    let mark = schema.marks.taxon.create(markAttr)
    let slice = new Slice(Fragment.from(schema.text(taxon.taxonTxt,[mark])),0,0)
    let tr = view.state.tr.replaceWith(taxon.pmDocStartPos,taxon.pmDocEndPos,Fragment.empty)
    view.dispatch(tr);
    let tr2 = view.state.tr.replace(taxon.pmDocStartPos,taxon.pmDocStartPos,slice)
    view.dispatch(tr2);
    let tr3 = view.state.tr.setSelection(TextSelection.create(view.state.doc,taxon.pmDocStartPos,taxon.pmDocEndPos))
    view.dispatch(tr3);
  }

  getPositionsOfNonEmptyMarksSameAsTaxon(doc:Node,txt:string){
    let count = 0;
    let docSize = doc.content.size
    let positions:{from:number,to:number,attrs:any}[] = []
    doc.nodesBetween(0,docSize,(node,pos,par,i)=>{
      let mark = node.marks.find((x)=>x.type.name == 'taxon');
      if(mark && (mark.attrs.removedtaxon == 'false' || mark.attrs.removedtaxon == false)&&txt == node.textContent  ){
        positions.push({from:pos,to:pos+node.nodeSize,attrs:mark.attrs});
      }
    })
    return positions.sort((a,b)=>b.from-a.from);
  }

  removeAllTaxon(taxon:taxonMarkData){
    let containers = this.serviceShare.ProsemirrorEditorsService.editorContainers
    Object.keys(containers).forEach((key)=>{
      if(key == 'headEditor') return ;
      let view = containers[key].editorView
      let state = view.state;
      let positions = this.getPositionsOfNonEmptyMarksSameAsTaxon(state.doc,taxon.taxonTxt)
      let tr = view.state.tr;
      positions.forEach((pos)=>{
        let attrs = {...pos.attrs};
        attrs.removedtaxon = true;
        let mark = schema.marks.taxon.create(attrs)
        let slice = new Slice(Fragment.from(schema.text(taxon.taxonTxt,[mark])),0,0)
        tr = tr.replaceWith(pos.from,pos.to,Fragment.empty)
        tr = tr.replace(pos.from,pos.from,slice)
      })
      view.dispatch(tr);
    })
  }

  showHideTaxonButtons(view: EditorView) {
    const {from, to} = view.state.selection;
    const anchor = view.state.selection.$anchor;
    const referenceCitationInfo = this.serviceShare.citationButtonsService.citeRefPosition(view.state, anchor.pos);
    const mark = this.serviceShare.citationButtonsService.findCitationMark(view, anchor.pos);
              
    if(to - from >= 3 && !referenceCitationInfo && !mark) {
      this.canShowTaxonButtons.next(true);
    } else {
      this.canShowTaxonButtons.next(false);
    }
  }
}
