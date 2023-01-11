import { Pipe, PipeTransform } from '@angular/core';
import {AuthService} from "@core/services/auth.service";

@Pipe({
  name: 'skipCurrent'
})
export class SkipCurrentPipe implements PipeTransform {
  constructor(public authService: AuthService) {

  }


  transform(value: any, ...args: any[]): any {
    const {id}: any = this.authService.currentUserValue || {};
    const currentIndex = value.findIndex((el: any) => el.userInfo.data.id === id);
    return value.filter((el: any, index: number) => {
      return index !== currentIndex;
    });
  }

}
