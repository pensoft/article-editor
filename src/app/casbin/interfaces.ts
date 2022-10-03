export interface ACL {
  prefix:string,
  sub: string,
  obj: string;
  act: string;
  eft: "allow" | "deny";
}

export interface GlobalObjContainer {
  items:{[key:string]:any};
  isOwner:(objId:string,subId:string)=>boolean;
}
