import {TestBed} from '@angular/core/testing'
import {provideHttpClient} from '@angular/common/http'
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing'
import {environment} from '../../../../environments/environment'
import {WeaponService} from './weapon.service'
import {Weapon} from '../../model/weapon/weapon.model'
import {TranslateService} from '../translate-service/translate.service'
import {createTranslateServiceMock, fakeTranslations} from '../../testing/list-fetcher-testing'

describe('WeaponService', () => {
  const url = `${environment.apiUrl}/weapon`
  let service: WeaponService
  let http: HttpTestingController
  let translateService: jasmine.SpyObj<TranslateService>

  const weapon = (name: string, group: string, type: string) => <Weapon><unknown>{
    name,
    nameTranslation: name,
    weaponGroup: {name: group, nameTranslation: group},
    weaponType: {nameTranslation: type}
  }
  const waitForNextRequest = () => new Promise(resolve => setTimeout(resolve))

  beforeEach(() => {
    localStorage.clear()
    fakeTranslations()
    translateService = createTranslateServiceMock()
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), {provide: TranslateService, useValue: translateService}]
    })
    service = TestBed.inject(WeaponService)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  describe('fetchWeapons', () => {
    it('requests the weapons with GET', async () => {
      const pending = service.fetchWeapons()

      const request = http.expectOne(url)
      expect(request.request.method).toBe('GET')
      request.flush([])
      await pending
    })

    it('translates the weapons and groups them with sorted members and the group type', async () => {
      const pending = service.fetchWeapons()
      http.expectOne(url).flush([
        weapon('Spear', 'Polearm', 'Melee'),
        weapon('Halberd', 'Polearm', 'Melee'),
        weapon('Bow', 'Bows', 'Ranged')
      ])
      await pending

      expect(translateService.prepareWeaponTranslation).toHaveBeenCalledTimes(3)
      expect(service.weaponsList.length).toBe(3)
      expect(service.weaponGroups.map(group => group.name)).toEqual(['Bows', 'Polearm'])
      expect(service.weaponGroups[1].type).toBe('Melee')
      expect(service.weaponGroups[1].weapons.map(item => item.nameTranslation)).toEqual(['Halberd', 'Spear'])
    })

    it('saves weapons and groups in local storage and notifies subscribers', async () => {
      const emitted: unknown[][] = []
      service.weaponGroupsChanged.subscribe(list => emitted.push(list))

      const pending = service.fetchWeapons()
      http.expectOne(url).flush([weapon('Bow', 'Bows', 'Ranged')])
      await pending

      expect(JSON.parse(<string>localStorage.getItem('weapons')).length).toBe(1)
      expect(JSON.parse(<string>localStorage.getItem('weaponGroups')).length).toBe(1)
      expect(emitted.length).toBe(1)
      expect(emitted[0].length).toBe(1)
    })

    it('clears weapons and groups when the response body is empty', async () => {
      service.weaponsList = [weapon('stale', 'Bows', 'Ranged')]

      const pending = service.fetchWeapons()
      http.expectOne(url).flush(null)
      await pending

      expect(service.weaponsList).toEqual([])
      expect(service.weaponGroups).toEqual([])
    })

    it('rejects when the request fails', async () => {
      const pending = service.fetchWeapons()

      http.expectOne(url).flush('error', {status: 500, statusText: 'Server Error'})

      await expectAsync(pending).toBeRejected()
    })
  })

  describe('putWeapon', () => {
    it('sends the weapon with PUT', async () => {
      const edited = weapon('Bow', 'Bows', 'Ranged')

      const pending = service.putWeapon(edited)

      const request = http.expectOne(url)
      expect(request.request.method).toBe('PUT')
      expect(request.request.body).toBe(edited)
      request.flush(null)
      await pending
    })
  })

  describe('removeWeapon', () => {
    it('deletes the weapon and then reloads the weapons', async () => {
      const pending = service.removeWeapon(3)

      const deleteRequest = http.expectOne(`${url}/3`)
      expect(deleteRequest.request.method).toBe('DELETE')
      deleteRequest.flush(null)
      await waitForNextRequest()

      http.expectOne(url).flush([])
      await pending

      expect(service.weaponsList).toEqual([])
    })
  })

  const lookups: { endpoint: string, fetch: (service: WeaponService) => Promise<unknown> }[] = [
    {endpoint: 'weaponType', fetch: s => s.fetchWeaponTypes()},
    {endpoint: 'weaponGroup', fetch: s => s.fetchWeaponGroups()},
    {endpoint: 'weaponReach', fetch: s => s.fetchWeaponReaches()},
    {endpoint: 'weaponQuality', fetch: s => s.fetchWeaponQualities()}
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
