import { uuidv4 } from "lib0/random";
import { reference } from "../data/data";

export function genereteNewReference(refData: reference, data: any) {
  /* [ {
          "citationID": "SXDNEKR5AD",
          "citationItems": [{ "id": "2kntpabvm2" }],
          "properties": { "noteIndex": 1 }
        },[],[]] */
  /*
  {
    "type": "article-journal",
    "title": "Journal Title",
    "container-title": "Journal Name",
    "page": "427-454",
    "volume": "24",
    "issue": "3",
    "URL": "http://www.jstor.org/stable/173640",
    "DOI": "doi",
    "language": 'Publication language',
    "ISSN": "0022-0027",
    "author": [{ "family": "Mandel", "given": "Robert", "multi": { "_key": {} } }],
    "id": "2kntpabvm2"
  } */
  let newRefID = data.id||uuidv4();
  let newRef: any = {};
  let addCreator = (creator: any, type: string) => {
    if (!newRef[type]) {
      newRef[type] = []
    }
    newRef[type].push(creator)
  }
  let resolveCreators = (val: any, overRole?: string) => {
    val.forEach((creator: any) => {
      if (creator && typeof creator == 'object' && Object.keys(creator).length > 0) {
        let role = overRole ? overRole : creator.role ? creator.role : 'author';
        if (
          creator.type == 'person' &&
          ((creator.first && creator.first != '') || (creator.last && creator.last != ''))
        ) {
          addCreator({ "family": creator.last || '', "given": creator.first || '' }, role);
        } else if (
          creator.type == 'institution' &&
          (creator.name && creator.name != '')
        ) {
          addCreator({ "family": '', "given": creator.name }, role);
        } else if (creator.type == 'anonymous') {
          addCreator({ "family": 'Anonymous', "given": 'Anonymous' }, role);
        }
      }
    })
  }
  Object.keys(data).forEach((key) => {
    if (data[key]) {
      if (key == 'authors') {
        let val = data[key];
        resolveCreators(val)
      } else if (key == 'editor') {
        let val = data[key];
        resolveCreators(val, 'editor')
      } else if (key == 'issued') {
        let val = data[key];
        let dateParts = val.hasOwnProperty('date-parts') ? val['date-parts'] : val.split('-');
        newRef[key] = {
          "date-parts": [
            dateParts
          ]
        }
      } else {
        let val = data[key];
        if (val && val !== '') newRef[key] = val;
      }
    }

  })
  /* refData.formFields.forEach((formField) => {
  }) */

  newRef.type = refData.type;
  newRef.id = newRefID;
  /* newRef = {
    "type": "article-journal",
    "multi": { "main": {}, "_keys": {} },
    "title": "Ottoman Tax Registers ( <i>Tahrir Defterleri</i> )",
    "container-title": "Historical Methods: A Journal of Quantitative and Interdisciplinary History",
    "page": "87-102",
    "volume": "37",
    "issue": "2",
    "source": "Crossref",
    "abstract": "The Ottoman government obtained current information on the empire’s sources of revenue through periodic registers called tahrir defterleri. These documents include detailed information on taxpaying subjects and taxable resources, making it possible to study the economic and social history of the Middle East and eastern Europe in the fifteenth and sixteenth centuries. Although the use of these documents has been typically limited to the construction of local histories, adopting a more optimistic attitude toward their potential and using appropriate sampling procedures can greatly increase their contribution to historical scholarship. They can be used in comprehensive quantitative studies and in addressing questions of broader historical significance or larger social scientific relevance.",
    "URL": "http://www.tandfonline.com/doi/abs/10.3200/HMTS.37.2.87-102",
    "DOI": "10.3200/HMTS.37.2.87-102",
    "ISSN": "0161-5440, 1940-1906",
    "language": "en",
    "author": [{ "family": "CoşGel", "given": "Metin M", "multi": { "_key": {} } }],
    "issued": {
      "date-parts": [
        ["2004", 4]
      ]
    },
    "accessed": {
      "date-parts": [
        ["2018", 6, 5]
      ]
    },
    "id" : "umk3nf9gqp"
  }*/
  return newRef
}
