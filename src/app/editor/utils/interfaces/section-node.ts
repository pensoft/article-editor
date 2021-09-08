
export interface sectionNode {
  id: string;
  name: string;
  children?: sectionNode[];
  active?: boolean;
  type:any;
}