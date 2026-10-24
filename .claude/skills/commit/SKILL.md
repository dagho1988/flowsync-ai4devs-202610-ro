---
name: commit
description: Crea un commit convencional (`tipo(scope): descripción`) a partir de los cambios ya preparados (staged). Usar cuando el usuario invoque /commit o pida commitear lo que está en el stage.
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git commit:*)
---

# /commit

Commitea **solo lo que ya está en el stage**. No ejecutes `git add`, `git reset` ni `git stash`: qué entra en el commit lo decide el usuario.

## 1. Lee los cambios

```bash
git diff --cached --stat
git diff --cached
git log --oneline -10
```

Si `git diff --cached` está vacío, dile al usuario que no hay nada preparado y para. Si hay cambios sin preparar, ignóralos (como mucho, menciónalos en una línea al final).

## 2. Redacta el mensaje

Formato:

```
tipo(scope): descripción

[cuerpo opcional]
```

- **tipo**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Elige por lo que cambia el comportamiento, no por el tipo de archivo.
- **scope**: el área tocada, en minúsculas: `frontend`, `backend`, `auth`, `harness`… Si el cambio abarca demasiadas áreas para un scope, omítelo (`tipo: descripción`). Si los commits recientes usan otros scopes para la misma zona, sigue esos.
- **descripción**: en español, como el historial del repo; en minúscula, sin punto final, que describa qué hace el cambio, ≤ 72 caracteres en la primera línea.
- **cuerpo**: solo si el *porqué* no se deduce del diff. Líneas de ≤ 72 caracteres.
- **Breaking change**: `!` tras el scope (`feat(auth)!: …`) y un pie `BREAKING CHANGE: …`.
- Si la rama o los cambios mencionan una clave de Jira del proyecto `FLOW` (p. ej. la rama `feat/FLOW-3-login-frontend`), añade un pie `Refs: FLOW-3`.
- Añade al final las líneas de atribución que tengas configuradas para commits.

Si el stage mezcla cambios sin relación entre sí (p. ej. una feature y un arreglo ajeno), propón al usuario dividirlo en lugar de forzar un único mensaje.

## 3. Commitea

Usa un heredoc para conservar los saltos de línea:

```bash
git commit -F - <<'EOF'
tipo(scope): descripción

cuerpo
EOF
```

Si falla un hook de pre-commit, muestra el error y no reintentes con `--no-verify`. Al terminar, muestra `git log --oneline -1`.
