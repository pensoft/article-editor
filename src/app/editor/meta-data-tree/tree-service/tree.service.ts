import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { YdocService } from '../../services/ydoc.service';
import { treeNode } from '../../utils/interfaces/treeNode';
import * as Y from 'yjs'
import { uuidv4 } from 'lib0/random';
import { articleSection, editorData } from '../../utils/interfaces/articleSection';

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
  constructor(private ydocService: YdocService) {
    let buildFunc = () => {
      this.guid = this.metadatachangeMap?.doc?.guid;
      this.articleStructureMap = ydocService.ydoc.getMap('articleStructure');
      this.metadatachangeMap?.observe((event, transaction) => {
        let metadatachange = this.metadatachangeMap?.get('change')
        if (this.guid != metadatachange.guid) {
          if (!this.ydocService.editorIsBuild) {
            return
          }
          if (metadatachange.action == 'listNodeDrag') {
            this.applyNodeDrag(metadatachange.from, metadatachange.to, metadatachange.id)
          } else if (metadatachange.action == 'editNode') {
            this.applyEditChange(metadatachange.nodeId)
          } else if (metadatachange.action == "addNode") {
            this.attachChildToNode(metadatachange.parentId, metadatachange.childId);
          } else if (metadatachange.action == "deleteNode") {
            let { nodeRef, i } = this.deleteNodeById(metadatachange.childId);
          }
        }
        //this.articleStructureMap?.set('articleSectionsStructure', this.articleSectionsStructure)
        
      })

      this.treeVisibilityChange.subscribe((data) => {
        let guid = this.metadatachangeMap?.doc?.guid
        this.metadatachangeMap?.set('change', { ...data, guid })
        this.setArticleSectionStructureFlat()
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

  setArticleSectionStructureFlat(){
    //this.articleSectionsStructure = this.ydocService.articleStructure?.get('articleSectionsStructure')

    let articleSectionsStructureFlat1:articleSection[] = []
    let makeFlat = (structure:articleSection[]) => {
      structure.forEach((section)=>{
        if(section.active){
          articleSectionsStructureFlat1.push(section)
        }
        if(section.children.length>0){
          makeFlat(section.children)
        }
      })
    }
    makeFlat(this.articleSectionsStructure!)
    //this.articleSectionsStructureFlat = articleSectionsStructureFlat1
    this.ydocService.articleStructure?.set('articleSectionsStructureFlat',articleSectionsStructureFlat1)
    this.ydocService.articleStructure?.set('articleSectionsStructure',this.articleSectionsStructure)
  }

  initTreeList(articleSectionsStructure: articleSection[]) {
    this.articleSectionsStructure = articleSectionsStructure
  }

  dragNodeChange(from: number, to: number, id: string) {
    this.treeVisibilityChange.next({ action: 'listNodeDrag', from, to, id })
  }

  editNodeChange(nodeId: string) {
    try{
      this.applyEditChange(nodeId)
    }catch(e){
      console.log(e);
    }
    this.treeVisibilityChange.next({ action: 'editNode', nodeId });
  }

  addNodeChange(nodeId: string) {
    let newChildid = this.attachChildToNode(nodeId, uuidv4());
    this.treeVisibilityChange.next({ action: 'addNode', parentId: nodeId, childId: newChildid });
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

  applyNodeDrag(from: number, to: number, id: string) {
    if (id == 'parentList') {
      let s = this.articleSectionsStructure?.splice(from, 1);
      this.articleSectionsStructure?.splice(to, 0, ...s!)
      return
    }
    let listRef = this.findListArray(id);
    if (listRef) {
      let s = listRef.splice(from, 1);
      listRef.splice(to, 0, ...s)
    }
  }

  attachChildToNode(parentNodeid: string, childId: string) {
    let nodeRef = this.findNodeById(parentNodeid)!;
    if (!nodeRef.children) {
      nodeRef.children = []
    }
    nodeRef.children.push({
      sectionID: uuidv4(),
      active: true,
      title: { type: 'content', contentData: 'Title2' ,titleContent:"NewSection",key:'titleContent'},
      children: [],
      edit: { bool: true, main: true },
      add: { bool: true, main: false },mode:'documentMode',
      delete: { bool: true, main: false },
      sectionContent: { type: 'content', contentData: { editorId: uuidv4(), menuType: 'fullMenu' },key:'sectionContent'}
    })
    return childId
  }

  applyEditChange(id: string) {
    let nodeRef = this.findNodeById(id)!;
    if (!nodeRef.active) {
      nodeRef.active = true

    }
    if(nodeRef.sectionContent.type=='TaxonTreatmentsMaterial'){
      let nodeJsonStructure = this.articleStructureMap?.get(nodeRef.sectionID+'TaxonTreatmentsMaterial');
      if(nodeJsonStructure == undefined){
        let nodeJsonFormIOStructureObj:any = {}
        let recursiveInputDetect = (components:any[])=>{
          components.forEach((el)=>{
            if(el.input){
              let imputId = uuidv4()
              el.key = imputId + '|'+ el.key 
              nodeJsonFormIOStructureObj[imputId] = el
            }
            if(el.components){
              if(el?.components.length > 0){
                recursiveInputDetect(el.components);
              }
            }
          })
        }
        let formioJsonCopy = JSON.parse(JSON.stringify((nodeRef.sectionContent.contentData! as editorData).editorMeta?.formioJson));
        recursiveInputDetect([formioJsonCopy])
        this.articleStructureMap?.set(nodeRef.sectionID+'TaxonTreatmentsMaterial',nodeJsonFormIOStructureObj);
        this.articleStructureMap?.set(nodeRef.sectionID+'TaxonTreatmentsMaterialFormIOJson',formioJsonCopy);
        console.log('TaxonTreatmentsMaterialFormIOJson',formioJsonCopy);
      }
    }

  }
}
