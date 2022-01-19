import { Plugin, PluginKey } from 'prosemirror-state' // eslint-disable-line

import { getRelativeSelection } from './sync-plugin.js'
import { UndoManager, Item, ContentType, XmlElement, Text, XmlText, YMap } from 'yjs'
import { yUndoPluginKey, ySyncPluginKey } from './keys.js'

export const undo = state => {
    const undoManager = yUndoPluginKey.getState(state).undoManager
    if (undoManager != null) {
        let result = undoManager.undo()
        return true
    }
}

export const redo = state => {
    const undoManager = yUndoPluginKey.getState(state).undoManager
    if (undoManager != null) {
        let result = undoManager.redo()
        return true
    }
}

export const yUndoPlugin = (metadata, { protectedNodes = new Set(['figures_nodes_container', 'block_figure', 'figure_components_container', 'figure_component', 'figure_descriptions_container', 'figure_description', 'figure_component_description']), trackedOrigins = [] } = {}) => {
    let sectionId = metadata.editorID;
    let figuresMap = metadata.figuresMap;
    let renderFigures = metadata.renderFigures;

    let citatsObj = figuresMap.get('articleCitatsObj');
    let addremoveCitatsFunc = (item) => {
        let changedItems = item.changedParentTypes
        let iterator = changedItems.entries()
        let element = iterator.next();
        let elValue = element.value
        let xmlEl;
        if (elValue && elValue[0] instanceof XmlText) {
            xmlEl = elValue[0];
        }
        while (!element.done && !(xmlEl instanceof XmlText)) {
            element = iterator.next();
            elValue = element.value
            if (elValue && elValue[0] instanceof XmlText) {
                xmlEl = elValue[0];
            }
        }
        if (xmlEl) {
            let delta = xmlEl.toDelta()
            let newCitatsCount = 0;
            let newCitats = []
            delta.forEach((element) => {
                let attributes = element.attributes;
                if (attributes) {
                    Object.keys(attributes).forEach((key) => {
                        if (key == 'citation') {
                            newCitatsCount++
                            let citatAtributes = attributes[key];
                            newCitats.push(citatAtributes)
                        }
                    })
                }
            })

            let oldC = item.stackItem.meta.citatData || [];
            let newC = newCitats || [];
            let citatsToRemove = oldC.filter((element) => {
                return newC.filter((el) => { return el.citateid == element.citateid }).length == 0;
            })
            let citatsToAdd = newC.filter((element) => {
                return oldC.filter((el) => { return el.citateid == element.citateid }).length == 0;
            })
            if (oldC.length > newC.length) {
                citatsToRemove.forEach((citatData) => {
                    citatsObj[sectionId][citatData.citateid] = undefined
                })

            } else if (oldC.length < newC.length) {

                citatsToAdd.forEach((citatData) => {
                    /* {
                        "figureIDs": [
                            "5672f573-3349-4b2e-aa7a-2a90fbc3b88f|3"
                        ],
                        "position": 1374,
                        "lastTimeUpdated": 1642428807052,
                        "displaydFiguresViewhere": []
                    } */
                    citatsObj[sectionId][citatData.citateid] = {
                        "figureIDs": citatData.citated_figures,
                        "lastTimeUpdated": new Date().getTime(),
                        "displaydFiguresViewhere": []
                    }
                })
            }
            if (oldC.length !== newC.length && renderFigures) {
                setTimeout(() => {
                    renderFigures(citatsObj)
                }, 10)
            }
        }
    }
    return new Plugin({
        key: yUndoPluginKey,
        state: {
            init: (initargs, state) => {
                // TODO: check if plugin order matches and fix
                const ystate = ySyncPluginKey.getState(state)
                const undoManager = new UndoManager(ystate.type, {
                    captureTimeout: 3000,
                    deleteFilter: item => !(item instanceof Item) ||
                        !(item.content instanceof ContentType) ||
                        !(item.content.type instanceof Text ||
                            (item.content.type instanceof XmlElement && protectedNodes.has(item.content.type.nodeName))) ||
                        item.content.type._length === 0,
                    trackedOrigins: new Set([ySyncPluginKey].concat(trackedOrigins)),
                })
                undoManager.on('stack-item-popped', (item) => {
                    addremoveCitatsFunc(item);
                })
                return {
                    undoManager,
                    prevSel: null,
                    hasUndoOps: undoManager.undoStack.length > 0,
                    hasRedoOps: undoManager.redoStack.length > 0
                }
            },
            apply: (tr, val, oldState, state) => {
                const binding = ySyncPluginKey.getState(state).binding
                const undoManager = val.undoManager
                const hasUndoOps = undoManager.undoStack.length > 0
                const hasRedoOps = undoManager.redoStack.length > 0
                if (binding) {
                    return {
                        undoManager,
                        prevSel: getRelativeSelection(binding, oldState),
                        hasUndoOps,
                        hasRedoOps
                    }
                } else {
                    if (hasUndoOps !== val.hasUndoOps || hasRedoOps !== val.hasRedoOps) {
                        return Object.assign({}, val, {
                            hasUndoOps: undoManager.undoStack.length > 0,
                            hasRedoOps: undoManager.redoStack.length > 0
                        })
                    } else { // nothing changed
                        return val
                    }
                }
            }
        },
        view: view => {
            const ystate = ySyncPluginKey.getState(view.state)
            const undoManager = yUndoPluginKey.getState(view.state).undoManager
            undoManager.on('stack-item-added', ({ stackItem }) => {
                const binding = ystate.binding
                if (binding) {
                    stackItem.meta.set(binding, yUndoPluginKey.getState(view.state).prevSel)
                }
            })
            undoManager.on('stack-item-popped', ({ stackItem }) => {
                const binding = ystate.binding
                if (binding) {
                    binding.beforeTransactionSelection = stackItem.meta.get(binding) || binding.beforeTransactionSelection
                }
            })
            undoManager.on('stack-item-added', (item) => {
                let changedItems = item.changedParentTypes
                let iterator = changedItems.entries()
                let element = iterator.next();
                let elValue = element.value
                let xmlEl;
                if (elValue && elValue[0] instanceof XmlText) {
                    xmlEl = elValue[0];
                }

                while (!element.done && !(xmlEl instanceof XmlText)) {
                    element = iterator.next();
                    elValue = element.value
                    if (elValue && elValue[0] instanceof XmlText) {
                        xmlEl = elValue[0];
                    }
                }
                if (xmlEl) {
                    let delta = xmlEl.toDelta()
                    delta.forEach((element, index) => {
                        let attributes = element.attributes;
                        if (attributes) {
                            Object.keys(attributes).forEach((key) => {
                                if (key == 'citation') {
                                    let citatAtributes = attributes[key];
                                    if (!item.stackItem.meta.citatData) {
                                        item.stackItem.meta.citatData = [];
                                    }
                                    if (item.stackItem.meta.citatData.filter((attrs) => { return attrs.citateid == citatAtributes.citateid }).length == 0) {
                                        item.stackItem.meta.citatData.push(citatAtributes);
                                    }
                                }
                            })
                        }
                    })
                }
            })
            return {
                destroy: () => {
                    undoManager.destroy()
                }
            }
        }
    })
}
