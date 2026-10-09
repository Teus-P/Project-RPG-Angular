import {TestBed} from '@angular/core/testing'
import {provideHttpClient} from '@angular/common/http'
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing'
import {environment} from '../../../../environments/environment'
import {ArmorService} from './armor.service'
import {Armor} from '../../model/armor/armor.model'
import {TranslateService} from '../translate-service/translate.service'
import {createTranslateServiceMock, fakeTranslations} from '../../testing/list-fetcher-testing'

describe('ArmorService', () => {
  const url = `${environment.apiUrl}/armor`
  let service: ArmorService
  let http: HttpTestingController
  let translateService: jasmine.SpyObj<TranslateService>

  const armor = (name: string, category: string) =>
    <Armor><unknown>{name, nameTranslation: name, armorCategory: {nameTranslation: category}}
  const waitForNextRequest = () => new Promise(resolve => setTimeout(resolve))

  beforeEach(() => {
    localStorage.clear()
    fakeTranslations()
    translateService = createTranslateServiceMock()
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), {provide: TranslateService, useValue: translateService}]
    })
    service = TestBed.inject(ArmorService)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  describe('fetchArmors', () => {
    it('requests the armors with GET', async () => {
      const pending = service.fetchArmors()

      const request = http.expectOne(url)
      expect(request.request.method).toBe('GET')
      request.flush([])
      await pending
    })

    it('resolves with the data returned by the backend', async () => {
      const data = [armor('Helmet', 'Plate')]

      const pending = service.fetchArmors()
      http.expectOne(url).flush(data)

      expect(await pending).toEqual(data)
    })

    it('translates the armors and groups them by category with sorted members', async () => {
      const pending = service.fetchArmors()
      http.expectOne(url).flush([armor('Gauntlets', 'Plate'), armor('Boots', 'Plate'), armor('Cap', 'Leather')])
      await pending

      expect(translateService.prepareArmorsList).toHaveBeenCalledTimes(1)
      expect(service.armorsList.length).toBe(3)
      expect(service.armorsGroups.map(group => group.name)).toEqual(['Leather', 'Plate'])
      expect(service.armorsGroups[1].armors.map(item => item.nameTranslation)).toEqual(['Boots', 'Gauntlets'])
    })

    it('notifies subscribers about the armors and their groups', async () => {
      const armors: Armor[][] = []
      const groups: unknown[][] = []
      service.armorsListChanged.subscribe(list => armors.push(list))
      service.armorsGroupsChanged.subscribe(list => groups.push(list))

      const pending = service.fetchArmors()
      http.expectOne(url).flush([armor('Cap', 'Leather')])
      await pending

      expect(armors.length).toBe(1)
      expect(armors[0].length).toBe(1)
      expect(groups.length).toBe(1)
      expect(groups[0].length).toBe(1)
    })

    it('empties the armor list when the response body is empty', async () => {
      service.armorsList = [armor('stale', 'Plate')]

      const pending = service.fetchArmors()
      http.expectOne(url).flush(null)
      await pending

      expect(service.armorsList).toEqual([])
    })

    it('rejects when the request fails', async () => {
      const pending = service.fetchArmors()

      http.expectOne(url).flush('error', {status: 500, statusText: 'Server Error'})

      await expectAsync(pending).toBeRejected()
    })
  })

  describe('storeArmor', () => {
    it('sends the armor with PUT and then reloads the armors', async () => {
      const edited = armor('Cap', 'Leather')

      const pending = service.storeArmor(edited)

      const putRequest = http.expectOne(url)
      expect(putRequest.request.method).toBe('PUT')
      expect(putRequest.request.body).toBe(edited)
      putRequest.flush(null)
      await waitForNextRequest()

      const reloadRequest = http.expectOne(url)
      expect(reloadRequest.request.method).toBe('GET')
      reloadRequest.flush([edited])
      await pending

      expect(service.armorsList).toEqual([edited])
    })
  })

  describe('removeArmor', () => {
    it('deletes the armor and then reloads the armors', async () => {
      const pending = service.removeArmor(5)

      const deleteRequest = http.expectOne(`${url}/5`)
      expect(deleteRequest.request.method).toBe('DELETE')
      deleteRequest.flush(null)
      await waitForNextRequest()

      http.expectOne(url).flush([])
      await pending

      expect(service.armorsList).toEqual([])
    })
  })

  const lookups: { endpoint: string, fetch: (service: ArmorService) => Promise<unknown> }[] = [
    {endpoint: 'armorCategory', fetch: s => s.fetchArmorCategories()},
    {endpoint: 'armorPenalty', fetch: s => s.fetchArmorPenalties()},
    {endpoint: 'armorQuality', fetch: s => s.fetchArmorQualities()},
    {endpoint: 'armorType', fetch: s => s.fetchArmorTypes()}
  ]

  lookups.forEach(lookup => {
    it(`requests /${lookup.endpoint} from the configured api url`, async () => {
      const pending = lookup.fetch(service)

      const request = http.expectOne(`${environment.apiUrl}/${lookup.endpoint}`)
      expect(request.request.method).toBe('GET')
      request.flush([])
      await pending
    })
  })
})
