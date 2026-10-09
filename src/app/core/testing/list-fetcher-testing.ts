import {Type} from '@angular/core'
import {TestBed} from '@angular/core/testing'
import {provideHttpClient} from '@angular/common/http'
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing'
import {Observable} from 'rxjs'
import {environment} from '../../../environments/environment'
import {TranslateService} from '../services/translate-service/translate.service'
import {TextResourceService} from '../services/text-resource-service/text-resource.service'

export interface ListFetcherCase<S> {
  serviceName: string
  service: Type<S>
  endpoint: string
  sample: object[]
  expectedLength: number
  emptiesListOnNull: boolean
  fetch: (service: S) => Promise<unknown>
  list: (service: S) => unknown[]
  changed: (service: S) => Observable<unknown[]>
}

export function createTranslateServiceMock() {
  return jasmine.createSpyObj('TranslateService', [
    'prepareCharacter',
    'prepareTalentList',
    'prepareTrait',
    'prepareSpellList',
    'prepareConditionList',
    'prepareCondition',
    'prepareArmorsList',
    'prepareWeaponTranslation'
  ])
}

export function fakeTranslations() {
  spyOn(TextResourceService, 'getTranslation').and.callFake((_element, name) => ({
    name,
    nameTranslation: `T-${name}`,
    description: ''
  }))
}

export function describeListFetcher<S>(testCase: ListFetcherCase<S>) {
  describe(`${testCase.serviceName} fetching`, () => {
    const url = `${environment.apiUrl}/${testCase.endpoint}`
    let service: S
    let http: HttpTestingController

    beforeEach(() => {
      localStorage.clear()
      fakeTranslations()
      TestBed.configureTestingModule({
        providers: [
          provideHttpClient(),
          provideHttpClientTesting(),
          {provide: TranslateService, useValue: createTranslateServiceMock()}
        ]
      })
      service = TestBed.inject(testCase.service)
      http = TestBed.inject(HttpTestingController)
    })

    afterEach(() => http.verify())

    it(`requests /${testCase.endpoint} from the configured api url`, async () => {
      const pending = testCase.fetch(service)

      const request = http.expectOne(url)
      expect(request.request.method).toBe('GET')
      request.flush(testCase.sample)
      await pending
    })

    it('stores the response and notifies subscribers with a copy of the list', async () => {
      const emitted: unknown[][] = []
      testCase.changed(service).subscribe(list => emitted.push(list))

      const pending = testCase.fetch(service)
      http.expectOne(url).flush(testCase.sample)
      await pending

      expect(testCase.list(service).length).toBe(testCase.expectedLength)
      expect(emitted.length).toBe(1)
      expect(emitted[0]).not.toBe(testCase.list(service))
      expect(emitted[0].length).toBe(testCase.expectedLength)
    })

    it('handles an empty response body', async () => {
      let pending = testCase.fetch(service)
      http.expectOne(url).flush(testCase.sample)
      await pending

      pending = testCase.fetch(service)
      http.expectOne(url).flush(null)
      await pending

      expect(testCase.list(service).length).toBe(testCase.emptiesListOnNull ? 0 : testCase.expectedLength)
    })

    it('rejects when the request fails', async () => {
      const pending = testCase.fetch(service)

      http.expectOne(url).flush('error', {status: 500, statusText: 'Server Error'})

      await expectAsync(pending).toBeRejected()
    })
  })
}
