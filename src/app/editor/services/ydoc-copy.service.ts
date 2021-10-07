import { Component, Injectable, OnInit } from '@angular/core';
import * as Y from 'yjs';
import { WebrtcConn, WebrtcProvider as OriginalWebRtc, } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import { YXmlFragment } from 'yjs/dist/src/types/YXmlFragment';
import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import * as awarenessProtocol from 'y-protocols/awareness.js';
import * as random from 'lib0/random.js';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { fromEvent, race } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
//@ts-ignore
import { WebrtcProvider } from '../utils/y-webrtc/index.js';
import { sectionNode } from '../utils/interfaces/section-node'
import { editorContainer } from '../utils/interfaces/editor-container'
import { Subject } from 'rxjs';
import { ydocData } from '../utils/interfaces/ydocData';
import { YMap } from 'yjs/dist/src/internals';
import { treeNode } from '../utils/interfaces/treeNode';
import { uuidv4 } from "lib0/random";
import { editorData, titleContent, sectionContent, taxonomicCoverageContentData, articleSection, taxa } from '../utils/interfaces/articleSection';

import { articleBasicStructure, editorFactory } from '../utils/articleBasicStructure';
import { YdocService } from './ydoc.service';
import { AbstractType } from 'yjs';

@Injectable({
  providedIn: 'root'
})
export class YdocCopyService {

  ydoc = new Y.Doc();

  constructor(public ydocService: YdocService) {
    
  }

  copyXmlFragmentWithId(id: string): string {
    let newEditorId = uuidv4()
    let oldXmlFragment = this.ydocService.ydoc.getXmlFragment(id);    // oldEditorXmlFragment
    let newXmlFragment = this.ydoc.getXmlFragment(newEditorId);
    //@ts-ignore
    newXmlFragment.insert(0, oldXmlFragment.toArray().map(item => item instanceof AbstractType ? item.clone() : item));
    //this.prosemirrorService.renderEditorIn(this.editor?.nativeElement,this.newValue.contentData)
    return newEditorId

  }

  saveXmlFragmentWithId(id:string,saveId:string){ // id : id in the main ydoc   || saveId  :  id in the copy doc
    let xmlFragment = this.ydocService.ydoc.getXmlFragment(id);    // oldEditorXmlFragment
    let newxmlFragment = this.ydoc.getXmlFragment(saveId);

    xmlFragment.delete(0,xmlFragment.length);
    //@ts-ignore
    xmlFragment.insert(0, newxmlFragment.toArray().map(item => item instanceof AbstractType ? item.clone() : item));
  }

  saveEditedSection(sectionBeforeUpdate:articleSection,sectionAfterUpdate:articleSection){
    //let data: articleSection = JSON.parse(JSON.stringify(section));

    sectionBeforeUpdate.mode = 'documentMode'
    let updateEditorWithId = (editorDataBefore: editorData,editorDataAfter: editorData) => {
      let oldEditorId = editorDataBefore.editorId
      let newEditorId = editorDataAfter.editorId;
      this.saveXmlFragmentWithId(oldEditorId,newEditorId);
    }
    let updateContent = (contentBefore: titleContent | sectionContent,contentAfter: titleContent | sectionContent) => {
      if (contentBefore.type == 'editorContentType') {
        updateEditorWithId(contentBefore.contentData as editorData,contentAfter.contentData as editorData)
      } else if (contentBefore.type == 'taxonomicCoverageContentType') {
        let taxonomicContentDataBefore = contentBefore.contentData as taxonomicCoverageContentData
        let taxonomicContentDataAfter = contentAfter.contentData as taxonomicCoverageContentData
        updateEditorWithId(taxonomicContentDataBefore.description,taxonomicContentDataAfter.description)
        console.log(taxonomicContentDataAfter.taxaArray);
        taxonomicContentDataAfter.taxaArray.forEach((el, i, arr) => {
          if(!taxonomicContentDataBefore.taxaArray[i]){
            taxonomicContentDataBefore.taxaArray[i] = {
              scietificName:editorFactory({placeHolder:'ScietificName...',label:'Scietific name'}),
              commonName:editorFactory({placeHolder:'CommonName...',label:'Common name'}),
              rank:{options:['kingdom','genus','genus2']}
            }
          }
          updateEditorWithId(taxonomicContentDataBefore.taxaArray[i].commonName,arr[i].commonName)
          updateEditorWithId(taxonomicContentDataBefore.taxaArray[i].scietificName,arr[i].scietificName)
        })
        let newTaxaArray:taxa[] = []
        taxonomicContentDataBefore.taxaArray.forEach((el, i, arr) => {
          if(taxonomicContentDataAfter.taxaArray[i]){
            newTaxaArray.push(el)
          }
        })
        taxonomicContentDataBefore.taxaArray = newTaxaArray
      }
    }
    updateContent(sectionBeforeUpdate.title,sectionAfterUpdate.title)
    updateContent(sectionBeforeUpdate.sectionContent,sectionAfterUpdate.sectionContent)

    this.ydocService.updateSection(sectionBeforeUpdate)
  }
}
