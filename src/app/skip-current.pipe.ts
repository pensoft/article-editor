import { Pipe, PipeTransform } from '@angular/core';
import {AuthService} from "@core/services/auth.service";

@Pipe({
  name: 'skipCurrent'
})
export class SkipCurrentPipe implements PipeTransform {
  constructor(public authService: AuthService) {

  }


  transform(value: any, ...args: any[]): any {
    // console.log(value, this.authService.currentUserValue.id);
    const {id}: any = this.authService.currentUserValue
    return value.filter((el: any) => {
      return el.ususerInfoer.data.id !== id;
    });
  }

}
