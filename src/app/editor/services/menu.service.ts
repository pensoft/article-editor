//@ts-ignore
import { Dropdown as Dropdown2} from '../utils/prosemirror-menu-master/src/index.js';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Dropdown, DropdownSubmenu } from 'prosemirror-menu';
import { CommentsService } from '../utils/commentsService/comments.service';

import * as Y from 'yjs';
import * as menuDialogs from '../utils/menu/menu-dialogs';
import * as m from '../utils/menu/menuItems';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  
  addCommentSubject;

  constructor(public dialog: MatDialog,private commentsService:CommentsService) {
    menuDialogs.shareDialog(dialog);
    this.addCommentSubject=commentsService.addCommentSubject;
  }

  sectionMenus: { [key: string]: (string | { dropdownName?: string, dropdownIcon?:string,label?: string, content: (string | { dropdownSubmenuName?: string,dropdownSubmenuIcon?:string, label?: string, content: any })[] })[][] } = {
    'Title':
      [
        ['toggleStrong', 'toggleEm', 'toggleCode'],
        ['alignMenu'],
        ['insertLink','addAnchorTagMenuItem'],
        ['toggleSubscriptItem', 'toggleSuperscriptItem'],
        ['undoItem', 'redoItem']
      ],
    'fullMenu1': [
      ['toggleStrong', 'toggleEm', 'toggleCode', 'insertLink','addAnchorTagMenuItem'],
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
    ],
    'fullMenu': [
      ['textMenu'],
      ['alignMenu'],
      ['undoItem', 'redoItem'],
      ['insertLink', 'addAnchorTagMenuItem','highLightMenuItem'],
      ['insertMenu']
    ],'fullMenuWithLog': [
      ['textMenu'],
      ['alignMenu'],
      ['undoItem', 'redoItem'],
      ['insertLink', 'addAnchorTagMenuItem','highLightMenuItem'],
      ['insertMenu']
    ],
    'SimpleMenu': [
      ['toggleStrong', 'toggleEm', 'toggleUnderline'],
      ['toggleSubscriptItem', 'toggleSuperscriptItem'],
      ['undoItem', 'redoItem','insertVideoItem'],
    ]
  }

  attachMenuItems2(menu: any, ydoc: Y.Doc) {
    let menuItems = m.getItems();
    
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

  attachMenuItems(menu: any, ydoc: Y.Doc, sectionName: string,sectionId?:string) {
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
      let item : any;
      if (itemName == 'alignMenu') {

        item = new Dropdown(menuItems[itemName], { class: "align-icon" })
      } else if (itemName == 'tableMenu') {
        item = new Dropdown(menuItems[itemName], { class: "table-icon" })
      } else if (itemName == 'textMenu') {
        let dropdown = new Dropdown2(menuItems[itemName], { class: "text-menu-icon" })
        item = dropdown
      } else if (itemName == 'insertMenu') {
        item = new Dropdown(menuItems[itemName], { label: 'Insert' })
      } else if (itemName == 'headings') {
        //@ts-ignore
        item = Object.values(menuItems['headings'])
      } else {
        item = menuItems[itemName]
      }
      if(!item){
        console.error(`Could not find menu item with name "${itemName}" !!`);
      }
      return item
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

          menuBuild[i][j] = buildDropDown( menuItem.dropdownIcon!, 'dropdown', menuItem.content)!
        }
      })
    })
    return menuBuild;
  }
}
