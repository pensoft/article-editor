import { Injectable } from '@angular/core';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { createCustomIcon } from '@app/editor/utils/menu/common-methods';
import { schema } from '@app/editor/utils/Schema';
import { EditorView } from '@codemirror/basic-setup';
import { timeStamp } from 'console';
import { PluginKey, Plugin } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';

@Injectable({
  providedIn: 'root'
})
export class ReferencePluginService {
  referencePluginKey?: PluginKey;
  referencePlugin?: Plugin
  refsObj: any = {}
  decorationsByEditors: any = {}
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
              if (node.type.name == 'reference_citation_end'&&node.attrs.refInstance == 'local') {
                let nodeRefData = node.attrs.referenceData;
                let nodeStyleData = node.attrs.referenceStyle;
                let actualRef = refsObj.refs.find((ref: any) => {
                  return ref.refData.referenceData.id == nodeRefData.refId
                })

                let buttonContainer = document.createElement('div');

                buttonContainer.className = 'reference-citation-pm-buttons';

                if (
                  actualRef &&
                  actualRef.refData.last_modified > nodeRefData.last_modified) {
                  let button = document.createElement('button')
                  button.className = 'update-data-reference-button';
                  button.addEventListener('click', () => {
                    updateRef(pos, node.nodeSize, prev.sectionName)
                  })
                  button.style.cursor = 'pointer'
                  button.title = 'This reference citation is outdated. Click this button to refresh it.'
                  let img = createCustomIcon('refresh_google.svg', 12, 12, 0, 1.5, 1.3)
                  img.dom.className = 'update-data-reference-img'
                  button.append(img.dom)
                  buttonContainer.append(button);
                }
                let nodeStart = pos;
                let nodeEnd = node.nodeSize+ pos;
                if ((
                  editorState.selection.from>=nodeStart&&editorState.selection.from<=nodeEnd
                )||(
                  editorState.selection.to>=nodeStart&&editorState.selection.to<=nodeEnd
                )) {
                  let button1 = document.createElement('button')
                  button1.className = 'update-data-reference-button';
                  button1.addEventListener('click', () => {
                    serviceShare.CslService!.editReferenceThroughPMEditor(node,prev.sectionName);
                  })
                  button1.style.cursor = 'pointer'
                  button1.title = 'Click this button to edit this reference.'
                  let img1 = createCustomIcon('edit2.svg', 12, 12, 1)
                  img1.dom.className = 'update-data-reference-img'
                  button1.append(img1.dom)
                  buttonContainer.append(button1);
                }
                if (buttonContainer.childNodes.length > 0) {
                  decs.push(Decoration.widget(pos, (view) => {
                    return buttonContainer
                  }))
                }
              }else if(node.type.name == 'reference_citation_end'&&node.attrs.refInstance == 'external'){
                let nodeRefData = node.attrs.referenceData;

                let buttonContainer = document.createElement('div');
                buttonContainer.className = 'reference-citation-pm-buttons';

                let nodeStart = pos;
                let nodeEnd = node.nodeSize+ pos;
                if ((
                  editorState.selection.from>=nodeStart&&editorState.selection.from<=nodeEnd
                )||(
                  editorState.selection.to>=nodeStart&&editorState.selection.to<=nodeEnd
                )) {
                  let button1 = document.createElement('button')
                  button1.className = 'update-data-reference-button';
                  button1.addEventListener('click', () => {
                    serviceShare.CslService!.editReferenceThroughPMEditor(node,prev.sectionName);
                  })
                  button1.style.cursor = 'pointer'
                  button1.title = 'Click this button to edit this reference.'
                  let img1 = createCustomIcon('edit2.svg', 12, 12, 1)
                  img1.dom.className = 'update-data-reference-img'
                  button1.append(img1.dom)
                  buttonContainer.append(button1);
                }
                if (buttonContainer.childNodes.length > 0) {
                  decs.push(Decoration.widget(pos, (view) => {
                    return buttonContainer
                  }))
                }
              }
            })
          }
          if (decs.length > 0) {
            prev.decs = decs;
            return { ...prev }
          }
          return prev
        },
      },
      props: {
        decorations(state) {
          let docs = referencePluginKey.getState(state).decs ? referencePluginKey.getState(state).decs.filter((dec: any) => dec) : undefined;
          return docs && docs.length > 0 ? DecorationSet.create(state.doc, referencePluginKey.getState(state).decs) : DecorationSet.empty;
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

  updateReference = (refPos: number, refSize: number, sectionID: string) => {
    let view = this.serviceShare.ProsemirrorEditorsService?.editorContainers[sectionID].editorView;
    let refNode = view?.state.doc.nodeAt(refPos);
    let refData = refNode?.attrs.referenceData;
    let refStyle = refNode?.attrs.referenceStyle;
    let refType = refNode?.attrs.referenceType;
    let refs = this.refsObj.refs as any[];

    let actualRef = refs.find((ref) => {
      return ref.refData.referenceData.id == refData.refId;
    })
    if (actualRef) {
      let strObj = this.serviceShare.CslService?.genereteCitationStr(refStyle.name, actualRef.refData.referenceData);
      let refInYdoc = this.serviceShare.EditorsRefsManagerService!.addReferenceToEditor({
        ref:actualRef,
        citation:strObj,
        refInstance: "local"
      })
      let newAttrs = JSON.parse(JSON.stringify(refNode?.attrs))
      newAttrs.referenceData.last_modified = actualRef.refData.last_modified;
      //newAttrs.referenceData = {refId:actualRef.refData.referenceData.id,last_modified:actualRef.refData.last_modified}
      let newNode = schema.nodes.reference_citation_end.create(newAttrs, schema.text(refInYdoc.bibliography))
      view?.dispatch(view.state.tr.replaceWith(refPos, refPos + refSize, newNode).setMeta('createNewHistoryGroup',true))
      setTimeout(() => {
        this.serviceShare.ProsemirrorEditorsService?.dispatchEmptyTransaction()
      }, 10)
    }
  }

  setRefs(refs: any[]) {
    this.refsObj.refs = refs;
  }
}
