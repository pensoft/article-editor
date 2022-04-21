import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { uuidv4 } from 'lib0/random';
import { endsWith, keys } from 'lodash';
import { Fragment } from 'prosemirror-model';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';

@Injectable({
  providedIn: 'root'
})
export class EditorsRefsManagerService {

  constructor(private serviceShare: ServiceShare) {
    this.serviceShare.shareSelf('EditorsRefsManagerService', this)
  }

  addReferenceToEditor(refDataFromDialog: any) {
    let refs = this.serviceShare.YdocService!.referenceCitationsMap?.get('referencesInEditor')
    let citationDisplayText = refDataFromDialog.citation.text;
    let countOfRefsWithTheSameDisplayText = 0;
    let refID
    if (refDataFromDialog.refInstance == 'local') {
      refID = refDataFromDialog.ref.refData.referenceData.id
    } else if (refDataFromDialog.refInstance == "external") {
      refID = refDataFromDialog.ref.id
    }
    let newRef = {
      originalDisplayText: citationDisplayText,
      citationDisplayText: citationDisplayText,
      originalBibliography: refDataFromDialog.citation.bibliography,
      bibliography: refDataFromDialog.citation.bibliography,
      ref: refDataFromDialog.ref,
      refInstance: refDataFromDialog.refInstance
    }
    console.log(refID);
    let notInEndEditorYet = !refs[refID]
    refs[refID] = newRef
    let refsUpdated = this.updateCitationsDisplayTextAndBibliography(refs)
    if (notInEndEditorYet) {
      this.addReferenceToEndEditor(newRef);
    }
    this.serviceShare.YdocService!.referenceCitationsMap?.set('referencesInEditor', refsUpdated);
    return refsUpdated[refID]
  }

  updateCitationsDisplayTextAndBibliography(refs: any) {
    let countObj: any = {}

    let updatedAnyDisplayText = false
    let updatedReferences: string[] = []
    // count number of refs with the same citation display text ex. : (Author 2022)

    Object.keys(refs).forEach((refId) => {
      let ref = refs[refId]
      let cictatDispTxt = ref.originalDisplayText;
      if (!countObj[cictatDispTxt]) {
        countObj[cictatDispTxt] = 1;
      } else {
        countObj[cictatDispTxt]++;
      }
    })

    // change all citationDisplayText for all refs that have the same originalDisplayText

    Object.keys(countObj).forEach((text) => {
      if (countObj[text] > 1) {
        updatedAnyDisplayText = true
        let count = 1;
        Object.keys(refs).forEach((refId) => {
          let ref = refs[refId]
          if (ref.originalDisplayText == text) {
            updatedReferences.push(refId)
            let char = String.fromCharCode(96 + count)
            let citationDisText = this.checkTextAndReplace(ref.originalDisplayText, char)
            ref.citationDisplayText = citationDisText
            let bibliography = this.checkTextAndReplace(ref.originalBibliography, char)
            ref.bibliography = bibliography
            count++;
          }
        })
      }else{
        updatedAnyDisplayText = true
        Object.keys(refs).forEach((refId) => {
          let ref = refs[refId]
          if (ref.originalDisplayText == text) {
            updatedReferences.push(refId)
            ref.citationDisplayText = ref.originalDisplayText
            ref.bibliography = ref.originalBibliography
          }
        })
      }

    })

    if (updatedAnyDisplayText) {
      setTimeout(() => {
        this.updateReferenceCitats(updatedReferences, refs);
      }, 0)
    }
    return refs
  }

  updateReferenceCitats(updatedReferences: string[], refs: any) {
    //update refs bibliography in end editor
    updatedReferences.forEach((refid) => {
      this.updateBibliography(refs, refid)
    })
    //update citation of refs
    updatedReferences.forEach((refid) => {
      this.updateRefCitations(refs, refid)
    })
  }

  checkIfEditorHasCitationOfRef(container: {
    editorID: string;
    containerDiv: HTMLDivElement;
    editorState: EditorState<any>;
    editorView: EditorView<any>;
    dispatchTransaction: any;
  },refId:string) {
    let count = 0
    let st =container.editorView.state;
    let docSize = st.doc.content.size
    st.doc.nodesBetween(0,docSize-1,(n,p,par,i)=>{
      if(n.type.name == 'reference_citation'&&n.attrs.actualRefId == refId){
        count++;
      }
    })
    return count
  }

  handleRefCitationDelete(deletedRefCitations:any[]){
    console.log(deletedRefCitations);
    setTimeout(()=>{
      deletedRefCitations
      let refs = this.serviceShare.YdocService!.referenceCitationsMap?.get('referencesInEditor')
      deletedRefCitations.forEach((delCit)=>{
        let deletedCitRefId = delCit.actualRefId
        this.checkIfShouldRemoveEditorFromEndEditor(deletedCitRefId)
      })
    },10)
  }

  checkIfShouldRemoveEditorFromEndEditor(refId:string,){
    if(!this.anyCitationsLeftOfRefInAnyEditor(refId)){
      this.removeFromEndEditor(refId)
    }
  }

