---
name: priority-ticket
description: Trae de Jira el ticket de mayor prioridad asignado al usuario en «Por hacer», resume sus criterios de aceptación, entra en plan mode y propone cómo implementarlo. Al aprobarse el plan, mueve el ticket a «En curso». Úsala cuando el usuario pida empezar con el siguiente ticket o lance /priority-ticket.
---

# /priority-ticket

Usa el servidor MCP `atlassian` del proyecto (`.mcp.json`). Si no está conectado o no tiene sesión iniciada, para y dile al usuario que ejecute `/mcp` → `atlassian` → *Authenticate*. No uses otra fuente de tickets.

## 1. Encuentra el ticket

1. Si no tienes el `cloudId`, obtenlo con `getAccessibleAtlassianResources`. Si hay más de un sitio, pregunta cuál usar.
2. Busca con `searchJiraIssuesUsingJql`:

   ```
   assignee = currentUser() AND status = "Por hacer" ORDER BY priority DESC, created ASC
   ```

   Si no sale nada porque el estado tiene otro nombre en ese tablero, repite con `statusCategory = "To Do"` en lugar de `status = "Por hacer"`.
3. Quédate con el primer resultado. Si no hay ninguno, díselo al usuario y termina.
4. Lee el ticket completo con `getJiraIssue`: resumen, descripción y criterios de aceptación.

## 2. Resume el ticket

Muestra:

- **Clave, título y prioridad.**
- **Criterios de aceptación**, numerados y cada uno en una línea, tal como están en el ticket. No añadas criterios propios.
- **Huecos:** lo que el ticket no dice y el código sí exige. Contrasta el ticket con el código real, no con suposiciones. Por ejemplo: qué campos valida el backend, qué forma tienen las respuestas y los errores, y qué falta instalar en el frontend.

## 3. Entra en plan mode y propón la implementación

Entra en plan mode (`EnterPlanMode`) e investiga el código antes de proponer nada. El plan debe incluir:

- La rama que se va a crear, con este formato: `feat/<CLAVE>-<slug-corto>` (p. ej. `feat/FLOW-2-login`).
- Los archivos que se crean o modifican, cada uno con su ruta.
- Las dependencias que hay que instalar, en qué paquete y con qué comando.
- Cómo se cubre cada criterio de aceptación, criterio por criterio.
- Cómo se comprueba: comandos de build, lint y tests de `CLAUDE.md`, y una prueba manual contra el backend en `localhost:3333`.

Presenta el plan con `ExitPlanMode`. No toques código antes de que se apruebe.

## 4. Al aprobarse el plan

1. Mueve el ticket a «En curso»: consulta las transiciones disponibles del ticket y aplica la que lleve a «En curso» (o a la categoría *In Progress* si el nombre no coincide). Si no existe ninguna, avisa y sigue.
2. Confirma en una línea: `<CLAVE> → En curso`.
3. Implementa según el plan y las reglas de proceso de `CLAUDE.md`.

Si el plan se rechaza, el ticket no cambia de estado.
