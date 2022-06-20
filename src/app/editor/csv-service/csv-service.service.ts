import {Injectable} from '@angular/core';
import {convertArrayToCSV} from 'convert-array-to-csv';
import {materialStructure} from "@core/services/custom_sections/materials_structure";
import {result} from "lodash";
import {ServiceShare} from "@app/editor/services/service-share.service";
import {YdocService} from "@app/editor/services/ydoc.service";
import {HelperService} from "@app/editor/section/helpers/helper.service";
import {TreeService} from "@app/editor/meta-data-tree/tree-service/tree.service";


@Injectable({
  providedIn: 'root'
})
export class CsvServiceService {
  articleSectionsStructure;

  constructor(private ydocService: YdocService, public helperService: HelperService, public treeService: TreeService) {
  }

  findNestedObj(entireObj, keyToFind, valToFind) {
    let foundObj;
    JSON.stringify(entireObj, (_, nestedValue) => {
      if (nestedValue && nestedValue[keyToFind] === valToFind) {
        foundObj = nestedValue;
      }
      return nestedValue;
    });
    return foundObj;
  };

  arrayToCSV(sectionId) {
    this.articleSectionsStructure = this.ydocService.articleStructure?.get('articleSectionsStructure');
    // const parent = this.articleSectionsStructure.find(item => item.)
    const parent = this.findNestedObj(this.articleSectionsStructure, 'sectionID', sectionId);
    const dataArrays = [];
    const root = this.helperService.filter(this.treeService.articleSectionsStructure, sectionId);
    const props = Object.keys(root.override.categories).map(key => {
      return root.override.categories[key].entries.map(entry => {
        return entry.localName
      })
    }).flat();
    parent.children.forEach(item => {
      const cloned = JSON.parse(JSON.stringify(item.defaultFormIOValues));
      const row = new Array(props.length).fill('');
      Object.keys(cloned).forEach(key => {
        const index = props.indexOf(key)
        if (index > -1) {
          row[index] = cloned[key]
        }
      });
      dataArrays.push(row);
    })
    const header = props;
    const csvFromArrayOfArrays = convertArrayToCSV(dataArrays, {
      header,
      separator: ';'
    });
    return csvFromArrayOfArrays;
  }
}
