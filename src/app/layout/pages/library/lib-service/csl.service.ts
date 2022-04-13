import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { basicJournalArticleData, jsonSchemaForCSL, possibleReferenceTypes, exampleCitation, lang as langData, reference, formioAuthorsDataGrid, formIOTextFieldTemplate } from '../data/data';

//@ts-ignore
import { CSL } from '../data/citeproc.js'
import { uuidv4 } from 'lib0/random';
import { basicStyle, styles } from '../data/styles';
import { HttpClient } from '@angular/common/http';
import { RefsApiService } from './refs-api.service';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { schema } from '@app/editor/utils/Schema';
@Injectable({
  providedIn: 'root'
})
export class CslService {
  references: any;
  currentRef: any;

  getRefsArray() {
    this.references = this.serviceShare.YdocService!.referenceCitationsMap!.get('references');
    return Object.values(this.references)
  }
  citeprocSys = {

    // Given a language tag in RFC-4646 form, this method retrieves the
    // locale definition file.  This method must return a valid *serialized*
    // CSL locale. (In other words, an blob of XML as an unparsed string.  The
    // processor will fail on a native XML object or buffer).
    retrieveLocale: (lang: any) => {
      /* xhr.open('GET', 'locales-' + lang + '.xml', false);
      xhr.send(null); */
      return langData;
    },

    // Given an identifier, this retrieves one citation item.  This method
    // must return a valid CSL-JSON object.
    retrieveItem: (id: any) => {
      return this.currentRef;
    }
  };
  citeproc: any
  constructor(
    private serviceShare: ServiceShare,
    private _http: HttpClient,
    private refsAPI: RefsApiService,
  ) {
    this.serviceShare.shareSelf('CslService', this)
    this.citeproc = new CSL.Engine(this.citeprocSys, /* pensoftStyle */basicStyle);
    //var citationStrings = this.citeproc.processCitationCluster(exampleCitation[0], exampleCitation[1], [])[1];
    this.serviceShare.YdocService!.ydocStateObservable.subscribe((event) => {
      if (event == 'docIsBuild') {
        this.references = this.serviceShare.YdocService!.referenceCitationsMap!.get('references');
      }
    });

  }

  genereteCitationStr(style: string, ref: any) {
    this.currentRef = ref.referenceData;
    this.citeproc = new CSL.Engine(this.citeprocSys, styles[style]/* basicStyle */);
    this.citeproc.updateItems([ref.referenceData.id]);
    let newCitationId = uuidv4()
    let citationData: any = this.generateCitation([{
      "citationID": newCitationId,
      "citationItems": [{ "id": ref.referenceData.id }],
      "properties": { "noteIndex": 1 }
    }, [], []]);
    let bibliography = this.citeproc.makeBibliography();
    citationData.bibliography = bibliography;
    return citationData;
  }

  deleteCitation(id: string) {
    this.references = this.serviceShare.YdocService!.referenceCitationsMap!.get('references');
    delete this.references[id]
    this.serviceShare.YdocService!.referenceCitationsMap!.set('references', this.references)
  }

  addReference(ref: any, refType: any, refStyle: any, formioSubmission: any, oldRef?: any, globally?: boolean) {
    let newRef: any = {};
    this.currentRef = ref;
    let newCitationId = uuidv4()
    this.citeproc = new CSL.Engine(this.citeprocSys, /* pensoftStyle */refStyle.style);
    this.citeproc.updateItems([ref.id]);
    let citationData = this.generateCitation([{
      "citationID": newCitationId,
      "citationItems": [{ "id": ref.id }],
      "properties": { "noteIndex": 1 }
    }, [], []]);
    let bibliography = this.citeproc.makeBibliography();
    newRef.basicCitation = {
      data: citationData,
      citatId: newCitationId,
      style: 'basicStyle'
    }
    newRef.basicCitation.bobliography = bibliography[1][0];
    newRef.referenceData = ref;
    newRef.formioData = formioSubmission;
    newRef.last_modified = (new Date()).getTime();
    let newRefObj = {
      refData: newRef,
      refType,
      refStyle
    }
    if (oldRef) {
      return this.refsAPI.editReference(newRefObj, globally!);
    } else {
      return this.refsAPI.createReference(newRefObj);
    }
    /* this.references = this.serviceShare.YdocService!.referenceCitationsMap!.get('references');
    this.references[ref.id] = newRefObj;
    this.serviceShare.YdocService!.referenceCitationsMap!.set('references',this.references); */
  }
  /*
  [{
    "citationID": "SXDNEKR5AD",
    "citationItems": [{ "id": "2kntpabvm2" }],
    "properties": { "noteIndex": 1 }
  },[],[]]
  */
  generateCitation(citationObj: any[]) {
    let html = this.citeproc.previewCitationCluster(citationObj[0], citationObj[1], [], 'html');
    let text = this.citeproc.previewCitationCluster(citationObj[0], citationObj[1], [], 'text');
    let rtx = this.citeproc.previewCitationCluster(citationObj[0], citationObj[1], [], 'rtf');
    return { html, text, rtx }
  }

