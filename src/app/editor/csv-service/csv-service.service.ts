import {Injectable} from '@angular/core';
import {convertArrayToCSV} from 'convert-array-to-csv';
import {materialStructure} from "@core/services/custom_sections/materials_structure";
import {result} from "lodash";
import {ServiceShare} from "@app/editor/services/service-share.service";
import {YdocService} from "@app/editor/services/ydoc.service";

const props = Object.keys(materialStructure.categories).map(key => {
  return materialStructure.categories[key].entries.map(entry => {
    return entry.localName
  })
}).flat().sort(function(x,y){ return x == 'typeStatus' ? -1 : y == 'typeStatus' ? 1 : 0; });

@Injectable({
  providedIn: 'root'
})
export class CsvServiceService {
  articleSectionsStructure;

  constructor(private ydocService: YdocService) {
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
