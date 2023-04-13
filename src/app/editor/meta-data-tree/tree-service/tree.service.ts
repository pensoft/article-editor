import { Injectable, OnDestroy } from '@angular/core';
import { Subject, Subscriber, Subscription } from 'rxjs';
import { mainSectionValidations, YdocService } from '../../services/ydoc.service';
import { treeNode } from '../../utils/interfaces/treeNode';
//@ts-ignore
import * as Y from 'yjs'
import { articleSection, editorData } from '../../utils/interfaces/articleSection';
import { FormGroup } from '@angular/forms';
import {
  checkIfSectionsAreAboveOrAtMax,
  checkIfSectionsAreAboveOrAtMaxAtParentList,
  checkIfSectionsAreAboveOrAtMaxAtParentListWithName,
  checkIfSectionsAreUnderOrAtMin,
  checkIfSectionsAreUnderOrAtMinAtParentList,
  editorFactory,
  getAllAllowedNodesOnSection,
  getFilteredSectionChooseData,
  renderSectionFunc
} from '@app/editor/utils/articleBasicStructure';
import { FormBuilderService } from '@app/editor/services/form-builder.service';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { installPatch } from '../cdk-list-recursive/patchCdk';
import { CdkDropList, DropListRef, transferArrayItem } from '@angular/cdk/drag-drop';
import { parseSecFormIOJSONMenuAndSchemaDefs } from '@app/editor/utils/fieldsMenusAndScemasFns';
import { updateYFragment } from '../../../y-prosemirror-src/plugins/sync-plugin.js'
import {DOMParser} from 'prosemirror-model';

@Injectable({
  providedIn: 'root'
})

export class TreeService implements OnDestroy {

  articleSectionsStructure?: articleSection[]
  treeVisibilityChange: Subject<any> = new Subject<any>();
  metadatachangeMap?: Y.Map<any>
  articleStructureMap?: Y.Map<any>
  guid?: string
  toggleTreeDrawer: Subject<any> = new Subject<any>();

  connectedLists: string[] = []
  sectionFormGroups: { [key: string]: FormGroup } = {}
  sectionProsemirrorNodes: { [key: string]: string } = {} // prosemirror nodes as html

  canDropBool: any[] = [true];

  errorSnackbarSubject: Subject<any> = new Subject()

  labelupdateLocalMeta: any = {}

  treeSubsctiption?: Subscription
  obsFunc = (event: any, transaction: any) => {
    let metadatachange = this.metadatachangeMap?.get('change')
    if (this.guid != metadatachange.guid) {
      if (!this.ydocService.editorIsBuild) {
        return
      }
      if (metadatachange.action == 'listNodeDrag') {
        this.applyNodeDrag(metadatachange.from, metadatachange.to, metadatachange.prevContainerId, metadatachange.newContainerId)
      } else if (metadatachange.action == 'editNode') {
        this.applyEditChange(metadatachange.nodeId)
        this.applyEditChangeV2(metadatachange.nodeId)
      } else if (metadatachange.action == "addNode") {
        this.attachChildToNode(metadatachange.parentId,metadatachange.originalSectionTemplate, metadatachange.newChild);
      } else if (metadatachange.action == "deleteNode") {
        let { nodeRef, i } = this.deleteNodeById(metadatachange.childId);
      } else if (metadatachange.action == 'addNodeAtPlace') {
        this.addNodeAtPlace(metadatachange.parentContainerID, metadatachange.newSection, metadatachange.place, metadatachange.newNode);
      } else if (metadatachange.action == 'replaceChildren') {
        this.replaceChildren(metadatachange.newChildren, metadatachange.parent, true);
      } else if (metadatachange.action == 'buildNewFromGroups') {
        this.buildNewFormGroups(metadatachange.nodes);
      } else if (metadatachange.action == 'saveNewTitle') {
        this.saveNewTitle(metadatachange.node, metadatachange.title);
      }
    }
    //this.articleStructureMap?.set('articleSectionsStructure', this.articleSectionsStructure)

  }

