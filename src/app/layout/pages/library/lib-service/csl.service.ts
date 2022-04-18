import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { basicJournalArticleData, jsonSchemaForCSL, possibleReferenceTypes, exampleCitation, lang as langData, reference, formioAuthorsDataGrid, formIOTextFieldTemplate } from '../data/data';

//@ts-ignore
import { CSL } from '../data/citeproc.js'
import { uuidv4 } from 'lib0/random';
import { basicStyle, styles1 } from '../data/styles';
import { HttpClient } from '@angular/common/http';
import { RefsApiService } from './refs-api.service';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { schema } from '@app/editor/utils/Schema';
import { Node } from 'prosemirror-model';
import { MatDialog } from '@angular/material/dialog';
import { ReferenceEditComponent } from '../reference-edit/reference-edit.component';
import { genereteNewReference } from './refs-funcs';
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
    public dialog: MatDialog,
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
    this.citeproc = new CSL.Engine(this.citeprocSys, styles1[style]/* basicStyle */);
    this.citeproc.updateItems([ref.referenceData.id]);
    let newCitationId = uuidv4()
    let citationData: any = this.generateCitation([{
      "citationID": newCitationId,
      "citationItems": [{ "id": ref.referenceData.id }],
      "properties": { "noteIndex": 1 }
    }, [], []]);
    let bibliography = this.citeproc.makeBibliography();
    citationData.bibliography = bibliography[1][0];
    let contDiv = document.createElement('div');
    contDiv.innerHTML = citationData.bibliography;
    citationData.bibliography = contDiv.textContent!.endsWith('\n') ? contDiv.textContent!.slice(0, contDiv.textContent!.length - 2) : contDiv.textContent!
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
    this.citeproc = new CSL.Engine(this.citeprocSys, /* pensoftStyle */styles1[refStyle.name]);
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
      Object.keys(editorContainers).forEach((key) => {
        setTimeout(() => {
          this.checkReferencesInEditor(editorContainers[key], refs);
        }, 0)
      })
    })
  }

  updateAllCitatsOfReferenceInAllEditors(editorContainers: {
    [key: string]: {
      editorID: string,
      containerDiv: HTMLDivElement,
      editorState: EditorState,
      editorView: EditorView,
      dispatchTransaction: any
    }
  }, ref: any) {
    Object.keys(editorContainers).forEach((key) => {
      setTimeout(() => {
        this.updateCitatsOfReferenceInEditor(editorContainers[key], ref);
      }, 0)
    })
  }

  checkData(actualRef: any, nodeAttrs: any) {
    let nodeRefData = nodeAttrs.referenceData;
    let nodeStyleData = nodeAttrs.referenceStyle;
    return actualRef &&
      ((actualRef.refStyle.last_modified > nodeStyleData.last_modified || actualRef.refStyle.name !== nodeStyleData.name) ||
        (actualRef.refData.last_modified > nodeRefData.last_modified && actualRef.refData.global === false));
  }

  thereAreOutOfDateReferences(state: EditorState, refs: any[]) {
    let docSize = state.doc.content.size;
    let outOfDateRefs = 0;
    state.doc.nodesBetween(0, docSize - 1, (node, pos, parent, index) => {
      if (node.type.name == 'reference_citation') {
        let nodeRefData = node.attrs.referenceData;
        let actualRef = refs.find((ref) => {
          return ref.refData.referenceData.id == nodeRefData.refId
        })
        if (this.checkData(actualRef, node.attrs)) {
          outOfDateRefs++
        }
      }
    })
    return outOfDateRefs
  }

  updateCitatWithIDInEditor(container: {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  },citatID:string, ref: any){
    let vw = container.editorView;
    let st = vw.state;
    let size = st.doc.content.size

    let from:any
    let to:any
    let node:any

    st.doc.nodesBetween(0,size-1,(n,pos,parent,index)=>{
      if(n.type.name == 'reference_citation'&&n.attrs.refCitationID == citatID){
        // reference citation found
        node = n;
        from = pos;
        to = pos+n.nodeSize;
      }
    })

    if(node){
      let newData = this.genereteCitationStr(ref.refStyle.name, ref.refData);
      let newAttrs = JSON.parse(JSON.stringify(node.attrs));
      console.log('old text    :' + node.textContent);
      console.log('new text    :' + newData.bibliography);
      newAttrs.referenceStyle = { name: ref.refStyle.name, last_modified: ref.refStyle.last_modified }
      newAttrs.referenceData = { refId: node.attrs.referenceData.refId, last_modified: ref.refData.last_modified }
      let newReferenceCitation = schema.nodes.reference_citation.create(newAttrs, schema.text(newData.bibliography || 'd'))
      container.editorView.dispatch(st.tr.replaceWith(from, to, newReferenceCitation).setMeta('preventHistoryAdd', true));
    }
  }

  updateCitatsOfReferenceInEditor(container: {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  }, ref: any){
    let allRefCitatsIdsInEditor = this.findAllCitatsOfRefInEditor(container.editorView.state,ref);
    allRefCitatsIdsInEditor.forEach((id)=>{
      this.updateCitatWithIDInEditor(container,id,ref);
    })
  }

  findAllCitatsOfRefInEditor(state:EditorState,ref:any){
    let docSize = state.doc.content.size;
    let refCitatsIds:string[] = []
    state.doc.nodesBetween(0,docSize-1,(node,pos,parent,i)=>{
      if(node.type.name == 'reference_citation'&&node.attrs.referenceData.refId == ref.refData.referenceData.id){
        refCitatsIds.push(node.attrs.refCitationID);
      }
    })
    return refCitatsIds;
  }

  checkReferencesInEditor(container: {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  }, references: any[]) {
    let refsToUpdate = this.thereAreOutOfDateReferences(container.editorView.state, references)
    if (refsToUpdate > 0) {
      for (let i = 0; i < refsToUpdate; i++) {
        setTimeout(() => {
          this.fixReferenceInEditor(container, references);
        }, 0)
      }
    }
  }
  fixReferenceInEditor(container: {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  }, references: any[]) {
    let state = container.editorView.state;
    let docSize = state.doc.content.size;
    let found = false;

    let refNode: any;
    let start: any;
    let end: any;
    let actRef: any;

    state.doc.nodesBetween(0, docSize - 1, (node, pos, parent, index) => {
      if (!found && node.type.name == 'reference_citation') {
        let nodeRefData = node.attrs.referenceData;
        let actualRef = references.find((ref) => {
          return ref.refData.referenceData.id == nodeRefData.refId
        })
        if (this.checkData(actualRef, node.attrs)) {
          found = true
          actRef = actualRef;
          refNode = node;
          start = pos;
          end = start + node.nodeSize;
        }
      }
    })
    let newData = this.genereteCitationStr(actRef.refStyle.name, actRef.refData);
    let newAttrs = refNode.attrs;
    console.log('old text    :' + refNode.textContent);
    console.log('new text    :' + newData.bibliography);
    newAttrs.referenceStyle = { name: actRef.refStyle.name, last_modified: actRef.refStyle.last_modified }
    newAttrs.referenceData = { refId: refNode.attrs.referenceData.refId, last_modified: actRef.refData.last_modified }
    let newReferenceCitation = schema.nodes.reference_citation.create(newAttrs, schema.text(newData.bibliography || 'd'))
    container.editorView.dispatch(state.tr.replaceWith(start, end, newReferenceCitation).setMeta('preventHistoryAdd', true));
  }

  editReferenceThroughPMEditor(node: Node, sectionId: string) {
    let attrs = JSON.parse(JSON.stringify(node.attrs));
    this.refsAPI.getReferences().subscribe((refsRes: any) => {
      let refs = refsRes.data as any[];
      let citationRefId = attrs.referenceData.refId;
      let ref = refs.find((ref) => {
        return ref.refData.referenceData.id == citationRefId;
      })
      if (ref) {
        this.refsAPI.getReferenceTypes().subscribe((refTypes: any) => {
          this.refsAPI.getStyles().subscribe((refStyles: any) => {
            let referenceStyles = refStyles.data
            let referenceTypesFromBackend = refTypes.data;
            const dialogRef = this.dialog.open(ReferenceEditComponent, {
              data: { referenceTypesFromBackend, oldData: ref, referenceStyles },
              panelClass: 'edit-reference-panel',
              width: 'auto',
              height: '90%',
              maxWidth: '100%'
            });

            dialogRef.afterClosed().subscribe((result: any) => {
              if (result) {
                let refType: reference = result.referenceScheme;
                let refStyle = result.referenceStyle
                let formioData = result.submissionData.data;
                let globally = result.globally
                let newRef = genereteNewReference(refType, formioData)
                let refID = ref.refData.referenceData.id;
                newRef.id = refID;
                this.addReference(newRef, refType, refStyle, formioData, ref, globally).subscribe((editRes:any) => {
                  let reference = editRes.data.find((ref1:any)=>ref1.refData.referenceData.id == ref.refData.referenceData.id)
                  let containers = this.serviceShare.ProsemirrorEditorsService?.editorContainers!
                  // find ref in the returned obj
                  // edit all cetitaions of this reference in the editors
                  this.updateAllCitatsOfReferenceInAllEditors(containers,reference)
                })
              }
            })
          })
        })
      } else {
        console.error('The reference for this citation does not exist anymore.')
      }
    })
  }
}
