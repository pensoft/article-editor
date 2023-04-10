import crel from "crelt"
import { Node } from "prosemirror-model"
import { Plugin } from "prosemirror-state"

import { renderGrouped } from "./menu"

const prefix = "ProseMirror-menubar"

function isIOS() {
    if (typeof navigator == "undefined") return false
    let agent = navigator.userAgent
    return !/Edge\/\d/.test(agent) && /AppleWebKit/.test(agent) && /Mobile\/\w+/.test(agent)
}

// :: (Object) → Plugin
// A plugin that will place a menu bar above the editor. Note that
// this involves wrapping the editor in an additional `<div>`.
//
//   options::-
//   Supports the following options:
//
//     content:: [[MenuElement]]
//     Provides the content of the menu, as a nested array to be
//     passed to `renderGrouped`.
//
//     floating:: ?bool
//     Determines whether the menu floats, i.e. whether it sticks to
//     the top of the viewport when the editor is partially scrolled
//     out of view.
export function menuBar(options) {

    let menuPlugins = []
    let menus = options.content
    Object.keys(menus).forEach((key) => {
        let newOptions = {...options }
        newOptions.menuKey = key;
        menuPlugins.push(new Plugin({
            view(editorView) { return new MenuBarView(editorView, newOptions) }
        }))
    })
    return menuPlugins
}
class MenuBarView {

    constructor(editorView, options) {
        try {
            this.editorView = editorView
            this.options = options
            if(options.sectionID){
              this.PMMenusAndSchemasDefsMap = this.options.serviceShare.YdocService.ydoc.getMap('PMMenusAndSchemasDefsMap')
            }

            this.menuContainer = 
            document.getElementsByClassName(
              options.containerClass
              )[document.getElementsByClassName(options.containerClass).length - 1];

            this.wrapper = crel("div", { class: prefix + "-wrapper" })
            this.menu = this.menuContainer.appendChild(crel("div", { class: prefix }))
            this.menu.className = prefix
            this.menu.style.display = 'none'
            this.spacer = null

            //editorView.dom.parentNode.replaceChild(this.wrapper, editorView.dom)
            //this.wrapper.appendChild(editorView.dom)

            this.maxHeight = 0
            this.widthForMaxHeight = 0
            this.floating = false
            let { dom, update } = renderGrouped(this.editorView, this.options.content[this.options.menuKey],this.options)
            this.contentUpdate = update
            this.menu.appendChild(dom)
            this.update()
            setTimeout(()=>{
              if(this.editorView.isPopupEditor){
                this.editorView.dom.addEventListener('blur',($event)=>{
                  this.menu.style.display = 'none'
                })
              }
            },20)
            if (options.floating && !isIOS()) {
                this.updateFloat()
                let potentialScrollers = getAllWrapping(this.wrapper)
                this.scrollFunc = (e) => {
                    let root = this.editorView.root
                    if (!(root.body || root).contains(this.wrapper)) {
                        potentialScrollers.forEach(el => el.removeEventListener("scroll", this.scrollFunc))
                    } else {
                        this.updateFloat(e.target.getBoundingClientRect && e.target)
                    }
                }
                potentialScrollers.forEach(el => el.addEventListener('scroll', this.scrollFunc))
            }
        } catch (e) {
            console.error(e);
        }
    }

