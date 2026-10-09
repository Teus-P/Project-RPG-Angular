import {NO_ERRORS_SCHEMA} from '@angular/core'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {By} from '@angular/platform-browser'
import {Router} from '@angular/router'
import {MatBottomSheet} from '@angular/material/bottom-sheet'
import {MatDialog} from '@angular/material/dialog'
import {DetailsCharacterComponent} from './details-character.component'
import {SkillsListPipe} from '../../../pipes/skills-list.pipe'
import {TalentsListPipe} from '../../../pipes/talents-list.pipe'
import {SpellRowsPipe} from '../../../pipes/spell-rows.pipe'
import {CharacterService} from '../../../../core/services/character-service/character.service'
import {TextResourceService} from '../../../../core/services/text-resource-service/text-resource.service'
import {Character} from '../../../../core/model/character/character.model'
import {Skill} from '../../../../core/model/skill/skill.model'
import {Talent} from '../../../../core/model/talent/talent.model'
import {ValueModel} from '../../../../core/model/value-model'

describe('DetailsCharacterComponent tables', () => {
  let fixture: ComponentFixture<DetailsCharacterComponent>

  const skill = (name: string, isSkirmishSkill: boolean) =>
    new ValueModel<Skill>(1, new Skill(name, name, isSkirmishSkill, false), '30', '')

  const talent = (name: string, isSkirmishTalent: boolean) =>
    new ValueModel<Talent>(1, Object.assign(new Talent(), {name, nameTranslation: name, isSkirmishTalent}), '1', '')

  const tableDataSource = (sectionLabel: string): unknown[] => {
    const section = fixture.debugElement
      .queryAll(By.css('.column'))
      .find(column => column.query(By.css('h4')).nativeElement.textContent.includes(sectionLabel))
    return section!.query(By.css('table')).nativeElement.dataSource
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetailsCharacterComponent],
      imports: [SkillsListPipe, TalentsListPipe, SpellRowsPipe],
      providers: [
        {provide: CharacterService, useValue: {}},
        {provide: Router, useValue: {}},
        {provide: MatBottomSheet, useValue: {}},
        {provide: MatDialog, useValue: {}}
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    fixture = TestBed.createComponent(DetailsCharacterComponent)
    fixture.componentInstance.character = Object.assign(new Character(), {
      skills: [skill('Athletics', false), skill('Dodge', true)],
      talents: [talent('Ambidextrous', false), talent('Strike Mighty Blow', true)],
      traits: [],
      spells: [],
      notes: [],
      weapons: [],
      armors: [],
      conditions: []
    })
    fixture.componentInstance.isSkirmishMode = true
    fixture.detectChanges()
  })

  it('shows only skirmish skills and talents in skirmish mode', () => {
    expect(tableDataSource(TextResourceService.getText().skillsLabel).length).toBe(1)
    expect(tableDataSource(TextResourceService.getText().talentsLabel).length).toBe(1)
  })

  it('hands the skills table the same array on every change detection cycle', () => {
    const first = tableDataSource(TextResourceService.getText().skillsLabel)

    fixture.detectChanges()
    fixture.detectChanges()

    expect(tableDataSource(TextResourceService.getText().skillsLabel)).toBe(first)
  })

  it('hands the talents table the same array on every change detection cycle', () => {
    const first = tableDataSource(TextResourceService.getText().talentsLabel)

    fixture.detectChanges()
    fixture.detectChanges()

    expect(tableDataSource(TextResourceService.getText().talentsLabel)).toBe(first)
  })

  it('shows all skills again after the skirmish checkbox is cleared', () => {
    fixture.componentInstance.skillsCheckboxUpdate(false)
    fixture.detectChanges()

    expect(tableDataSource(TextResourceService.getText().skillsLabel).length).toBe(2)
  })
})
