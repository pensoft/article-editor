import { Injectable } from '@angular/core';
//@ts-ignore
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc';
import { ColorDef } from 'y-prosemirror/dist/src/plugins/sync-plugin';
import * as random from 'lib0/random.js';
import * as userSpec from '../utils/userSpec';
//@ts-ignore
import { buildMenuItems, exampleSetup } from '../utils/prosemirror-example-setup-master/src/index.js';
import { schema } from '../utils/Schema';
import {
  insertMathCmd,
  makeBlockMathInputRule,
  makeInlineMathInputRule,
  mathBackspaceCmd,
  mathPlugin,
  mathSerializer,
  REGEX_BLOCK_MATH_DOLLARS,
  REGEX_INLINE_MATH_DOLLARS
} from '@benrbray/prosemirror-math';
import { DOMSerializer, Node, Slice } from 'prosemirror-model';
//@ts-ignore
import { EditorView } from 'prosemirror-view';
import { EditorState, Plugin, PluginKey, Transaction, TextSelection } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
//import { redo, undo, yCursorPlugin, yDocToProsemirrorJSON, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import { chainCommands, deleteSelection, joinBackward, selectNodeBackward } from 'prosemirror-commands';
//@ts-ignore
import {redo, undo, yCursorPlugin, yDocToProsemirrorJSON, ySyncPlugin, yUndoPlugin } from '../../y-prosemirror-src/y-prosemirror.js';
import { CellSelection, columnResizing, goToNextCell, tableEditing } from 'prosemirror-tables';
//@ts-ignore
import * as trackedTransaction from '../utils/trackChanges/track-changes/index.js';
import { CommentsService } from '../utils/commentsService/comments.service';
import { inputRules } from 'prosemirror-inputrules';
import { YdocService } from './ydoc.service';
import { TrackChangesService } from '../utils/trachChangesService/track-changes.service';
import { PlaceholderPluginService } from '../utils/placeholderPlugin/placeholder-plugin.service';
import { DetectFocusService } from '../utils/detectFocusPlugin/detect-focus.service';
import { MenuService } from './menu.service';
import { Subject } from 'rxjs';
import { LinkPopUpPluginServiceService } from '../utils/linkPopUpPlugin/link-pop-up-plugin-service.service';
import {
  articleSection,
  editorData,
  sectionContent,
  taxonomicCoverageContentData,
  titleContent
} from '../utils/interfaces/articleSection';
//@ts-ignore
import { FormControlService } from '../section/form-control.service';
import { FormControl } from '@angular/forms';
import { TreeService } from '../meta-data-tree/tree-service/tree.service';
import { DOMParser } from 'prosemirror-model';

//@ts-ignore
import { menuBar } from '../utils/prosemirror-menu-master/src/menubar.js'
import { Form } from 'formiojs';
import { FormioControl } from 'src/app/formio-angular-material/FormioControl';
import { I } from '@angular/cdk/keycodes';
import { ReplaceAroundStep } from 'prosemirror-transform';
@Injectable({
  providedIn: 'root'
})
export class ProsemirrorEditorsService {

  ydoc?: Y.Doc;
  provider?: WebrtcProvider;

  articleSectionsStructure?: articleSection[];
  initDocumentReplace: any = {};
  editorContainers: any = {}
  xmlFragments: { [key: string]: Y.XmlFragment } = {}

  DOMPMSerializer = DOMSerializer.fromSchema(schema);

