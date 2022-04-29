import { uuidv4 } from "lib0/random";

const mappingObj: any = {
  "doi": { type: ['string'], cslProp: 'DOI', formIOprop: "DOI" },
  "href": { type: ['string'], cslProp: 'URL', formIOprop: "URL" },
  "title": { type: ['string'], cslProp: 'title', formIOprop: "title" },
  "year": {
    type: ['string', 'number'],
    cslProp: {
      prop: 'issued', func: `(function a(year,refobj,formioobj,extRef){
        if(!year) return
        let val = year.toString();
        let dateParts = val.split('-')
        if (dateParts.length == 1) {
          dateParts.push('01')
          dateParts.push('01')
        }
        if (dateParts.length == 2) {
          dateParts.push('01')
        }
        for(let i =0 ; i < dateParts.length;i++){
          if(dateParts[i].length == 1) {
            dateParts[i] = "0"+dateParts[i]
          }
        }
        refobj['issued'] = {
          "date-parts": [
            dateParts
          ]
        }
    })` },
    formIOprop: {
      prop: 'issued', func: `(function a(year,refobj,formioobj,extRef){
        if(!year) return
        let val = year.toString();
        let dateParts = val.split('-')
        if (dateParts.length == 1) {
          dateParts.push('01')
          dateParts.push('01')
        }
        if (dateParts.length == 2) {
          dateParts.push('01')
        }
        for(let i =0 ; i < dateParts.length;i++){
          if(dateParts[i].length == 1) {
            dateParts[i] = "0"+dateParts[i]
          }
        }
        formioobj['issued'] = dateParts.join("-")
    })` },
  },
  "publicationDate": {
    type: ['string', 'number'],
    cslProp: {
      prop: 'issued', func: `(function a(year,refobj,formioobj,extRef){
        if(!year) return
        let val = year.toString();
        let dateParts = val.split('-')
        if (dateParts.length == 1) {
          dateParts.push('01')
          dateParts.push('01')
        }
        if (dateParts.length == 2) {
          dateParts.push('01')
        }
        for(let i =0 ; i < dateParts.length;i++){
          if(dateParts[i].length == 1) {
            dateParts[i] = "0"+dateParts[i]
          }
        }
        refobj['issued'] = {
          "date-parts": [
            dateParts
          ]
        }
    })` },
    formIOprop: {
      prop: 'issued', func: `(function a(year,refobj,formioobj,extRef){
        if(!year) return
        let val = year.toString();
        let dateParts = val.split('-')
        if (dateParts.length == 1) {
          dateParts.push('01')
          dateParts.push('01')
        }
        if (dateParts.length == 2) {
          dateParts.push('01')
        }
        for(let i =0 ; i < dateParts.length;i++){
          if(dateParts[i].length == 1) {
            dateParts[i] = "0"+dateParts[i]
          }
        }
        formioobj['issued'] = dateParts.join("-")
    })` },
  },
  "publishedIn": { type: 'string', cslProp: 'city', formIOprop: "city" },
  "firstauthor": {
    type: ['string[][]'],
    cslProp: {
      prop: 'author', func: `(function a(firstauthor,refobj,formioobj,exterRef){
      if (!refobj['author']) {
        refobj['author'] = []
      }
      firstauthor.forEach((author) => {
        if (author && (author[0] || author[1])) {
          refobj['author'].push({ "family": author[0] ? author[0] : '', "given": author[1] ? author[1] : '' })
        }
      })
    })` },
    formIOprop: {
      prop: 'authors', func: `(function a(firstauthor,refobj,formioobj,exterRef){
      if (!formioobj['authors']) {
        formioobj['authors'] = []
      }
      firstauthor.forEach((author) => {
        if (author && (author[0] || author[1])) {
          formioobj['authors'].push({
            "first": author[0] ? author[0] : '',
            "last": author[1] ? author[1] : '',
            "name": "",
            "role": "author",
            "type": "person"
          })
        }
      })
    })` },
  },
  "isParsed": undefined,
  "type": {
    type: 'string', cslProp: {
      prop: 'type', func: `(function a(type,refobj,formioobj,extRef){
        if (type) {
          maped['type'] = type.replace(' ', '-').toLocaleLowerCase()
        } else {
          maped['type'] = 'article-journal'
        }
  })` }
  },
  "volume": { type: 'string', cslProp: 'volume', formIOprop: "volume" },
  "spage": {
    type: ['string', 'number'],
    cslProp: {
      prop: 'page', func: `(function a(spage,refobj,formioobj,exterRef){
      if(!refobj['page']){
        refobj['page'] = spage
      }else{
        refobj['page'] = spage+"-"+refobj['page']
      }
    })` },
    formIOprop: {
      prop: 'page', func: `(function a(spage,refobj,formioobj,exterRef){
      if(!formioobj['page']){
        formioobj['page'] = spage
      }else{
        formioobj['page'] = spage+"-"+formioobj['page']
      }
    })` },
  },
  "epage": {
    type: ['string', 'number'],
    cslProp: {
      prop: 'page', func: `(function a(epage,refobj,formioobj,exterRef){
      if(!refobj['page']){
        refobj['page'] = epage
      }else{
        refobj['page'] = refobj['page']+"-"+epage
      }
    })` },
    formIOprop: {
      prop: 'page', func: `(function a(epage,refobj,formioobj,exterRef){
      if(!formioobj['page']){
        formioobj['page'] = epage
      }else{
        formioobj['page'] =formioobj['page']+"-"+epage
      }
    })` },
  },
  "id": {
    type: ['string', 'object'],
    cslProp: {
      prop: 'id', func: `(function a(id,refobj,formioobj,exterRef){
      if (typeof ref.id == 'string') {
        return ref.id
      } else if (typeof ref.id == 'object') {
        return Object.values(ref.id).join(':SePaRaToR:')
      } else {
        return undefined
      }
    })` },
  },
  "infoUrl": undefined,
  "abstract": { type: 'string', cslProp: 'abstract', formIOprop: "abstract" },
  "fullCitation": undefined,
  "score": undefined,
  "authors": {
    type: ['string[][]'],
    cslProp: {
      prop: 'author', func: `(function a(authors,refobj,formioobj,exterRef){
      if (!refobj['author']) {
        refobj['author'] = []
      }
      authors.forEach((author) => {
        if (author && (author[0] || author[1])) {
          refobj['author'].push({ "family": author[0] ? author[0] : '', "given": author[1] ? author[1] : '' })
        }
      })
    })` },
    formIOprop: {
      prop: 'authors', func: `(function a(authors,refobj,formioobj,exterRef){
      if (!formioobj['author']) {
        formioobj['authors'] = []
      }
      authors.forEach((author) => {
        if (author && (author[0] || author[1])) {
          formioobj['authors'].push({
            "first": author[0] ? author[0] : '',
            "last": author[1] ? author[1] : '',
            "name": "",
            "role": "author",
            "type": "person"
          })
        }
      })
    })` },
  },
  "related": undefined,
  "source": undefined,
  "issue": { type: 'string', cslProp: 'issue', formIOprop: "issue" },
}
function mapRef1(ref: any) {
  let maped: any = {};
  let formIOData: any = {}
  Object.keys(ref).forEach((key: any) => {
    let val = ref[key];
    let mapObjVal = mappingObj[key];
    if (mapObjVal && mapObjVal.cslProp) {
      let cslP = mapObjVal.cslProp
      if (typeof cslP == 'string') {
        maped[cslP] = val
      } else if (typeof cslP == 'object') {
        let prop = cslP.prop;
        let func = eval(cslP.func);
        let funcOutPut = func(val, maped, formIOData, ref);
        if (funcOutPut) {
          maped[prop] = funcOutPut;
        } else if (!funcOutPut && key == 'id') {
          maped[prop] = uuidv4();
        }
      }
    }
    if (mapObjVal && mapObjVal.formIOprop) {
      let formioProp = mapObjVal.formIOprop
      if (typeof formioProp == 'string') {
        formIOData[formioProp] = val
      } else if (typeof formioProp == 'object') {
        let prop = formioProp.prop;
        let func = eval(formioProp.func);
        let funcOutPut = func(val, maped, formIOData, ref);
        if (funcOutPut) {
          formIOData[prop] = funcOutPut;
        }
      }
    }
  })

  return { ref: maped, formIOData }
}
function mapRef(ref: any) {
  let maped: any = {};
  let formIOData: any = {}
  if (ref.authors && ref.authors instanceof Array && ref.authors.length > 0) {
    if (!maped['author']) {
      maped['author'] = []
      formIOData['authors'] = []
    }
    ref.authors.forEach((author: string[] | null | null[]) => {
      if (author && (author[0] || author[1])) {
        maped['author'].push({ "family": author[0] ? author[0] : '', "given": author[1] ? author[1] : '' })
        formIOData['authors'].push({
          "first": author[0] ? author[0] : '',
          "last": author[1] ? author[1] : '',
          "name": "",
          "role": "author",
          "type": "person"
        })
      }
    })
  }
  if (ref.firstauthor && ref.firstauthor instanceof Array && ref.firstauthor.length > 0) {
    if (!maped['author']) {
      maped['author'] = []
      formIOData['authors'] = []
    }
    ref.firstauthor.forEach((author: string[] | null | null[]) => {
      if (author && (author[0] || author[1])) {
        maped['author'].push({ "family": author[0] ? author[0] : '', "given": author[1] ? author[1] : '' })
        formIOData['authors'].push({
          "first": author[0] ? author[0] : '',
          "last": author[1] ? author[1] : '',
          "name": "",
          "role": "author",
          "type": "person"
        })
      }
    })
  }
  if (ref.doi) {
    maped['DOI'] = ref.doi
    formIOData['DOI'] = ref.doi
  }
  if (ref.href) {
    maped['URL'] = ref.href
    formIOData['URL'] = ref.href
  }
  if (ref.title) {
    maped['title'] = ref.title
    formIOData['title'] = ref.title
  }
  if (ref.year) {
    let val = `${ref.year}`;
    let dateParts = val.split('-')
    formIOData['issued'] = val
    if (dateParts.length == 1) {
      dateParts.push('1')
      dateParts.push('1')
    }
    if (dateParts.length == 2) {
      dateParts.push('1')
    }
    maped['issued'] = {
      "date-parts": [
        dateParts
      ]
    }
  }
  if (ref.publicationDate) {
    let val = `${ref.publicationDate}`
    let dateParts = val.split('-')
    formIOData['issued'] = val
    if (dateParts.length == 1) {
      dateParts.push('1')
      dateParts.push('1')
    }
    if (dateParts.length == 2) {
      dateParts.push('1')
    }
    maped['issued'] = {
      "date-parts": [
        dateParts
      ]
    }
  }
  if (ref.issue) {
    maped['issue'] = ref.issue
    formIOData['issue'] = ref.issue
  }
  if (ref.volume) {
    maped['volume'] = ref.volume
    formIOData['volume'] = ref.volume
  }
  if (ref.publishedIn) {
    maped['city'] = ref.publishedIn
    formIOData['city'] = ref.publishedIn
  }
  if (ref.abstract) {
    maped['abstract'] = ref.abstract
    formIOData['abstract'] = ref.abstract
  }
  if (ref.spage && ref.epage) {
    maped['page'] = ref.spage + '-' + ref.epage
    formIOData['page'] = ref.spage + '-' + ref.epage
  }
  if (ref.type) {
    maped['type'] = ref.type.replace(' ', '-').toLocaleLowerCase()
  } else {
    maped['type'] = 'article-journal'
  }
  if (ref.id) {
    if (ref.id instanceof String) {
      maped['id'] = ref.id
    } else if (typeof ref.id == 'object') {
      maped['id'] = Object.values(ref.id).join(':SePaRaToR:')
    } else {
      maped['id'] = ref.doi ? ref.doi : uuidv4()
    }
  } else {
    maped['id'] = ref.doi ? ref.doi : uuidv4()
  }

  return { ref: maped, formIOData }
}
export let mapExternalRefs = (data1: string) => {
  let stringArray = data1.split('][').map((val, i) => {
    let newVal = val;
    if (!newVal.startsWith('[')) {
      newVal = '[' + newVal;
    }
    if (!newVal.endsWith(']')) {
      newVal = newVal + ']';
    }
    return newVal
  })
  let data: any[] = [];
  stringArray.forEach((str: string) => {
    data.push(...JSON.parse(str))
  })

  //map data in csl lib format
  let mapedReferences: any[] = []
  data.forEach((ref) => {
    let mapedRef = mapRef(ref)

    let mapedRef1 = mapRef1(ref)
    //console.log('mapedRef', mapedRef, 'mapedRef1', mapedRef1);
    mapedReferences.push(mapedRef1)
  })
  console.log('external refs',data);
  console.log('mapped refs',mapedReferences);
  return JSON.stringify(mapedReferences)
}
