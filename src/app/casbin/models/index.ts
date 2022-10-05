import { newModelFromString } from "casbin";

/* const modelDefinition = `
  [request_definition]
  r = sub, obj, act
  [policy_definition]
  p = sub, obj, act, eft
  [policy_effect]
  e = some(where (p.eft == allow)) && !some(where (p.eft == deny))
  [matchers]
  m = (r.obj == p.obj || p.obj == '*') && (r.act == p.act || p.act == '*' || crudMatch(r.act, p.act))
`; */

const modelDefinition = `
  [request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act, eft

[role_definition]
g = _, _

[policy_effect]
e = priority(p.eft) || deny

[matchers]
m = g(r.sub, p.sub) && ( keyMatch(r.obj,p.obj) || aclFunction(r.obj, p.obj) ) && matchAction(r.act, p.act) && log(r.obj,p.obj,r.act,p.act,p.eft)
`;

/*const modelDefinition = `
  [request_definition]
  r = sub, obj, act
  [policy_definition]
  p = sub, obj, act, eft
  [policy_effect]
  e = some(where (p.eft == allow))
  [matchers]
  m = (r.obj == p.obj || p.obj == '*') && (r.act == p.act || p.act == '*' || matchAction(r.act, p.act)) && logMatching(r.obj,r.act,p.obj,p.act)
`;*/

export function getModel() {
  return newModelFromString(modelDefinition);
}
