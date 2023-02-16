import { Pipe, PipeTransform, Sanitizer, SecurityContext } from '@angular/core';

@Pipe({
  name: 'makeTextBold'
})
export class BoldPipe implements PipeTransform {
  constructor(
    private sanitizer: Sanitizer
  ) {}

  transform(value: string, regex): any {
    //return this.sanitize(this.replace(value, regex));
    return this.replace(value, regex);
  }

  replace(str, regex) {
    return str.replace(new RegExp(`(${regex})`, 'gm'), '<b>$1</b>');
  }

  /* sanitize(str) {
    return this.sanitizer.sanitize(SecurityContext.HTML, str);
  } */
}
