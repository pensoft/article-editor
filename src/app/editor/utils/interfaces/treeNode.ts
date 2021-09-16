export interface treeNode {
    name:string,
    edit:boolean,
    id:string,
    children:treeNode[],
    add?:boolean,
    active:boolean,
    listId?:string,
    delete?:boolean,
    extended:boolean
  }