function matchAction(rAct: string, pAct: string){
  let regex = new RegExp(`^(${pAct})$`);
  let matched = regex.test(rAct)
  return matched;
}

function logMatching(robj:string,ract:string,pobj:string,pact:string){
  console.log('robj',robj,'ract',ract,'pobj',pobj,'pact',pact);
  return  true;
}

export { matchAction,logMatching };
