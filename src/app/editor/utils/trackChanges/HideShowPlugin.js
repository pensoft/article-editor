/* eslint-disable */

import { EditorState, Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import { DocumentHelpers } from 'wax-prosemirror-utilities';
import { acceptChange,rejectChange } from './acceptReject.js'

const hideShowPluginKey = new PluginKey('hideShowPlugin');

const getTrackChanges = state => {
  const finalTracks = [];
  const allInlineNodes = DocumentHelpers.findInlineNodes(state.doc);

  allInlineNodes.map(node => {
    if (node.node.marks.length > 0) {
      node.node.marks.filter(mark => {
        
        if (
          mark.type.name === 'insertion' ||
          mark.type.name === 'deletion' ||
          mark.type.name === 'format_change'
        ) {
          mark.pos = node.pos;
          finalTracks.push(mark);
        }
      });
    }
  });
  return finalTracks;
};

let showChanges = true;
let changesContainer = document.createElement('div')

function createChangeDiv(result, position, type, doc,view) {
  let changeDiv = document.createElement('div');
  changeDiv.setAttribute('class', 'change-div');
  let propertiesDiv = document.createElement('div');
  propertiesDiv.setAttribute('class', 'change-properties-div');
  propertiesDiv.textContent =
    `Change type:${result.attrs.class}      from:${position.from}      to:${position.to}      user:${result.attrs.username}      userID:${result.attrs.user}`;
  let changeContentDiv = document.createElement('div');
  let changeContent = doc.textBetween(position.from, position.to);
  changeContentDiv.setAttribute('class', 'change-content-div');
  if(type == 'deletion'){
    changeContentDiv.setAttribute('style', 'color: #f08989;text-decoration: line-through black;');
  }else if(type == 'insertion'){
    changeContentDiv.setAttribute('style', 'background-color: #72e090;width: fit-content;');
  }
  else if(type == 'format_change'){
    changeContentDiv.setAttribute('style', 'border-bottom: 2px solid royalblue;width: fit-content;');
  }

  changeContentDiv.textContent = changeContent
  let hr = document.createElement('hr');
  hr.setAttribute('class', 'change-hr');

  let btnsDiv = document.createElement('div');
  btnsDiv.setAttribute('class', 'change-btns-div');

  let acceptBtn = document.createElement('button');
  acceptBtn.setAttribute('class', 'change-accept-btn-div');
  acceptBtn.textContent = 'Accept';
  acceptBtn.addEventListener('click',()=>{acceptChange(view,position)});

  let rejectBtn = document.createElement('button');
  rejectBtn.setAttribute('class', 'change-reject-btn-div');
  rejectBtn.textContent = 'Reject';
  rejectBtn.addEventListener('click',()=>{rejectChange(view,position)});


  btnsDiv.append(acceptBtn, rejectBtn)

  changeDiv.append(propertiesDiv, hr, changeContentDiv, btnsDiv);
  changesContainer.appendChild(changeDiv);
}

export const hideShowPlugin = (changesContainerRef) => {
  if (changesContainerRef != undefined && changesContainer != changesContainerRef) {
    changesContainer = changesContainerRef
  }
  return new Plugin({
    key: hideShowPluginKey,
    state: {
      init: (_, state) => {
        return DecorationSet.empty;
      },
      apply(tr, prev, _, newState) {
        //changesContainer.innerHTML = '';
        let decorations;
        let createdDecorations = DecorationSet.empty;
        const allMatches = getTrackChanges(newState);
        if (allMatches.length > 0 && !showChanges) {

          decorations = allMatches.map((result, index) => {



            if (result.type.name === 'insertion') {
              const position = DocumentHelpers.findMarkPosition(
                newState,
                result.pos,
                'insertion',
              );
              //createChangeDiv(result, position, result.type.name, tr.doc)
              return Decoration.inline(position.from, position.to, {
                class: 'show-insertion',
              });
            }
            if (result.type.name === 'deletion') {
              const position = DocumentHelpers.findMarkPosition(
                newState,
                result.pos,
                'deletion',
              );
              //createChangeDiv(result, position, result.type.name, tr.doc)
              return Decoration.inline(position.from, position.to, {
                class: 'hide-deletion',
              });
            }
          });
          decorations = decorations.filter((dec)=>dec!==undefined)
          if(decorations.length){
            createdDecorations = DecorationSet.create(newState.doc, decorations);
          }else{
            createdDecorations = DecorationSet.empty
          }
        }
        return {
          createdDecorations,
          allMatches,
        };
      },
    },
    props: {
      decorations: state => {
        const hideShowPluginState = state && hideShowPluginKey.getState(state);
        return hideShowPluginState.createdDecorations;
      },
      setHideShow: show => {
        showHide = true;
        //showHide = show;
      },
    },
    view: (editorView) => {
      return {
        update: (view, prevState) => {
          if(!editorView.hasFocus()){
            return
          }
          changesContainer.innerHTML = '';
          let decorations;
          const allMatches = getTrackChanges(editorView.state);
          if (allMatches.length > 0 && showHide) {

            allMatches.map((result, index) => {
              if (result.type.name === 'insertion') {
                const position = DocumentHelpers.findMarkPosition(
                  editorView.state,
                  result.pos,
                  'insertion',
                );
                createChangeDiv(result, position, result.type.name, editorView.state.doc,editorView)
              }
              if (result.type.name === 'deletion') {
                const position = DocumentHelpers.findMarkPosition(
                  editorView.state,
                  result.pos,
                  'deletion',
                );
                createChangeDiv(result, position, result.type.name, editorView.state.doc,editorView)
              }
              if (result.type.name === 'format_change') {
                const position = DocumentHelpers.findMarkPosition(
                  editorView.state,
                  result.pos,
                  'format_change',
                );
                createChangeDiv(result, position, result.type.name, editorView.state.doc,editorView)
              }
            });

          }

        },
        destroy: () => {

        }
      }
    }
  });
}