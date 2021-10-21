import { Injectable } from '@angular/core';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { ColorDef } from 'y-prosemirror/dist/src/plugins/sync-plugin';
import { editorContainer } from '../utils/interfaces/editor-container';
import * as random from 'lib0/random.js';
import * as userSpec from '../utils/userSpec';
//@ts-ignore
import { buildMenuItems, exampleSetup } from '../utils/prosemirror-example-setup-master/src/index.js';
import { schema } from '../utils/schema';
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
import { Node as prosemirrorNode } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { EditorState, Plugin, Transaction } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { redo, undo, yCursorPlugin, yDocToProsemirrorJSON, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import { chainCommands, deleteSelection, joinBackward, selectNodeBackward } from 'prosemirror-commands';
import { columnResizing, goToNextCell, tableEditing } from 'prosemirror-tables';
//@ts-ignore
import * as trackedTransaction from '../utils/trackChanges/track-changes/index.js';
import { CommentsService } from '../utils/commentsService/comments.service';
import { inputRules } from 'prosemirror-inputrules';
import { YdocService } from './ydoc.service';
import { TrackChangesService } from '../utils/trachChangesService/track-changes.service';
import { treeNode } from '../utils/interfaces/treeNode';
import { PlaceholderPluginService } from '../utils/placeholderPlugin/placeholder-plugin.service';
import { DetectFocusService } from '../utils/detectFocusPlugin/detect-focus.service';
import { MenuService } from './menu.service';
import { Subject } from 'rxjs';
import { LinkPopUpPluginServiceService } from '../utils/linkPopUpPlugin/link-pop-up-plugin-service.service';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map } from 'rxjs/operators';
import { YMap } from 'yjs/dist/src/internals';
import { DOMSerializer, Slice } from 'prosemirror-model';
import { pasteRules } from 'prosemirror-paste-rules';
import { articleSection, sectionContent, taxonomicCoverageContentData, titleContent } from '../utils/interfaces/articleSection';
import { editorData } from '../utils/interfaces/articleSection';
import { YdocCopyService } from './ydoc-copy.service';
//@ts-ignore
import { updateYFragment } from '../../y-prosemirror-src/plugins/sync-plugin.js';
import { SELECT_PANEL_MAX_HEIGHT } from '@angular/material/select/select';
import { Selection } from 'prosemirror-state';
import { GapCursor } from 'prosemirror-gapcursor';
import { StepResult } from 'prosemirror-transform';
import { _fixedSizeVirtualScrollStrategyFactory } from '@angular/cdk/scrolling';
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

  color = random.oneOf(userSpec.colors);
  user = random.oneOf(userSpec.testUsers);
  colorMapping: Map<string, ColorDef> = new Map([[this.user.username, this.color],]);
  permanentUserData?: Y.PermanentUserData;
  colors = userSpec.colors;
  menu: any = buildMenuItems(schema);
  inlineMathInputRule = makeInlineMathInputRule(REGEX_INLINE_MATH_DOLLARS, schema.nodes.math_inline);
  blockMathInputRule = makeBlockMathInputRule(REGEX_BLOCK_MATH_DOLLARS, schema.nodes.math_display);

  changesOnOffSubject = new Subject<boolean>()
  shouldTrackChanges = false
  treeChangesCount = 0
  showChangesSubject
  transactionCount = 0;

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
    private ydocCopyService: YdocCopyService,
    private trackChangesService: TrackChangesService) {

    this.ydocCopyService.addEditorForDeleteSubject.subscribe((editorId) => {
      this.addEditorForDelete(editorId);
    })

    /*setInterval(() => {
     console.log('TransactionPerSecond', this.transactionCount, 'EditorsCount', Object.keys(this.editorContainers).length);
     this.transactionCount = 0;
   }, 1000)
   setInterval(() => {
     console.log('Ydoc', this.ydoc);
   }, 1000) */

    this.mobileVersionSubject.subscribe((data) => {
      // data == true => mobule version
      this.mobileVersion = data
    })

    this.showChangesSubject = this.trackChangesService.showChangesSubject
    this.changesOnOffSubject.subscribe((data) => {
      this.shouldTrackChanges = data
    })

    this.showChangesSubject.subscribe((data) => {
      this.dispatchEmptyTransaction()
    })


  }

  getXmlFragment(mode: string, id: string) {
    if (this.xmlFragments[id]) {
      return this.xmlFragments[id]
    }
    let xmlFragment = mode == 'editMode' ? this.ydocCopyService.ydoc?.getXmlFragment(id) : this.ydocService.ydoc?.getXmlFragment(id)
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
      /* {
        editorID: editorID,
        containerDiv: container,
        editorState: edState,
        editorView: editorView,
        dispatchTransaction: dispatchTransaction
      }; */
      this.editorContainers[id].editorView.destroy();
      delete this.editorContainers[id]
      //this.deleteXmlFragment(id)
    }
  }

  clearDeleteArray() {
    this.ydocCopyService.clearYdocCopy();
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
    this.ydocCopyService.clearYdocCopy()
  }

  dispatchEmptyTransaction() {  // for update of view
    Object.values(this.editorContainers).forEach((container: any) => {
      let editorState = container.editorView.state as EditorState
      container.editorView.dispatch(editorState.tr)
    })
  }

  renderEditorIn(EditorContainer: HTMLDivElement, editorData: editorData, sectionData: articleSection): {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  } {

    if (this.editorContainers[editorData.editorId]) {
      EditorContainer.appendChild(this.editorContainers[editorData.editorId].containerDiv);
      return this.editorContainers[editorData.editorId]
    }
    let container = document.createElement('div');
    let editorView: EditorView;
    let colors = this.colors
    let colorMapping = this.colorMapping
    let permanentUserData = this.permanentUserData
    let editorID = editorData.editorId;
    let data = editorData.editorMeta
    if (data?.label) {
      let labelDIv = document.createElement('div');
      labelDIv.setAttribute('class', 'editor-container-label-div');
      labelDIv.innerHTML = data.label
      container.appendChild(labelDIv);
    }
    let editorMode = sectionData.mode;
    let menuContainerClass = "menu-container";

    //let xmlFragment = sectionData.mode == 'editMode' ? this.ydocCopyService.ydoc?.getXmlFragment(editorID) : this.ydoc?.getXmlFragment(editorID)
    let xmlFragment = this.getXmlFragment(sectionData.mode, editorID)
    if (editorData.editorMeta?.prosemirrorJsonTemplate) {
      let xmlProsemirrorContent = yDocToProsemirrorJSON(xmlFragment.doc, editorID)
      if (xmlProsemirrorContent.content.length == 0) {
        const node = prosemirrorNode.fromJSON(schema, editorData.editorMeta?.prosemirrorJsonTemplate)
        updateYFragment(xmlFragment.doc, xmlFragment, node, new Map())
      }
    }


    let yjsPlugins = [ySyncPlugin(xmlFragment, { colors, colorMapping, permanentUserData }),
    /* yCursorPlugin(this.provider!.awareness) , */
    yUndoPlugin()]

    editorData.menuType = 'fullMenuWithLog';
    if (editorMode !== 'documentMode') {
      menuContainerClass = 'popup-menu-container';
      //yjsPlugins = [ySyncPlugin(xmlFragment, { colors, colorMapping, permanentUserData }),  yUndoPlugin()];
    }
    container.setAttribute('class', 'editor-container');
    let filterTransaction = false

    /* let plugins = [...yjsPlugins,
    this.placeholderPluginService.getPlugin(),
    this.detectFocusService.getPlugin() ,
    new Plugin({
      filterTransaction(transaction,state) {


        return true
      }

    })
    ] */
    let menu1

    menu1 = this.menuService.attachMenuItems(this.menu, this.ydoc!, editorData.menuType, editorID);

    this.initDocumentReplace[editorID] = false;

    setTimeout(() => {
      this.initDocumentReplace[editorID] = true;
      filterTransaction = true;
    }, 1000);

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
        // new Plugin({
        //   filterTransaction(transaction, state) {
        //     let r = true
        //     if (transaction.steps.length > 0) {
        //       let result: StepResult<any>|undefined = undefined
        //       transaction.steps.forEach((step) => {
        //         if (result == undefined) {
        //
        //           result = step.apply(state.doc)
        //         } else {
        //           result = step.apply(result!.doc!)
        //         }
        //       })
        //       /* state.doc.descendants((node,pos,parent)=>{
        //         if(node.attrs.validations){
        //           console.log(node.attrs.validations);
        //         }
        //       }) */
        //       if (result !== undefined) {
        //         (result as StepResult<any>).doc!.descendants((node, pos, parent) => {
        //           if (node.attrs.validations) {
        //             let validations :any = node.attrs.validations as string
        //             console.log();
        //             if(validations.includes(';')){
        //               let valArray:any[] = validations.split(';');
        //               valArray.forEach((val,index)=>{
        //                 valArray[index] = val.split(':')
        //               })
        //               validations = valArray
        //             }else{
        //               validations = [validations.split(':')];
        //             }
        //             console.log(validations);
        //             validations.forEach((validation:any) => {
        //               if(validation[0] == 'max-size'){
        //                 if(node.nodeSize>+validation[1]){
        //                   console.log('node.nodeSize',node.nodeSize);
        //                   console.log('validations[1]',validation[1]);
        //
        //                   r = false
        //                 }
        //               }
        //             });
        //           }
        //           if(node.attrs.regex){
        //             let regexStr = node.attrs.regex
        //             //@ts-ignore
        //             let text = node.content.content[0].text
        //             console.log(regexStr);
        //             let regex = new RegExp(regexStr)
        //             console.log(text);
        //             console.log(regex.test(text));
        //             if(!regex.test(text)){
        //               r = false
        //             }
        //
        //           }
        //         })
        //       }
        //     }
        //     return r
        //   }
        //
        // }),
        //trackPlugin,
        this.detectFocusService.getPlugin(),
        this.commentsService.getPlugin(),
        this.trackChangesService.getHideShowPlugin(),
        this.linkPopUpPluginService.linkPopUpPlugin,
        //commentsPlugin,
        //hideShowPlugin(this.changesContainer?.nativeElement),
        inputRules({ rules: [this.inlineMathInputRule, this.blockMathInputRule] }),
        //commentPlugin,

      ].concat(exampleSetup({ schema, menuContent: menu1, containerClass: menuContainerClass }))
      ,
      // @ts-ignore
      sectionName: editorID,
      // @ts-ignore
      data
    });
    let lastStep: any
    const dispatchTransaction = (transaction: Transaction) => {

      this.transactionCount++
      try {
        if (lastStep == transaction.steps[0]) {
          if (lastStep) {
            return
          }
        }
        lastStep = transaction.steps[0]
        if (!this.initDocumentReplace[editorID] || !this.shouldTrackChanges) {
          let state = editorView?.state.apply(transaction);
          editorView?.updateState(state!);

        } else {
          const tr = trackedTransaction.default(transaction, editorView?.state,
            {
              userId: this.ydoc?.clientID, username: this.user.username, userColor: { addition: 'transperant', deletion: 'black' }
            });
          let state = editorView?.state.apply(tr);
          editorView?.updateState(state!);
        }
      } catch (err) {
        console.log(err);
      }
    };
    let textNodeType = schema.text('sdsd').type
    editorView = new EditorView(container, {
      state: edState,
      clipboardTextSerializer: (slice: Slice) => {
        return mathSerializer.serializeSlice(slice);
      },
      editable: (state: EditorState) => {

        return !this.mobileVersion
        // mobileVersion is true when app is in mobile mod | editable() should return return false to set editor not editable so we return !mobileVersion
      },
      dispatchTransaction,
      /* transformPastedHTML: (html) => {
        let startTag = false
        //let html2 = html.replace(/ [-\S]+=["']?((?:.(?!["']?\s+(?:\S+)=|\s*\/?[>"']))*.)["']|<\/?body>|<\/?html>/gm,'');
        let htm = html.replace(/ (class|data-id|data-track|style|data-group|data-viewid|data-user|data-username|data-date|data-pm-slice)=["']?((?:.(?!["']?\s+(?:\S+)=|\s*\/?[>"']))*.)["']/gm, '');
        let html2 = htm.replace(/<\/?body>|<\/?html>/gm, '');
        let html3 = html2.replace(/<\/?span *>/gm, '');
        return html3
      } ,*/handleClick(view, event) {
        return true

        try {
          let state = view.state;
          let from = state.selection.from;
          let nodeAt = state.doc.nodeAt(from);
          if (nodeAt) {
            if (nodeAt!.type == textNodeType) {
              return true
            }
          }
        } catch (e) {
          console.log(e);
        }
        return false
      }, handleKeyDown(view, event) {

        let state = view.state;
        let from = state.selection.from;
        let to = state.selection.to;
        let key = event.key
        if (state.selection instanceof GapCursor) {
          return true
        }

        if (key == 'Shift' || key == 'Backspace') {
          return false;
          if (key == 'Backspace') {
            if (from == to) {
              let nodeAtStart = state.doc.nodeAt(from - 1);
              if (nodeAtStart!.type == textNodeType) {
                return false;
              }
            } else {
              let nodeAtStart = state.doc.nodeAt(from);
              //let nodeAtStartMinusOne = state.doc.nodeAt(from);
              let nodeAtEnd = state.doc.nodeAt(to - 1);
              //let nodeAtEndPlusOne = state.doc.nodeAt(to);
              console.log('nodeAtStart', nodeAtStart);
              console.log('nodeAtEnd', nodeAtEnd);
              if (nodeAtStart?.type == textNodeType &&
                nodeAtEnd?.type == textNodeType) {
                return false;
              }
            }
            return true;
          }
          return false
        } else if (key == 'ArrowRight') {
          let nodeAt = state.doc.nodeAt(to + 1);
          if (nodeAt!.type == textNodeType) {
            return false;
          }
          return true;

        } else if (key == 'ArrowLeft') {
          let nodeAt = state.doc.nodeAt(from - 1);
          if (nodeAt) {
            if (nodeAt!.type == textNodeType) {
              return false;

            }
          }
          return true;

        } else if (key == 'ArrowUp' || key == 'ArrowDown' || event.altKey) {
          return true;
        }
        return false;

      }/* ,createSelectionBetween(view,anchor,head){
        let sel = new Selection(anchor,head)
        console.log(sel);
        view.state.selection = sel
        return sel
      } */


      /* nodeViews:{
        'text-input':(node,view,getPos,decorations)=>{
          return{
            dom:node
          }
        }
      } */
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

  renderEditorInWithId(EditorContainer: HTMLDivElement, editorId: string,section:articleSection): {
    editorID: string,
    containerDiv: HTMLDivElement,
    editorState: EditorState,
    editorView: EditorView,
    dispatchTransaction: any
  } {

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

    //let editorMode = section.mode;
    let menuContainerClass = "menu-container";

    //let xmlFragment = sectionData.mode == 'editMode' ? this.ydocCopyService.ydoc?.getXmlFragment(editorID) : this.ydoc?.getXmlFragment(editorID)
    let xmlFragment = this.getXmlFragment(section.mode, editorID)
   /*  if (editorData.editorMeta?.prosemirrorJsonTemplate) {
      let xmlProsemirrorContent = yDocToProsemirrorJSON(xmlFragment.doc, editorID)
      if (xmlProsemirrorContent.content.length == 0) {
        const node = prosemirrorNode.fromJSON(schema, editorData.editorMeta?.prosemirrorJsonTemplate)
        updateYFragment(xmlFragment.doc, xmlFragment, node, new Map())
      }
    } */


    let yjsPlugins = [ySyncPlugin(xmlFragment, { colors, colorMapping, permanentUserData }),
    /* yCursorPlugin(this.provider!.awareness) , */
    yUndoPlugin()]

    //editorData.menuType = ;
    /* if (editorMode !== 'documentMode') {
      menuContainerClass = 'popup-menu-container';
      //yjsPlugins = [ySyncPlugin(xmlFragment, { colors, colorMapping, permanentUserData }),  yUndoPlugin()];
    } */
    container.setAttribute('class', 'editor-container');
    let filterTransaction = false

    /* let plugins = [...yjsPlugins,
    this.placeholderPluginService.getPlugin(),
    this.detectFocusService.getPlugin() ,
    new Plugin({
      filterTransaction(transaction,state) {


        return true
      }

    })
    ] */
    let menu1

    menu1 = this.menuService.attachMenuItems(this.menu, this.ydoc!, 'fullMenuWithLog', editorID);

    this.initDocumentReplace[editorID] = false;

    setTimeout(() => {
      this.initDocumentReplace[editorID] = true;
      filterTransaction = true;
    }, 1000);

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
        new Plugin({
          filterTransaction(transaction, state) {
            let r = true
            if (transaction.steps.length > 0) {
              let result: StepResult<any>|undefined = undefined
              transaction.steps.forEach((step) => {
                if (result == undefined) {

                  result = step.apply(state.doc)
                } else {
                  result = step.apply(result!.doc!)
                }
              })
              /* state.doc.descendants((node,pos,parent)=>{
                if(node.attrs.validations){
                  console.log(node.attrs.validations);
                }
              }) */
              if (result !== undefined) {
                (result as StepResult<any>).doc!.descendants((node, pos, parent) => {
                  if (node.attrs.validations) {
                    let validations :any = node.attrs.validations as string
                    console.log();
                    if(validations.includes(';')){
                      let valArray:any[] = validations.split(';');
                      valArray.forEach((val,index)=>{
                        valArray[index] = val.split(':')
                      })
                      validations = valArray
                    }else{
                      validations = [validations.split(':')];
                    }
                    console.log(validations);
                    validations.forEach((validation:any) => {
                      if(validation[0] == 'max-size'){
                        if(node.nodeSize>+validation[1]){
                          console.log('node.nodeSize',node.nodeSize);
                          console.log('validations[1]',validation[1]);

                          r = false
                        }
                      }
                    });
                  }
                  if(node.attrs.regex){
                    let regexStr = node.attrs.regex
                    //@ts-ignore
                    let text = node.content.content[0].text
                    console.log(regexStr);
                    let regex = new RegExp(regexStr)
                    console.log(text);
                    console.log(regex.test(text));
                    if(!regex.test(text)){
                      r = false
                    }

                  }
                })
              }
            }
            return r
          }

        }),
        //trackPlugin,
        this.detectFocusService.getPlugin(),
        this.commentsService.getPlugin(),
        this.trackChangesService.getHideShowPlugin(),
        this.linkPopUpPluginService.linkPopUpPlugin,
        //commentsPlugin,
        //hideShowPlugin(this.changesContainer?.nativeElement),
        inputRules({ rules: [this.inlineMathInputRule, this.blockMathInputRule] }),
        //commentPlugin,

      ].concat(exampleSetup({ schema, menuContent: menu1, containerClass: menuContainerClass }))
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
          if (lastStep) {
            return
          }
        }
        lastStep = transaction.steps[0]
        if (!this.initDocumentReplace[editorID] || !this.shouldTrackChanges) {
          let state = editorView?.state.apply(transaction);
          editorView?.updateState(state!);

        } else {
          const tr = trackedTransaction.default(transaction, editorView?.state,
            {
              userId: this.ydoc?.clientID, username: this.user.username, userColor: { addition: 'transperant', deletion: 'black' }
            });
          let state = editorView?.state.apply(tr);
          editorView?.updateState(state!);
        }
      } catch (err) {
        console.log(err);
      }
    };
    let textNodeType = schema.text('sdsd').type
    editorView = new EditorView(container, {
      state: edState,
      clipboardTextSerializer: (slice: Slice) => {
        return mathSerializer.serializeSlice(slice);
      },
      editable: (state: EditorState) => {

        return !this.mobileVersion
        // mobileVersion is true when app is in mobile mod | editable() should return return false to set editor not editable so we return !mobileVersion
      },
      dispatchTransaction,
      /* transformPastedHTML: (html) => {
        let startTag = false
        //let html2 = html.replace(/ [-\S]+=["']?((?:.(?!["']?\s+(?:\S+)=|\s*\/?[>"']))*.)["']|<\/?body>|<\/?html>/gm,'');
        let htm = html.replace(/ (class|data-id|data-track|style|data-group|data-viewid|data-user|data-username|data-date|data-pm-slice)=["']?((?:.(?!["']?\s+(?:\S+)=|\s*\/?[>"']))*.)["']/gm, '');
        let html2 = htm.replace(/<\/?body>|<\/?html>/gm, '');
        let html3 = html2.replace(/<\/?span *>/gm, '');
        return html3
      } ,*/handleClick(view, event) {
        return true

        try {
          let state = view.state;
          let from = state.selection.from;
          let nodeAt = state.doc.nodeAt(from);
          if (nodeAt) {
            if (nodeAt!.type == textNodeType) {
              return true
            }
          }
        } catch (e) {
          console.log(e);
        }
        return false
      }, handleKeyDown(view, event) {

        let state = view.state;
        let from = state.selection.from;
        let to = state.selection.to;
        let key = event.key
        if (state.selection instanceof GapCursor) {
          return true
        }

        if (key == 'Shift' || key == 'Backspace') {
          return false;
          if (key == 'Backspace') {
            if (from == to) {
              let nodeAtStart = state.doc.nodeAt(from - 1);
              if (nodeAtStart!.type == textNodeType) {
                return false;
              }
            } else {
              let nodeAtStart = state.doc.nodeAt(from);
              //let nodeAtStartMinusOne = state.doc.nodeAt(from);
              let nodeAtEnd = state.doc.nodeAt(to - 1);
              //let nodeAtEndPlusOne = state.doc.nodeAt(to);
              console.log('nodeAtStart', nodeAtStart);
              console.log('nodeAtEnd', nodeAtEnd);
              if (nodeAtStart?.type == textNodeType &&
                nodeAtEnd?.type == textNodeType) {
                return false;
              }
            }
            return true;
          }
          return false
        } else if (key == 'ArrowRight') {
          let nodeAt = state.doc.nodeAt(to + 1);
          if (nodeAt!.type == textNodeType) {
            return false;
          }
          return true;

        } else if (key == 'ArrowLeft') {
          let nodeAt = state.doc.nodeAt(from - 1);
          if (nodeAt) {
            if (nodeAt!.type == textNodeType) {
              return false;

            }
          }
          return true;

        } else if (key == 'ArrowUp' || key == 'ArrowDown' || event.altKey) {
          return true;
        }
        return false;

      }/* ,createSelectionBetween(view,anchor,head){
        let sel = new Selection(anchor,head)
        console.log(sel);
        view.state.selection = sel
        return sel
      } */


      /* nodeViews:{
        'text-input':(node,view,getPos,decorations)=>{
          return{
            dom:node
          }
        }
      } */
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

  init() {

    let data = this.ydocService.getData();
    this.ydoc = data.ydoc;
    this.provider = data.provider;
    this.articleSectionsStructure = data.articleSectionsStructure;
    this.permanentUserData = new Y.PermanentUserData(this.ydoc);
    this.permanentUserData.setUserMapping(this.ydoc, this.ydoc.clientID, this.user.username);
    this.ydoc.gc = false;
  }
}