  setTitleListener(node: articleSection) {
    let formGroup = this.sectionFormGroups[node.sectionID]!;
    let shouldInterpolate = /{{\s*\S*\s*}}|<span(\[innerHTML]="[\S]+"|[^>])+>[^<]*<\/span>/gm.test(node.title.template)
    node.title.label = shouldInterpolate ? node.title.name! : node.title.label;
    formGroup.valueChanges.subscribe((data) => {
      if(shouldInterpolate){
        if (node.title.name == '[MM] Materials' || node.title.name == 'Material') {
          let customPropsObj = this.ydocService.customSectionProps?.get('customPropsObj');
          let data = customPropsObj[node.sectionID];
          let valuesCopy = {};
          Object.keys(data).forEach((key)=>{
            valuesCopy[key] = data[key]
          })
          this.serviceShare.ProsemirrorEditorsService?.interpolateTemplate(node.title.template, valuesCopy, formGroup).then((newTitle: string) => {
            node.title.label = newTitle
          })
        } else {
          let valuesCopy = {};
          Object.keys(formGroup.value).forEach((key)=>{
            valuesCopy[key] = formGroup.value[key]
          })
          this.serviceShare.ProsemirrorEditorsService?.interpolateTemplate(node.title.template, valuesCopy, formGroup).then((newTitle: string) => {
            node.title.label = newTitle
          })
        }
      }else if(formGroup.value.sectionTreeTitle && node.title.label!=formGroup.value.sectionTreeTitle){
        node.title.label = formGroup.value.sectionTreeTitle
      }
    })
  }

  resetTreeData() {
    this.articleSectionsStructure = undefined;
    if (this.obsFunc) {
      this.metadatachangeMap?.unobserve(this.obsFunc)
    }
    if (this.treeSubsctiption) {
      this.treeSubsctiption.unsubscribe();
    }
    this.metadatachangeMap = undefined
    this.articleStructureMap = undefined
    this.guid = undefined
    this.sectionFormGroups = {}
    this.sectionProsemirrorNodes = {}
    this.parentListRules = undefined
  }

  registerConnection(id: string) {
    if (!this.connectedLists.includes(id)) {
      this.connectedLists.push(id);
    }
  }

  connectionChangeSubject: Subject<boolean> = new Subject();
  dropListRefs: { ids: string[], refs: DropListRef[], cdkRefs: CdkDropList[] } = { ids: [], refs: [], cdkRefs: [] };
  registerDropListRef(ref: DropListRef, cdkDropList: CdkDropList, id: string) {
    if (!this.dropListRefs.ids.includes(id)) {
      this.dropListRefs.ids.push(id);
      this.dropListRefs.cdkRefs.push(cdkDropList)
      this.dropListRefs.refs.push(ref)
      this.connectionChangeSubject.next(true)
    }
  }
  unregisterDropListRef(id: string) {
    if (this.dropListRefs.ids.includes(id)) {
      let index = this.dropListRefs.ids.findIndex((idsearch) => idsearch == id);
      this.dropListRefs.ids.splice(index)
      this.dropListRefs.cdkRefs.splice(index)
      this.dropListRefs.refs.splice(index)
      this.connectionChangeSubject.next(true)
    }
  }
  unregisterConnection(id: string) {
    if (this.connectedLists.includes(id)) {
      this.connectedLists.splice(this.connectedLists.findIndex((connId) => connId == id), 1);
    }
  }

  constructor(
    private ydocService: YdocService,
    private formBuilderService: FormBuilderService,
    private serviceShare: ServiceShare,
    private articlesSectionsService: ArticleSectionsService
  ) {
    installPatch(this);

    this.serviceShare.shareSelf('TreeService', this);
    let buildFunc = () => {
      this.guid = this.metadatachangeMap?.doc?.guid;
      this.articleStructureMap = ydocService.ydoc.getMap('articleStructure');
      this.metadatachangeMap?.observe(this.obsFunc)

      this.treeSubsctiption = this.treeVisibilityChange.subscribe((data) => {
        let guid = this.metadatachangeMap?.doc?.guid
        this.metadatachangeMap?.set('change', { ...data, guid })
        this.setArticleSectionStructureFlat()
      })
      this.setParentListSectionMinMaxRules()
    }
    if (this.ydocService.editorIsBuild) {
      this.metadatachangeMap = ydocService.getYDoc().getMap('editorMetadataChange')
      buildFunc()
    }
    this.ydocService.ydocStateObservable.subscribe((event) => {
      if (event == 'docIsBuild') {
        this.metadatachangeMap = ydocService.getYDoc().getMap('editorMetadataChange')
        buildFunc()
      }
    });
  }

