import { Injectable } from '@angular/core';
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Subject } from 'rxjs';
import { ServiceShare } from '../services/service-share.service';
import { schema } from '../utils/Schema';

@Injectable({
  providedIn: 'root'
})
export class TaxonService {
  taxonPlugin:Plugin
  taxonPluginKey = new PluginKey('taxonPlugin');

  canTagSelectionSubject = new Subject<boolean>()
  tagCreateData?:{view:EditorView}

  constructor(
    private serviceShare:ServiceShare
  ) {
    this.serviceShare.shareSelf('TaxonService',this)
    this.taxonPlugin = new Plugin({
      key: this.taxonPluginKey,
      state: {
        init: (_:any, state) => {
          let getPluginData:()=>{ sectionName: string ,view:undefined|EditorView} = ()=>{
            return { sectionName: _.sectionName ,view:undefined}
          }
          return getPluginData();
        },
        apply:(tr, prev, oldState, newState) =>{
          if(!prev.view){
            if(serviceShare.ProsemirrorEditorsService.editorContainers[prev.sectionName]){
              prev.view = serviceShare.ProsemirrorEditorsService.editorContainers[prev.sectionName].editorView
            }
          }
          if(
            tr.selection instanceof TextSelection &&
            !tr.selection.empty &&
            prev.view &&
            prev.view.hasFocus()
          ){
            this.canTagSelectionSubject.next(true);
            this.tagCreateData = {
              view:prev.view
            }
          }else if(prev.view.hasFocus()){
            this.canTagSelectionSubject.next(false);
            this.tagCreateData = undefined
          }
          return prev
        },
      },
      view: function () {
        return {
          update: (view, prevState) => {},
          destroy: () => { }
        }
      },
    });
  }

  getPlugin(){
    return this.taxonPlugin;
  }

  tagText(allOccurrence:boolean){
    if(allOccurrence){
      this.tagAllOccurrenceOfTextInCurrSelection()
    }else{
      this.tagOnlyTextInCurrSelection()
    }
  }

  tagOnlyTextInCurrSelection(){
    console.log('tagOnlyTextInCurrSelection');
    if(this.tagCreateData){
      let {from,to} = this.tagCreateData.view.state.selection
      let text = this.tagCreateData.view.state.doc.textBetween(from,to);
      this.tagCreateData.view.dispatch(this.tagCreateData.view.state.tr.addMark(from,to,schema.mark('taxon',{
        taxmarkid: 1,
        taxonid: 2,
        removedtaxon: false,
      })))
    }
  }

  tagAllOccurrenceOfTextInCurrSelection(){
    console.log('tagAllOccurrenceOfTextInCurrSelection');

  }
}
