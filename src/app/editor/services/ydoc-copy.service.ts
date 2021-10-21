import { Component, Injectable, OnInit } from '@angular/core';
import * as Y from 'yjs';

import { Subject } from 'rxjs';

import { uuidv4 } from "lib0/random";
import { editorData, titleContent, sectionContent, taxonomicCoverageContentData, articleSection, taxa } from '../utils/interfaces/articleSection';

import { articleBasicStructure, editorFactory } from '../utils/articleBasicStructure';
import { YdocService } from './ydoc.service';
import { AbstractType } from 'yjs';
import { ProsemirrorEditorsService } from './prosemirror-editors.service';
import { DOMParser } from 'prosemirror-model';
import { schema } from '../utils/schema';
//@ts-ignore
import { updateYFragment } from '../../y-prosemirror-src/plugins/sync-plugin.js';

@Injectable({
  providedIn: 'root'
})
export class YdocCopyService {

  ydoc = new Y.Doc();
  addEditorForDeleteSubject: Subject<string> = new Subject<string>();

  constructor(public ydocService: YdocService/* ,public prosemirrorEditorsService:ProsemirrorEditorsService */) {

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

  clearYdocCopy() {
    this.ydoc = new Y.Doc();
  }

  saveXmlFragmentWithId(id: string, saveId: string) { // id : id in the main ydoc   || saveId  :  id in the copy doc
    let xmlFragment = this.ydocService.ydoc.getXmlFragment(id);    // oldEditorXmlFragment
    let newxmlFragment = this.ydoc.getXmlFragment(saveId);
    console.log('dqwdqw');
    xmlFragment.delete(0,xmlFragment.length);
    //@ts-ignore
    xmlFragment.insert(0, newxmlFragment.toArray().map(item => item instanceof AbstractType ? item.clone() : item));
    
    /* let html1 = '<div contenteditable="true" translate="no" class="ProseMirror ProseMirror-example-setup-style"><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">eewEEweqweEQWEEEwwweqEE</p><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qweqqwe;  idqweeqweqwe  </p><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">wewqeqwe</p><input_container1 data-input-id=""><input_label style="color:gray" contenteditable="false">label</input_label><input_placeholder style="border:1px solid black;margin-left:3px;margin-right:3px">placeholder</input_placeholder></input_container1><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qw</p><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">eeewEEweqweEQ<span class="comment" data-id="4191f684-092c-486a-ad11-63f97b3e690f" data-conversation="[]" data-viewid="" data-group="">WEEEw</span>;  idqweeqweqwe</p><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid=""><span class="comment" data-id="4191f684-092c-486a-ad11-63f97b3e690f" data-conversation="[]" data-viewid="" data-group="">wwe</span>qEEqwe</p><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qweq</p><input_container1 data-input-id=""><input_label style="color:gray" contenteditable="false">label</input_label><input_placeholder style="border:1px solid black;margin-left:3px;margin-right:3px">placeholder</input_placeholder></input_container1><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">;  idq</p><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">wewqeqwe</p><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">labelplaceholdereewEEweqweEQWEEEwwweqEE</p><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qweq</p><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">wewqeqwe</p><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">labelplaceholder</p><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qw</p><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">e</p><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">qw</p><p class="set-align-left" data-id="" data-track="[]" data-group="" data-viewid="">e</p></div>'
    let templDiv = document.createElement('div')
    templDiv.innerHTML = html
    let node = DOMParser.fromSchema(schema).parse(templDiv.firstChild!);
    console.log(node);
    updateYFragment(xmlFragment.doc, xmlFragment, node, new Map()); */
  }

  saveEditedSection(sectionBeforeUpdate: articleSection, sectionAfterUpdate: articleSection) {
    //let data: articleSection = JSON.parse(JSON.stringify(section));

    sectionBeforeUpdate.mode = 'documentMode'
    let updateEditorWithId = (editorDataBefore: editorData, editorDataAfter: editorData, editorMeta?: any) => {
      let oldEditorId = editorDataBefore.editorId
      let newEditorId = editorDataAfter.editorId;
      editorMeta ? editorDataBefore.editorMeta = editorMeta : editorMeta
      this.saveXmlFragmentWithId(oldEditorId, newEditorId);
    }
    let updateContent = (contentBefore: titleContent | sectionContent, contentAfter: titleContent | sectionContent) => {
      if (contentBefore.type == 'editorContentType') {
        updateEditorWithId(contentBefore.contentData as editorData, contentAfter.contentData as editorData)
      } else if (contentBefore.type == 'taxonomicCoverageContentType') {
        let taxonomicContentDataBefore = contentBefore.contentData as taxonomicCoverageContentData
        let taxonomicContentDataAfter = contentAfter.contentData as taxonomicCoverageContentData
        updateEditorWithId(taxonomicContentDataBefore.description, taxonomicContentDataAfter.description)
        taxonomicContentDataAfter.taxaArray.forEach((el, i, arr) => {
          if (!taxonomicContentDataBefore.taxaArray[i]) {
            taxonomicContentDataBefore.taxaArray[i] = {
              scietificName: editorFactory({ placeHolder: 'ScientificName...', label: 'Scientific name' }),
              commonName: editorFactory({ placeHolder: 'CommonName...', label: 'Common name' }),
              rank: { options: ['kingdom', 'genus', 'genus2'] }
            }
          }
          updateEditorWithId(taxonomicContentDataBefore.taxaArray[i].commonName, arr[i].commonName, { placeHolder: 'Common name...' })
          updateEditorWithId(taxonomicContentDataBefore.taxaArray[i].scietificName, arr[i].scietificName, { placeHolder: 'Scientific name...' })
          taxonomicContentDataBefore.taxaArray[i].rank.defaulValue = arr[i].rank.defaulValue
        })
        let newTaxaArray: taxa[] = []
        taxonomicContentDataBefore.taxaArray.forEach((el, i, arr) => {
          if (taxonomicContentDataAfter.taxaArray[i]) {
            newTaxaArray.push(el)
          } else {
            this.addEditorForDeleteSubject.next(el.commonName.editorId)
            this.addEditorForDeleteSubject.next(el.scietificName.editorId)

          }
        })
        taxonomicContentDataBefore.taxaArray = newTaxaArray
      }
    }
    updateContent(sectionBeforeUpdate.title, sectionAfterUpdate.title)
    updateContent(sectionBeforeUpdate.sectionContent, sectionAfterUpdate.sectionContent)

    this.ydocService.updateSection(sectionBeforeUpdate)
  }
}