  parentListRules:mainSectionValidations = {}
  setParentListSectionMinMaxRules(){
    let rules = this.ydocService.articleData.mainSectionValidations
    /* if(rules){
      let parentListSectionRules = []
      rules.forEach(x=>{
        if(x.key == "min_max_section_instances"){
          let sectionNames = x.config.names.split('|');
          let min = x.config.min
          let max = x.config.max
          sectionNames.forEach((sec)=>{
            parentListSectionRules.push({sectionName:sec,min,max})
          })
        }
      })
      this.parentListRules = parentListSectionRules
    } */
    this.parentListRules = this.ydocService.articleData.mainSectionValidations
  }

  ngOnDestroy(): void {
    this.setArticleSectionStructureFlat()
  }

  setArticleSectionStructureFlat() {
    //this.articleSectionsStructure = this.ydocService.articleStructure?.get('articleSectionsStructure')

    let articleSectionsStructureFlat1: articleSection[] = []
    let makeFlat = (structure: articleSection[]) => {
      structure.forEach((section) => {
        if (section.active) {
          articleSectionsStructureFlat1.push(section)
        }
        if (section.children.length > 0) {
          makeFlat(section.children)
        }
      })
    }
    makeFlat(this.articleSectionsStructure!)
    //this.articleSectionsStructureFlat = articleSectionsStructureFlat1
    this.ydocService.articleStructure?.set('articleSectionsStructureFlat', articleSectionsStructureFlat1)
    this.ydocService.articleStructure?.set('articleSectionsStructure', this.articleSectionsStructure)
  }


  initTreeList(articleSectionsStructure: articleSection[]) {
    this.articleSectionsStructure = articleSectionsStructure
  }

  getNodeLevel(node: articleSection) {
    if(!node) return {nodeLevel: 0, hTag: 0};
    let nodeLevel: number
    let hTag = 0
    let isIn = false;
    const regex = /<h([1-6]).*>/g;
    let findLevel = (children: articleSection[], level: number, h: number) => {
      children.forEach((child, i) => {
        const match = regex.exec(child.originalSectionTemplate.template);
        if (child.sectionID == node.sectionID) {
          if(match) {
            hTag = +match[1];
          } else {
            if(level > 0) {
              hTag = h;
            } else {
              hTag = 2;
            }
          }
          child.level = hTag;
          nodeLevel = level;
          isIn = true;
        }
        if (!isIn && nodeLevel == undefined && child.type == 'complex' && child.children.length > 0) {
          findLevel(child.children, level + 1, child.level + 1);
        }
      })
    }
    findLevel(this.articleSectionsStructure!, 0, 0);
    //@ts-ignore
    return {nodeLevel, hTag };
  }

  buildNewFormGroups(nodes: articleSection[]) {
    let buildForms = (node: any) => {
      let dataFromYMap = this.ydocService.sectionFormGroupsStructures!.get(node.sectionID);
      let defaultValues = dataFromYMap ? dataFromYMap.data : node.defaultFormIOValues
      let sectionContent = defaultValues ? this.formBuilderService.populateDefaultValues(defaultValues, node.formIOSchema, node.sectionID,node) : node.formIOSchema;
      let nodeForm: FormGroup = new FormGroup({});
      this.formBuilderService.buildFormGroupFromSchema(nodeForm, sectionContent, node);

      nodeForm.patchValue(defaultValues);
      nodeForm.updateValueAndValidity()
      this.sectionFormGroups[node.sectionID] = nodeForm;
      this.setTitleListener(node)
      if (node.children.length > 0) {
        node.children.forEach((child: any) => {
          buildForms(child)
        })
      }
    }
    nodes.forEach((section) => {
      buildForms(section)
    })
  }

  saveNewTitleChange(node: articleSection, title: string) {
    this.saveNewTitle(node, title)
    this.treeVisibilityChange.next({ action: "saveNewTitle", node, title })
  }

  saveNewTitle(node: articleSection, title: string) {
    let nodeRef = this.findNodeById(node.sectionID);
    if (nodeRef) {
      nodeRef.title.label = title;
    }
  }

  buildNewFormGroupsChange(nodes: articleSection[]) {
    this.buildNewFormGroups(nodes)
    this.treeVisibilityChange.next({ action: "buildNewFromGroups", nodes })
  }

