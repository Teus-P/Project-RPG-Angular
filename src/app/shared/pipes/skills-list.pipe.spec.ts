import {SkillsListPipe} from './skills-list.pipe'
import {Character} from '../../core/model/character/character.model'
import {Skill} from '../../core/model/skill/skill.model'
import {ValueModel} from '../../core/model/value-model'

describe('SkillsListPipe', () => {
  const pipe = new SkillsListPipe()

  const skill = (name: string, isSkirmishSkill: boolean) =>
    new ValueModel<Skill>(1, new Skill(name, name, isSkirmishSkill, false), '30', '')

  const characterWith = (skills: ValueModel<Skill>[]) => Object.assign(new Character(), {skills})

  it('returns the very same skills array when the skirmish filter is off', () => {
    const character = characterWith([skill('Athletics', false), skill('Dodge', true)])

    expect(pipe.transform(character, false)).toBe(character.skills)
  })

  it('returns only skirmish skills when the skirmish filter is on', () => {
    const character = characterWith([skill('Athletics', false), skill('Dodge', true), skill('Melee', true)])

    const names = pipe.transform(character, true).map(item => item.model.name)

    expect(names).toEqual(['Dodge', 'Melee'])
  })

  it('returns an empty list for a character without skirmish skills', () => {
    const character = characterWith([skill('Athletics', false)])

    expect(pipe.transform(character, true)).toEqual([])
  })

  it('does not change the skills of the character', () => {
    const character = characterWith([skill('Athletics', false), skill('Dodge', true)])

    pipe.transform(character, true)

    expect(character.skills.length).toBe(2)
  })
})
