import {SpellRowsPipe, SpellGroupRow} from './spell-rows.pipe'
import {Spell} from '../../core/model/spell/spell.model'

describe('SpellRowsPipe', () => {
  const pipe = new SpellRowsPipe()

  const spell = (name: string, group: string) =>
    <Spell><unknown>{name, nameTranslation: name, spellGroup: {nameTranslation: group}}

  const describeRows = (rows: (Spell | SpellGroupRow)[]) =>
    rows.map(row => 'isGroup' in row ? `[${row.name}]` : row.nameTranslation)

  it('returns no rows for no spells', () => {
    expect(pipe.transform([])).toEqual([])
  })

  it('puts a group header before the spells of every group', () => {
    const rows = pipe.transform([spell('Fireball', 'Fire'), spell('Heal', 'Light'), spell('Flame blade', 'Fire')])

    expect(describeRows(rows)).toEqual(['[Fire]', 'Fireball', 'Flame blade', '[Light]', 'Heal'])
  })

  it('orders the groups alphabetically', () => {
    const rows = pipe.transform([spell('Heal', 'Light'), spell('Fireball', 'Fire'), spell('Shield', 'Aegis')])

    expect(describeRows(rows)).toEqual(['[Aegis]', 'Shield', '[Fire]', 'Fireball', '[Light]', 'Heal'])
  })

  it('keeps the original order of spells inside a group', () => {
    const rows = pipe.transform([spell('Zap', 'Fire'), spell('Ash', 'Fire'), spell('Mist', 'Fire')])

    expect(describeRows(rows)).toEqual(['[Fire]', 'Zap', 'Ash', 'Mist'])
  })

  it('marks group headers with isGroup and spells without it', () => {
    const rows = pipe.transform([spell('Fireball', 'Fire')])

    expect((<SpellGroupRow>rows[0]).isGroup).toBeTrue()
    expect('isGroup' in rows[1]).toBeFalse()
  })

  it('does not change the order of the array it receives', () => {
    const spells = [spell('Heal', 'Light'), spell('Fireball', 'Fire')]
    const copy = [...spells]

    pipe.transform(spells)

    expect(spells).toEqual(copy)
  })

  it('does not change the spells themselves', () => {
    const fireball = spell('Fireball', 'Fire')
    const before = JSON.stringify(fireball)

    pipe.transform([fireball])

    expect(JSON.stringify(fireball)).toBe(before)
  })
})