  replaceChildren(newChildren: articleSection[], parent: articleSection, replaceFromOtherRoot: boolean) {
    let nodeRef = this.findNodeById(parent.sectionID);
    nodeRef!.children = newChildren;
  }

  replaceChildrenChange(newChildren: articleSection[], parent: articleSection) {
    this.replaceChildren(newChildren, parent, false)
    this.treeVisibilityChange.next({ action: 'replaceChildren', newChildren, parent });
  }

  dragNodeChange(from: number, to: number, prevContainerId: string, newContainerId: string, node: articleSection) {
    /*
    this.serviceShare.YjsHistoryService.startCapturingNewUndoItem();
    this.serviceShare.YjsHistoryService.addUndoItemInformation({type:'section-drag-drop',data:{
      from,
      to,
      prevContainerId,
      newContainerId
    }})
    this.serviceShare.YjsHistoryService.stopCapturingUndoItem(); */

    setTimeout(() => {
      //this.serviceShare.FiguresControllerService.updateOnlyFiguresView()
      this.serviceShare.updateCitableElementsViews()
    }, 10)

    this.updateSectionView(node)

    this.treeVisibilityChange.next({ action: 'listNodeDrag', from, to, prevContainerId, newContainerId })
  }
  updateSectionView(node: articleSection) {
    let findF = (list: articleSection[], cb :(node:articleSection)=>void) => {
      list.forEach((node) => {
        cb(node)
        if (node.children && node.children.length>0) {
          findF(node.children,cb)
        }
      })
    }

    const updateView = (node: articleSection) => {
      let {nodeLevel, hTag} = this.getNodeLevel(node)
      let htmlTemplate = node.prosemirrorHTMLNodesTempl
      let sectionFormGroup = this.sectionFormGroups[node.sectionID]
      let submission = sectionFormGroup.value
            
      this.serviceShare.ProsemirrorEditorsService.interpolateTemplate(htmlTemplate, submission, sectionFormGroup, null, {hTag}).then((result: string) => {
        let templDiv = document.createElement('div');
        templDiv.innerHTML = result

        let xmlFragment = this.ydocService.ydoc.getXmlFragment(node.sectionID);
        
        let node1 = DOMParser.fromSchema(this.serviceShare.ProsemirrorEditorsService.editorContainers[node.sectionID].editorView.state.schema).parse(templDiv.firstChild!);
        
        updateYFragment(xmlFragment.doc, xmlFragment, node1, new Map());
        })
    }

    updateView(node)
    findF(node.children, updateView)
  }
  editNodeChange(nodeId: string) {
    this.applyEditChangeV2(nodeId)
    this.applyEditChange(nodeId)
    this.treeVisibilityChange.next({ action: 'editNode', nodeId });
  }

  async addNodeChange(nodeId: string,originalSectionTemplate:any,callback?:()=>void) {
    let newChild = await this.attachChildToNode(nodeId,originalSectionTemplate, undefined);
    this.ydocService.saveSectionMenusAndSchemasDefs([newChild])
    this.treeVisibilityChange.next({ action: 'addNode', parentId: nodeId, newChild,originalSectionTemplate });
    callback();
  }

  renderForms = (sectionToRender: articleSection) => {
    let children: any[] = []
    if (sectionToRender.type == "complex") {
      sectionToRender.children.forEach((childSection: any) => {
        this.renderForms(childSection)
      })
    }

    let dataFromYMap = this.ydocService.sectionFormGroupsStructures!.get(sectionToRender.sectionID);
    let defaultValues = dataFromYMap ? dataFromYMap.data : sectionToRender!.defaultFormIOValues
    let sectionContent = defaultValues ? this.formBuilderService.populateDefaultValues(defaultValues, sectionToRender!.formIOSchema, sectionToRender!.sectionID,sectionToRender) : sectionToRender!.formIOSchema;

    let nodeForm: FormGroup = new FormGroup({});
    this.formBuilderService.buildFormGroupFromSchema(nodeForm, sectionContent, sectionToRender!);

    nodeForm.patchValue(defaultValues);
    nodeForm.updateValueAndValidity()
    this.sectionFormGroups[sectionToRender!.sectionID] = nodeForm;
    this.setTitleListener(sectionToRender)
  }

