import {
    bundlesDirectory,
    componentDirectory,
    defaultCommands,
} from '../config.mjs'
import { gatherDynamicFolderContents } from '../services/utilities.mjs'
import { pathArray } from '../navigation/nav.mjs'
import { mainMenuChoices as mmc } from '../config.mjs'

export const mainMenuPrompt = [{
    type: 'list',
    name: 'main_menu',
    message: 'Welcome! What would you like to do?',
    choices: [
        mmc.copyFrom,
        mmc.build,
        mmc.explore,
        mmc.createNew,
        mmc.help,
        mmc.settings
    ]
}]

export const whatDirPrompt = [{
    type: 'input',
    name: 'what_dir',
    message: 'Whats the new folder name?',
}]

export const whatFilenamePrompt = [{
    type: 'input',
    name: 'what_filename',
    message: 'What is the file to be called? Include file extension!'
}]

export const whatComponentNamePrompt = [{
    type: 'input',
    name: 'what_compname',
    message: `What is the component named? i.e - the 'in-file' exported name.` 
}]

export const srcFolderPrompt = [{
    type: 'input',
    name: 'src_folder',
    message: 'Type path of your /src folder',
}]

export const settingsPrompt = [{
    type: 'list',
    name: 'settings',
    message: 'User configurable settings',
    choices: ['Set /src folder', 'Reset /src folder', 'Set style sheet options']
}]

export const newBuildPrompt = [{
    type: 'list',
    name: 'language',
    message: 'For What Language?',
    choices: ['React', 'Vue', 'Ruby']
}]

export const reactBuilds = [{
    type: 'list',
    name: 'reactBuilds',
    message: 'Which Build Pack?',
    choices: ['Parcel', 'Vite', 'Webpack']
}]

export const vueBuilds = [{
    type: 'list',
    name: 'vueBuilds',
    message: 'Which Build Pack?',
    choices: ['Unknown']
}]

export const newBundlePrompt = [{
    type: 'input',
    name: 'rootDirName',
    message: 'What would you like your root directory to be called?',
}]

export function generateDynamicPrompt(commandArray = defaultCommands) {
    const dynamicFolderPrompt = [{
        type: 'list',
        name: 'contents',
        message: 'Navigation',
        choices: () => gatherDynamicFolderContents(pathArray.join('/'), commandArray),
        pageSize: 25,
        default: commandArray.length
    }]
    return dynamicFolderPrompt
}

export function generateDynamicLibraryPrompt(commandArray = defaultCommands) {
    const dynamicFolderPrompt = [{
        type: 'list',
        name: 'selection',
        message: 'Navigation',
        choices: () => gatherDynamicFolderContents(componentDirectory.join('/'), commandArray),
        pageSize: 25,
        default: commandArray.length
    }]
    return dynamicFolderPrompt
}

export function generateDynamicBundlePrompt(commandArray = defaultCommands, startingLocation) {
    const dynamicFolderPrompt = [{
        type: 'list',
        name: 'selection',
        message: 'Navigation',
        choices: () => gatherDynamicFolderContents(`${bundlesDirectory.join('/')}/${startingLocation.join('/')}`, commandArray),
        pageSize: 25,
        default: commandArray.length
    }]
    return dynamicFolderPrompt
}