// PostToolUse hook: formatea con Prettier el archivo que el agente acaba de
// editar, solo si está bajo frontend/src/. Nunca bloquea al agente.
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
const frontendDir = path.join(projectDir, 'frontend')
const srcDir = path.join(frontendDir, 'src')
const prettierBin = path.join(frontendDir, 'node_modules', 'prettier', 'bin', 'prettier.cjs')

let input
try {
  input = JSON.parse(readFileSync(0, 'utf8'))
} catch {
  process.exit(0)
}

const filePath = input?.tool_input?.file_path
if (!filePath) process.exit(0)

const absolute = path.resolve(projectDir, filePath)
const relative = path.relative(srcDir, absolute)
if (relative.startsWith('..') || path.isAbsolute(relative)) process.exit(0)
if (!existsSync(absolute)) process.exit(0)

if (!existsSync(prettierBin)) {
  console.error('format-frontend: Prettier no está instalado; ejecuta `npm install` en frontend/.')
  process.exit(0)
}

try {
  execFileSync(
    process.execPath,
    [prettierBin, '--write', '--ignore-unknown', '--log-level', 'warn', absolute],
    { cwd: frontendDir, stdio: ['ignore', 'ignore', 'pipe'] },
  )
} catch (error) {
  // Un error de sintaxis no debe bloquear la edición; se lo contamos al agente.
  console.error(`format-frontend: Prettier falló en ${filePath}\n${error.stderr ?? error.message}`)
}
