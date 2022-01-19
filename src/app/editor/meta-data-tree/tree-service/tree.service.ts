import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { YdocService } from '../../services/ydoc.service';
import { treeNode } from '../../utils/interfaces/treeNode';
//@ts-ignore
import * as Y from 'yjs'
import { uuidv4 } from 'lib0/random';
import { articleSection, editorData } from '../../utils/interfaces/articleSection';
import { FormGroup } from '@angular/forms';
import { editorFactory, renderSectionFunc } from '@app/editor/utils/articleBasicStructure';
import { formIODefaultValues, formIOTemplates, htmlNodeTemplates } from '@app/editor/utils/section-templates';
import { FormBuilderService } from '@app/editor/services/form-builder.service';
import { ServiceShare } from '@app/editor/services/service-share.service';
import { ArticlesService } from '@app/core/services/articles.service';
import { ArticleSectionsService } from '@app/core/services/article-sections.service';
import { reject } from 'lodash';
import { complexSectionFormIoSchema } from '@app/editor/utils/section-templates/form-io-json/complexSection';
import { ReturnStatement } from '@angular/compiler';
import { installPatch } from '../cdk-list-recursive/patchCdk';
import { transferArrayItem } from '@angular/cdk/drag-drop';
@Injectable({
  providedIn: 'root'
})
export class TreeService {

  articleSectionsStructure?: articleSection[]
  treeVisibilityChange: Subject<any> = new Subject<any>();
  metadatachangeMap?: Y.Map<any>
  articleStructureMap?: Y.Map<any>
  guid?: string
  toggleTreeDrawer: Subject<any> = new Subject<any>();

  connectedLists :string[] = []
  sectionFormGroups: { [key: string]: FormGroup } = {}
  sectionProsemirrorNodes: { [key: string]: string } = {} // prosemirror nodes as html

  canDropBool:any[] = [true];

  errorSnackbarSubject : Subject<any> = new Subject()

  resetTreeData() {
    this.articleSectionsStructure = undefined;
    this.metadatachangeMap = undefined
    this.articleStructureMap = undefined
    this.guid = undefined
    this.sectionFormGroups = {}
    this.sectionProsemirrorNodes = {}
  }

  registerConnection(id:string){
    if(!this.connectedLists.includes(id)){
      this.connectedLists.push(id)
    }
  }

