import {TestBed} from '@angular/core/testing'
import {provideHttpClient} from '@angular/common/http'
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing'
import {MatDialog} from '@angular/material/dialog'
import {NgbModal} from '@ng-bootstrap/ng-bootstrap'
import {of} from 'rxjs'
import {environment} from '../../../../environments/environment'
import {RoundService} from './round.service'
import {EndTurnCheck} from '../../model/end-turn-check/end-turn-check.model'
import {TranslateService} from '../translate-service/translate.service'
import {createTranslateServiceMock} from '../../testing/list-fetcher-testing'

describe('RoundService', () => {
  const endTurnCheckUrl = `${environment.apiUrl}/endTurnCheck`
  const endTurnTestsCheckUrl = `${environment.apiUrl}/endTurnTestsCheck`
  let service: RoundService
  let http: HttpTestingController
  let dialog: { open: jasmine.Spy }
  let translateService: jasmine.SpyObj<TranslateService>

  const waitForNextRequest = () => new Promise(resolve => setTimeout(resolve))

  beforeEach(() => {
    localStorage.clear()
    dialog = {open: jasmine.createSpy('open').and.returnValue({afterClosed: () => of(undefined)})}
    translateService = createTranslateServiceMock()
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: MatDialog, useValue: dialog},
        {provide: NgbModal, useValue: {}},
        {provide: TranslateService, useValue: translateService}
      ]
    })
    service = TestBed.inject(RoundService)
    http = TestBed.inject(HttpTestingController)
  })

  afterEach(() => http.verify())

  it('starts with round number 1 saved in local storage', () => {
    expect(service.roundNumber).toBe(1)
    expect(localStorage.getItem('roundNumber')).toBe('1')
  })

  describe('nextRound', () => {
    it('increases the round number, saves it and posts the cleared end-of-turn check', async () => {
      const pending = service.nextRound()

      const request = http.expectOne(endTurnCheckUrl)
      expect(request.request.method).toBe('POST')
      expect(request.request.body.tests).toEqual([])
      request.flush({roundNumber: 2, tests: []})
      await pending

      expect(service.roundNumber).toBe(2)
      expect(localStorage.getItem('roundNumber')).toBe('2')
    })

    it('does not open the roll dialog when there is nothing to test', async () => {
      const pending = service.nextRound()
      http.expectOne(endTurnCheckUrl).flush({roundNumber: 2, tests: []})
      await pending

      expect(dialog.open).not.toHaveBeenCalled()
    })

    it('opens the roll dialog and then posts the tests check when conditions have to be tested', async () => {
      const pending = service.nextRound()
      http.expectOne(endTurnCheckUrl).flush({
        roundNumber: 2,
        tests: [{skirmishCharacter: {id: 1}, condition: {name: 'ABLAZE'}}]
      })
      await waitForNextRequest()

      expect(translateService.prepareCondition).toHaveBeenCalledTimes(1)
      expect(dialog.open).toHaveBeenCalledTimes(1)

      const testsRequest = http.expectOne(endTurnTestsCheckUrl)
      expect(testsRequest.request.method).toBe('POST')
      testsRequest.flush({roundNumber: 2, tests: []})
      await pending
    })

    it('rejects when the request fails', async () => {
      const pending = service.nextRound()

      http.expectOne(endTurnCheckUrl).flush('error', {status: 500, statusText: 'Server Error'})

      await expectAsync(pending).toBeRejected()
    })
  })

  it('postEndTurnTestsCheck posts the check to the tests endpoint', async () => {
    const check = new EndTurnCheck(3, [])

    const pending = service.postEndTurnTestsCheck(check)

    const request = http.expectOne(endTurnTestsCheckUrl)
    expect(request.request.method).toBe('POST')
    expect(request.request.body).toBe(check)
    request.flush(check)

    expect(await pending).toEqual(check)
  })

  it('clearData resets the round number to 1', async () => {
    const pending = service.nextRound()
    http.expectOne(endTurnCheckUrl).flush({roundNumber: 2, tests: []})
    await pending

    service.clearData()

    expect(service.roundNumber).toBe(1)
    expect(localStorage.getItem('roundNumber')).toBe('1')
  })
})
