export interface treeNode {
  name: string,
  id: string,
  children: treeNode[],
  active: boolean,
  add: {bool:boolean,main:boolean},
  edit: {bool:boolean,main:boolean},
  delete: {bool:boolean,main:boolean},
}