#!/usr/bin/env node
// PostToolUse hook: formatea con Prettier los archivos de frontend/src/** que el agente edita.
// Lee el evento JSON por stdin; nunca bloquea al agente (siempre sale con 0).
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

let input = ''
for await (const chunk of process.stdin) input += chunk

let filePath
try {
  filePath = JSON.parse(input).tool_input?.file_path
} catch {
  process.exit(0)
}
if (!filePath) process.exit(0)

const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd()
const frontendDir = path.join(projectDir, 'frontend')
const srcDir = path.join(frontendDir, 'src') + path.sep
const absPath = path.resolve(projectDir, filePath)

if (!absPath.startsWith(srcDir) || !existsSync(absPath)) process.exit(0)

const prettier = path.join(frontendDir, 'node_modules', '.bin', 'prettier')
if (!existsSync(prettier)) {
  console.error('format-frontend: Prettier no está instalado (cd frontend && npm install)')
  process.exit(0)
}

try {
  execFileSync(prettier, ['--write', '--ignore-unknown', '--log-level', 'warn', absPath], {
    cwd: frontendDir,
    stdio: ['ignore', 'ignore', 'pipe'],
  })
} catch (err) {
  // Error de sintaxis u otro fallo: se avisa por stderr pero no se bloquea la edición.
  console.error(`format-frontend: Prettier falló en ${absPath}\n${err.stderr ?? err.message}`)
}
process.exit(0)
