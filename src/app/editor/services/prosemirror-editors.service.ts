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
import { EditorView } from 'prosemirror-view';
import { EditorState, Transaction } from 'prosemirror-state';
import { keymap } from 'prosemirror-keymap';
import { redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
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
import { articleSection } from '../utils/interfaces/articleSection';
import { editorData } from '../utils/interfaces/articleSection';
import { YdocCopyService } from './ydoc-copy.service';
@Injectable({
  providedIn: 'root'
})
export class ProsemirrorEditorsService {

  ydoc?: Y.Doc;
  ydocCopy?: Y.Doc
  provider?: WebrtcProvider;

  articleSectionsStructure?: articleSection[];

  initDocumentReplace: any = {};

  editorContainers:any={}

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

  mobileVersionSubject = new Subject<boolean>()
  mobileVersion = false;

  constructor(
    private menuService: MenuService,
    private detectFocusService: DetectFocusService,
    private placeholderPluginService: PlaceholderPluginService,
    private ydocService: YdocService,
    private linkPopUpPluginService: LinkPopUpPluginServiceService,
    private commentsService: CommentsService,
    private ydocCopyService: YdocCopyService,
    private trackChangesService: TrackChangesService) {

    this.mobileVersionSubject.subscribe((data)=>{
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

  dispatchEmptyTransaction() {  // for update of view 
    Object.values(this.editorContainers).forEach((container: any) => {
      let editorState = container.editorView.state as EditorState
      container.editorView.dispatch(editorState.tr)
    })
  }

  renderEditorIn(container: HTMLDivElement, editorData:editorData,sectionData:articleSection) {
    let editorView: EditorView;
    let colors = this.colors
    let colorMapping = this.colorMapping
    let permanentUserData = this.permanentUserData
    let editorID = editorData.editorId;
    //console.log('sectionData',sectionData);
    let data = editorData.editorMeta
    if(data?.label){
      let labelDIv = document.createElement('div');
      labelDIv.setAttribute('class', 'editor-container-label-div');
      labelDIv.innerHTML = data.label
      container.appendChild(labelDIv);
    }
    let editorMode = sectionData.mode;
    let menuContainerClass = "menu-container";

    let xmlFragment = sectionData.mode=='editMode'?this.ydocCopy?.getXmlFragment(editorID):this.ydoc?.getXmlFragment(editorID)
    let yjsPlugins = [ySyncPlugin(xmlFragment, { colors, colorMapping, permanentUserData }),
      /* yCursorPlugin(this.provider!.awareness) , */
      yUndoPlugin()]
    if(editorMode!=='documentMode'){
      menuContainerClass = 'popup-menu-container';
      yjsPlugins = [ySyncPlugin(xmlFragment, { colors, colorMapping, permanentUserData }),yUndoPlugin()];
    }
    container.setAttribute('class', 'editor-container');
    
    let menu1

    menu1 = this.menuService.attachMenuItems(this.menu, this.ydoc!, editorData.menuType, editorID);

    this.initDocumentReplace[editorID] = false;

    setTimeout(() => {
      this.initDocumentReplace[editorID] = true;
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
        /* trackPlugin, */
        this.detectFocusService.getPlugin(),
        this.commentsService.getPlugin(),
        this.trackChangesService.getHideShowPlugin(),
        this.linkPopUpPluginService.linkPopUpPlugin,
        //commentsPlugin,
        /* hideShowPlugin(this.changesContainer?.nativeElement), */
        inputRules({ rules: [this.inlineMathInputRule, this.blockMathInputRule] }),
        //commentPlugin,

      ].concat(exampleSetup({ schema, menuContent: menu1 ,containerClass:menuContainerClass}))
      ,
      // @ts-ignore
      sectionName: editorID,
      // @ts-ignore
      data
    });

    const dispatchTransaction = (transaction: Transaction) => {
      //console.log(transaction.steps);
      try {
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

    editorView = new EditorView(container, {
      state: edState,
      clipboardTextSerializer: (slice: Slice) => {
        return mathSerializer.serializeSlice(slice);
      },
      editable:(state:EditorState)=>{
        return !this.mobileVersion      
        // mobileVersion is true when app is in mobile mod | editable() should return return false to set editor not editable so we return !mobileVersion
      },
      dispatchTransaction,
      transformPastedHTML:(html)=>{
        let startTag = false
        //let html2 = html.replace(/ [-\S]+=["']?((?:.(?!["']?\s+(?:\S+)=|\s*\/?[>"']))*.)["']|<\/?body>|<\/?html>/gm,'');
        let htm = html.replace(/ (class|data-id|data-track|style|data-group|data-viewid|data-user|data-username|data-date|data-pm-slice)=["']?((?:.(?!["']?\s+(?:\S+)=|\s*\/?[>"']))*.)["']/gm,'');
        let html2 = htm.replace(/<\/?body>|<\/?html>/gm,'');
        let html3 = html2.replace(/<\/?span *>/gm,'');
        return html3
      },
    });

    let editorCont: editorContainer = {
      editorID: editorID,
      containerDiv: container,
      editorState: edState,
      editorView: editorView,
      dispatchTransaction: dispatchTransaction
    };

    this.editorContainers[editorID] = editorCont;
  }

  init() {

    let data = this.ydocService.getData();
    this.ydoc = data.ydoc;
    this.ydocCopy = this.ydocCopyService.ydoc;
    this.provider = data.provider;
    this.articleSectionsStructure = data.articleSectionsStructure;
    this.permanentUserData = new Y.PermanentUserData(this.ydoc);
    this.permanentUserData.setUserMapping(this.ydoc, this.ydoc.clientID, this.user.username);
    this.ydoc.gc = false;
  }
}
