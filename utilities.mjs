import { promises, stat } from 'fs'
import util from 'util'
import inquirer from 'inquirer'
import { clearANSI, styled } from './styles.mjs'
import { writeFile } from 'fs'

export const statPromise = util.promisify(stat)

export function colorizeString(input, isDirectory) {
    return isDirectory ? styled(styled(`${input}`, 'bold'), 'cyan') : styled(input, 'green')
}

export async function gatherDynamicFolderContents(inputDirectory, commandOptions) {
    try {
        const files = await promises.readdir(inputDirectory)
        const taggedFiles = await Promise.all(
            files.map(async (entry) => {
                const fullPath = `${inputDirectory}/${entry}`
                const stats = await statPromise(fullPath)
                const isDirectory = stats.isDirectory()
                const styledEntry = colorizeString(entry, isDirectory)
                return styledEntry
            })
        )

        const styledCommands = commandOptions.map(entry => (
            styled(styled(entry, 'italics'), 'yellow')
        ))

        return [
            new inquirer.Separator(),
            ...styledCommands,
            new inquirer.Separator(),
            ...taggedFiles
        ]

    } catch (error) {
        console.error('Error reading directory:', error)
        return []
    }
}

export function fsWriteFile(path, newContent) {
    writeFile(path, newContent, (err) => {
        if (err) {
            console.error('Error writing to file:', err)
        } else {
            console.log('File content changed successfully.')
        }
    })
}

export function answerMatch(answer, command) {
    return clearANSI(answer) === command
}

export function updatePrimaryStyleSheet(primaryStyleSheet, componentFilename, componentType) {
    let newStyleImport
    const replaceTag = `/* HAL ${componentType.toUpperCase()}S STYLESHEET TAG */`
    newStyleImport = `@import "./${componentType}s/${componentFilename.split('.')[0]}";`
    const newStringBlock = `${newStyleImport}\n${replaceTag}`
    const regexPattern = new RegExp(`\\/\\*\\s*HAL ${componentType.toUpperCase()}S STYLESHEET TAG\\s*\\*\\/`);
    return primaryStyleSheet.replace(regexPattern, newStringBlock)
}
