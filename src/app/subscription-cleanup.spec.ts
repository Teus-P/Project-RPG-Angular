import {NO_ERRORS_SCHEMA, Provider, Type} from '@angular/core'
import {TestBed} from '@angular/core/testing'
import {ActivatedRoute, Router} from '@angular/router'
import {MatDialog} from '@angular/material/dialog'
import {MatBottomSheet} from '@angular/material/bottom-sheet'
import {MatMenuModule} from '@angular/material/menu'
import {Observable, of, Subject} from 'rxjs'
import {WeaponService} from './core/services/weapon-service/weapon.service'
import {ArmorService} from './core/services/armor-service/armor.service'
import {CharacterService} from './core/services/character-service/character.service'
import {SkirmishCharacterService} from './core/services/skirmish-character-service/skirmish-character.service'
import {SkirmishService} from './core/services/skirmish-service/skirmish.service'
import {RoundService} from './core/services/round-service/round.service'
import {WeaponTypeListComponent} from './features/list-of-elements/weapon-list/weapon-type-list/weapon-type-list.component'
import {ArmorGroupItemList} from './features/list-of-elements/armor-list/armor-group-item-list/armor-group-item-list.component'
import {CharacterListComponent} from './features/character/character-list/character-list.component'
import {SkirmishCharactersListComponent} from './features/skirmish/skirmish-characters-list/skirmish-characters-list.component'
import {SkirmishCharacterDetailsComponent} from './features/skirmish/skirmish-character-details/skirmish-character-details.component'
import {SkirmishBattlefieldComponent} from './features/skirmish/skirmish-battlefield/skirmish-battlefield.component'
import {DetailsBodyLocalizationsComponent} from './shared/components/details-components/details-body-localizations/details-body-localizations.component'

interface SubscriptionCase {
  name: string
  component: Type<unknown>
  standalone: boolean
  providers: (subjects: Subject<unknown>[]) => Provider[]
  subjectCount: number
  configure?: (instance: never) => void
}

describe('Components subscribing to service subjects', () => {
  const skirmishCharacterDetails = {sequenceNumber: 1, id: 1, character: {name: 'A'}}

  const cases: SubscriptionCase[] = [
    {
      name: 'WeaponTypeListComponent',
      component: WeaponTypeListComponent,
      standalone: false,
      subjectCount: 1,
      providers: ([weaponGroupsChanged]) => [
        {provide: WeaponService, useValue: {weaponGroupsChanged, getWeaponGroups: () => []}},
        {provide: MatDialog, useValue: {}}
      ]
    },
    {
      name: 'ArmorGroupItemList',
      component: ArmorGroupItemList,
      standalone: false,
      subjectCount: 1,
      providers: ([armorsListChanged]) => [
        {provide: ArmorService, useValue: {armorsListChanged, armorsList: []}},
        {provide: MatBottomSheet, useValue: {}},
        {provide: MatDialog, useValue: {}}
      ]
    },
    {
      name: 'CharacterListComponent',
      component: CharacterListComponent,
      standalone: false,
      subjectCount: 1,
      providers: ([charactersChanged]) => [
        {provide: CharacterService, useValue: {charactersChanged, getCharacterGroupsTypes: () => []}},
        {provide: SkirmishCharacterService, useValue: {}},
        {provide: SkirmishService, useValue: {}},
        {provide: Router, useValue: {}},
        {provide: ActivatedRoute, useValue: {}},
        {provide: MatDialog, useValue: {}}
      ]
    },
    {
      name: 'SkirmishCharactersListComponent',
      component: SkirmishCharactersListComponent,
      standalone: false,
      subjectCount: 2,
      providers: ([skirmishCharactersChanged, skirmishGroupsChanged]) => [
        {provide: SkirmishCharacterService, useValue: {skirmishCharactersChanged, getSkirmishCharacters: () => []}},
        {provide: SkirmishService, useValue: {skirmishGroupsChanged, skirmishGroupsList: []}},
        {provide: RoundService, useValue: {roundNumber: 1}},
        {provide: Router, useValue: {}},
        {provide: MatDialog, useValue: {}}
      ]
    },
    {
      name: 'SkirmishCharacterDetailsComponent',
      component: SkirmishCharacterDetailsComponent,
      standalone: false,
      subjectCount: 2,
      providers: ([skirmishCharactersChanged, charactersChanged]) => [
        {
          provide: SkirmishCharacterService,
          useValue: {skirmishCharactersChanged, getSkirmishCharacter: () => skirmishCharacterDetails}
        },
        {provide: CharacterService, useValue: {charactersChanged}},
        {provide: ActivatedRoute, useValue: {params: of({id: '1'})}},
        {provide: Router, useValue: {}}
      ]
    },
    {
      name: 'SkirmishBattlefieldComponent',
      component: SkirmishBattlefieldComponent,
      standalone: true,
      subjectCount: 1,
      providers: ([skirmishCharactersChanged]) => [
        {provide: SkirmishCharacterService, useValue: {skirmishCharactersChanged, getSkirmishCharacters: () => []}},
        {provide: SkirmishService, useValue: {}},
        {provide: MatDialog, useValue: {}}
      ]
    },
    {
      name: 'DetailsBodyLocalizationsComponent',
      component: DetailsBodyLocalizationsComponent,
      standalone: false,
      subjectCount: 1,
      providers: ([charactersChanged]) => [
        {provide: CharacterService, useValue: {charactersChanged}},
        {provide: SkirmishCharacterService, useValue: {}},
        {provide: MatBottomSheet, useValue: {}}
      ],
      configure: instance => Object.assign(instance, {character: {id: 1, bodyLocalizations: []}, isSkirmishMode: false})
    }
  ]

  const isObserved = (subject: Observable<unknown>) => (<Subject<unknown>>subject).observed

  beforeEach(() => localStorage.clear())

  cases.forEach(testCase => {
    describe(testCase.name, () => {
      let subjects: Subject<unknown>[]

      const configure = () => {
        subjects = Array.from({length: testCase.subjectCount}, () => new Subject<unknown>())
        TestBed.configureTestingModule({
          declarations: testCase.standalone ? [] : [testCase.component],
          imports: testCase.standalone ? [testCase.component] : [MatMenuModule],
          providers: testCase.providers(subjects),
          schemas: [NO_ERRORS_SCHEMA]
        })
      }

      const createComponent = () => {
        const fixture = TestBed.createComponent(testCase.component)
        testCase.configure?.(<never>fixture.componentInstance)
        fixture.detectChanges()
        return fixture
      }

      beforeEach(configure)

      it('subscribes to the service subjects when it is created', () => {
        createComponent()

        subjects.forEach(subject => expect(isObserved(subject)).toBeTrue())
      })

      it('releases every subscription when it is destroyed', () => {
        const fixture = createComponent()

        fixture.destroy()

        subjects.forEach(subject => expect(isObserved(subject)).toBeFalse())
      })

      it('leaves no subscribers behind after several instances were created and destroyed', () => {
        const instances = [createComponent(), createComponent(), createComponent()]

        instances.forEach(instance => instance.destroy())

        subjects.forEach(subject => expect(isObserved(subject)).toBeFalse())
      })
    })
  })
})
