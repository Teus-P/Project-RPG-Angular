import {TestBed} from '@angular/core/testing'
import {provideHttpClient} from '@angular/common/http'
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing'
import {environment} from '../../../../environments/environment'
import {CharacterService} from './character.service'
import {Character} from '../../model/character/character.model'
import {TranslateService} from '../translate-service/translate.service'
import {createTranslateServiceMock} from '../../testing/list-fetcher-testing'

describe('CharacterService', () => {
  const url = `${environment.apiUrl}/character`
  let service: CharacterService
  let http: HttpTestingController
  let translateService: jasmine.SpyObj<TranslateService>

  const character = (id: number, name: string) => <Character><unknown>{id, name}
  const waitForNextRequest = () => new Promise(resolve => setTimeout(resolve))

  beforeEach(() => {
    localStorage.clear()
    spyOn(Character, 'fromJSON').and.callFake(json => <Character>json)
    translateService = createTranslateServiceMock()
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), {provide: TranslateService, useValue: translateService}]
    })
    service = TestBed.inject(CharacterService)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  describe('fetchCharacters', () => {
    it('requests the characters with GET', async () => {
      const pending = service.fetchCharacters()

      const request = http.expectOne(url)
      expect(request.request.method).toBe('GET')
      request.flush([])
      await pending
    })

    it('translates every character and stores the list in memory and in local storage', async () => {
      const pending = service.fetchCharacters()
      http.expectOne(url).flush([{id: 1, name: 'A'}, {id: 2, name: 'B'}])
      await pending

      expect(service.charactersList.map(item => item.name)).toEqual(['A', 'B'])
      expect(translateService.prepareCharacter).toHaveBeenCalledTimes(2)
      expect(JSON.parse(<string>localStorage.getItem('characters')).length).toBe(2)
    })

    it('notifies subscribers with a copy of the list', async () => {
      const emitted: Character[][] = []
      service.charactersChanged.subscribe(list => emitted.push(list))

      const pending = service.fetchCharacters()
      http.expectOne(url).flush([{id: 1, name: 'A'}])
      await pending

      expect(emitted.length).toBe(1)
      expect(emitted[0]).not.toBe(service.charactersList)
      expect(emitted[0].length).toBe(1)
    })

    it('clears the list when the response body is empty', async () => {
      service.charactersList = [character(1, 'stale')]

      const pending = service.fetchCharacters()
      http.expectOne(url).flush(null)
      await pending

      expect(service.charactersList).toEqual([])
      expect(localStorage.getItem('characters')).toBe('[]')
    })

    it('rejects when the request fails', async () => {
      const pending = service.fetchCharacters()

      http.expectOne(url).flush('error', {status: 500, statusText: 'Server Error'})

      await expectAsync(pending).toBeRejected()
    })
  })

  describe('storeCharacter', () => {
    it('sends the character with PUT', async () => {
      const edited = character(1, 'edited')

      const pending = service.storeCharacter(edited)

      const request = http.expectOne(url)
      expect(request.request.method).toBe('PUT')
      expect(request.request.body).toBe(edited)
      request.flush(null)
      await pending
    })

    it('replaces an existing character with the one returned by the backend', async () => {
      service.charactersList = [character(1, 'old'), character(2, 'other')]

      const pending = service.storeCharacter(character(1, 'edited'))
      http.expectOne(url).flush({id: 1, name: 'saved'})
      await pending

      expect(service.charactersList.map(item => item.name)).toEqual(['saved', 'other'])
      expect(translateService.prepareCharacter).toHaveBeenCalledTimes(1)
    })

    it('appends a character that is not on the list yet', async () => {
      service.charactersList = [character(1, 'old')]

      const pending = service.storeCharacter(character(3, 'new'))
      http.expectOne(url).flush({id: 3, name: 'created'})
      await pending

      expect(service.charactersList.map(item => item.name)).toEqual(['old', 'created'])
    })
  })

  describe('removeCharacter', () => {
    it('deletes the character and then reloads the list', async () => {
      const pending = service.removeCharacter(7)

      const deleteRequest = http.expectOne(`${url}/7`)
      expect(deleteRequest.request.method).toBe('DELETE')
      deleteRequest.flush(null)
      await waitForNextRequest()

      const reloadRequest = http.expectOne(url)
      expect(reloadRequest.request.method).toBe('GET')
      reloadRequest.flush([{id: 1, name: 'left'}])
      await pending

      expect(service.charactersList.map(item => item.name)).toEqual(['left'])
    })
  })
})
