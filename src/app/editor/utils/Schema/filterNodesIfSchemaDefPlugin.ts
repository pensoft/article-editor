import { ServiceShare } from "@app/editor/services/service-share.service";
import { DOMParser, DOMSerializer, Fragment, ResolvedPos, Schema, Slice } from "prosemirror-model";
import { PluginKey ,Plugin, TextSelection, Transaction, EditorState} from "prosemirror-state";
import {schema} from './index';
export let filterNodesBySchemaDefPluginKey = new PluginKey('filterNodesOnPaste');

let getAttrValueIfAnyAtPos = (resolvedPos:ResolvedPos,attrName : string) => {
  //@ts-ignore
  let path = resolvedPos.path as any[]
  let attr = undefined
  for(let i = path.length-3;i>-1;i-=3){
    if(!attr){
      let node = path[i];
      if(node.attrs[attrName] && node.attrs[attrName].length>0){
        attr = node.attrs[attrName]
      }
    }
  }
  return attr
}

export let FullSchemaDOMPMSerializer = DOMSerializer.fromSchema(schema)
export let FullSchemaDOMPMParser = DOMParser.fromSchema(schema)

export let getFilterNodesBySchemaDefPlugin = (serviceShare:ServiceShare,schemaDefs:{nodes:any,marks:any})=>{


    let menusAndSchemasDefs = serviceShare.YdocService.PMMenusAndSchemasDefsMap?.get('menusAndSchemasDefs');

    let DOMParsersAndSerializersBySchemaKeys:{[key:string]:{domSerializer:DOMSerializer,domParser:DOMParser}} = {}

    let getDOMParserAndSerializerForSchema = (editorSchemaDEFKey:string,sectionID:string)=>{
      let nodeSchemaParser
      let nodeSchemaSerializer
      if(DOMParsersAndSerializersBySchemaKeys[editorSchemaDEFKey]){
        nodeSchemaParser = DOMParsersAndSerializersBySchemaKeys[editorSchemaDEFKey].domParser
        nodeSchemaSerializer = DOMParsersAndSerializersBySchemaKeys[editorSchemaDEFKey].domSerializer
      }else{
        //@ts-ignore
        let importantSchemaDefsForSection =  {
          ...(menusAndSchemasDefs['layoutDefinitions']||{schemas:{}}).schemas,
          ...(menusAndSchemasDefs[sectionID]||{schemas:{}}).schemas
        }
        let schemaDefForNode = importantSchemaDefsForSection[editorSchemaDEFKey];
        let nodeSchema = serviceShare.ProsemirrorEditorsService.buildSchemaFromKeysDef(schemaDefForNode);
        nodeSchemaParser = DOMParser.fromSchema(nodeSchema)
        nodeSchemaSerializer = DOMSerializer.fromSchema(nodeSchema);
        DOMParsersAndSerializersBySchemaKeys[editorSchemaDEFKey] = {
          domParser:nodeSchemaParser,
          domSerializer:nodeSchemaSerializer
        }
      }
      return {nodeSchemaParser,nodeSchemaSerializer}
    }

    /* function removeStyling(slice:Slice){
      let dom = FullSchemaDOMPMSerializer.serializeFragment(slice.content);
      let container = document.createElement('div');
      container.style.whiteSpace = 'pre-wrap'
      let container1 = document.createElement('div');
      container1.style.whiteSpace = 'pre-wrap'

      if(dom instanceof DocumentFragment){
        container.append(...Array.from(dom.children))
      }else{
        container.append(dom);
      }
      let htmlWithNoStyle = container.innerHTML.replace(/ /gm,'&nbsp;')
      htmlWithNoStyle = htmlWithNoStyle.replace(/style="[^"]+"/gm,'style=""');
      htmlWithNoStyle = htmlWithNoStyle.replace(/class="[^"]+"/gm,'class=""');
      container1.innerHTML = "<form-field>"+htmlWithNoStyle+"</form-field>"
      let newSlice = FullSchemaDOMPMParser.parse(container1);
      //@ts-ignore
      slice.content = newSlice.content.content[0].content
    } */

    let getFilteredSlice = (slice:Slice,editorSchemaDEFKey,sectionID:string) => {
      let pastedSliceDOMInitial = FullSchemaDOMPMSerializer.serializeFragment(slice.content);
      let container = document.createElement('div');
      if(pastedSliceDOMInitial instanceof HTMLElement){
        container.append(pastedSliceDOMInitial)
      }else if(pastedSliceDOMInitial instanceof DocumentFragment){
        container.append(...Array.from(pastedSliceDOMInitial.childNodes));
      }
      let pastedDomHTMLStr = container.innerHTML;
      //let htmlWithNoStyle = pastedDomHTMLStr.replace(/ /gm,'&nbsp;')
      let htmlWithNoStyle = pastedDomHTMLStr.replace(/style="[^"]+"/gm,'style=""');
      htmlWithNoStyle = htmlWithNoStyle.replace(/class="[^"]+"/gm,'class=""');
      htmlWithNoStyle.match(/>[^<]+</gm).forEach((val)=>{
        htmlWithNoStyle = htmlWithNoStyle.replace(val,val.replace(/ /gm,'&nbsp;'));
      })
      let newDocFr = document.createDocumentFragment();
      let container1= document.createElement('div');

      container1.innerHTML = htmlWithNoStyle;
      newDocFr.append(...Array.from(container1.childNodes));
      //@ts-ignore
      let {nodeSchemaParser,nodeSchemaSerializer} = getDOMParserAndSerializerForSchema(editorSchemaDEFKey,sectionID);

      let cleanedSlice = nodeSchemaParser.parseSlice(newDocFr)
      let srializedCleanStruct = nodeSchemaSerializer.serializeFragment(cleanedSlice.content);

      let newSlice = FullSchemaDOMPMParser.parseSlice(srializedCleanStruct)
      return newSlice
    }

    let filterNodesBySchemaDefPlugin = new Plugin({
      key:filterNodesBySchemaDefPluginKey,
      props:{
        handlePaste:(view,event,slice)=>{
          //@ts-ignore
          if(view.editorType == 'editorWithCustomSchema'){
            let { from, to } = view.state.selection
            let editorSchemaDEFKey
            let allowedTagsOnNode
            let lastFormControlName
            view.state.doc.nodesBetween(from, to, (node, pos, parent, index) => {
              if (node.attrs.allowedTags && node.attrs.allowedTags !== '') {
                allowedTagsOnNode = node.attrs.allowedTags;
              }
              if(node.attrs.formControlName&&node.attrs.formControlName.length>0){
                lastFormControlName = node.attrs.formControlName;
              }
            })
            if(
              !allowedTagsOnNode&&
              lastFormControlName&&
              //@ts-ignore
              view.globalMenusAndSchemasSectionsDefs[view.sectionID]&&
              //@ts-ignore
              view.globalMenusAndSchemasSectionsDefs[view.sectionID][lastFormControlName]
            ){
              //@ts-ignore
              let formIOJSONDefs = view.globalMenusAndSchemasSectionsDefs[view.sectionID][lastFormControlName];
              editorSchemaDEFKey = formIOJSONDefs.schema
            }else if(allowedTagsOnNode){
              editorSchemaDEFKey = allowedTagsOnNode
            }
            if(editorSchemaDEFKey){
              //@ts-ignore
              let newSlice = getFilteredSlice(slice,editorSchemaDEFKey,view.sectionID)
              view.dispatch(view.state.tr.replaceRange(from,to,newSlice))
              return true;
            }
          }
          return false;
        },
        handleDrop:(view,event,slice,moved)=>{
          // moved = true => condent is only draged , moved = false => condent is draged with copy
          // when changing the transaction meta["uiEvent"] == 'drop' should be added to the meta
          let posOfDrop = view.posAtCoords({left:event.x,top:event.y});
          //@ts-ignore
          let closestAllowedTags = getAttrValueIfAnyAtPos(view.state.doc.resolve(posOfDrop.pos),'allowedTags')
          let closestFormControlNameType = getAttrValueIfAnyAtPos(view.state.doc.resolve(posOfDrop.pos),'formControlName')

          let editorSchemaDEFKey
          if(closestAllowedTags){ // if there is a parent node with allowedtags attr then we use that one
            editorSchemaDEFKey = closestAllowedTags
          }else if(closestFormControlNameType){
            //@ts-ignore
            let formIOJSONDefs = view.globalMenusAndSchemasSectionsDefs[view.sectionID][closestFormControlNameType];
            editorSchemaDEFKey = formIOJSONDefs.schema
          }
          if(editorSchemaDEFKey){
            //@ts-ignore
            let newSlice = getFilteredSlice(slice,editorSchemaDEFKey,view.sectionID)
            let state = view.state
            let newTr = state.tr
            if(moved){
              let {from,to} = state.selection
              let removeTr = newTr.replaceWith(from,to,Fragment.empty).setMeta('uiEvent','drop');
              let mappedNewDropPos = removeTr.mapping.map(posOfDrop.pos)
              let dropTr = removeTr.replaceRange(mappedNewDropPos,mappedNewDropPos,newSlice);
              view.dispatch(dropTr)
            }else{
              let dropTr = newTr.replaceRange(posOfDrop.pos,posOfDrop.pos,newSlice).setMeta('uiEvent','drop');
              view.dispatch(dropTr)
            }
            return true;
          }
          return false
        }
      }
    })
    return filterNodesBySchemaDefPlugin
}
