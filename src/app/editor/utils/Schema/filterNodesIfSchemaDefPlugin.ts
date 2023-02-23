import { ServiceShare } from "@app/editor/services/service-share.service";
import { DOMParser as PMDomParser, DOMSerializer, Fragment, ResolvedPos, Schema, Slice } from "prosemirror-model";
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
export let FullSchemaDOMPMParser = PMDomParser.fromSchema(schema)

export let getFilterNodesBySchemaDefPlugin = (serviceShare:ServiceShare)=>{


    let menusAndSchemasDefs = serviceShare.YdocService.PMMenusAndSchemasDefsMap?.get('menusAndSchemasDefs');

    let DOMParsersAndSerializersBySchemaKeys:{[key:string]:{domSerializer:DOMSerializer,domParser:DOMParser}} = {}

    let getDOMParserAndSerializerForSchema = (editorSchemaDEFKey:string|undefined,sectionID:string)=>{
      if(!editorSchemaDEFKey){
        let nodeSchemaParser = FullSchemaDOMPMParser
        let nodeSchemaSerializer = FullSchemaDOMPMSerializer
        return {nodeSchemaParser,nodeSchemaSerializer}
      }
      let nodeSchemaParser
      let nodeSchemaSerializer
      if(DOMParsersAndSerializersBySchemaKeys[editorSchemaDEFKey]){
        nodeSchemaParser = DOMParsersAndSerializersBySchemaKeys[editorSchemaDEFKey].domParser
        nodeSchemaSerializer = DOMParsersAndSerializersBySchemaKeys[editorSchemaDEFKey].domSerializer
      }else{
        //@ts-ignore
        let importantSchemaDefsForSection =  {
          ...(menusAndSchemasDefs['layoutDefinitions']||{schemas:{}}).schemas,
          ...(menusAndSchemasDefs[sectionID]||{schemas:{}}).schemas,
          ...(menusAndSchemasDefs['citableElementMenusAndSchemaDefs'].allCitableElementsSchemas)
        }
        let schemaDefForNode = importantSchemaDefsForSection[editorSchemaDEFKey];
        let nodeSchema = schemaDefForNode?serviceShare.ProsemirrorEditorsService.buildSchemaFromKeysDef(schemaDefForNode):schema;
        if(!schemaDefForNode){
          console.error(`There is no schema def with this name ["${editorSchemaDEFKey}"]. Available schema defs are : ["${Object.keys(importantSchemaDefsForSection).join('","')}"]`)
        }
        nodeSchemaParser = PMDomParser.fromSchema(nodeSchema)
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
      /* container.style.whiteSpace = 'pre-wrap';
      container.setAttribute('style','white-space: pre-wrap;'); */
      if(pastedSliceDOMInitial instanceof HTMLElement){
        container.append(pastedSliceDOMInitial)
      }else if(pastedSliceDOMInitial instanceof DocumentFragment){
        container.append(...Array.from(pastedSliceDOMInitial.childNodes));
      }
      let pastedDomHTMLStr = container.innerHTML;
      //let htmlWithNoStyle = pastedDomHTMLStr.replace(/ /gm,'&nbsp;')
      let htmlWithNoStyle = pastedDomHTMLStr.replace(/style="[^"]+"/gm,'style=""');
      if(htmlWithNoStyle){
        htmlWithNoStyle = htmlWithNoStyle.replace(/class="[^"]+"/gm,'class=""');
      }
      let matches = htmlWithNoStyle.match(/>[^<]+</gm)
      if(matches){
        matches.forEach((val)=>{
          if(htmlWithNoStyle){
            //htmlWithNoStyle = htmlWithNoStyle.replace(val,val.replace(/ /gm,'&nbsp;'));
          }
        })
      }
     /*  container1.style.whiteSpace = 'pre-wrap';
      container1.setAttribute('style','white-space: pre-wrap;'); */
      const htmlString = '<my-custom-tag>   Hello,\n  World!   </my-custom-tag>';
      const parser = new DOMParser();

      // Define a custom DOMImplementation that allows any tags and preserves input string exactly as it was
      const customDOMImplementation = {
        createHTMLDocument: function(title) {
          const doc = document.implementation.createHTMLDocument(title);
          doc.documentElement.innerHTML = '';
          doc.createElement = function(tagName) {
            return doc.createElementNS('http://www.w3.org/1999/xhtml', tagName);
          };
          doc.createDocumentFragment = function() {
            return document.createDocumentFragment();
          };
          doc.createTextNode = function(data) {
            return document.createTextNode(data);
          };
          doc.createComment = function(data) {
            return document.createComment(data);
          };

          // Override the default textContent setter to preserve whitespace
          Object.defineProperty(doc.constructor.prototype, 'textContent', {
            set: function(text) {
              this.innerHTML = text.replace(/\r\n?/g, '\n').replace(/\n/g, '<br>');
            },
            configurable: true
          });

          return doc;
        }
      };

      // Use the custom DOMImplementation to parse the HTML string
      //@ts-ignore
      const doc = parser.parseFromString(htmlWithNoStyle, 'text/html', customDOMImplementation);

      // Output the resulting DOM tree to the console
      //@ts-ignore
      let {nodeSchemaParser,nodeSchemaSerializer} = getDOMParserAndSerializerForSchema(editorSchemaDEFKey,sectionID);

      let cleanedSlice = nodeSchemaParser.parseSlice(doc);
      let srializedCleanStruct = nodeSchemaSerializer.serializeFragment(cleanedSlice.content);
      let newSlice = FullSchemaDOMPMParser.parseSlice(srializedCleanStruct)
      return newSlice
    }

    let getFilteredSliceV2 = (slice:Slice) => {
      let nodeAttrsToClean = ['styling','invalid','background'];
      let start = 0 ;
      let end = slice.content.size
      slice.content.nodesBetween(start,end,(node,start,par,i)=>{
        let attrsKeys = Object.keys(node.attrs)
        if(attrsKeys.some(key=>nodeAttrsToClean.includes(key))){
          attrsKeys.forEach((key)=>{
            if(node.attrs[key] && nodeAttrsToClean.includes(key)){
              //@ts-ignore
              node.attrs[key] = ""
            }
          })
        }
      })
      return slice
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
              view.globalMenusAndSchemasSectionsDefs&&
              //@ts-ignore
              view.globalMenusAndSchemasSectionsDefs[view.sectionID]&&
              //@ts-ignore
              view.globalMenusAndSchemasSectionsDefs[view.sectionID][lastFormControlName]&&
              //@ts-ignore
              view.globalMenusAndSchemasSectionsDefs[view.sectionID][lastFormControlName].schema
            ){
              //@ts-ignore
              let formIOJSONDefs = view.globalMenusAndSchemasSectionsDefs[view.sectionID][lastFormControlName];
              editorSchemaDEFKey = formIOJSONDefs.schema
            }else if(
              !allowedTagsOnNode&&
              lastFormControlName&&
              //@ts-ignore
              view.citableElementMenusAndSchemaDefs&&
              //@ts-ignore
              view.citableElementMenusAndSchemaDefs.allCitableElementsSchemas&&
              //@ts-ignore
              view.citableElementMenusAndSchemaDefs.allCitableElementsSchemas[lastFormControlName]&&
              //@ts-ignore
              view.citableElementMenusAndSchemaDefs.allCitableElementsSchemas[lastFormControlName].schema
            ){
              //@ts-ignore
              editorSchemaDEFKey = view.citableElementMenusAndSchemaDefs.allCitableElementsSchemas[lastFormControlName].schema
            }else if(allowedTagsOnNode){
              editorSchemaDEFKey = allowedTagsOnNode
            }

            if(editorSchemaDEFKey){
              //@ts-ignore
              let newSlice = getFilteredSliceV2(slice,editorSchemaDEFKey,view.sectionID)
              view.dispatch(view.state.tr.replace(from,to,newSlice))
              return true;
            }else{
              //@ts-ignore
              let newSlice = getFilteredSliceV2(slice,undefined,view.sectionID)
              view.dispatch(view.state.tr.replace(from,to,newSlice))
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
            let newSlice = getFilteredSliceV2(slice,editorSchemaDEFKey,view.sectionID)

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