  nOfRefsInEndEditor(){
    let endEditor = this.serviceShare.ProsemirrorEditorsService!.editorContainers['endEditor'];
    let nOfRefs = 0
    let doc = endEditor.editorView.state.doc;
    let size = doc.content.size;
    doc.nodesBetween(0,size-1,(n,p,par,i)=>{
      if(n.type.name == 'reference_citation_end'){
        nOfRefs++;
      }
    })
    return nOfRefs
  }

  checkIfRefIsInEndEditor(refId:string){
    let endEditor = this.serviceShare.ProsemirrorEditorsService!.editorContainers['endEditor'];
    let view = endEditor.editorView;
    let st = view.state;
    let any = false
    let docSize = st.doc.content.size
    st.doc.nodesBetween(0,docSize-1,(n,p,par,i)=>{
      if(n.type.name == 'reference_citation_end'&&n.attrs.referenceData.refId == refId){
        any = true;
      }
    })
    return any;
  }

  removeFromEndEditor(refId:string){
    let endEditor = this.serviceShare.ProsemirrorEditorsService!.editorContainers['endEditor'];
    let nOfRefs = this.nOfRefsInEndEditor();
    let thereIsRefWithThisIDInLastEditor = this.checkIfRefIsInEndEditor(refId);
    if (!thereIsRefWithThisIDInLastEditor) return
    let view = endEditor.editorView;
    let st = view.state;

    let from : any;
    let to : any;
    console.log('removeFromEndEditor',refId,'nOfRefs',nOfRefs);
    let docSize = st.doc.content.size
    if(nOfRefs == 1){
      st.doc.nodesBetween(0,docSize-1,(n,p,par,i)=>{
        if(n.type.name == 'reference_container'){
          from = p-15;
          to = p+n.nodeSize
        }
      })
    }else{
      st.doc.nodesBetween(0,docSize-1,(n,p,par,i)=>{
        if(n.type.name == 'reference_citation_end'&&n.attrs.referenceData.refId == refId){
          from = p-1;
          to = p+n.nodeSize+1
        }
      })
    }

    if(from||to){
      view.dispatch(st.tr.replaceWith(from,to,Fragment.empty));
    }
    let refs = this.serviceShare.YdocService!.referenceCitationsMap?.get('referencesInEditor')
    let newRefs:any = {}
    Object.keys(refs).forEach((key)=>{
      if(key!=refId){
        newRefs[key] = refs[key];
      }
    })
    this.updateCitationsDisplayTextAndBibliography(newRefs)
    this.serviceShare.YdocService!.referenceCitationsMap?.set('referencesInEditor',newRefs)

  }

  anyCitationsLeftOfRefInAnyEditor(refId:string){
    let editors = this.serviceShare.ProsemirrorEditorsService!.editorContainers;
    let any = false;
    Object.keys(editors).forEach((editorid)=>{
      if(editorid!='endEditor'){
        let container = editors[editorid];
        let st = container.editorView.state;
        let docSize = st.doc.content.size;
        st.doc.nodesBetween(0,docSize-1,(n,p,par,i)=>{
          if(n.type.name == 'reference_citation'&&n.attrs.actualRefId == refId){
            any = true
          }
        })
      }
    })
    return any
  }

  updateRefCitations(ydocRefs: any, refId: string) {
    Object.keys(this.serviceShare.ProsemirrorEditorsService!.editorContainers).forEach((editorid)=>{
      if(editorid!=="endEditor"){
        let cont = this.serviceShare.ProsemirrorEditorsService!.editorContainers[editorid]
        let citationsInEd= this.checkIfEditorHasCitationOfRef(cont,refId);
        if(citationsInEd>0){
          for(let i = 0;i<citationsInEd;i++){
            this.updateRefCitation(cont,ydocRefs[refId],refId);
          }
        }
      }
    })
  }

  updateRefCitation(container: {
    editorID: string;
    containerDiv: HTMLDivElement;
    editorState: EditorState<any>;
    editorView: EditorView<any>;
    dispatchTransaction: any;
  },ydocRef:any,refId:String){
    let edView = container.editorView;

    let node: any;
    let from: any;
    let to: any;

    let state = edView.state;
    let found = false;
    let docSize = state.doc.content.size


    state.doc.nodesBetween(0,docSize-1,(n,p,par,i)=>{
      if(n.type.name == 'reference_citation'&&n.attrs.actualRefId == refId&&n.textContent!=ydocRef.citationDisplayText){
        found = true
        node = n;
        from =p;
        to = n.nodeSize+p;
      }
    })
    if (found) {
      let attrs = JSON.parse(JSON.stringify(node.attrs));
      let newNode = state.schema.nodes.reference_citation.create(attrs, state.schema.text(ydocRef.citationDisplayText))
      edView.dispatch(state.tr.replaceWith(from, to, newNode));
    }
  }

