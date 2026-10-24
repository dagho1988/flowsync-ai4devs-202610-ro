---
name: priority-ticket
description: Trae de Jira el ticket de mayor prioridad asignado al usuario en «Por hacer», resume sus criterios de aceptación, entra en plan mode para proponer la implementación y, al aprobarse el plan, mueve el ticket a «En curso». Usar cuando el usuario pida empezar con el siguiente ticket o invoque /priority-ticket.
---

# /priority-ticket

Toma el siguiente ticket de trabajo de Jira y lleva al usuario hasta un plan aprobado. Usa las herramientas del servidor MCP de Atlassian.

## Datos del tablero

- Sitio: `https://dagho1988.atlassian.net` — `cloudId`: `dab15775-6320-4c6b-aae0-4ee8b58a2f68`
- Proyecto: `FLOW` (FlowSync)
- Flujo: «Por hacer» → «En curso» → «Listo» (los nombres de estado y de transición coinciden)

Pasa siempre el `cloudId` explícito en cada llamada. Solo si una llamada lo rechaza, llama a `getAccessibleAtlassianResources` una vez y usa el que devuelva.

## 1. Localiza el ticket

1. Busca con `searchJiraIssuesUsingJql`:

   ```
   project = FLOW AND assignee = currentUser() AND status = "Por hacer" ORDER BY priority DESC, created ASC
   ```

2. Quédate con el primer resultado. Si no hay ninguno, díselo al usuario y para aquí: no busques tickets de otros ni en otros estados.
3. Trae el ticket completo con `getJiraIssue` (descripción incluida).

## 2. Resume el ticket

Muestra al usuario, de forma breve:

- Clave, título y prioridad.
- Los **criterios de aceptación** como lista numerada, tal como vienen en el ticket (sin inventar ni reinterpretar).
- **Huecos detectados**: lo que el ticket no especifica y el código exige. Antes de escribirlos, contrasta el ticket con el código real (rutas en `backend/start/routes.ts`, validadores en `backend/app/validators/`, forma de la respuesta en `backend/providers/api_provider.ts` y los transformers). Ejemplo típico: campos obligatorios del validador que el ticket no menciona.

## 3. Entra en plan mode y propón la implementación

Llama a `EnterPlanMode`. Dentro de plan mode, explora lo necesario (solo lectura) y redacta el plan con:

- Rama a crear (`feat/<CLAVE>-<slug>`, p. ej. `feat/FLOW-3-login-frontend`).
- Archivos a crear o modificar, agrupados por capa.
- Cómo se cumple **cada** criterio de aceptación (referencia el número del criterio).
- Cómo se resuelve cada hueco detectado en el paso 2, citando el archivo del código que lo justifica.
- Cómo se verificará (comandos de build/lint/test del `CLAUDE.md`, y comprobación manual contra el backend).

Presenta el plan con `ExitPlanMode`. No toques código antes de que el usuario lo apruebe.

## 4. Al aprobarse el plan, mueve el ticket a «En curso»

Solo si el usuario aprueba el plan:

1. Lista las transiciones del ticket con `executeRead`, operación `listJiraIssueTransitions`, `inputs: { "issueIdOrKey": "<CLAVE>" }`.
2. Toma el `id` de la transición cuyo destino es «En curso». Si no aparece, pregunta al usuario en vez de adivinar.
3. Aplícala con `transitionJiraIssue` (`transitionId`) y confirma al usuario, en una línea, el estado que devuelve la llamada.

Si el usuario rechaza el plan, el ticket se queda en «Por hacer».
