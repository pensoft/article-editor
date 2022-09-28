function matchAction(/* request */key1: string,/* policy */ key2: string) {
  /* function regexMatch(key1: string, key2: string): boolean {
  return new RegExp(key2).test(key1);
} */



  return new RegExp(key2).test(key1);
}



function logMatching(robj: string, ract: string, pobj: string, pact: string) {
  //console.log('robj', robj, 'ract', ract, 'pobj', pobj, 'pact', pact);
  return true;
}

async function asyncLog(robj: string, ract: string, pobj: string, pact: string) {
  //console.log('async log -------1');
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(true)
    }, 1000)
  })
  //console.log('async log -------2');
  return true;
}

export { matchAction, logMatching, asyncLog };
