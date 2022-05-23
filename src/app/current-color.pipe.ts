import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currentColor'
})
export class CurrentColorPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
