import { Helper, Model } from "casbin";
import { ACL } from "../interfaces";

export default class JwtAdapter {
  acls: ACL[];
  sub: string = 'asd';

  constructor(acls: ACL[]) {
    this.acls = acls;
  }

  loadPolicy(model: Model) {
    if (!this.acls) {
      throw new Error("invalid acls. Acls must be provided!");
    }

    for (const acl of this.acls) {
      const row = `p, ${this.sub}, ${acl.obj}, ${acl.act}, ${acl.eft}`;
      Helper.loadPolicyLine(row, model);
    }
  }

  savePolicy() {
    throw new Error("Transient adapter; cannot save");
  }

  addPolicy() {
    throw new Error("Transient adapter; cannot add");
  }

  removePolicy() {
    throw new Error("Transient adapter; cannot remove");
  }

  removeFilteredPolicy() {
    throw new Error("Transient adapter; cannot remove");
  }
}
