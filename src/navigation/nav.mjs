/* Configuration imports */
import {
    defaultCommands,
    fromLibraryCommands,
    directoriesContainingStyleSheets,
    placeComponentCommands,
    navCommandObject as cmd,
    newBuildPlacement
} from "../config/config.mjs"

import {
    libraryStyleDirectory,
    componentDirectory,
    projectComponentStylesFolder,
    projectMainStylesheet,
} from "../config/pathVariables.mjs"

import { relativeDirectoryArray } from "../config/relativeDirectory.mjs"

/* Library and Helper imports */
import inquirer from "inquirer"
import * as p from '../inquirer/prompts.js'
import {
    setSourceAction,
    newFileAction,
    newFolderAction,
    newBuildActions
} from "../inquirer/actions.mjs"

import { stat, readFileSync, promises } from 'fs'

import {
    answerMatch,
    styledComponentRegex,
    noExportRegExp,
    updatePrimaryStyleSheet,
    fsWriteFile,
    writeNewBundle
} from "../services/utilities.mjs"

import { clearANSI } from '../styles/styles.mjs'
import { userRootDirectory } from "../config/userSetRootPath.mjs"

/* Local variable used to store temporary values */
var tempComponentFilename = null
var tempComponentContent = null
var tempStylesheetContent = null
var tempPrimaryStylesheetContent = null
var tempStyledComponentType = null
var tempComponentName = null
var hasExport = false
var hasStylesheet = false

function garbageCollectTempVars() {
    tempComponentFilename = null
    tempComponentContent = null
    tempStylesheetContent = null
    tempPrimaryStylesheetContent = null
    tempStyledComponentType = null
    tempComponentName = null
    hasExport = false
    hasStylesheet = false
}


