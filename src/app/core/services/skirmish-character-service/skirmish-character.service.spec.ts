import {TestBed} from '@angular/core/testing'
import {provideHttpClient} from '@angular/common/http'
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing'
import {environment} from '../../../../environments/environment'
import {SkirmishCharacterService} from './skirmish-character.service'
import {SkirmishCharacter} from '../../model/skirmish/skirmish-character.model'
import {TranslateService} from '../translate-service/translate.service'
import {createTranslateServiceMock} from '../../testing/list-fetcher-testing'

describe('SkirmishCharacterService', () => {
  const url = `${environment.apiUrl}/skirmishCharacter`
  const bulkUrl = `${environment.apiUrl}/skirmishCharacters`
  let service: SkirmishCharacterService
  let http: HttpTestingController
  let translateService: jasmine.SpyObj<TranslateService>

  const skirmishCharacter = (id: number, name: string) => <SkirmishCharacter><unknown>{id, character: {name}}
  const waitForNextRequest = () => new Promise(resolve => setTimeout(resolve))

  beforeEach(() => {
    localStorage.clear()
    spyOn(SkirmishCharacter, 'fromJSON').and.callFake(json => <SkirmishCharacter>json)
    translateService = createTranslateServiceMock()
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), {provide: TranslateService, useValue: translateService}]
    })
    service = TestBed.inject(SkirmishCharacterService)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  describe('fetchSkirmishCharacter', () => {
    it('requests the skirmish characters with GET', async () => {
      const pending = service.fetchSkirmishCharacter()

      const request = http.expectOne(url)
      expect(request.request.method).toBe('GET')
      request.flush([])
      await pending
    })

    it('translates the character of every skirmish character and stores the list', async () => {
      const pending = service.fetchSkirmishCharacter()
      http.expectOne(url).flush([skirmishCharacter(1, 'A'), skirmishCharacter(2, 'B')])
      await pending

      expect(service.skirmishCharactersList.length).toBe(2)
      expect(translateService.prepareCharacter).toHaveBeenCalledTimes(2)
      expect(JSON.parse(<string>localStorage.getItem('skirmishCharacters')).length).toBe(2)
    })

    it('notifies subscribers with a copy of the list', async () => {
      const emitted: SkirmishCharacter[][] = []
      service.skirmishCharactersChanged.subscribe(list => emitted.push(list))

      const pending = service.fetchSkirmishCharacter()
      http.expectOne(url).flush([skirmishCharacter(1, 'A')])
      await pending

      expect(emitted.length).toBe(1)
      expect(emitted[0]).not.toBe(service.skirmishCharactersList)
    })

    it('clears the list when the response body is empty', async () => {
      service.skirmishCharactersList = [skirmishCharacter(1, 'stale')]

      const pending = service.fetchSkirmishCharacter()
      http.expectOne(url).flush(null)
      await pending

      expect(service.skirmishCharactersList).toEqual([])
    })

    it('rejects when the request fails', async () => {
      const pending = service.fetchSkirmishCharacter()

      http.expectOne(url).flush('error', {status: 500, statusText: 'Server Error'})

      await expectAsync(pending).toBeRejected()
    })
  })

  it('updateSkirmishCharacters sends the characters with PUT and then reloads the list', async () => {
    const characters = [skirmishCharacter(1, 'A')]

    const pending = service.updateSkirmishCharacters(characters)

    const putRequest = http.expectOne(bulkUrl)
    expect(putRequest.request.method).toBe('PUT')
    expect(putRequest.request.body).toBe(characters)
    putRequest.flush(null)
    await waitForNextRequest()

    http.expectOne(url).flush(characters)
    await pending

    expect(service.skirmishCharactersList.length).toBe(1)
  })

  it('updateSkirmishCharacter sends the character with PUT and then reloads the list', async () => {
    const edited = skirmishCharacter(1, 'edited')
    service.skirmishCharactersList = [skirmishCharacter(1, 'old')]

    const pending = service.updateSkirmishCharacter(edited)

    const putRequest = http.expectOne(url)
    expect(putRequest.request.method).toBe('PUT')
    expect(putRequest.request.body).toBe(edited)
    putRequest.flush(null)
    await waitForNextRequest()

    http.expectOne(url).flush([edited])
    await pending
  })

  it('removeSkirmishCharacter deletes the character and then reloads the list', async () => {
    const pending = service.removeSkirmishCharacter(4)

    const deleteRequest = http.expectOne(`${url}/4`)
    expect(deleteRequest.request.method).toBe('DELETE')
    deleteRequest.flush(null)
    await waitForNextRequest()

    http.expectOne(url).flush([])
    await pending

    expect(service.skirmishCharactersList).toEqual([])
  })

  it('removeAllSkirmishCharacters deletes every character and then reloads the list', async () => {
    const pending = service.removeAllSkirmishCharacters()

    const deleteRequest = http.expectOne(url)
    expect(deleteRequest.request.method).toBe('DELETE')
    deleteRequest.flush(null)
    await waitForNextRequest()

    const reloadRequest = http.expectOne(url)
    expect(reloadRequest.request.method).toBe('GET')
    reloadRequest.flush([])
    await pending
  })
})
