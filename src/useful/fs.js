import { readFile, writeFile } from "node:fs/promises"

const todoFilePath = "src/Data/todos.json"

export async function readTodos () {
    return JSON.parse(await readFile(todoFilePath, "utf8"))
}


export async function writeTodos(todos) {
    await writeFile(todoFilePath, JSON.stringify(todos, null, 2))
}