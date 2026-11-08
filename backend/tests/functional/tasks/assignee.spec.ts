import User from '#models/user'
import Task from '#models/task'
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Lo que cada tarea muestra de su responsable. Cubre los tres scenarios del
 * requisito «Lo que cada tarea muestra de su responsable» de
 * `openspec/specs/tasks/spec.md`: responsable identificable, la tarea no
 * filtra datos de cuenta, y responsable sin nombre.
 *
 * Cada tarea se obtiene por los dos caminos que la entregan — suelta
 * (`GET /tasks/:id`) y dentro de la lista (`GET /tasks`) — porque el requisito
 * vale para «cada tarea», no para una de las dos lecturas.
 */
test.group('Tasks | responsable', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  /**
   * Lo único que el requisito deja ver del responsable: con qué identificarlo
   * (id), su nombre y sus iniciales.
   */
  const CLAVES_PERMITIDAS = ['id', 'fullName', 'initials']

  async function sesion(client: any, email = 'lector@example.com') {
    await User.create({ fullName: 'Lector', email, password: 'secreto123' })

    const response = await client.post('/api/v1/auth/login').json({ email, password: 'secreto123' })

    return response.body().data.token as string
  }

  async function tareaDe(responsable: User) {
    return Task.create({
      title: 'Revisar el informe',
      status: 'pending',
      assigneeId: responsable.id,
    })
  }

  async function assigneeSuelta(client: any, token: string, task: Task) {
    const response = await client
      .get(`/api/v1/tasks/${task.id}`)
      .qs({ today: '2026-11-08' })
      .header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)
    return response.body().data.assignee
  }

  async function assigneeEnLista(client: any, token: string, task: Task, assert: any) {
    const response = await client.get('/api/v1/tasks').header('Authorization', `Bearer ${token}`)

    response.assertStatus(200)

    const enLista = response.body().data.find((t: { id: number }) => t.id === task.id)
    assert.exists(enLista, 'la tarea no aparece en la lista')
    return enLista.assignee
  }

  test('responsable identificable: el assignee trae su nombre y sus iniciales', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const ada = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })
    const task = await tareaDe(ada)

    for (const assignee of [
      await assigneeSuelta(client, token, task),
      await assigneeEnLista(client, token, task, assert),
    ]) {
      assert.equal(assignee.fullName, 'Ada Lovelace')
      assert.equal(assignee.initials, 'AL')
    }
  })

  test('la tarea no filtra datos de cuenta: el assignee no trae email ni otros datos', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const ada = await User.create({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secreto123',
    })
    const task = await tareaDe(ada)

    const suelta = await assigneeSuelta(client, token, task)
    assert.notProperty(suelta, 'email')
    assert.notProperty(suelta, 'password')
    assert.containsSubset(CLAVES_PERMITIDAS, Object.keys(suelta))

    const enLista = await assigneeEnLista(client, token, task, assert)
    assert.notProperty(enLista, 'email')
    assert.notProperty(enLista, 'password')
    assert.containsSubset(CLAVES_PERMITIDAS, Object.keys(enLista))
  })

  test('responsable sin nombre: el nombre llega nulo y las iniciales siguen llegando', async ({
    client,
    assert,
  }) => {
    const token = await sesion(client)
    const sinNombre = await User.create({
      fullName: null,
      email: 'ada@example.com',
      password: 'secreto123',
    })
    const task = await tareaDe(sinNombre)

    for (const assignee of [
      await assigneeSuelta(client, token, task),
      await assigneeEnLista(client, token, task, assert),
    ]) {
      assert.isNull(assignee.fullName)
      assert.equal(assignee.initials, 'AE')
      assert.notProperty(assignee, 'email')
    }
  })
})
