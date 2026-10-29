import {buildAttackReport} from './attack-report'
import {SkirmishCharacter} from '../../core/model/skirmish/skirmish-character.model'
import {ReceivedDamage} from '../../core/model/receive-damage/receive-damage.model'

describe('buildAttackReport', () => {
  const localization = (name: string, armorPoints: number, injuries: {name: string, value: string}[] = []) => ({
    bodyLocalization: {name, nameTranslation: name.toLowerCase()},
    armorPoints,
    additionalArmorPoints: 0,
    injuries: injuries.map(injury => ({model: {name: injury.name, nameTranslation: injury.name}, value: injury.value}))
  })
  const condition = (name: string, value: number) => ({condition: {name, nameTranslation: name}, value})

  const skirmishCharacter = (name: string, options: {
    wounds?: number, isDead?: boolean, localizations?: unknown[], conditions?: unknown[]
  } = {}) => <SkirmishCharacter><unknown>{
    currentWounds: options.wounds ?? 10,
    isDead: options.isDead ?? false,
    character: {
      name,
      bodyLocalizations: options.localizations ?? [localization('HEAD', 2), localization('BODY', 1)],
      conditions: options.conditions ?? []
    }
  }

  const damage = (value: number, bodyLocalization = 'HEAD') => {
    const receivedDamage = new ReceivedDamage(1, false, true, true, 0, false)
    receivedDamage.damage = value
    receivedDamage.bodyLocalization = bodyLocalization
    return receivedDamage
  }

  const attacker = skirmishCharacter('Attacker')

  it('reports the wounds before and after the attack and the hit location', () => {
    const report = buildAttackReport(attacker, skirmishCharacter('Target', {wounds: 10}), skirmishCharacter('Target', {wounds: 6}), damage(7))

    expect(report.attackerName).toBe('Attacker')
    expect(report.targetName).toBe('Target')
    expect(report.bodyLocalization).toBe('Głowa')
    expect(report.damage).toBe(7)
    expect(report.woundsBefore).toBe(10)
    expect(report.woundsAfter).toBe(6)
  })

  it('reports a death only when the target was alive before the attack', () => {
    const alive = skirmishCharacter('Target')
    const dead = skirmishCharacter('Target', {isDead: true})

    expect(buildAttackReport(attacker, alive, dead, damage(5)).hasDied).toBeTrue()
    expect(buildAttackReport(attacker, dead, dead, damage(5)).hasDied).toBeFalse()
    expect(buildAttackReport(attacker, alive, alive, damage(5)).hasDied).toBeFalse()
  })

  it('lists only the localizations whose armor points changed', () => {
    const before = skirmishCharacter('Target', {localizations: [localization('HEAD', 3), localization('BODY', 2)]})
    const after = skirmishCharacter('Target', {localizations: [localization('HEAD', 1), localization('BODY', 2)]})

    expect(buildAttackReport(attacker, before, after, damage(5)).armorChanges)
      .toEqual([{name: 'head', before: 3, after: 1}])
  })

  it('lists new injuries and injuries whose value increased', () => {
    const before = skirmishCharacter('Target', {localizations: [
      localization('HEAD', 0, [{name: 'CUT', value: '1'}]), localization('BODY', 0)]})
    const after = skirmishCharacter('Target', {localizations: [
      localization('HEAD', 0, [{name: 'CUT', value: '2'}]), localization('BODY', 0, [{name: 'BRUISE', value: '1'}])]})

    expect(buildAttackReport(attacker, before, after, damage(5)).newInjuries)
      .toEqual(['CUT (head)', 'BRUISE (body)'])
  })

  it('lists added, increased and removed conditions', () => {
    const before = skirmishCharacter('Target', {conditions: [condition('BLEEDING', 1), condition('STUNNED', 1)]})
    const after = skirmishCharacter('Target', {conditions: [condition('BLEEDING', 3), condition('PRONE', 1)]})

    expect(buildAttackReport(attacker, before, after, damage(5)).conditionChanges).toEqual([
      {name: 'BLEEDING', before: 1, after: 3},
      {name: 'STUNNED', before: 1, after: 0},
      {name: 'PRONE', before: 0, after: 1}
    ])
  })

  it('reports no changes when the attack had no effect', () => {
    const target = skirmishCharacter('Target')
    const report = buildAttackReport(attacker, target, skirmishCharacter('Target'), damage(1))

    expect(report.armorChanges).toEqual([])
    expect(report.newInjuries).toEqual([])
    expect(report.conditionChanges).toEqual([])
    expect(report.hasDied).toBeFalse()
  })

  it('marks manually entered damage and reports what the target mitigated', () => {
    const result = {
      damage: 12, damageOverridden: true, destroyArmorValue: 0, isWeaponUndamaging: false,
      isIgnoringArmor: false, ignoredArmorPoints: 0, damagesShield: false, shieldChange: null,
      toughnessBonus: 3, armorReduction: 2, woundsLost: 7,
      missingRoll: false, breakdown: [], qualities: []
    }
    const target = skirmishCharacter('Target')
    const report = buildAttackReport(attacker, target, target, damage(12), result)

    expect(report.damageOverridden).toBeTrue()
    expect(report.mitigation).toEqual({toughnessBonus: 3, armorReduction: 2, woundsLost: 7})
  })

  it('has no mitigation or override information without a result', () => {
    const target = skirmishCharacter('Target')
    const report = buildAttackReport(attacker, target, target, damage(5))

    expect(report.damageOverridden).toBeFalse()
    expect(report.mitigation).toBeNull()
  })

  it('can build a report without an attacker', () => {
    const target = skirmishCharacter('Target')
    const report = buildAttackReport(undefined, target, target, damage(5))

    expect(report.attackerName).toBeNull()
    expect(report.targetName).toBe('Target')
  })

  it('passes on the shield that lost a point', () => {
    const result = {
      damage: 5, damageOverridden: false, destroyArmorValue: 0, isWeaponUndamaging: false, isIgnoringArmor: false,
      ignoredArmorPoints: 0, damagesShield: true, shieldChange: {nameTranslation: 'Tarcza', before: 2, after: 1},
      toughnessBonus: 3, armorReduction: 2, woundsLost: 1, missingRoll: false, breakdown: [], qualities: []
    }
    const target = skirmishCharacter('Target')
    const report = buildAttackReport(attacker, target, target, damage(5), result)

    expect(report.shieldChange).toEqual({nameTranslation: 'Tarcza', before: 2, after: 1})
  })
})
