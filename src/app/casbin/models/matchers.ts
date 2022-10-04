function matchAction(/* request */key1: string,/* policy */ key2: string) {
  return new RegExp(key2).test(key1);
}

export { matchAction };
