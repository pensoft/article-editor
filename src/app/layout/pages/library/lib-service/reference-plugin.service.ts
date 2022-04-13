import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { schema } from '@app/editor/utils/Schema';
import { EditorView } from '@codemirror/basic-setup';
import { PluginKey, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

@Injectable({
  providedIn: 'root'
})
export class ReferencePluginService {
  referencePluginKey?: PluginKey;
  referencePlugin?: Plugin
  refsObj: any = {}
  decorationsByEditors:any = {}
  constructor(
    private serviceShare: ServiceShare
  ) {
    serviceShare.shareSelf('ReferencePluginService', this);
    let referencePluginKey = new PluginKey('referencePluginKey');
    this.referencePluginKey = referencePluginKey;
    let refsObj = this.refsObj;
    let updateRef = this.updateReference
    let decorationsByEditors = this.decorationsByEditors
    this.referencePlugin = new Plugin({
      key: referencePluginKey,
      state: {
        init: (_, state) => {
          return { sectionName: _.sectionName };
        },
        apply(tr, prev, editorState, newState) {
          let decs: Decoration[] = [];
          if (refsObj.refs) {
            let docSize = editorState.doc.content.size
            editorState.doc.nodesBetween(0, docSize - 1, (node, pos, parent, index) => {
              if (node.type.name == 'reference_citation') {
                let nodeRefData = node.attrs.referenceData;
                let nodeStyleData = node.attrs.referenceStyle;
                let actualRef = refsObj.refs.find((ref: any) => {
                  return ref.refData.referenceData.id == nodeRefData.refId
                })
                if (actualRef &&
                  actualRef.refData.last_modified > nodeRefData.last_modified) {
                    decs.push(Decoration.widget(pos, (view) => {
                    let button = document.createElement('button')
                    button.className = 'update-data-reference-button';
                    button.addEventListener('click', () => {
                      console.log('resetReference', pos,prev.sectionName);
                      updateRef(pos,node.nodeSize,prev.sectionName)
                    })
                    button.style.cursor = 'pointer'
                    button.title = 'This reference citation is outdated. Click this button to refresh it.'
                    button.innerHTML = '&#x21bb;'
                    return button
                  }))

                }
              }
            })
          }
          if(decs.length>0){
            prev.decs = decs;
            return {...prev}
          }
          return prev
        },
      },
      props: {
        decorations(state) {
          console.log(referencePluginKey.getState(state).decs);
          let docs = referencePluginKey.getState(state).decs?referencePluginKey.getState(state).decs.filter((dec:any)=>dec):undefined;
          return docs&&docs.length>0? DecorationSet.create(state.doc, referencePluginKey.getState(state).decs) : DecorationSet.empty;
        }
      },
      view: function () {
        return {
          update: (view, prevState) => {
          },
          destroy: () => { }
        }
      }
    });
  }

  updateReference = (refPos:number,refSize:number,sectionID:string)=>{
    let view = this.serviceShare.ProsemirrorEditorsService?.editorContainers[sectionID].editorView;
    let refNode = view?.state.doc.nodeAt(refPos);
    let refData = refNode?.attrs.referenceData;
    let refStyle = refNode?.attrs.referenceStyle;
    let refType = refNode?.attrs.referenceType;
    let refs = this.refsObj.refs as any[];

    let actualRef = refs.find((ref)=>{
      return ref.refData.referenceData.id == refData.refId;
    })
    if(actualRef){
      let strObj = this.serviceShare.CslService?.genereteCitationStr(refStyle.name,actualRef.refData);
      let newAttrs = {...refNode?.attrs};
      newAttrs.referenceData.last_modified = actualRef.refData.last_modified;
      let divContainer = document.createElement('div');
      divContainer.innerHTML = strObj.bibliography[1][0]
      let newNode = schema.nodes.reference_citation.create(newAttrs,schema.text(divContainer.textContent!))
      view?.dispatch(view.state.tr.replaceWith(refPos,refPos+refSize,newNode))
    }
  }

  setRefs(refs: any[]) {
    this.refsObj.refs = refs;
  }
}
