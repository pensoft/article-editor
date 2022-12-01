function matchAction(/* request */key1: string,/* policy */ key2: string) {
  return new RegExp(key2).test(key1);
}
function log(...args){
  return true;
}

export { matchAction,log };
