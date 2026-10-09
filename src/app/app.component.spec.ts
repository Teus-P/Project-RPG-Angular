import {NO_ERRORS_SCHEMA, Type} from '@angular/core'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {MatDialog} from '@angular/material/dialog'
import {AppComponent} from './app.component'
import {ArmorService} from './core/services/armor-service/armor.service'
import {WeaponService} from './core/services/weapon-service/weapon.service'
import {SkillService} from './core/services/skill-service/skill.service'
import {TalentService} from './core/services/talent-service/talent.service'
import {TraitService} from './core/services/trait-service/trait.service'
import {BodyLocalizationService} from './core/services/body-localization-service/body-localization.service'
import {CharacterService} from './core/services/character-service/character.service'
import {InjuryService} from './core/services/injuries-service/injury.service'
import {ConditionService} from './core/services/condition-service/condition.service'
import {SpellService} from './core/services/spell-service/spell.service'
import {SkirmishCharacterService} from './core/services/skirmish-character-service/skirmish-character.service'
import {AvailabilityService} from './core/services/availability-service/availability.service'
import {SkirmishService} from './core/services/skirmish-service/skirmish.service'

interface Deferred {
  promise: Promise<void>
  resolve: () => void
  reject: (reason: unknown) => void
}

describe('AppComponent', () => {
  const fetchers: [Type<unknown>, string[]][] = [
    [ArmorService, ['fetchArmors', 'fetchArmorCategories', 'fetchArmorPenalties', 'fetchArmorQualities', 'fetchArmorTypes']],
    [BodyLocalizationService, ['fetchBodyLocalizations']],
    [InjuryService, ['fetchInjuries']],
    [ConditionService, ['fetchConditions']],
    [WeaponService, ['fetchWeapons', 'fetchWeaponTypes', 'fetchWeaponGroups', 'fetchWeaponReaches', 'fetchWeaponQualities']],
    [SkillService, ['fetchSkills']],
    [TalentService, ['fetchTalents']],
    [TraitService, ['fetchTraits']],
    [SpellService, ['fetchSpells']],
    [CharacterService, ['fetchCharacters']],
    [SkirmishCharacterService, ['fetchSkirmishCharacter']],
    [AvailabilityService, ['fetchAvailabilities']],
    [SkirmishService, ['fetchSkirmishGroups']]
  ]
  const totalFetches = fetchers.reduce((sum, [, methods]) => sum + methods.length, 0)

  let spies: jasmine.Spy[]
  let deferreds: Deferred[]
  let fixture: ComponentFixture<AppComponent>
  let component: AppComponent

  const createDeferred = (): Deferred => {
    let resolve!: () => void
    let reject!: (reason: unknown) => void
    const promise = new Promise<void>((res, rej) => {
      resolve = res
      reject = rej
    })
    return {promise, resolve, reject}
  }

  beforeEach(() => {
    spies = []
    deferreds = []
    const providers = fetchers.map(([token, methods]) => {
      const mock = jasmine.createSpyObj(token.name, methods)
      methods.forEach(method => {
        const spy = <jasmine.Spy>mock[method]
        spy.and.callFake(() => {
          const deferred = createDeferred()
          deferreds.push(deferred)
          return deferred.promise
        })
        spies.push(spy)
      })
      return {provide: token, useValue: mock}
    })

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      providers: [...providers, {provide: MatDialog, useValue: {}}],
      schemas: [NO_ERRORS_SCHEMA]
    })
    fixture = TestBed.createComponent(AppComponent)
    component = fixture.componentInstance
  })

  it('requests every data set', () => {
    expect(totalFetches).toBe(21)
  })

  it('starts all requests at once instead of waiting for each one to finish', () => {
    fixture.detectChanges()

    spies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1))
    expect(deferreds.length).toBe(totalFetches)
    expect(component.dataLoaded).toBeFalse()
  })

  it('shows the loader until the slowest request finishes', async () => {
    fixture.detectChanges()

    deferreds.slice(1).forEach(deferred => deferred.resolve())
    await Promise.resolve()
    expect(component.dataLoaded).toBeFalse()

    deferreds[0].resolve()
    await fixture.whenStable()
    expect(component.dataLoaded).toBeTrue()
  })

  it('does not report the data as loaded when one request fails', async () => {
    const pending = component['fetchData']()

    deferreds.slice(1).forEach(deferred => deferred.resolve())
    deferreds[0].reject(new Error('backend unavailable'))

    await expectAsync(pending).toBeRejected()
    expect(component.dataLoaded).toBeFalse()
    spies.forEach(spy => expect(spy).toHaveBeenCalledTimes(1))
  })
})