  checkReferencesInAllEditors(editorContainers: {
    [key: string]: {
      editorID: string,
      containerDiv: HTMLDivElement,
      editorState: EditorState,
      editorView: EditorView,
      dispatchTransaction: any
    }
  }) {
    this.refsAPI.getReferences().subscribe((refsData: any) => {
      let refs = refsData.data;
      Object.keys(editorContainers).forEach((key)=>{
        setTimeout(()=>{
          this.checkReferencesInEditor(editorContainers[key],refs);
        },0)
      })
    })
  }

  thereAreOutOfDateReferences(state:EditorState,refs:any[]){
    let docSize = state.doc.content.size;
    let outOfDateRefs = 0;
    state.doc.nodesBetween(0,docSize-1,(node,pos,parent,index)=>{
      if(node.type.name == 'reference_citation'){
        let nodeRefData = node.attrs.referenceData;
        let nodeStyleData = node.attrs.referenceStyle;
        let actualRef = refs.find((ref)=>{
          return ref.refData.referenceData.id == nodeRefData.refId
        })
        if(actualRef&&(actualRef.refStyle.last_modified>nodeStyleData.last_modified||actualRef.refStyle.name!==nodeStyleData.name)){
          outOfDateRefs++
        }
      }
    })
    return outOfDateRefs
  }


  checkReferencesInEditor(container: {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  },references:any[]) {
    let refsToUpdate = this.thereAreOutOfDateReferences(container.editorView.state,references)
    if(refsToUpdate>0){
      for(let i = 0 ; i < refsToUpdate;i++){
        setTimeout(()=>{
          this.fixReferenceInEditor(container,references);
        },0)
      }
    }
  }
  fixReferenceInEditor(container: {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  },references:any[]){
    let state = container.editorView.state;
    let docSize = state.doc.content.size;
    let found = false;

    let refNode:any;
    let start:any;
    let end:any;
    let actRef:any;

    state.doc.nodesBetween(0,docSize-1,(node,pos,parent,index)=>{
      if(!found&&node.type.name == 'reference_citation'){
        let nodeRefData = node.attrs.referenceData;
        let nodeStyleData = node.attrs.referenceStyle;
        let actualRef = references.find((ref)=>{
          return ref.refData.referenceData.id == nodeRefData.refId
        })
        if(actualRef&&(actualRef.refStyle.last_modified>nodeStyleData.last_modified||actualRef.refStyle.name!==nodeStyleData.name)){
          found = true
          actRef = actualRef;
          refNode = node;
          start = pos;
          end = start+node.nodeSize;
        }
      }
    })
    let newData = this.genereteCitationStr(actRef.refStyle.name,actRef.refData);
    let contDiv = document.createElement('div');
    contDiv.innerHTML = newData.bibliography[1][0];
    let newAttrs = refNode.attrs;
    newAttrs.referenceStyle = {name:actRef.refStyle.name,last_modified:actRef.refStyle.last_modified}
    let newReferenceCitation = schema.nodes.reference_citation.create(newAttrs,schema.text(contDiv.textContent!||'d'))
    container.editorView.dispatch(state.tr.replaceWith(start,end,newReferenceCitation));
    console.log('updated style');
  }
}
