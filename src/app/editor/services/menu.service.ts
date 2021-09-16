import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Dropdown, DropdownSubmenu } from 'prosemirror-menu';

import * as Y from 'yjs';
import * as m from '../utils/menuItems';

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(public dialog: MatDialog,) {
    m.shereDialog(dialog);
  }

  sectionMenus: { [key: string]: (string | { dropdownName: string, label?: string, content: (string | { dropdownSubmenuName: string, label?: string, content: any })[] })[][] } = {
    'Title':
      [
        ['toggleStrong', 'toggleEm', 'toggleCode'],
        ['alignMenu'],
        ['insertLink'],
        ['toggleSubscriptItem', 'toggleSuperscriptItem'],
        ['undoItem', 'redoItem']
      ],
    'fullMenu': [
      ['toggleStrong', 'toggleEm', 'toggleCode', 'addCommentMenuItem', 'insertLink'],
      [
        { dropdownName: 'Insert', content: ['insertImage', 'insertHorizontalRule'] },
        {
          dropdownName: 'Type...', content: [
            'makeParagraph', 'makeCodeBlock', {
              dropdownSubmenuName: 'Headings', content: [
                'headings'
              ]
            }
          ]
        },
      ],
      ['undoItem', 'redoItem'],
      ['wrapBulletList', 'wrapOrderedList', 'wrapBlockQuote', 'selectParentNodeItem'],
      ['alignMenu'],
      ['toggleSubscriptItem', 'toggleSuperscriptItem'],
      ['insertVideoItem',
        { dropdownName: 'Math', content: ['addMathInlineMenuItem', 'addMathBlockMenuItem'] }
      ],
      ['tableMenu']
    ]
  }

  attachMenuItems2(menu: any, ydoc: Y.Doc) {
    let menuItems = m.getItems()
    menu.fullMenu[0].push(menuItems.addCommentMenuItem(ydoc));
    menu.fullMenu[4] = [];
    menu.fullMenu[4].push(menuItems.setAlignLeft);
    menu.fullMenu[4].push(menuItems.setAlignCenter);
    menu.fullMenu[4].push(menuItems.setAlignRight);
    menu.fullMenu[5] = [];
    menu.fullMenu[5].push(menuItems.superscriptItem);
    menu.fullMenu[5].push(menuItems.subscriptItem);
    menu.fullMenu[6] = [];
    menu.fullMenu[6].push(menuItems.insertVideoItem);
    menu.fullMenu[6].push(new Dropdown(m.cut([menuItems.mathInlineItem, menuItems.mathBlockItem]), { label: "Math" }));
    menu.fullMenu[7] = [];
    menu.fullMenu[7].push(new Dropdown(menuItems.tableMenu, { label: "Table", title: "Table" }));
    menu.fullMenu[8] = [];
    menu.fullMenu[8].push(menuItems.insertLink);
  }

  attachMenuItems(menu: any, ydoc: Y.Doc, sectionName: string) {
    let menuItemsData
    if (!this.sectionMenus[sectionName]) {
      menuItemsData = [...this.sectionMenus['fullMenu']]
    } else {
      menuItemsData = [...this.sectionMenus[sectionName]]
    }

    // build Menu
    let menuBuild: any[] = []
    let menuItems = m.getItems()
    let getMenuItem = (itemName: string) => {
      if (itemName == 'addCommentMenuItem') {
        return menuItems[itemName](ydoc)
      } else if (itemName == 'alignMenu') {
        return new Dropdown(menuItems['alignMenu'], { class: "align-icon" })
      } else if (itemName == 'tableMenu') {
        return new Dropdown(menuItems['tableMenu'], { class: "table-icon" })
      } else if (itemName == 'headings') {
        //@ts-ignore
        return Object.values(menuItems['headings'])
      } else {
        return menuItems[itemName]
      }
    }
    let buildDropDown = (name: string, type: string, content: any[], label?: string) => {

      let conentItems: any[] = []
      content.forEach((value, index, array) => {
        if (typeof value !== 'string') {
          let submenu = buildDropDown(value.dropdownSubmenuName, 'dropdownSubmenu', value.content);
          conentItems[index] = submenu
        } else {
          conentItems[index] = getMenuItem(value)
        }
      })
      if (type == 'dropdownSubmenu') {
        if (name == 'Headings') {
          conentItems = conentItems.flat()
        }
        return new DropdownSubmenu(m.cut(conentItems), { label: name })
      } else if (type == 'dropdown') {
        return new Dropdown(conentItems, { label: name })
      }
      return
    }
    /* r.typeMenu = new Dropdown(cut([r.makeParagraph, r.makeCodeBlock, r.makeHead1 && new DropdownSubmenu(cut([
      r.makeHead1, r.makeHead2, r.makeHead3, r.makeHead4, r.makeHead5, r.makeHead6
    ]), {label: "Heading"})]), {label: "Type..."}) */
    menuItemsData.forEach((menuSection, i) => {
      menuBuild[i] = [];
      menuSection.forEach((menuItem, j) => {
        if (typeof menuItem == "string") {
          menuBuild[i][j] = getMenuItem(menuItem);
        } else {

          menuBuild[i][j] = buildDropDown(menuItem.dropdownName, 'dropdown', menuItem.content)!
        }
      })
    })
    return menuBuild;
  }
}
