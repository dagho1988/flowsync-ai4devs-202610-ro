---
name: commit
description: Crea un commit convencional (`tipo(scope): descripción`) a partir de los cambios ya preparados (staged). Úsala cuando el usuario pida commitear o lance /commit.
---

# /commit

Commitea **solo lo que está en el stage**. No ejecutes `git add` ni metas archivos por tu cuenta.

## 1. Revisa qué hay preparado

```bash
git status --short
git diff --cached --stat
git diff --cached
```

- Si no hay nada en el stage, dilo, enseña lo que hay sin preparar y termina. No lo prepares tú.
- Si en el stage hay algo que no debería ir en un commit, para y avisa antes de commitear. Por ejemplo: `.env`, `tmp/db.sqlite3`, `node_modules/` o artefactos de build.
- Si estás en `main`, para y avisa: las reglas del proyecto piden trabajar en una rama.

## 2. Escribe el mensaje

Formato: `tipo(scope): descripción`

- **tipo**: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `style`, `perf`, `build` o `ci`. Elige el que describa el cambio principal.
- **scope**: la parte del repo que se toca, sobre todo `backend` o `frontend`. Usa otro solo si encaja mejor, como `harness` para `.claude/`, `CLAUDE.md` o `.mcp.json`, o `deps`. Si el cambio toca varias partes por igual, quita el scope (`docs: ...`).
- **descripción**: en **español**, en minúscula, sin punto final y de 72 caracteres como mucho en total. Di qué cambia, no cómo.
- **cuerpo** (opcional): sepáralo con una línea en blanco. Solo si el porqué no se deduce del diff. Puede ser una lista corta.
- Si la rama lleva la clave de un ticket (p. ej. `feat/FLOW-2-login`), añade al final una línea `Refs: FLOW-2`.

Ejemplos del historial del repo:

```
fix(backend): repo utilizable tras clone en limpio
docs(s1): enunciado del ejercicio y plantilla de prompts en la rama de partida
```

Si los cambios preparados son de cosas que no tienen nada que ver entre sí, propón dividirlos en varios commits en lugar de juntarlos en uno.

## 3. Commitea

Pasa el mensaje con un heredoc para conservar los saltos de línea. No uses `--no-verify` ni `--amend`, salvo que el usuario lo pida. Si un hook falla, arregla la causa y crea un commit nuevo.

Al terminar, muestra la salida de `git log --oneline -1`.
