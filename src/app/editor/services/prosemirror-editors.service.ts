import {Injectable} from '@angular/core';
import * as Y from 'yjs';
import {WebrtcProvider} from 'y-webrtc';
import {ColorDef} from 'y-prosemirror/dist/src/plugins/sync-plugin';
import {editorContainer} from '../utils/interfaces/editor-container';
import * as random from 'lib0/random.js';
import * as userSpec from '../utils/userSpec';
//@ts-ignore
import {buildMenuItems, exampleSetup} from '../utils/prosemirror-example-setup-master/src/index.js';
import {schema} from '../utils/schema';
import {
  insertMathCmd,
  makeBlockMathInputRule,
  makeInlineMathInputRule,
  mathBackspaceCmd,
  mathPlugin,
  REGEX_BLOCK_MATH_DOLLARS,
  REGEX_INLINE_MATH_DOLLARS
} from '@benrbray/prosemirror-math';
import {EditorView} from 'prosemirror-view';
import {EditorState, Transaction} from 'prosemirror-state';
import {keymap} from 'prosemirror-keymap';
import {redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin} from 'y-prosemirror';
import {chainCommands, deleteSelection, joinBackward, selectNodeBackward} from 'prosemirror-commands';
import {columnResizing, goToNextCell, tableEditing} from 'prosemirror-tables';
//@ts-ignore
import * as trackedTransaction from '../utils/trackChanges/track-changes/index.js';
import {CommentsService} from '../utils/commentsService/comments.service';
import {inputRules} from 'prosemirror-inputrules';
import {YdocService} from './ydoc.service';
import {TrackChangesService} from '../utils/trachChangesService/track-changes.service';
import {treeNode} from '../utils/interfaces/treeNode';
import {PlaceholderPluginService} from '../utils/placeholderPlugin/placeholder-plugin.service';
import {DetectFocusService} from '../utils/detectFocusPlugin/detect-focus.service';
import {MenuService} from './menu.service';

@Injectable({
  providedIn: 'root'
})
export class ProsemirrorEditorsService {

  ydoc?: Y.Doc;

  provider?: WebrtcProvider;

  TREE_DATA?: treeNode[];

  nodesListRef: any = {};
  nodesRefByNodesIDs: any = {};

  editorContainers: any = {};
  initDocumentReplace: any = {};