export function navHandler(type, commands, options = null) {
    console.log(options)
    let pathArray
    let directoryHandler
    // let bundlePath = [...bundlesDirectory]
    // console.log(bundlePath)
    // console.log(typeof(bundlePath))
    if (type === 'nav') (pathArray = [...relativeDirectoryArray])
    if (type === 'library') (pathArray = [...componentDirectory])
    if (type === 'bundle') (pathArray = [...options.chosenBundlePath])

    if (options?.bundleIsSelected && userRootDirectory !== '') (pathArray = [...userRootDirectory])

    function updateStyleAction(answers, pathArray) { // Issue with scope of pathArray
        pathArray.push(clearANSI(answers.contents))
        pathArray.join('/').match(noExportRegExp) === null && (hasExport = true)

        if (pathArray.join('/').match(styledComponentRegex)) { /* --------------- HAS STYLESHEET COMPONENTS ---------------- */
            hasStylesheet = true

            async function getStyleSheets() {
                const styleFiles = await promises.readdir(libraryStyleDirectory.join('/'))
                return styleFiles
            }
            getStyleSheets().then(result => {
                const relativeStyleSheetFilename = result.filter(entry => entry.includes(clearANSI(answers.contents.split('.')[0])))[0]
                tempStylesheetContent = readFileSync(`${libraryStyleDirectory.join('/')}/${relativeStyleSheetFilename}`, 'utf8')
                const primaryStyleSheetInitContent = readFileSync(`${projectMainStylesheet.join('/')}`).toString()
                handleNamingUpdatingAndNav(pathArray, primaryStyleSheetInitContent)
            })

        } else { /* --------------- NO STYLESHEET COMPONENTS ---------------- */
            handleNamingUpdatingAndNav(pathArray)
        }
    }

    function handleNamingUpdatingAndNav(pathArray, primaryStyleSheetInitContent = null) { // Issue with scope of pathArray
        try {
            inquirer.prompt(p.whatFilenamePrompt).then(answers => {
                tempComponentFilename = answers.what_filename
                hasStylesheet && (tempPrimaryStylesheetContent = updatePrimaryStyleSheet(primaryStyleSheetInitContent, tempComponentFilename, tempStyledComponentType))

                if (hasExport) {
                    inquirer.prompt(p.whatComponentNamePrompt).then(answers => {
                        tempComponentName = answers.what_compname
                        tempComponentContent = readFileSync(pathArray.join('/'), 'utf8')
                        hasExport && (tempComponentContent = tempComponentContent.replace(/!!NAME!!/g, tempComponentName).toString())
                    }).finally(() => {
                        const options = {
                            resetPath: true
                        }
                        nav(placeComponentCommands, options)
                    })
                } else if (!hasExport) {
                    tempComponentContent = readFileSync(pathArray.join('/'), 'utf8')
                    const options = {
                        resetPath: true
                    }
                    nav(placeComponentCommands, options)
                }

            })
        } catch (err) {
            console.error('Error reading file:', err)
        }
    }

    const navStat = (pathArray, answers, commandArray, options = null) => {
        stat(`${pathArray.join('/')}/${clearANSI(answers.contents)}`, (err, stats) => {
            if (err) {
                console.error('Error getting file/folder information:', err)
            } else {
                if (stats.isFile()) {
                    console.log('No action available') // THIS IS A USELESS ENDPOINT FOR THE USER
                } else if (stats.isDirectory()) {
                    pathArray.push(clearANSI(answers.contents))
                    nav(commandArray, options)
                } else {
                    console.log('The selection is neither a file nor a folder.')
                }
            }
        })
    }

    const libraryStat = (pathArray, answers, commandArray) => {
        stat(`${pathArray.join('/')}/${clearANSI(answers.contents)}`, (err, stats) => {
            if (err) {
                console.error('Error getting file/folder information:', err)
            } else {
                if (stats.isFile()) { // HANDLES FILE SELECTION
                    updateStyleAction(answers, pathArray)
                } else if (stats.isDirectory()) { // HANDLES DIRECTORY SELECTION
                    if (directoriesContainingStyleSheets.includes(clearANSI(answers.contents))) {
                        tempStyledComponentType = clearANSI(answers.contents)
                    }
                    pathArray.push(clearANSI(answers.contents))
                    nav(commandArray)
                } else {
                    console.log('The selection is neither a file nor a folder.')
                }
            }
        })
    }

    const bundleStat = (pathArray, answers, commandArray, passedOptions) => {
        console.log('TRACE: bundleStat')
        stat(`${pathArray.join('/')}/${clearANSI(answers.contents)}`, (err, stats) => {
            if (err) {
                console.error('Error getting file/folder information:', err)
            } else {
                // pathArray.push(clearANSI(answers.contents))
                const options = {
                    ...passedOptions,
                    bundleSrcFolder: pathArray,
                    bundleSelection: answers.contents,
                    bundleIsSelected: true
                }
                // TODO: it would be better to pass the build language and type directly instead of manipulating the path
                navHandler('nav', newBuildPlacement, options)
            }
        })
    }

    type === 'nav' && (directoryHandler = navStat)
    type === 'library' && (directoryHandler = libraryStat)
    type === 'bundle' && (directoryHandler = bundleStat)

    function nav(commandArray = defaultCommands, options = null) {
        inquirer.prompt(p.generateDynamicPrompt(commandArray, pathArray)).then((answers) => {
            if (answerMatch(answers.contents, cmd.up)) {
                pathArray = pathArray.slice(0, -1)
                nav(commandArray, options)
            } else if (answerMatch(answers.contents, cmd.cancel)) {
                console.log('Goodbye!')
            } else if (answerMatch(answers.contents, cmd.place)) {
                placeComponentAction(pathArray)
            } else if (answerMatch(answers.contents, cmd.newFile)) {
                newFileAction(pathArray)
            } else if (answerMatch(answers.contents, cmd.newFolder)) {
                newFolderAction(pathArray)
            } else if (answerMatch(answers.contents, cmd.startBuild)) {
                writeNewBundle(pathArray, options)
            } else if (answerMatch(answers.contents, cmd.setSRC)) {
                setSourceAction(pathArray)
            } else {
                directoryHandler(pathArray, answers, commandArray, options)
            }
        })
    }
    nav(commands, options)

}

function placeComponentAction(pathArray) {
    try {
        fsWriteFile(`${pathArray.join('/')}/${tempComponentFilename}`, tempComponentContent) // Write new component
        if (tempStylesheetContent !== null) {
            fsWriteFile(`${projectComponentStylesFolder.join('/')}/${tempStyledComponentType}/${tempComponentFilename.split('.')[0]}.scss`, tempStylesheetContent) // Write new scss file
            fsWriteFile(`${projectMainStylesheet.join('/')}`, tempPrimaryStylesheetContent) // Write updated primary stylesheet
        }
    } catch (error) {
        console.log('Something went wrong!', error)
    } finally {
        garbageCollectTempVars()
    }
}

/* DEV FUNCTIONS */

// function logTempVars() {
//     console.log('comp filename', tempComponentFilename)
//     console.log('comp content', tempComponentContent)
//     console.log('comp export name', tempComponentName)
//     console.log('stylesheet content', tempStylesheetContent)
//     console.log('primary stylesheet content', tempPrimaryStylesheetContent)
//     console.log('comp type', tempStyledComponentType)
// }
