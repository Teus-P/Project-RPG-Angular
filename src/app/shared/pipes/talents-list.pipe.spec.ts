import {TalentsListPipe} from './talents-list.pipe'
import {Character} from '../../core/model/character/character.model'
import {Talent} from '../../core/model/talent/talent.model'
import {ValueModel} from '../../core/model/value-model'

describe('TalentsListPipe', () => {
  const pipe = new TalentsListPipe()

  const talent = (name: string, isSkirmishTalent: boolean) => {
    const model = Object.assign(new Talent(), {name, nameTranslation: name, isSkirmishTalent})
    return new ValueModel<Talent>(1, model, '1', '')
  }

  const characterWith = (talents: ValueModel<Talent>[]) => Object.assign(new Character(), {talents})

  it('returns the very same talents array when the skirmish filter is off', () => {
    const character = characterWith([talent('Ambidextrous', false), talent('Strike Mighty Blow', true)])

    expect(pipe.transform(character, false)).toBe(character.talents)
  })

  it('returns only skirmish talents when the skirmish filter is on', () => {
    const character = characterWith([talent('Ambidextrous', false), talent('Strike Mighty Blow', true)])

    const names = pipe.transform(character, true).map(item => item.model.name)

    expect(names).toEqual(['Strike Mighty Blow'])
  })

  it('returns an empty list for a character without skirmish talents', () => {
    const character = characterWith([talent('Ambidextrous', false)])

    expect(pipe.transform(character, true)).toEqual([])
  })
})
