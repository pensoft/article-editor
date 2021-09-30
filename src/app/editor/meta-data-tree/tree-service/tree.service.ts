import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { YdocService } from '../../services/ydoc.service';
import { treeNode } from '../../utils/interfaces/treeNode';
import * as Y from 'yjs'
import { uuidv4 } from 'lib0/random';

@Injectable({
  providedIn: 'root'
})
export class TreeService {
  TREE_DATA?: treeNode[]
  treeVisibilityChange: Subject<any> = new Subject<any>();
  metadatachangeMap?: Y.Map<any>
  metadataMap?: Y.Map<any>
  guid?: string
  toggleTreeDrawer: Subject<any> = new Subject<any>();
  constructor(private ydocService: YdocService) {
    let buildFunc = () => {
      this.guid = this.metadatachangeMap?.doc?.guid;
      this.metadataMap = ydocService.getMetaDataMap()
      this.metadatachangeMap?.observe((event, transaction) => {
        let metadatachange = this.metadatachangeMap?.get('change')
        if (this.guid != metadatachange.guid) {
          if (!this.ydocService.editorIsBuild) {
            return
          }
          //console.log('change from someone else', metadatachange);
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
        this.metadataMap?.set('TREE_DATA', this.TREE_DATA)
      })

      this.treeVisibilityChange.subscribe((data) => {
        let guid = this.metadatachangeMap?.doc?.guid
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

  initTreeList(TREE_DATA: treeNode[]) {
    this.TREE_DATA = TREE_DATA
  }

  dragNodeChange(from: number, to: number, id: string) {
    this.treeVisibilityChange.next({ action: 'listNodeDrag', from, to, id })
  }

  editNodeChange(nodeId: string) {
    this.applyEditChange(nodeId)
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
    let arr: treeNode[] | undefined
    let findF = (list?: treeNode[]) => {
      list?.forEach((node) => {
        if (node.id !== undefined && node.id == id) {
          arr = node.children
        } else if (node.children) {
          findF(node.children)
        }
      })
    }
    findF(this.TREE_DATA);
    return arr
  }

  deleteNodeById(id: string) {
    let nodeRef: treeNode | undefined
    let i: number | undefined
    let arrayRef: treeNode[] | undefined
    let findF = (list?: treeNode[]) => {
      list?.forEach((node, index, array) => {
        if (node.id !== undefined && node.id == id) {
          nodeRef = node
          i = index
          arrayRef = array
        } else if (node.children) {
          findF(node.children)
        }
      })
    }
    findF(this.TREE_DATA);
    arrayRef?.splice(i!, 1);
    return { nodeRef, i }
  }

  findNodeById(id: string) {
    let nodeRef: treeNode | undefined
    let findF = (list?: treeNode[]) => {
      list?.forEach((node) => {
        if (node.id !== undefined && node.id == id) {
          nodeRef = node
        } else if (node.children) {
          findF(node.children)
        }
      })
    }
    findF(this.TREE_DATA);
    return nodeRef
  }

  applyNodeDrag(from: number, to: number, id: string) {
    if (id == 'parentList') {
      let s = this.TREE_DATA?.splice(from, 1);
      this.TREE_DATA?.splice(to, 0, ...s!)
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
    nodeRef.children.push({ name: 'Subsection', id: childId!, children: [], edit: { bool: true, main: false }, active: false, add: { bool: true, main: false }, delete: { bool: true, main: true } },)
    return childId
  }

  applyEditChange(id: string) {
    let nodeRef = this.findNodeById(id)!;
    if (!nodeRef.active) {
      nodeRef.active = true
    }

  }
}
