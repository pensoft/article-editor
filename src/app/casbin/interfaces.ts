export interface ACL {
  prefix:string,
  sub: string,
  obj: string;
  act: string;
  eft: "allow" | "deny";
}
