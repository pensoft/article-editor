import { EditorView } from 'prosemirror-view'
import { ColorDef } from 'y-prosemirror/dist/src/plugins/sync-plugin'

let testUsers = [
    { username: 'Alice', color: '#ecd444', lightColor: '#ecd44433' },
    { username: 'Bob', color: '#ee6352', lightColor: '#ee635233' },
    { username: 'Rado', color: '#b8ffb0', lightColor: '#c8ffc2' },
    { username: 'Max', color: '#6eeb83', lightColor: '#6eeb8333' }
]

let colors:ColorDef[] = [
    { light: '#ecd44433', dark: '#ecd444' },
    { light: '#ee635233', dark: '#ee6352' },
    { light: '#6eeb8333', dark: '#6eeb83' }
]

export {
    colors,
    testUsers,
}