  addNodeAtPlaceChange(parentContainerID: string, newSection: any, place: any) {
    let newNode = this.addNodeAtPlace(parentContainerID, newSection, place);
    this.ydocService.saveSectionMenusAndSchemasDefs([newNode])
    this.treeVisibilityChange.next({ action: 'addNodeAtPlace', parentContainerID, newSection, place, newNode });
  }

  addNodeAtPlace(parentContainerID: string, newSection: any, place: any, newNode?: any) {
    if (newNode) {
      if (typeof place == 'string' && place == 'end') {
        if (parentContainerID == 'parentList') {
          this.articleSectionsStructure?.push(newNode);
        } else {
          let containerToPlaceIn = this.findNodeById(parentContainerID)?.children;
          containerToPlaceIn?.push(newNode);
        }
      } else if (typeof place == 'number') {
        if (parentContainerID == 'parentList') {
          this.articleSectionsStructure?.splice(place, 0, newNode);
        } else {
          let containerToPlaceIn = this.findNodeById(parentContainerID)?.children;
          containerToPlaceIn?.splice(place, 0, newNode);
        }
      }
      let buildForms = (node: any) => {
        let dataFromYMap = this.ydocService.sectionFormGroupsStructures!.get(node.sectionID);
        let defaultValues = dataFromYMap ? dataFromYMap.data : node.defaultFormIOValues
        let sectionContent = defaultValues ? this.formBuilderService.populateDefaultValues(defaultValues, node.formIOSchema, node.sectionID,node) : node.formIOSchema;
        let nodeForm: FormGroup = new FormGroup({});
        this.formBuilderService.buildFormGroupFromSchema(nodeForm, sectionContent, node);

        nodeForm.patchValue(defaultValues);
        nodeForm.updateValueAndValidity()
        this.sectionFormGroups[node.sectionID] = nodeForm;
        this.setTitleListener(node)

        if (node.children.length > 0) {
          node.children.forEach((child: any) => {
            buildForms(child)
          })
        }
      }
      buildForms(newNode)
      return;
    }
    let container: any[] = []

    let sec = renderSectionFunc(newSection, container, this.ydocService.ydoc,this.serviceShare);

    this.renderForms(sec)

    if (typeof place == 'string' && place == 'end') {
      if (parentContainerID == 'parentList') {
        this.articleSectionsStructure?.push(container[0]);
      } else {
        let containerToPlaceIn = this.findNodeById(parentContainerID)?.children;
        containerToPlaceIn?.push(container[0]);
      }
    } else if (typeof place == 'number') {
      if (parentContainerID == 'parentList') {
        this.articleSectionsStructure?.splice(place, 0, container[0]);
      } else {
        let containerToPlaceIn = this.findNodeById(parentContainerID)?.children;
        containerToPlaceIn?.splice(place, 0, container[0]);
      }
    }
    return container[0];
  }

  updateNodeProsemirrorHtml(newHTML: string, sectionId: string) {
    let nodeRef = this.findNodeById(sectionId)!;
    nodeRef.prosemirrorHTMLNodesTempl = newHTML;
    this.setArticleSectionStructureFlat()
  }

  deleteNodeChange(nodeId: string, parentId: string) {
    let editorContainer = this.serviceShare.ProsemirrorEditorsService.editorContainers[nodeId]
    if(editorContainer){
      let doc = editorContainer.editorView.state.doc;
      let docSize = doc.content.size
      let deletedRefCitations: any[] = []
      doc.nodesBetween(0, docSize - 2, (node, pos, par, i) => {
        if (node.type.name == 'reference_citation') {
          deletedRefCitations.push(JSON.parse(JSON.stringify(node.attrs)))
        }
      })
      if (deletedRefCitations.length > 0) {
        setTimeout(()=>{
          this.serviceShare.YjsHistoryService.preventCaptureOfBigNumberOfUpcomingItems()
          this.serviceShare.YjsHistoryService.capturingNewItem = true
          this.serviceShare.EditorsRefsManagerService!.updateRefsInEndEditorAndTheirCitations();
          setTimeout(() => {
            this.serviceShare.YjsHistoryService.stopBigNumberItemsCapturePrevention()
          }, 30)
        },30)
      }
    }
    let { nodeRef, i } = this.deleteNodeById(nodeId);
    setTimeout(() => {
      if (nodeRef.custom) {
        let customSectionPropsObj = this.ydocService.customSectionProps.get('customPropsObj');
        if (customSectionPropsObj[nodeId]) {
          customSectionPropsObj[nodeId] = undefined;
        }
        this.ydocService.customSectionProps.set('customPropsObj', customSectionPropsObj)
      }
      //this.serviceShare.FiguresControllerService.updateOnlyFiguresView();
      this.serviceShare.updateCitableElementsViews()
    }, 10)
    this.treeVisibilityChange.next({ action: 'deleteNode', parentId, childId: nodeId, indexInList: i });
  }

