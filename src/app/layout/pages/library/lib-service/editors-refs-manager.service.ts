import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { uuidv4 } from 'lib0/random';
import { keys } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class EditorsRefsManagerService {

  constructor(private serviceShare:ServiceShare) {
    this.serviceShare.shareSelf('EditorsRefsManagerService',this)
  }

  addReferenceToEditor(refDataFromDialog:any){
    let refs = this.serviceShare.YdocService!.referenceCitationsMap?.get('referencesInEditor')
    let citationDisplayText = refDataFromDialog.citation.text;
    let countOfRefsWithTheSameDisplayText = 0;
    let refID
    if(refDataFromDialog.refInstance == 'local'){
      refID = refDataFromDialog.ref.refData.referenceData.id
    }else if(refDataFromDialog.refInstance == "external"){
      refID = refDataFromDialog.ref.id
    }
    if(refs[refID]){
      return refs[refID]
    }
    Object.keys(refs).forEach((refid)=>{
      let refData = refs[refid];
      if(refData.originalDisplayText == citationDisplayText){
        countOfRefsWithTheSameDisplayText++;
      }
    })
    if(countOfRefsWithTheSameDisplayText>0){
      citationDisplayText = citationDisplayText+String.fromCharCode(96+countOfRefsWithTheSameDisplayText);
    }
    let originalDisplayText = refDataFromDialog.citation.text;

    let newRef = {
      originalDisplayText,
      citationDisplayText,
      bibliography:refDataFromDialog.citation.bibliography,
      ref:refDataFromDialog.ref,
      refInstance:refDataFromDialog.refInstance
    }
    refs[refID] = newRef
    this.serviceShare.YdocService!.referenceCitationsMap?.set('referencesInEditor',refs);
    this.addReferenceToEndEditor(newRef);
    return newRef
  }

  addReferenceToEndEditor(newRef:any){
    let view = this.serviceShare.ProsemirrorEditorsService!.editorContainers['endEditor'].editorView;
    let nodeStart: number = view.state.doc.nodeSize - 2
    let nodeEnd: number = view.state.doc.nodeSize - 2
    let state = view.state
    let referenceContainerIsRendered = false;
    view.state.doc.forEach((node, offset, index) => {
      if (node.type.name == 'reference_container') {
        nodeStart = offset + node.nodeSize-1
        nodeEnd = offset + node.nodeSize-1
        referenceContainerIsRendered = true
      }
    })
    let schema = view.state.schema
      if(newRef.refInstance=='local'){
        let referenceData = {refId:newRef.ref.refData.referenceData.id,last_modified:newRef.ref.refData.last_modified};
        let referenceStyle = {name:newRef.ref.refStyle.name,last_modified:newRef.ref.refStyle.last_modified};
        let referenceType = {name:newRef.ref.refType.name,last_modified:newRef.ref.refType.last_modified};
        let recCitationAttrs =  {
          contenteditableNode: 'false',
          refCitationID:uuidv4(),
          referenceData,
          referenceStyle,
          referenceType,
          refInstance:newRef.refInstance
        }

        let refNode = schema.nodes.reference_citation_end.create(recCitationAttrs,schema.text(newRef.bibliography))
        let refContainerNode = schema.nodes.reference_block_container.create({contenteditableNode: 'false'},refNode)
        if(!referenceContainerIsRendered){
          let refTitle = schema.nodes.paragraph.create({contenteditableNode: 'false'},schema.text('References :'))
          let h1 = schema.nodes.heading.create({tagName:'h1'},refTitle)
          let allRefsContainer = schema.nodes.reference_container.create({contenteditableNode: 'false'},refContainerNode)
          let tr = state.tr.replaceWith(nodeStart, nodeEnd, [h1,allRefsContainer])
          view.dispatch(tr)
        }else{
          let tr = state.tr.replaceWith(nodeStart, nodeEnd, refContainerNode)
          view.dispatch(tr)
        }
      }else if(newRef.refInstance=='external'){
        let recCitationAttrs =  {
          contenteditableNode: 'false',
          refCitationID:uuidv4(),
          referenceData:'',
          referenceStyle:'',
          referenceType:'',
          refInstance:newRef.refInstance
        }
        let refNode = schema.nodes.reference_citation_end.create(recCitationAttrs,schema.text(newRef.bibliography))
        let refContainerNode = schema.nodes.reference_block_container.create({contenteditableNode: 'false'},refNode)
        if(!referenceContainerIsRendered){
          let refTitle = schema.nodes.paragraph.create({contenteditableNode: 'false'},schema.text('References :'))
          let h1 = schema.nodes.heading.create({tagName:'h1'},refTitle)
          let allRefsContainer = schema.nodes.reference_container.create({contenteditableNode: 'false'},refContainerNode)
          let tr = state.tr.replaceWith(nodeStart, nodeEnd, [h1,allRefsContainer])
          view.dispatch(tr)
        }else{
          let tr = state.tr.replaceWith(nodeStart, nodeEnd, refContainerNode)
          view.dispatch(tr)
        }
      }
  }
}
