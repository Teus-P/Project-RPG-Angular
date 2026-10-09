import {TestBed} from '@angular/core/testing'
import {provideHttpClient} from '@angular/common/http'
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing'
import {environment} from '../../../../environments/environment'
import {SkirmishService} from './skirmish.service'
import {ReceivedDamage} from '../../model/receive-damage/receive-damage.model'
import {AddConditions} from '../../model/condition/add-conditions.model'
import {SkirmishGroup} from '../../model/skirmish/skirmish-group.model'

describe('SkirmishService', () => {
  const api = environment.apiUrl
  const damage = <ReceivedDamage>{}
  const conditions = <AddConditions>{}
  let service: SkirmishService
  let http: HttpTestingController

  const waitForNextRequest = () => new Promise(resolve => setTimeout(resolve))

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient(), provideHttpClientTesting()]})
    service = TestBed.inject(SkirmishService)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  const postCases: { name: string, path: string, body: unknown, call: (service: SkirmishService) => Promise<unknown> }[] = [
    {name: 'receiveDamage', path: 'receiveDamage', body: damage, call: s => s.receiveDamage(damage)},
    {name: 'addWoundPoint', path: 'addWoundPoint', body: 5, call: s => s.addWoundPoint(5)},
    {name: 'removeWoundPoint', path: 'removeWoundPoint', body: 5, call: s => s.removeWoundPoint(5)},
    {name: 'addAdvantagePoint', path: 'addAdvantagePoint', body: 5, call: s => s.addAdvantagePoint(5)},
    {name: 'removeAdvantagePoint', path: 'removeAdvantagePoint', body: 5, call: s => s.removeAdvantagePoint(5)},
    {name: 'addConditions', path: 'addConditions', body: conditions, call: s => s.addConditions(conditions)},
    {name: 'changeIsDeadValue', path: 'changeIsDeadValue', body: {id: 3, value: true}, call: s => s.changeIsDeadValue(3, true)}
  ]

  postCases.forEach(postCase => {
    it(`${postCase.name} sends POST /${postCase.path} with the expected body`, async () => {
      const pending = postCase.call(service)

      const request = http.expectOne(`${api}/${postCase.path}`)
      expect(request.request.method).toBe('POST')
      expect(request.request.body).toEqual(postCase.body)
      request.flush(null)
      await pending
    })

    it(`${postCase.name} rejects when the request fails`, async () => {
      const pending = postCase.call(service)

      http.expectOne(`${api}/${postCase.path}`).flush('error', {status: 500, statusText: 'Server Error'})

      await expectAsync(pending).toBeRejected()
    })
  })

  describe('skirmish groups', () => {
    const groupsUrl = `${api}/skirmishGroups`
    const group = (id: number) => <SkirmishGroup><unknown>{id, name: `group ${id}`}

    it('fetchSkirmishGroups stores the list and notifies subscribers with a copy', async () => {
      const emitted: SkirmishGroup[][] = []
      service.skirmishGroupsChanged.subscribe(list => emitted.push(list))

      const pending = service.fetchSkirmishGroups()
      const request = http.expectOne(groupsUrl)
      expect(request.request.method).toBe('GET')
      request.flush([group(1), group(2)])
      await pending

      expect(service.skirmishGroupsList.length).toBe(2)
      expect(emitted.length).toBe(1)
      expect(emitted[0]).not.toBe(service.skirmishGroupsList)
    })

    it('fetchSkirmishGroups clears the list when the response body is empty', async () => {
      service.skirmishGroupsList = [group(1)]

      const pending = service.fetchSkirmishGroups()
      http.expectOne(groupsUrl).flush(null)
      await pending

      expect(service.skirmishGroupsList).toEqual([])
    })

    it('addGroupAdvantagePoint posts the group id and then reloads the groups', async () => {
      const pending = service.addGroupAdvantagePoint(4)

      const postRequest = http.expectOne(`${api}/addGroupAdvantagePoint`)
      expect(postRequest.request.method).toBe('POST')
      expect(postRequest.request.body).toBe(4)
      postRequest.flush(null)
      await waitForNextRequest()

      http.expectOne(groupsUrl).flush([group(4)])
      await pending

      expect(service.skirmishGroupsList.length).toBe(1)
    })

    it('removeGroupAdvantagePoint posts the group id and then reloads the groups', async () => {
      const pending = service.removeGroupAdvantagePoint(4)

      const postRequest = http.expectOne(`${api}/removeGroupAdvantagePoint`)
      expect(postRequest.request.body).toBe(4)
      postRequest.flush(null)
      await waitForNextRequest()

      http.expectOne(groupsUrl).flush([group(4)])
      await pending
    })

    it('addSkirmishGroup posts the group, reloads the groups and returns the created group', async () => {
      const created = group(9)

      const pending = service.addSkirmishGroup(group(0))

      const postRequest = http.expectOne(groupsUrl)
      expect(postRequest.request.method).toBe('POST')
      postRequest.flush(created)
      await waitForNextRequest()

      http.expectOne(groupsUrl).flush([created])

      expect(await pending).toEqual(created)
      expect(service.skirmishGroupsList).toEqual([created])
    })

    it('deleteAllSkirmishGroups deletes all groups and then reloads the list', async () => {
      service.skirmishGroupsList = [group(1)]

      const pending = service.deleteAllSkirmishGroups()

      const deleteRequest = http.expectOne(groupsUrl)
      expect(deleteRequest.request.method).toBe('DELETE')
      deleteRequest.flush(null)
      await waitForNextRequest()

      http.expectOne(groupsUrl).flush([])
      await pending

      expect(service.skirmishGroupsList).toEqual([])
    })
  })
})