  findListArray(id: string) {
    let arr: articleSection[] | undefined
    let findF = (list?: articleSection[]) => {
      list?.forEach((node) => {
        if (node.sectionID !== undefined && node.sectionID == id) {
          arr = node.children
        } else if (node.children) {
          findF(node.children)
        }
      })
    }
    findF(this.articleSectionsStructure);
    return arr
  }

  deleteNodeById(id: string) {

    let nodeRef: articleSection | undefined
    let i: number | undefined
    let arrayRef: articleSection[] | undefined
    let findF = (list?: articleSection[]) => {
      list?.forEach((node, index, array) => {
        if (node.sectionID !== undefined && node.sectionID == id) {
          nodeRef = node
          i = index
          arrayRef = array
        } else if (node.children) {
          findF(node.children)
        }
      })
    }
    findF(this.articleSectionsStructure);
    arrayRef?.splice(i!, 1);
    let deleteNodeData = (node: articleSection) => {
      let id = node.sectionID;
      this.serviceShare.ProsemirrorEditorsService?.deleteEditor(id);
      this.serviceShare.YjsHistoryService?.deleteUndoManager(id);
    }
    let deleteNodeDataRecursive = (node: articleSection) => {
      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => {
          deleteNodeDataRecursive(child);
        })
      }
      deleteNodeData(node);
    }
    deleteNodeDataRecursive(nodeRef);
    this.serviceShare.CommentsService.getCommentsInAllEditors()
    return { nodeRef, i }
  }

  findNodeById(id: string) {
    let nodeRef: articleSection | undefined
    let findF = (list?: articleSection[]) => {
      list?.forEach((node) => {
        if (node.sectionID !== undefined && node.sectionID == id) {
          nodeRef = node
        } else if (node.children) {
          findF(node.children)
        }
      })
    }
    findF(this.articleSectionsStructure);
    return nodeRef
  }

  applyNodeDrag(from: number, to: number, prevContainerId: string, newContainerId: string) {
    let articleDataCopy = this.articleSectionsStructure!
    let prevContNewRef: any[]
    let newContNewRef: any[]

    if (newContainerId == 'parentList') {
      newContNewRef = articleDataCopy;
    }

    if (prevContainerId == 'parentList') {
      prevContNewRef = articleDataCopy;
    }

    let findReferences = (container: any) => {
      container.forEach((el: any) => {
        if (el.sectionID == prevContainerId) {
          prevContNewRef = el.children
        }
        if (el.sectionID == newContainerId) {
          newContNewRef = el.children
        }
        if (el.children && el.children.length > 0) {
          findReferences(el.children)
        }
      })
    }

    findReferences(articleDataCopy);
    //@ts-ignore
    transferArrayItem(prevContNewRef, newContNewRef, from, to);

  }

  findContainerWhereNodeIs(nodeid: string) {
    let containerofNode: undefined | articleSection[] = undefined
    let find = (container: articleSection[]) => {
      container.forEach((section) => {
        if (section.sectionID == nodeid) {
          containerofNode = container
        } else if (section.children.length > 0 && containerofNode == undefined) {
          find(section.children);
        }
      })
    }
    find(this.articleSectionsStructure!)
    return containerofNode!
  }

  showDeleteButton(node: articleSection) {
    let r = true
    let parentNode = this.findParentNodeWithChildID(node.sectionID)!;
    if (parentNode && parentNode !== 'parentNode') {
      r = checkIfSectionsAreUnderOrAtMin(node, parentNode)
    }else if(parentNode == 'parentNode'){
      r = checkIfSectionsAreUnderOrAtMinAtParentList(this.articleSectionsStructure,node,this.parentListRules)
    }
    return r
  }

  checkIfNodeIsAtMaxInParentListWithBESection(data:any){
    return checkIfSectionsAreAboveOrAtMaxAtParentListWithName(this.articleSectionsStructure,data,this.parentListRules)
  }

  checkIfCanMoveNodeOutOfParentList(node:articleSection){
    return checkIfSectionsAreUnderOrAtMinAtParentList(this.articleSectionsStructure,node,this.parentListRules)
  }

  checkIfCanMoveNodeInParentList(node:articleSection){
    return checkIfSectionsAreAboveOrAtMaxAtParentList(this.articleSectionsStructure,node,this.parentListRules)
  }

  showAddBtn(node: articleSection) {
    let r = true
    let parentNode = this.findParentNodeWithChildID(node.sectionID)!;
    if (parentNode && parentNode !== 'parentNode') {
      r = checkIfSectionsAreAboveOrAtMax(node, parentNode)
    }else if(parentNode == 'parentNode'){
      r = checkIfSectionsAreAboveOrAtMaxAtParentList(this.articleSectionsStructure,node,this.parentListRules)
    }
    return r
  }

  showAddSubsectionBtn(node: articleSection) {
    let fileredSections = getFilteredSectionChooseData(node)
    return (this.getNodeLevel(node).nodeLevel+1 < 4&&fileredSections.length>0)
  }

  findParentNodeWithChildID(nodeid: string) {
    let parent: undefined | articleSection | 'parentNode' = undefined
    let find = (container: articleSection[], parentNode: articleSection | 'parentNode') => {
      container.forEach((section) => {
        if (section.sectionID == nodeid) {
          parent = parentNode
        } else if (section.children.length > 0 && parent == undefined) {
          find(section.children, section);
        }
      })
    }
    find(this.articleSectionsStructure!, 'parentNode')
    return parent!
  }

  async attachChildToNode(clickedNode: string, originalSectionTemplate:any,node: any) {
    let newNodeContainer = this.findContainerWhereNodeIs(clickedNode);
    let nodeRef = this.findNodeById(clickedNode)!;
    if (node) {
      newNodeContainer.splice(newNodeContainer.findIndex((s) => s.sectionID == nodeRef.sectionID)! + 1, 0, node);
      let buildForms = (node: any) => {
        let dataFromYMap = this.ydocService.sectionFormGroupsStructures!.get(node.sectionID);
        let defaultValues = dataFromYMap ? dataFromYMap.data : node.defaultFormIOValues
        let sectionContent = defaultValues ? this.formBuilderService.populateDefaultValues(defaultValues, node.formIOSchema, node.sectionID,node) : node.formIOSchema;
        let nodeForm: FormGroup = new FormGroup({});
        this.formBuilderService.buildFormGroupFromSchema(nodeForm, sectionContent, node);

        nodeForm.patchValue(defaultValues);
        nodeForm.updateValueAndValidity()
        this.sectionFormGroups[node.sectionID] = nodeForm;
        this.setTitleListener(node)
        if (node.children.length > 0) {
          node.children.forEach((child: any) => {
            buildForms(child)
          })
        }
      }
      buildForms(node)
      return
    }
    let newChild

    let container: any[] = []
    let newSec = renderSectionFunc(originalSectionTemplate, container, this.ydocService.ydoc,this.serviceShare);
    this.renderForms(newSec);
    newChild = container[0]
    newNodeContainer.splice(newNodeContainer.findIndex((s) => s.sectionID == nodeRef.sectionID)! + 1, 0, container[0]);

    return Promise.resolve(newChild)
  }

  applyEditChangeV2(id:string){
    let nodeRef = this.findNodeById(id)!;
    let {sectionMenusAndSchemaDefsFromJSON,formIOJSON,sectionMenusAndSchemasDefsfromJSONByfieldsTags} = parseSecFormIOJSONMenuAndSchemaDefs(nodeRef.formIOSchema,{menusL:"customSectionJSONMenuType",tagsL:'customSectionJSONAllowedTags'});
    this.serviceShare.ProsemirrorEditorsService.globalMenusAndSchemasSectionsDefs[id] = sectionMenusAndSchemasDefsfromJSONByfieldsTags;
  }

  applyEditChange(id: string) {
    let nodeRef = this.findNodeById(id)!;
    if(nodeRef&&!nodeRef.active){
      nodeRef.active = true
    }
  }
}