    update(editorView) {
        this.contentUpdate(this.editorView.state)
        if (editorView) {
            let { from, to,$anchor,anchor } = editorView.state.selection
            let menuKey = this.options.menuKey
            let menuTypeOnNode = 'main';
            let menuInAttrs = false;
            let userIsInSectionTreeTitleNode = false;
            let contenteditableNode = true;
            let firstFormControlName // the first when we loop form inside to the outside in the node structure -> the outer formControl name
            let doc = editorView.state.doc
            let docSize = doc.content.size
            let foundMenu = ()=>{
              return menuInAttrs||userIsInSectionTreeTitleNode||firstFormControlName
            }
            let searchPathForNodeWithMenu = (path)=>{
              if(!foundMenu()){
                for(let i = path.length-3;i>=0;i-=3){
                  if(!foundMenu()){
                    let node = path[i];
                    if (node.attrs.menuType && node.attrs.menuType !== '') {
                      menuTypeOnNode = node.attrs.menuType;
                      menuInAttrs = true;
                    }
                    if(node.attrs.formControlName&&node.attrs.formControlName.length>0){
                      firstFormControlName = node.attrs.formControlName;
                      /* if(node.attrs.formControlName=="sectionTreeTitle"){
                        userIsInSectionTreeTitleNode = true;
                      } */
                     }
                    if(node.attrs.contenteditableNode === false || node.attrs.contenteditableNode === "false") {
                      contenteditableNode = false
                    }
                  }
                }
              }
              return foundMenu()
            }
            if(editorView.hasFocus()&&!searchPathForNodeWithMenu($anchor.path)){
              let beforePos = anchor
              let afterPos = anchor
              let updatePositions = ()=>{
                beforePos = beforePos-1>0?beforePos-1:beforePos
                afterPos = afterPos+1<docSize?afterPos+1:afterPos
              }
              let count = 0
              while (!foundMenu()&&count<4){
                updatePositions();
                searchPathForNodeWithMenu(doc.resolve(afterPos).path)
                searchPathForNodeWithMenu(doc.resolve(beforePos).path)
                count++
              }
            }
            if(editorView.hasFocus()&&menuTypeOnNode!="main"){
            }
            if(!userIsInSectionTreeTitleNode&&!menuInAttrs&&this.editorView.editorType&&this.editorView.editorType == 'editorWithCustomSchema'){
              if(
                firstFormControlName &&
                this.options.sectionID&&
                this.editorView.globalMenusAndSchemasSectionsDefs&&
                this.editorView.globalMenusAndSchemasSectionsDefs[this.editorView.sectionID]&&
                this.editorView.globalMenusAndSchemasSectionsDefs[this.editorView.sectionID][firstFormControlName]&&
                this.editorView.globalMenusAndSchemasSectionsDefs[this.editorView.sectionID][firstFormControlName].menu
                ){
                  menuTypeOnNode = this.editorView.globalMenusAndSchemasSectionsDefs[this.editorView.sectionID][firstFormControlName].menu
              }else if(
                firstFormControlName &&
                this.editorView.citableElementMenusAndSchemaDefs&&
                this.editorView.citableElementMenusAndSchemaDefs.allCitableElementsDefsByTags&&
                this.editorView.citableElementMenusAndSchemaDefs.allCitableElementsDefsByTags[firstFormControlName]&&
                this.editorView.citableElementMenusAndSchemaDefs.allCitableElementsDefsByTags[firstFormControlName].menu
              ){
                menuTypeOnNode = this.editorView.citableElementMenusAndSchemaDefs.allCitableElementsDefsByTags[firstFormControlName].menu
              }else{
                if(menuTypeOnNode!='main'){
                }
              }
            }
            if(!userIsInSectionTreeTitleNode&&this.options.sectionID&&this.options.sectionID != 'headEditor'){

              let menusAndSchemasDefs = this.PMMenusAndSchemasDefsMap?.get('menusAndSchemasDefs');

              let importantMenusForCurrNode = [...Object.keys(menusAndSchemasDefs.layoutDefinitions.menus),...Object.keys(this.editorView.citableElementMenusAndSchemaDefs.allCitableElementsMenus)]
              if(menusAndSchemasDefs[this.options.sectionID]){
                importantMenusForCurrNode.push(...Object.keys(menusAndSchemasDefs[this.options.sectionID].menus))
              }
              if(!importantMenusForCurrNode.includes(menuTypeOnNode)){
                menuTypeOnNode = 'main'
              }
            }
            if (!userIsInSectionTreeTitleNode&&menuTypeOnNode == menuKey && editorView.hasFocus()) {
              Array.from(this.menuContainer.children).forEach((child) => {
                  child.style.display = 'none';
              })
              this.menu.style.display = 'block';
            }
            if(userIsInSectionTreeTitleNode && editorView.hasFocus()){
              Array.from(this.menuContainer.children).forEach((child) => {
                child.style.display = 'none';
              })
            }
            if(!contenteditableNode && editorView.hasFocus()){
              Array.from(this.menuContainer.children).forEach((child) => {
                child.style.display = 'none';
              })
            }
        }
        if (this.floating) {
            this.updateScrollCursor()
        } else {
            if (this.menu.offsetWidth != this.widthForMaxHeight) {
                this.widthForMaxHeight = this.menu.offsetWidth
                this.maxHeight = 0
            }
            if (this.menu.offsetHeight > this.maxHeight) {
                this.maxHeight = this.menu.offsetHeight
                this.menu.style.minHeight = this.maxHeight + "px"
            }
        }
    }