  unregisterConnection(id:string){
    if(this.connectedLists.includes(id)){
      this.connectedLists.splice(this.connectedLists.findIndex((connId)=>connId == id),1);
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
      this.metadatachangeMap?.observe((event: any, transaction: any) => {
        let metadatachange = this.metadatachangeMap?.get('change')
        if (this.guid != metadatachange.guid) {
          if (!this.ydocService.editorIsBuild) {
            return
          }
          if (metadatachange.action == 'listNodeDrag') {
            this.applyNodeDrag(metadatachange.from,metadatachange.to, metadatachange.prevContainerId, metadatachange.newContainerId)
          } else if (metadatachange.action == 'editNode') {
            this.applyEditChange(metadatachange.nodeId)
          } else if (metadatachange.action == "addNode") {
            this.attachChildToNode(metadatachange.parentId, metadatachange.newChild);
          } else if (metadatachange.action == "deleteNode") {
            let { nodeRef, i } = this.deleteNodeById(metadatachange.childId);
          } else if (metadatachange.action == 'addNodeAtPlace'){
            this.addNodeAtPlace(metadatachange.parentContainerID,metadatachange.newSection,metadatachange.place,metadatachange.newNode);
          } else if(metadatachange.action == 'replaceChildren'){
            this.replaceChildren(metadatachange.newChildren,metadatachange.parent);
          }else if (metadatachange.action == 'buildNewFromGroups'){
            this.buildNewFormGroups(metadatachange.nodes);
          }else if(metadatachange.action == 'saveNewTitle'){
            this.saveNewTitle(metadatachange.node,metadatachange.title);
          }
        }
        //this.articleStructureMap?.set('articleSectionsStructure', this.articleSectionsStructure)

      })

      this.treeVisibilityChange.subscribe((data) => {
        let guid = this.metadatachangeMap?.doc?.guid
        this.setArticleSectionStructureFlat()
        this.metadatachangeMap?.set('change', { ...data, guid })
      })
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

  setTitleListener(node:articleSection){
    if(!node.title.editable){
      let formGroup = this.sectionFormGroups[node.sectionID];
      node.title.label = /{{\s*\S*\s*}}/gm.test(node.title.label)?node.title.name!:node.title.label;
      formGroup.valueChanges.subscribe((data)=>{
        this.serviceShare.ProsemirrorEditorsService?.interpolateTemplate(node.title.template, formGroup.value, formGroup).then((newTitle:string)=>{
          let container = document.createElement('div')
          container.innerHTML = newTitle;
          container.innerHTML = container.textContent!;
          node.title.label = container.textContent!;
        })
      })
    }
  }

  initTreeList(articleSectionsStructure: articleSection[]) {
    this.articleSectionsStructure = articleSectionsStructure
  }

  getNodeLevel(node:articleSection){
    let nodeLevel:number
    let findLevel = (children:articleSection[],level:number)=>{
      children.forEach((child)=>{
        if(child.sectionID == node.sectionID){
          nodeLevel = level;
        }
        if(nodeLevel==undefined&&child.type == 'complex'&&child.children.length>0){
          findLevel(child.children,level+1);
        }
      })
    }
    findLevel(this.articleSectionsStructure!,0);
    //@ts-ignore
    return nodeLevel;
  }

  buildNewFormGroups(nodes:articleSection[]){
    let buildForms = (node: any) => {
      let dataFromYMap = this.ydocService.sectionFormGroupsStructures!.get(node.sectionID);
      let defaultValues = dataFromYMap ? dataFromYMap.data : node.defaultFormIOValues
      let sectionContent = defaultValues ? this.formBuilderService.populateDefaultValues(defaultValues, node.formIOSchema, node.sectionID) : node.formIOSchema;
      let nodeForm: FormGroup = new FormGroup({});
      this.formBuilderService.buildFormGroupFromSchema(nodeForm, sectionContent);

      nodeForm.patchValue(defaultValues);
      nodeForm.updateValueAndValidity()
      this.sectionFormGroups[node.sectionID] = nodeForm;
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

  saveNewTitleChange(node:articleSection,title:string){
    this.saveNewTitle(node,title)
    this.treeVisibilityChange.next({action:"saveNewTitle",node,title})
  }

  saveNewTitle(node:articleSection,title:string){
    let nodeRef = this.findNodeById(node.sectionID);
    nodeRef!.title.label = title;
  }

  buildNewFormGroupsChange(nodes:articleSection[]){
    this.buildNewFormGroups(nodes)
    this.treeVisibilityChange.next({action:"buildNewFromGroups",nodes})
  }

  replaceChildren(newChildren:articleSection[],parent:articleSection){
    let nodeRef = this.findNodeById(parent.sectionID);
    nodeRef!.children = newChildren;
  }

  replaceChildrenChange(newChildren:articleSection[],parent:articleSection){
    this.replaceChildren(newChildren,parent)
    this.treeVisibilityChange.next({action:'replaceChildren',newChildren,parent});
  }

  dragNodeChange(from: number, to: number, prevContainerId: string,newContainerId:string) {
    this.treeVisibilityChange.next({ action: 'listNodeDrag', from, to, prevContainerId ,newContainerId})
  }

  editNodeChange(nodeId: string) {
    try {
      this.applyEditChange(nodeId)
    } catch (e) {
      console.error(e);
    }
    this.treeVisibilityChange.next({ action: 'editNode', nodeId });
  }

  async addNodeChange(nodeId: string) {
    let newChild = await this.attachChildToNode(nodeId, undefined);
    this.treeVisibilityChange.next({ action: 'addNode', parentId: nodeId, newChild });
  }

  renderForms = (sectionToRender:articleSection) => {
    let children: any[] = []
    if (sectionToRender.type == "complex") {
      sectionToRender.children.forEach((childSection: any) => {
        this.renderForms(childSection)
      })
    }

    let dataFromYMap = this.ydocService.sectionFormGroupsStructures!.get(sectionToRender.sectionID);
    let defaultValues = dataFromYMap ? dataFromYMap.data : sectionToRender!.defaultFormIOValues
    let sectionContent = defaultValues ? this.formBuilderService.populateDefaultValues(defaultValues, sectionToRender!.formIOSchema, sectionToRender!.sectionID) : sectionToRender!.formIOSchema;

    let nodeForm: FormGroup = new FormGroup({});
    this.formBuilderService.buildFormGroupFromSchema(nodeForm, sectionContent);

    nodeForm.patchValue(defaultValues);
    nodeForm.updateValueAndValidity()
    this.sectionFormGroups[sectionToRender!.sectionID] = nodeForm;
  }

  addNodeAtPlaceChange(parentContainerID:string,newSection:any,place:any){
    let newNode = this.addNodeAtPlace(parentContainerID,newSection,place);
    this.treeVisibilityChange.next({ action: 'addNodeAtPlace', parentContainerID, newSection,place ,newNode});
  }

  addNodeAtPlace(parentContainerID:string,newSection:any,place:any,newNode?:any){
    if(newNode){
      if(typeof place == 'string' && place == 'end'){
        if(parentContainerID == 'parentList'){
          this.articleSectionsStructure?.push(newNode);
        }else{
          let containerToPlaceIn = this.findNodeById(parentContainerID)?.children;
          containerToPlaceIn?.push(newNode);
        }
      }else if(typeof place == 'number'){
        if(parentContainerID == 'parentList'){
          this.articleSectionsStructure?.splice(place,0,newNode);
        }else{
          let containerToPlaceIn = this.findNodeById(parentContainerID)?.children;
          containerToPlaceIn?.splice(place,0,newNode);
        }
      }
        let buildForms = (node: any) => {
          let dataFromYMap = this.ydocService.sectionFormGroupsStructures!.get(node.sectionID);
          let defaultValues = dataFromYMap ? dataFromYMap.data : node.defaultFormIOValues
          let sectionContent = defaultValues ? this.formBuilderService.populateDefaultValues(defaultValues, node.formIOSchema, node.sectionID) : node.formIOSchema;
          let nodeForm: FormGroup = new FormGroup({});
          this.formBuilderService.buildFormGroupFromSchema(nodeForm, sectionContent);

          nodeForm.patchValue(defaultValues);
          nodeForm.updateValueAndValidity()
          this.sectionFormGroups[node.sectionID] = nodeForm;
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

    let sec = renderSectionFunc(newSection, container);

    this.renderForms(sec)

    if(typeof place == 'string' && place == 'end'){
      if(parentContainerID == 'parentList'){
        this.articleSectionsStructure?.push(container[0]);
      }else{
        let containerToPlaceIn = this.findNodeById(parentContainerID)?.children;
        containerToPlaceIn?.push(container[0]);
      }
    }else if(typeof place == 'number'){
      if(parentContainerID == 'parentList'){
        this.articleSectionsStructure?.splice(place,0,container[0]);
      }else{
        let containerToPlaceIn = this.findNodeById(parentContainerID)?.children;
        containerToPlaceIn?.splice(place,0,container[0]);
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
    let { nodeRef, i } = this.deleteNodeById(nodeId);
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

  applyNodeDrag(from: number, to: number, prevContainerId:string,newContainerId:string) {
      let articleDataCopy = this.articleSectionsStructure!
      let prevContNewRef:any[]
      let newContNewRef:any[]

      if(newContainerId == 'parentList'){
        newContNewRef = articleDataCopy;
      }

      if(prevContainerId == 'parentList'){
        prevContNewRef= articleDataCopy;
      }

      let findReferences = (container:any) =>{
        container.forEach((el:any)=>{
          if(el.sectionID == prevContainerId){
            prevContNewRef = el.children
          }
          if(el.sectionID == newContainerId){
            newContNewRef = el.children
          }
          if(el.children&&el.children.length>0){
            findReferences(el.children)
          }
        })
      }

      findReferences(articleDataCopy);
      //@ts-ignore
      transferArrayItem(prevContNewRef,newContNewRef,from,to);

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

  async attachChildToNode(clickedNode: string, node: any) {
    let newNodeContainer = this.findContainerWhereNodeIs(clickedNode);
    let nodeRef = this.findNodeById(clickedNode)!;
    if (node) {
      newNodeContainer.splice(newNodeContainer.findIndex((s) => s.sectionID == nodeRef.sectionID)! + 1, 0, node);
      let buildForms = (node: any) => {
        let dataFromYMap = this.ydocService.sectionFormGroupsStructures!.get(node.sectionID);
        let defaultValues = dataFromYMap ? dataFromYMap.data : node.defaultFormIOValues
        let sectionContent = defaultValues ? this.formBuilderService.populateDefaultValues(defaultValues, node.formIOSchema, node.sectionID) : node.formIOSchema;
        let nodeForm: FormGroup = new FormGroup({});
        this.formBuilderService.buildFormGroupFromSchema(nodeForm, sectionContent);

        nodeForm.patchValue(defaultValues);
        nodeForm.updateValueAndValidity()
        this.sectionFormGroups[node.sectionID] = nodeForm;
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
    await new Promise((resolve, reject) => {
      this.articlesSectionsService.getSectionById(nodeRef.sectionTypeID).subscribe((sectionData: any) => {

        let sectionFromBackendOrigin = sectionData.data
        let container: any[] = []
        let newSec = renderSectionFunc(sectionFromBackendOrigin, container);
        this.renderForms(newSec);
        newNodeContainer.splice(newNodeContainer.findIndex((s) => s.sectionID == nodeRef.sectionID)! + 1, 0, container[0]);
        resolve(undefined)
      })
    })
    //@ts-ignore
    return newChild
  }

  applyEditChange(id: string) {
    let nodeRef = this.findNodeById(id)!;
    if (!nodeRef.active) {
      nodeRef.active = true

    }
  }
}
