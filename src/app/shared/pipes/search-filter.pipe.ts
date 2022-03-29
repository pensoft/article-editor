import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter',
})
export class SearchFilterPipe implements PipeTransform {
  public transform(items: any[], searchText: string): any {
    if (!items) {
      return [];
    } else if (!searchText) {
      return items;
    } else {
      searchText = searchText.toLowerCase();
      let result: any[] = [];
      items.forEach((element) => {
        if (element.username.toLowerCase().includes(searchText)) {
          result.push(element);
        }
      });
      return result;
    }
  }
}
