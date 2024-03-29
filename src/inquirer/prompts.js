/* Configuration imports */
import {
    defaultCommands,
    mainMenuChoices as mmc,
    navCommandObject as cmd
} from '../config/config.mjs'

import { styled } from '../styles/styles.mjs'

/* Library and Helper imports */
import inquirer from 'inquirer'
import { gatherDynamicFolderContents } from '../services/utilities.mjs'


export const mainMenuPrompt = [{
    type: 'list',
    name: 'main_menu',
    message: 'Welcome! What would you like to do?',
    choices: [
        mmc.copyFrom,
        mmc.build,
        mmc.explore,
        mmc.createNew,
        mmc.help, // ATTN: Planned feature - Help doc
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

export const newBuildPrompt = [{
    type: 'list',
    name: 'language',
    message: 'For What Language?',
    choices: [styled(cmd.reset, 'yellow'), styled(cmd.cancel, 'yellow'), new inquirer.Separator(), 'React', 'Vue', 'Ruby']
}]

export const reactBuilds = [{
    type: 'list',
    name: 'reactBuilds',
    message: 'Which Build Pack?',
    choices: [styled(cmd.reset, 'yellow'), styled(cmd.cancel, 'yellow'), new inquirer.Separator(), 'Parcel', 'Vite', 'Webpack']
}]

export const vueBuilds = [{
    type: 'list',
    name: 'vueBuilds',
    message: 'Which Build Pack?',
    choices: [styled(cmd.reset, 'yellow'), styled(cmd.cancel, 'yellow'), new inquirer.Separator(), 'Unknown']
}]

export const newBundlePrompt = [{
    type: 'input',
    name: 'rootDirName',
    message: 'What would you like your root directory to be called?',
}]

export const settingsPrompt = [{
    type: 'list',
    name: 'settings',
    message: 'Select setting to set:',
    choices: [cmd.setSRC, cmd.setMainStylesheet, cmd.setStyleFolder]
}]

export function generateDynamicPrompt(commandArray = defaultCommands, path) {
    const dynamicFolderPrompt = [{
        type: 'list',
        name: 'contents',
        message: 'Navigation',
        choices: () => gatherDynamicFolderContents(path, commandArray),
        pageSize: 25,
        default: commandArray.length
    }]
    return dynamicFolderPrompt
}
