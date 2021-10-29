/* import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { UltimateService } from '../../../shared/ultimate.service';
import { GridService } from '../../grid/grid.service';
import { UltimateFormBuilderService } from '../ultimate-form-builder.service';

@Injectable({
  providedIn: 'root'
})
export class FormPopulationService {

  constructor(
    private ultimateService: UltimateService,
    private gridService: GridService,
    private ultimateFormBuilderService: UltimateFormBuilderService,
    private localStorage: LocalStorageService) {
  }

  populateData(formGroup: FormGroup, conf: any, data: any, arrayColumns?: any[]) {
    let components = conf['components'];
    components = Array.isArray(components) ? components : [components];

    this.transferTitleData(conf, data);

    components.forEach(comp => {
      formGroup = this.ultimateFormBuilderService.createFormFromTemplate(formGroup, comp.settings.columns);
    });

    components.forEach(comp => {
      let currentArrayColumns = [];
      let response = {};
      if (comp.getModel) {
        response[comp.getModel] = data[comp.getModel];
      } else {
        response = data;
      }

      this.ultimateFormBuilderService.fillFormWithResponseValues(formGroup, comp, response);
      this.populateArrayColumns(comp, response[comp.settings.formArray], currentArrayColumns);
      formGroup.updateValueAndValidity();
      formGroup.markAllAsTouched();
      arrayColumns.push(currentArrayColumns);
    });
  }

  populateArrayColumns(comp, resp, arrayColumns) {
    if (comp?.settings?.table && comp?.settings?.columns[0]?.arrayColumns) {
      for (let i = 0; i < resp?.length || 0; i++) {
        let arrayCols = [];
        comp.settings?.columns[0]?.arrayColumns
          .filter(element => element.editor != 'hidden')
          .forEach(element => {
            const tmp: any = JSON.parse(JSON.stringify(element));
            tmp.data = `${comp.settings.formArray}.${i}.${tmp.data}`;
            arrayCols.push(tmp);
          });
        arrayColumns.push(arrayCols);
      }
    }
  }

  transferTitleData(conf, data) {
    if (conf.path == 'vod-assets.edit' || conf.path == 'tv-series.edit') {
      // Transfer title data to titles if not there
      if (data.title) {
        let lang = data.title.language;
        data.titles = data.titles || {};
        data.titles[lang] = data.titles[lang] || {};
        Object.keys(data.title).forEach(key => {
          data.titles[lang][key] = data.title[key];
        });
      }

      // Make sure that all titles has 'language' value set
      if (data.titles) {
        Object.keys(data.titles).forEach(key => {
          data.titles[key]['language'] = key;
        });
      }
    } else if (conf.path == 'products.product' || conf.path == 'vod-categories.vodCategory'
      || conf.path == 'price.edit' || conf.path == 'channels.channel' || conf.path == 'dictionaries.dictionary' || conf.path == 'banners.banner') {
      if (!data.language) {
        let defLang = this.findDefaultLangByValues(data);
        data.language = defLang ? defLang : this.localStorage.retrieve('defaultLanguage');
      }
      let defLang = data.language;
      if (data.title) {
        data.titles = data.titles || {};
        data.titles[defLang] = data.title;
      }
      if (data.description) {
        data.descriptions = data.descriptions || {};
        data.descriptions[defLang] = data.description;
      }
      if (data.currency) {
        data.currencies = data.currencies || {};
        data.currencies[defLang] = data.currency;
      }
    }
  }

  findDefaultLangByValues(data: any) {
    let defLang = null;
    if (data.titles) {
      defLang = Object.keys(data.titles).filter(key => data.titles[key] === data.title)[0];
    }
    return defLang;
  }

  getRequestPath(settings: any) {
    return settings.get?.interpolate ?
      this.ultimateService.interpolate({ ...this, ...settings.get }) :
      this.gridService.getSourcePath(settings.get, this, '/');
  }
}
 */