  color = random.oneOf(userSpec.colors);
  user = random.oneOf(userSpec.testUsers);
  colorMapping: Map<string, ColorDef> = new Map([[this.user.username, this.color],]);
  permanentUserData?: Y.PermanentUserData;
  colors = userSpec.colors;
  menu: any = buildMenuItems(schema);
  inlineMathInputRule = makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, schema.nodes.math_inline);
  blockMathInputRule = makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, schema.nodes.math_display);

  OnOffTrackingChangesShowTrackingSubject = new Subject<{hideshowStatus:boolean,trackTransactions:boolean}>()
  trackChangesMeta : any
  shouldTrackChanges = false
  treeChangesCount = 0
  transactionCount = 0;

  editorsEditableObj: { [key: string]: boolean } = {}

  mobileVersionSubject = new Subject<boolean>()
  mobileVersion = false;

  editorsDeleteArray: string[] = []

  constructor(
    private menuService: MenuService,
    private detectFocusService: DetectFocusService,
    private placeholderPluginService: PlaceholderPluginService,
    private ydocService: YdocService,
    private linkPopUpPluginService: LinkPopUpPluginServiceService,
    private commentsService: CommentsService,
    private treeService: TreeService,
    private trackChangesService: TrackChangesService) {


    this.mobileVersionSubject.subscribe((data) => {
      // data == true => mobule version
      this.mobileVersion = data
    })

    //this.showChangesSubject = this.trackChangesService.showChangesSubject
    this.OnOffTrackingChangesShowTrackingSubject.subscribe((data) => {

      this.shouldTrackChanges = data.trackTransactions
      let trackCHangesMetadata = this.ydocService.articleStructure?.get('trackChangesMetadata');
      trackCHangesMetadata.lastUpdateFromUser = this.ydoc?.guid;
      trackCHangesMetadata.trackTransactions = data.trackTransactions
      trackCHangesMetadata.hideshowStatus = data.hideshowStatus
      console.log('trackChangesMetadata',trackCHangesMetadata);
      this.ydocService.articleStructure?.set('trackChangesMetadata',trackCHangesMetadata);
    })


  }

  getXmlFragment(mode: string, id: string) {
    if (this.xmlFragments[id]) {
      return this.xmlFragments[id]
    }
    let xmlFragment = this.ydocService.ydoc?.getXmlFragment(id)
    this.xmlFragments[id] = xmlFragment;
    return xmlFragment
  }

  deleteXmlFragment(id: string) {
    if (this.xmlFragments[id]) {
      this.xmlFragments[id].delete(0, this.xmlFragments[id].length);
    }
    delete this.xmlFragments[id]
  }

  deleteEditor(id: any) {
    let deleteContainer = this.editorContainers[id];
    if (deleteContainer) {
      this.editorContainers[id].editorView.destroy();
      delete this.editorContainers[id]
    }
  }

  clearDeleteArray() {
    while (this.editorsDeleteArray.length > 0) {
      let deleteId = this.editorsDeleteArray.shift()!;
      this.deleteEditor(deleteId)
      this.deleteXmlFragment(deleteId)
    }
  }

  addEditorForDelete(editorId: string) {
    this.commentsService.removeEditorComment(editorId)
    this.editorsDeleteArray.push(editorId);
  }

  markSectionForDelete(section: articleSection) {
    let markEditor = (editorData: editorData) => {
      let editorId = editorData.editorId
      this.addEditorForDelete(editorId)
    }
    let markContent = (content: titleContent | sectionContent) => {
      if (content.type == 'editorContentType') {
        markEditor(content.contentData as editorData)
      } else if (content.type == 'taxonomicCoverageContentType') {
        let taxonomicContentData = content.contentData as taxonomicCoverageContentData
        markEditor(taxonomicContentData.description)
        taxonomicContentData.taxaArray.forEach((el, i, arr) => {
          markEditor(arr[i].commonName)
          markEditor(arr[i].scietificName)
        })
      }
    }
    markContent(section.title)
    markContent(section.sectionContent)
  }

  dispatchEmptyTransaction() {  // for updating the view
    Object.values(this.editorContainers).forEach((container: any) => {
      let editorState = container.editorView.state as EditorState
      container.editorView.dispatch(editorState.tr)
    })
  }

  renderEditorInWithId(EditorContainer: HTMLDivElement, editorId: string, section: articleSection): {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  } {
    let updateFormIoDefaultValues = (sectionID: string, data: any) => {
      try{
        this.ydocService.sectionsFromIODefaultValues?.set(sectionID, data);
      }catch(e){
        console.error(e);
      }
    }
    if (this.editorContainers[editorId]) {
      EditorContainer.appendChild(this.editorContainers[editorId].containerDiv);
      return this.editorContainers[editorId]
    }
    let container = document.createElement('div');
    let editorView: EditorView;
    let colors = this.colors
    let colorMapping = this.colorMapping
    let permanentUserData = this.permanentUserData
    let editorID = editorId;

    let menuContainerClass = "menu-container";
    let xmlFragment = this.getXmlFragment(section.mode, editorID)
    let yjsPlugins = [ySyncPlugin(xmlFragment, { colors, colorMapping, permanentUserData }),
    yCursorPlugin(this.provider!.awareness) ,
    yUndoPlugin()]


    container.setAttribute('class', 'editor-container');
    let filterTransaction = false
    let defaultMenu = this.menuService.attachMenuItems(this.menu, this.ydoc!, 'SimpleMenu', editorID);
    let fullMenu = this.menuService.attachMenuItems(this.menu, this.ydoc!, 'fullMenu', editorID);
    this.initDocumentReplace[editorID] = true;
    let transactionControllerPluginKey = new PluginKey('transactionControllerPlugin');
    let GroupControl = this.treeService.sectionFormGroups;
    let transactionControllerPlugin = new Plugin({
      key: transactionControllerPluginKey,
      appendTransaction: (trs: Transaction<any>[], oldState: EditorState, newState: EditorState) => {
        let tr1 = newState.tr;
        // return value whe r = false the transaction is canseled
        trs.forEach((transaction) => {
          if (transaction.steps.length > 0) {
            newState.doc!.descendants(/* newState.selection.from, newState.selection.to,  */(node, pos, parent) => {     // the document after the appling of the steps
              //@ts-ignore
              node.parent = parent
              if (node.attrs.formControlName && GroupControl[section.sectionID]) {      // validation for the formCOntrol
                try {
                  const fg = GroupControl[section.sectionID];
                  const controlPath = node.attrs.controlPath;
                  const control = fg.get(controlPath) as FormControl;
                  //@ts-ignore
                  if (control.componentType == "textarea") {
                    let HTMLnodeRepresentation = this.DOMPMSerializer.serializeFragment(node.content)
                    let temp = document.createElement('div');
                    temp.appendChild(HTMLnodeRepresentation);
                    control.setValue(temp.innerHTML, { emitEvent: true })
                  } else {
                    control.setValue(node.textContent, { emitEvent: true })
                  }
                  control.updateValueAndValidity()
                  const mark = schema.mark('invalid')
                  if (control.invalid) {
                    // newState.tr.addMark(pos + 1, pos + node.nodeSize - 1, mark)
                    tr1 = tr1.setNodeMarkup(pos, node.type, { ...node.attrs, invalid: "true" })
                  } else {
                    tr1 = tr1.setNodeMarkup(pos, node.type, { ...node.attrs, invalid: "" })

                  }
                  updateFormIoDefaultValues(editorID, fg.value);
                } catch (error) {
                  console.error(error);
                }
              }
            })
          }
        })
        return tr1
      },
      filterTransaction(transaction: Transaction<any>, state: EditorState) {
        //@ts-ignore
        let meta = transaction.meta
        if (meta.uiEvent) {
          if (meta.uiEvent == 'cut') {
            let noneditableNodesOnDropPosition = false
            //@ts-ignore
            let sel = transaction.curSelection
            //@ts-ignore
            state.doc.nodesBetween(sel.from, sel.to, (node, pos, parent) => {
              if (node.attrs.contenteditableNode == "false") {
                noneditableNodesOnDropPosition = true
              }
              if(node.type.name == "form_field"&&!noneditableNodesOnDropPosition){
                node.descendants((node)=>{
                  if (node.attrs.contenteditableNode == "false") {
                    noneditableNodesOnDropPosition = true
                  }
                })
              }
            })
            if (noneditableNodesOnDropPosition) {
              return false
            }
          } else if (meta.uiEvent == 'drop') {
            let noneditableNodesOnDropPosition = false
            //@ts-ignore
            let sel = transaction.curSelection
            //@ts-ignore
            state.doc.nodesBetween(sel.from, sel.from+1, (node, pos, parent) => {
              if (node.attrs.contenteditableNode == "false") {
                noneditableNodesOnDropPosition = true
              }
              if(node.type.name == "form_field"&&!noneditableNodesOnDropPosition){
                node.descendants((node)=>{
                  if (node.attrs.contenteditableNode == "false") {
                    noneditableNodesOnDropPosition = true
                  }
                })
              }
            })
            state.doc.nodesBetween(sel.to-1, sel.to, (node, pos, parent) => {
              if (node.attrs.contenteditableNode == "false") {
                noneditableNodesOnDropPosition = true
              }
              if(node.type.name == "form_field"&&!noneditableNodesOnDropPosition){
                node.descendants((node)=>{
                  if (node.attrs.contenteditableNode == "false") {
                    noneditableNodesOnDropPosition = true
                  }
                })
              }
            })
            if (noneditableNodesOnDropPosition) {
              return false
            }
          }
        }
        return true
      },

    })

    setTimeout(() => {
      this.initDocumentReplace[editorID] = true;
      filterTransaction = true;
    }, 1000);

    this.editorsEditableObj[editorID] = true

    let edState = EditorState.create({
      schema: schema,
      plugins: [
        ...yjsPlugins,
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
        transactionControllerPlugin,
        this.detectFocusService.getPlugin(),
        this.commentsService.getPlugin(),
        this.trackChangesService.getHideShowPlugin(),
        this.linkPopUpPluginService.linkPopUpPlugin,
        inputRules({ rules: [this.inlineMathInputRule, this.blockMathInputRule] }),
        ...menuBar({
          floating: true,
          content: { 'main': defaultMenu, fullMenu }, containerClass: menuContainerClass
        })
      ].concat(exampleSetup({ schema, /* menuContent: fullMenuWithLog, */ containerClass: menuContainerClass }))
      ,
      // @ts-ignore
      sectionName: editorID,
      // @ts-ignore
    });

    let lastStep: any
    const dispatchTransaction = (transaction: Transaction) => {
      this.transactionCount++
      try {
        if (lastStep == transaction.steps[0]) {
          if (lastStep) { return }
        }
        lastStep = transaction.steps[0]
        if (!this.initDocumentReplace[editorID] || !this.shouldTrackChanges) {
          let state = editorView?.state.apply(transaction);
          editorView?.updateState(state!);

        } else {
          const tr = trackedTransaction.default(transaction, editorView?.state,
            {
              userId: this.ydoc?.clientID,
              username: this.user.username,
              userColor: { addition: 'transperant', deletion: 'black' }
            });
          let state = editorView?.state.apply(tr);
          editorView?.updateState(state!);
        }
      } catch (err) { console.error(err); }
    };

    editorView = new EditorView(container, {
      state: edState,
      clipboardTextSerializer: (slice: Slice) => {
        return mathSerializer.serializeSlice(slice);
      },
      editable: (state: EditorState) => {
        return !this.mobileVersion /* && this.editorsEditableObj[editorID] */
        // mobileVersion is true when app is in mobile mod | editable() should return return false to set editor not editable so we return !mobileVersion
      },
      dispatchTransaction,
      handlePaste(view: EditorView, event, slice) {
        let sel = view.state.selection
        let noneditableNodes = false;
        view.state.doc.nodesBetween(sel.from, sel.to, (node, pos, parent) => {
          if (node.attrs.contenteditableNode == "false") {
            noneditableNodes = true;
          }
        })
        if (noneditableNodes) {
          return true
        }
        return false
      },
      handleTripleClickOn(view,pos,node,nodepos,event,direct){
        if(view.state.selection.$from.parent.type.name!=="form_field"){
          return true;
        }
        return false
      },
      handleKeyDown(view: EditorView, event: KeyboardEvent) {
        let sel = view.state.selection
        let key = event.key
        let noneditableNodes = false;
        if(sel instanceof CellSelection){
          let from = Math.min(sel.$headCell.pos,sel.$anchorCell.pos);
          let to = Math.max(sel.$headCell.pos,sel.$anchorCell.pos);
          view.state.doc.nodesBetween(from, to, (node, pos, parent) => {
            if (node.attrs.contenteditableNode == "false") {
              noneditableNodes = true;
            }
          })
        }else{
          view.state.doc.nodesBetween(sel.from,sel.to, (node, pos, parent) => {
            if (node.attrs.contenteditableNode == "false") {
              noneditableNodes = true;
            }
          })
        }
        if (key == 'Delete' || key == 'Backspace') {
          if (!sel.empty) {
            return noneditableNodes
          } else {
            if (noneditableNodes) {
              return noneditableNodes
            } else {
              if (key == 'Delete') {
                if (sel.$anchor.nodeAfter == null && sel.$anchor.parent.type.name == 'paragraph') {
                  //@ts-ignore
                  let s = sel.$anchor.parent.parent.content.lastChild === sel.$anchor.parent
                  if (s) {
                    return true
                  }
                }
              } else if (key == 'Backspace') {
                if (sel.$anchor.nodeBefore == null && sel.$anchor.parent.type.name == 'paragraph') {
                  //@ts-ignore
                  let s = sel.$anchor.parent.parent.content.firstChild === sel.$anchor.parent
                  if (s) {
                    return true
                  }
                }
              }
            }

          }
          if (noneditableNodes) {
            return noneditableNodes
          }
        }
        if (noneditableNodes) {
          if (key == 'ArrowRight' ||
            key == 'ArrowLeft' ||
            key == 'ArrowDown' ||
            key == 'ArrowUp') {
            return false
          } else {
            return true
          }
        }
        return false
      },
      createSelectionBetween: (view, anchor, head) => {
        if (anchor.pos == head.pos) {
          return new TextSelection(anchor, head);
        }
        let headRangeMin = anchor.pos
        let headRangeMax = anchor.pos
        let sel = view.state.selection


        //@ts-ignore
        let anchorPath = sel.$anchor.path
        let counter = anchorPath.length - 1
        let parentNode: Node | undefined = undefined;
        let parentNodePos: number | undefined = undefined;
        let formFieldParentFound = false
        while (counter > -1 && !formFieldParentFound) {
          let pathValue = anchorPath[counter]
          if (typeof pathValue == 'number') {   // number
          } else {                              // node       
            let parentType = pathValue.type.name
            if (parentType == "form_field") {
              parentNode = pathValue   // store the form_field node that the selection is currently in
              parentNodePos = anchorPath[counter - 1];
              formFieldParentFound = true
            } else if (parentType !== "doc") {
              parentNode = pathValue   // store last node in the path that is diffetant than the doc node
              parentNodePos = anchorPath[counter - 1];
            }
          }
          counter--;
        }

        if (parentNode) {

          headRangeMin = parentNodePos! + 1 // the parents inner start position
          headRangeMax = parentNodePos! + parentNode?.nodeSize! - 1 // the parent inner end position
        }

        //this.editorsEditableObj[editorID] = true

        if (headRangeMin > head.pos || headRangeMax < head.pos) {
          let headPosition = headRangeMin > head.pos ? headRangeMin : headRangeMax
          let newHeadResolvedPosition = view.state.doc.resolve(headPosition)
          let from = Math.min(view.state.selection.$anchor.pos, newHeadResolvedPosition.pos)
          let to = Math.max(view.state.selection.$anchor.pos, newHeadResolvedPosition.pos)
          view.state.doc.nodesBetween(from, to, (node, pos, parent) => {
            if (node.attrs.contenteditableNode == 'false') {
              this.editorsEditableObj[editorID] = false;

            }
          })
          let newSelection = new TextSelection(anchor, newHeadResolvedPosition);
          return newSelection
        }
        let from = Math.min(anchor.pos, head.pos)
        let to = Math.max(anchor.pos, head.pos)
        view.state.doc.nodesBetween(from, to, (node, pos, parent) => {
          if (node.attrs.contenteditableNode == 'false') {
            this.editorsEditableObj[editorID] = false;
          }
        })
        return undefined
      },

    });
    EditorContainer.appendChild(container);

    let editorCont: any = {
      editorID: editorID,
      containerDiv: container,
      editorState: edState,
      editorView: editorView,
      dispatchTransaction: dispatchTransaction
    };
    this.editorContainers[editorID] = editorCont;
    return editorCont
  }

  renderEditorWithNoSync(EditorContainer: HTMLDivElement, formIOComponentInstance: any, control: FormioControl, options: any, nodesArray?: Slice): {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  } {
    let editorID = random.uuidv4()
    let container = document.createElement('div');
    let editorView: EditorView;
    let doc: Node;
    if (!options.noLabel) {
      let componentLabel = formIOComponentInstance.component.label;
      let labelTag = document.createElement('div');
      labelTag.setAttribute('class', 'prosemirror-label-tag')
      labelTag.textContent = componentLabel
      EditorContainer.appendChild(labelTag);
    }

    if (!nodesArray) {
      doc = schema.nodes.doc.create({}, schema.nodes.form_field.create({}, schema.nodes.paragraph.create({})))
    } else {
      doc = schema.nodes.doc.create({}, schema.nodes.form_field.create({}, nodesArray.content))
    }
    let menuContainerClass = "popup-menu-container";

    container.setAttribute('class', 'editor-container');

    let filterTransaction = false
    let defaultMenu = this.menuService.attachMenuItems(this.menu, this.ydoc!, 'SimpleMenu');
    let fullMenu = this.menuService.attachMenuItems(this.menu, this.ydoc!, 'fullMenu');

    let transactionControllerPluginKey = new PluginKey('transactionControllerPlugin');

    let GroupControl = this.treeService.sectionFormGroups;
    let transactionControllerPlugin = new Plugin({
      key: transactionControllerPluginKey,
      appendTransaction: (trs: Transaction<any>[], oldState: EditorState, newState: EditorState) => {
        let containerElement = document.createElement('div');
        let htmlNOdeRepresentation = this.DOMPMSerializer.serializeFragment(newState.doc.content.firstChild!.content)
        containerElement.appendChild(htmlNOdeRepresentation);
        let nodelNodesString = containerElement.innerHTML.replace(/<span class="deletion"[\sa-zA-Z-="1-90:;]+>[\sa-zA-Z-="1-90:;]+<\/span>/gm,'');
        containerElement.innerHTML = nodelNodesString
        options.onChange(true, containerElement.textContent)

      },
      filterTransaction(transaction: Transaction<any>, state: EditorState) {
        return true
      }
    })



    this.editorsEditableObj[editorID] = true

    let edState = EditorState.create({
      doc,
      schema: schema,
      plugins: [
        mathPlugin,
        keymap({
          'Mod-Space': insertMathCmd(schema.nodes.math_inline),
          'Backspace': chainCommands(deleteSelection, mathBackspaceCmd, joinBackward, selectNodeBackward),
          'Tab': goToNextCell(1),
          'Shift-Tab': goToNextCell(-1)
        }),
        columnResizing({}),
        tableEditing(),
        this.placeholderPluginService.getPlugin(),
        transactionControllerPlugin,
        this.trackChangesService.getHideShowPlugin(),
        inputRules({ rules: [this.inlineMathInputRule, this.blockMathInputRule] }),
        ...menuBar({
          floating: true,
          content: { 'main': defaultMenu, fullMenu }, containerClass: menuContainerClass
        })
      ].concat(exampleSetup({ schema, /* menuContent: fullMenuWithLog, */ containerClass: menuContainerClass }))
      ,
      // @ts-ignore
      sectionName: editorID,
    });

    let lastStep: any
    const dispatchTransaction = (transaction: Transaction) => {
      this.transactionCount++
      try {
        if (lastStep == transaction.steps[0]) {
          if (lastStep) { return }
        }
        lastStep = transaction.steps[0]
        if (!this.initDocumentReplace[editorID] || !this.shouldTrackChanges) {
          let state = editorView?.state.apply(transaction);
          editorView?.updateState(state!);

        } else {
          const tr = trackedTransaction.default(transaction, editorView?.state,
            {
              userId: this.ydoc?.clientID,
              username: this.user.username,
              userColor: { addition: 'transperant', deletion: 'black' }
            });
          let state = editorView?.state.apply(tr);
          editorView?.updateState(state!);
        }
      } catch (err) { console.error(err); }
    };
    editorView = new EditorView(container, {
      state: edState,
      clipboardTextSerializer: (slice: Slice) => {
        return mathSerializer.serializeSlice(slice);
      },
      editable: (state: EditorState) => {
        return !this.mobileVersion && this.editorsEditableObj[editorID]
        // mobileVersion is true when app is in mobile mod | editable() should return return false to set editor not editable so we return !mobileVersion
      },
      dispatchTransaction,
      
      createSelectionBetween: (view, anchor, head) => {
        let headRangeMin = anchor.pos
        let headRangeMax = anchor.pos
        if (anchor.nodeBefore) {
          headRangeMin -= anchor.nodeBefore.nodeSize
        }
        if (anchor.nodeAfter) {
          headRangeMax += anchor.nodeAfter.nodeSize
        }
        this.editorsEditableObj[editorID] = true

        if (headRangeMin > head.pos || headRangeMax < head.pos) {
          let headPosition = headRangeMin > head.pos ? headRangeMin : headRangeMax
          let newHeadResolvedPosition = view.state.doc.resolve(headPosition)
          let from = Math.min(view.state.selection.$anchor.pos, newHeadResolvedPosition.pos)
          let to = Math.max(view.state.selection.$anchor.pos, newHeadResolvedPosition.pos)
          view.state.doc.nodesBetween(from, to, (node, pos, parent) => {
            if (node.attrs.contenteditableNode == 'false') {
              this.editorsEditableObj[editorID] = false;

            }
          })
          let newSelection = new TextSelection(anchor, newHeadResolvedPosition);
          return newSelection
        }
        let from = Math.min(anchor.pos, head.pos)
        let to = Math.max(anchor.pos, head.pos)
        view.state.doc.nodesBetween(from, to, (node, pos, parent) => {
          if (node.attrs.contenteditableNode == 'false') {
            this.editorsEditableObj[editorID] = false;
          }
        })
        return undefined
      },

    });
    EditorContainer.appendChild(container);

    let editorCont: any = {
      editorID: editorID,
      containerDiv: container,
      editorState: edState,
      editorView: editorView,
      dispatchTransaction: dispatchTransaction
    };
    return editorCont
  }

  init() {
    let data = this.ydocService.getData();
    this.ydoc = data.ydoc;
    this.provider = data.provider;
    this.articleSectionsStructure = data.articleSectionsStructure;
    let trackChangesMetadata = this.ydocService.articleStructure?.get('trackChangesMetadata');
    this.trackChangesMeta = trackChangesMetadata
    this.shouldTrackChanges = trackChangesMetadata.trackTransactions;
    this.ydocService.articleStructure?.observe((ymap)=>{
      let trackChangesMetadata = this.ydocService.articleStructure?.get('trackChangesMetadata');
      if(trackChangesMetadata.lastUpdateFromUser!==this.ydoc?.guid){
      }
        this.trackChangesMeta = trackChangesMetadata
        this.shouldTrackChanges = trackChangesMetadata.trackTransactions
    })
   
    this.permanentUserData = new Y.PermanentUserData(this.ydoc);
    this.permanentUserData.setUserMapping(this.ydoc, this.ydoc.clientID, this.user.username);
    this.ydoc.gc = false;
  }


}
