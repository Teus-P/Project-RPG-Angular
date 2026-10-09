import {TestBed} from '@angular/core/testing'
import {provideHttpClient} from '@angular/common/http'
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing'
import {Subject} from 'rxjs'
import {environment} from '../../../environments/environment'
import {BaseService} from './base.service'
import {Model} from '../model/model'
import {TextResourceKeys} from '../model/types'
import {TextResourceService} from './text-resource-service/text-resource.service'

describe('BaseService', () => {
  const resourceType = <TextResourceKeys>'armorType'
  let service: BaseService
  let http: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({providers: [provideHttpClient(), provideHttpClientTesting()]})
    service = TestBed.inject(BaseService)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('requests the endpoint under the configured api url', async () => {
    const pending = service.fetchMethod('armorType', resourceType, [])

    const request = http.expectOne(`${environment.apiUrl}/armorType`)
    expect(request.request.method).toBe('GET')
    request.flush([])
    await pending
  })

  it('replaces the content of the given list with translated and sorted items', async () => {
    const translations: Record<string, string> = {B: 'Beta', A: 'Alfa'}
    spyOn(TextResourceService, 'getTranslation').and.callFake((_element, name) => ({
      name,
      nameTranslation: translations[name],
      description: `opis ${name}`
    }))
    const list = [<Model>{name: 'stale', nameTranslation: 'stale', description: ''}]

    const pending = service.fetchMethod('armorType', resourceType, list)
    http.expectOne(`${environment.apiUrl}/armorType`).flush([{name: 'B'}, {name: 'A'}])
    await pending

    expect(list.map(item => item.nameTranslation)).toEqual(['Alfa', 'Beta'])
    expect(list.map(item => item.description)).toEqual(['opis A', 'opis B'])
  })

  it('keeps the original description when the translation has none', async () => {
    spyOn(TextResourceService, 'getTranslation').and.returnValue(
      <Model><unknown>{name: 'A', nameTranslation: 'Alfa', description: null}
    )
    const list: Model[] = []

    const pending = service.fetchMethod('armorType', resourceType, list)
    http.expectOne(`${environment.apiUrl}/armorType`).flush([{name: 'A', description: 'z backendu'}])
    await pending

    expect(list[0].description).toBe('z backendu')
  })

  it('empties the list when the response body is empty', async () => {
    const list = [<Model>{name: 'stale', nameTranslation: 'stale', description: ''}]

    const pending = service.fetchMethod('armorType', resourceType, list)
    http.expectOne(`${environment.apiUrl}/armorType`).flush(null)
    await pending

    expect(list.length).toBe(0)
  })

  it('emits a copy of the list through the optional subject', async () => {
    const listChanged = new Subject<Model[]>()
    const emitted: Model[][] = []
    listChanged.subscribe(list => emitted.push(list))
    const list: Model[] = []

    const pending = service.fetchMethod('armorType', resourceType, list, listChanged)
    http.expectOne(`${environment.apiUrl}/armorType`).flush([{name: 'A'}])
    await pending

    expect(emitted.length).toBe(1)
    expect(emitted[0]).toEqual(list)
    expect(emitted[0]).not.toBe(list)
  })

  it('rejects when the request fails', async () => {
    const pending = service.fetchMethod('armorType', resourceType, [])

    http.expectOne(`${environment.apiUrl}/armorType`).flush('error', {status: 500, statusText: 'Server Error'})

    await expectAsync(pending).toBeRejected()
  })
})
