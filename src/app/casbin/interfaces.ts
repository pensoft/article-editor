export interface ACL {
  sub: string,
  obj: string;
  act: string;
  eft: "allow" | "deny";
}