    updateScrollCursor() {
        let selection = this.editorView.root.getSelection()
        if (!selection.focusNode) return
        let rects = selection.getRangeAt(0).getClientRects()
        let selRect = rects[selectionIsInverted(selection) ? 0 : rects.length - 1]
        if (!selRect) return
        let menuRect = this.menu.getBoundingClientRect()
        if (selRect.top < menuRect.bottom && selRect.bottom > menuRect.top) {
            let scrollable = findWrappingScrollable(this.wrapper)
            if (scrollable) scrollable.scrollTop -= (menuRect.bottom - selRect.top)
        }
    }

    updateFloat(scrollAncestor) {
        let parent = this.wrapper,
            editorRect = parent.getBoundingClientRect(),
            top = scrollAncestor ? Math.max(0, scrollAncestor.getBoundingClientRect().top) : 0

        if (this.floating) {
            if (editorRect.top >= top || editorRect.bottom < this.menu.offsetHeight + 10) {
                this.floating = false
                this.menu.style.position = this.menu.style.left = this.menu.style.top = this.menu.style.width = ""
                this.menu.style.display = ""
                this.spacer.parentNode.removeChild(this.spacer)
                this.spacer = null
            } else {
                let border = (parent.offsetWidth - parent.clientWidth) / 2
                this.menu.style.left = (editorRect.left + border) + "px"
                this.menu.style.display = (editorRect.top > window.innerHeight ? "none" : "")
                if (scrollAncestor) this.menu.style.top = top + "px"
            }
        } else {
            if (editorRect.top < top && editorRect.bottom >= this.menu.offsetHeight + 10) {
                this.floating = true
                let menuRect = this.menu.getBoundingClientRect()
                this.menu.style.left = menuRect.left + "px"
                this.menu.style.width = menuRect.width + "px"
                if (scrollAncestor) this.menu.style.top = top + "px"
                this.menu.style.position = "fixed"
                this.spacer = crel("div", { class: prefix + "-spacer", style: `height: ${menuRect.height}px` })
                parent.insertBefore(this.spacer, this.menu)
            }
        }
    }

    destroy() {
      if(this.menuContainer&&this.menu){
        this.menuContainer.removeChild(this.menu)
      }
        if (this.wrapper.parentNode)
            this.wrapper.parentNode.replaceChild(this.editorView.dom, this.wrapper)
    }
}

// Not precise, but close enough
function selectionIsInverted(selection) {
    if (selection.anchorNode == selection.focusNode) return selection.anchorOffset > selection.focusOffset
    return selection.anchorNode.compareDocumentPosition(selection.focusNode) == Node.DOCUMENT_POSITION_FOLLOWING
}

function findWrappingScrollable(node) {
    for (let cur = node.parentNode; cur; cur = cur.parentNode)
        if (cur.scrollHeight > cur.clientHeight) return cur
}

function getAllWrapping(node) {
    let res = [window]
    for (let cur = node.parentNode; cur; cur = cur.parentNode)
        res.push(cur)
    return res
}