  color = random.oneOf(userSpec.colors);
  user = random.oneOf(userSpec.testUsers);
  editorDivContainer = document.createElement('div') as HTMLDivElement;
  metadatachangeMap: Y.Map<any>;
  metadataMap: Y.Map<any>;
  colorMapping: Map<string, ColorDef> = new Map([[this.user.username, this.color],]);
  permanentUserData?: Y.PermanentUserData;
  colors = userSpec.colors;
  menu: any = buildMenuItems(schema);
  inlineMathInputRule = makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, schema.nodes.math_inline);
  blockMathInputRule = makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, schema.nodes.math_display);

  constructor(
    private menuService: MenuService,
    private detectFocusService: DetectFocusService,
    private placeholderPluginService: PlaceholderPluginService,
    private ydocService: YdocService,
    private commentsService: CommentsService,
    private trackChangesService: TrackChangesService) {
    this.metadataMap = this.ydocService.getMetaDataMap();
    this.editorDivContainer.className = 'editor-outer-div';
    this.metadatachangeMap = ydocService.getYDoc().getMap('editorMetadataChange');
    this.metadatachangeMap.observe(() => {
      let metadatachange = this.metadatachangeMap.get('change');

      // event listener for tree changes . applies them to the dom editor structure

      // drag node event
      if (metadatachange.action == 'listNodeDrag') {
        let listRef = this.nodesListRef[metadatachange.id].newlistNodesDiv;
        this.moveEditorFromTo(metadatachange.from, metadatachange.to, listRef);
      } else if (metadatachange.action == 'editNode') {  // edit node event
        let nodeid = metadatachange.nodeId;
        if (!this.editorContainers[nodeid]) {   // no editor so we create one
          let editorDivRef = this.nodesRefByNodesIDs[nodeid];
          this.renderEditorIn(editorDivRef, nodeid, this.colors, this.colorMapping, this.permanentUserData!);
        }
        if (metadatachange.guid == this.ydoc?.guid) {
          let editorView = this.editorContainers[nodeid].editorView as EditorView;
          let editorState = editorView.state;
          editorView.focus();
          editorView.dispatch(editorState.tr.scrollIntoView());
        }

      } else if (metadatachange.action == 'addNode') {
        this.addChildToNodeById(metadatachange);
      } else if (metadatachange.action == 'deleteNode') {
        let parentNodeId = metadatachange.parentId;
        let childId = metadatachange.childId;
        let indexInList = metadatachange.indexInList;

        let parentNodeListRef = this.nodesListRef[parentNodeId].newlistNodesDiv;
        let childDivContainer = this.nodesListRef[childId].nodeContainer;

        parentNodeListRef.removeChild(childDivContainer);
        delete this.nodesListRef[childId];
        delete this.nodesRefByNodesIDs[childId];
      }
    });
  }

  addChildToNodeById(metadatachange: any) {
    let parentNodeId = metadatachange.parentId;
    let childId = metadatachange.childId;

    let parentNodeListRef = this.nodesListRef[parentNodeId].newlistNodesDiv;

    let nodeContainer = document.createElement('div') as HTMLDivElement;      // container of the entire node
    let listNodeContent = document.createElement('div') as HTMLDivElement;    // the div that containes the prosemirror editor view of this node
    let newlistNodesDiv = document.createElement('div') as HTMLDivElement;    // the list of this node's children


    nodeContainer.append(listNodeContent, newlistNodesDiv);
    this.nodesListRef[childId] = {nodeContainer: nodeContainer, listNodeContent: listNodeContent, newlistNodesDiv: newlistNodesDiv};
    this.nodesRefByNodesIDs[childId] = listNodeContent;
    parentNodeListRef.appendChild(nodeContainer);
  }

  addEditorOnPosition(position: number, editorDiv: HTMLDivElement, listNodesContainer: HTMLDivElement) {
    listNodesContainer.insertBefore(editorDiv, listNodesContainer.children.item(position)!);
  }

  //iztriva div na zadadena poziciq
  removeEditorOnPosition(position: number, listNodesContainer: HTMLDivElement): HTMLDivElement {
    let nodeRef = listNodesContainer.children.item(position)!;
    return listNodesContainer.removeChild(nodeRef) as HTMLDivElement;
  }

  //mesti div ot poziciq from na to
  moveEditorFromTo(from: number, to: number, listNodesContainer: HTMLDivElement) {
    let editor = this.removeEditorOnPosition(from, listNodesContainer);
    this.addEditorOnPosition(to, editor, listNodesContainer);
  }

  renderSectionsFromTree(treeData: treeNode[], editorContainer: HTMLDivElement) {

    treeData.forEach(node => {
      let nodeContainer = document.createElement('div') as HTMLDivElement;      // container of the entire node
      let listNodeContent = document.createElement('div') as HTMLDivElement;    // the div that containes the prosemirror editor view of this node
      let newlistNodesDiv = document.createElement('div') as HTMLDivElement;    // the list of this node's children
      if (node.active) {
        try {
          this.renderEditorIn(listNodeContent, node.id, this.colors, this.colorMapping, this.permanentUserData!);
        } catch (e) {
          console.log(e);
        }
      }

      if (node.children?.length! > 0) {

        this.renderSectionsFromTree(node.children!, newlistNodesDiv);
      }
      nodeContainer.append(listNodeContent, newlistNodesDiv);
      this.nodesListRef[node.id!] = {nodeContainer: nodeContainer, listNodeContent: listNodeContent, newlistNodesDiv: newlistNodesDiv};
      this.nodesRefByNodesIDs[node.id] = listNodeContent;
      editorContainer.appendChild(nodeContainer);
    });
  }

  findSectionName(nodeId: string) {
    let nodeRef: treeNode | undefined;
    let findF = (list?: treeNode[]) => {
      list?.forEach((node) => {
        if (node.id !== undefined && node.id == nodeId) {
          nodeRef = node;
        } else if (node.children) {
          findF(node.children);
        }
      });
    };
    findF(this.TREE_DATA);
    return nodeRef;
  }

  renderEditorIn(container: HTMLDivElement, nodeid: string, colors: ColorDef[], colorMapping: Map<string, ColorDef>, permanentUserData: Y.PermanentUserData) {
    let editorView: EditorView;
    this.TREE_DATA = this.metadataMap.get('TREE_DATA');
    let name = nodeid;
    let sectionName = this.findSectionName(nodeid);
    let editorNameDiv = document.createElement('div') as HTMLDivElement
    editorNameDiv.textContent = sectionName!.name
    editorNameDiv.style.paddingLeft = '14px';
    editorNameDiv.className = 'editorName';
    container.appendChild(editorNameDiv);
    let editorDiv = document.createElement('div');
    editorDiv.setAttribute('class', 'editor-container');

    let xmlFragment = this.ydoc?.getXmlFragment(name);
    let menu1 = this.menuService.attachMenuItems(this.menu, this.ydoc!, sectionName?.name!,name);
    this.initDocumentReplace[name] = false;
    setTimeout(() => {
      this.initDocumentReplace[name] = true;
    }, 1000);
    let edState = EditorState.create({
      schema: schema,
      plugins: [
        ySyncPlugin(xmlFragment, {colors, colorMapping, permanentUserData}),
        yCursorPlugin(this.provider!.awareness),
        yUndoPlugin(),
        mathPlugin,
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo,
          'Mod-Space': insertMathCmd(schema.nodes.math_inline),
          'Backspace': chainCommands(deleteSelection, mathBackspaceCmd, joinBackward, selectNodeBackward),
          'Tab': goToNextCell(1),
          'Shift-Tab': goToNextCell(-1)
        }),
        columnResizing({}),
        tableEditing(),
        this.placeholderPluginService.getPlugin(),
        /* trackPlugin, */
        this.detectFocusService.getPlugin(),
        this.commentsService.getPlugin(),
        this.trackChangesService.getHideShowPlugin(),
        //commentsPlugin,
        /* hideShowPlugin(this.changesContainer?.nativeElement), */
        inputRules({rules: [this.inlineMathInputRule, this.blockMathInputRule]}),
        //commentPlugin,

      ].concat(exampleSetup({schema, menuContent: menu1}))
      ,
      // @ts-ignore
      sectionName: name,
      // @ts-ignore
      comments: {ycommets: this.ycomments, userId: this.ydoc.clientID}
    });

    const dispatchTransaction = (transaction: Transaction) => {
      //console.log(transaction.steps);
      if (!this.initDocumentReplace[name]) {
        let state = editorView?.state.apply(transaction);
        editorView?.updateState(state!);

      } else {
        const tr = trackedTransaction.default(transaction, editorView?.state,
          {
            userId: this.ydoc?.clientID, username: this.user.username, userColor: {addition: '#72e090', deletion: '#f08989'}
          });
        try {
          let state = editorView?.state.apply(tr);
          editorView?.updateState(state!);
        } catch (err) {
          console.log(err);
        }
      }
    };

    editorView = new EditorView(editorDiv, {
      state: edState,
      /* clipboardTextSerializer: (slice: Slice) => {
        return mathSerializer.serializeSlice(slice);
      }, */
      dispatchTransaction
    });

    /* this.ycomments.observe((change) => {
      editorView.dispatch(editorView.state.tr);
    }); */

    let editorCont: editorContainer = {
      name: name,
      containerDiv: editorDiv,
      editorState: edState,
      editorView: editorView,
      dispatchTransaction: dispatchTransaction
    };
    this.editorContainers[name] = editorCont;
    editorNameDiv.addEventListener('click',()=>{
      editorView.focus();
    })
    container.appendChild(editorDiv);
  }

  //dobava div s editor na zadadena poziciq


  init() {
    let data = this.ydocService.getData();
    this.ydoc = data.ydoc;
    this.provider = data.provider;
    this.TREE_DATA = data.TREE_DATA;
    this.permanentUserData = new Y.PermanentUserData(this.ydoc);
    this.permanentUserData.setUserMapping(this.ydoc, this.ydoc.clientID, this.user.username);
    //this.menuService.attachMenuItems2(this.menu, this.ydoc!);
    this.ydoc.gc = false;
    this.renderSectionsFromTree(this.TREE_DATA, this.editorDivContainer);
    this.nodesListRef['parentList'] = {newlistNodesDiv: this.editorDivContainer};
    return this.editorDivContainer;
  }
}