  updateBibliography(ydocRefs: any, refId: string) {
    let endEdView = this.serviceShare.ProsemirrorEditorsService!.editorContainers['endEditor'].editorView;

    let node: any;
    let from: any;
    let to: any;

    let state = endEdView.state;

    let docsize = state.doc.content.size
    state.doc.nodesBetween(0, docsize - 1, (n, pos, parent, index) => {
      if (n.type.name == 'reference_citation_end' && n.attrs.referenceData.refId == refId) {
        node = n
        from = pos;
        to = n.nodeSize + pos;
      }
    })
    if (node) {
      let attrs = JSON.parse(JSON.stringify(node.attrs));
      let newNode = state.schema.nodes.reference_citation_end.create(attrs, state.schema.text(ydocRefs[refId].bibliography))
      endEdView.dispatch(state.tr.replaceWith(from, to, newNode));
    }
  }

  checkTextAndReplace(text: string, char: string) {
    let result: any
    if (/[0-9]{4}\)/gm.test(text)) {
      let regResult = /[0-9]{4}\)/.exec(text)![0];
      result = text.replace(regResult, regResult.split(')')[0] + char + ')')
    } else if (/[0 - 9]{ 4 }/gm.test(text)) {
      let regResult = /[0 - 9]{ 4 }/.exec(text)![0];
      result = text.replace(regResult, regResult + char)
    } else if (/\([0-9]{4}\)/gm.test(text)) {
      let regResult = /\([0-9]{4}\)/.exec(text)![0];
      result = text.replace(regResult, regResult.split(')')[0] + char + ')')
    } else {
      result = char + '. ' + text;
    }
    return result
  }

  addReferenceToEndEditor(newRef: any) {
    let view = this.serviceShare.ProsemirrorEditorsService!.editorContainers['endEditor'].editorView;
    let nodeStart: number = view.state.doc.nodeSize - 2
    let nodeEnd: number = view.state.doc.nodeSize - 2
    let state = view.state
    let referenceContainerIsRendered = false;
    view.state.doc.forEach((node, offset, index) => {
      if (node.type.name == 'reference_container') {
        nodeStart = offset + node.nodeSize - 1
        nodeEnd = offset + node.nodeSize - 1
        referenceContainerIsRendered = true
      }
    })
    let schema = view.state.schema
    if (newRef.refInstance == 'local') {
      let referenceData = { refId: newRef.ref.refData.referenceData.id, last_modified: newRef.ref.refData.last_modified };
      let referenceStyle = { name: newRef.ref.refStyle.name, last_modified: newRef.ref.refStyle.last_modified };
      let referenceType = { name: newRef.ref.refType.name, last_modified: newRef.ref.refType.last_modified };
      let recCitationAttrs = {
        contenteditableNode: 'false',
        refCitationID: uuidv4(),
        referenceData,
        referenceStyle,
        referenceType,
        refInstance: newRef.refInstance
      }

      let refNode = schema.nodes.reference_citation_end.create(recCitationAttrs, schema.text(newRef.bibliography))
      let refContainerNode = schema.nodes.reference_block_container.create({ contenteditableNode: 'false' }, refNode)
      if (!referenceContainerIsRendered) {
        let refTitle = schema.nodes.paragraph.create({ contenteditableNode: 'false' }, schema.text('References :'))
        let h1 = schema.nodes.heading.create({ tagName: 'h1' }, refTitle)
        let allRefsContainer = schema.nodes.reference_container.create({ contenteditableNode: 'false' }, refContainerNode)
        let tr = state.tr.replaceWith(nodeStart, nodeEnd, [h1, allRefsContainer])
        view.dispatch(tr)
      } else {
        let tr = state.tr.replaceWith(nodeStart, nodeEnd, refContainerNode)
        view.dispatch(tr)
      }
    } else if (newRef.refInstance == 'external') {
      let referenceData = { refId: newRef.ref.id, last_modified: undefined };
      let recCitationAttrs = {
        contenteditableNode: 'false',
        refCitationID: uuidv4(),
        referenceData,
        referenceStyle: '',
        referenceType: '',
        refInstance: newRef.refInstance
      }
      let refNode = schema.nodes.reference_citation_end.create(recCitationAttrs, schema.text(newRef.bibliography))
      let refContainerNode = schema.nodes.reference_block_container.create({ contenteditableNode: 'false' }, refNode)
      if (!referenceContainerIsRendered) {
        let refTitle = schema.nodes.paragraph.create({ contenteditableNode: 'false' }, schema.text('References :'))
        let h1 = schema.nodes.heading.create({ tagName: 'h1' }, refTitle)
        let allRefsContainer = schema.nodes.reference_container.create({ contenteditableNode: 'false' }, refContainerNode)
        let tr = state.tr.replaceWith(nodeStart, nodeEnd, [h1, allRefsContainer])
        view.dispatch(tr)
      } else {
        let tr = state.tr.replaceWith(nodeStart, nodeEnd, refContainerNode)
        view.dispatch(tr)
      }
    }
  }
}
