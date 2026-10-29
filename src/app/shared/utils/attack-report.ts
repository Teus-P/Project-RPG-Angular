import {SkirmishCharacter} from "../../core/model/skirmish/skirmish-character.model";
import {ReceivedDamage} from "../../core/model/receive-damage/receive-damage.model";
import {Mitigation} from "./attack-breakdown";
import {TextResourceService} from "../../core/services/text-resource-service/text-resource.service";
import {AttackQuality, AttackResult, BreakdownEntry, ShieldChange} from "../../core/model/receive-damage/attack-result.model";

export interface ValueChange {
  name: string;
  before: number;
  after: number;
}

export interface AttackReport {
  attackerName: string | null;
  targetName: string;
  bodyLocalization: string;
  damage: number;
  damageOverridden: boolean;
  mitigation: Mitigation | null;
  shieldChange: ShieldChange | null;
  woundsBefore: number;
  woundsAfter: number;
  hasDied: boolean;
  armorChanges: ValueChange[];
  newInjuries: string[];
  conditionChanges: ValueChange[];
  breakdown: BreakdownEntry[];
  qualities: AttackQuality[];
}

export function buildAttackReport(attacker: SkirmishCharacter | undefined,
                                  before: SkirmishCharacter,
                                  after: SkirmishCharacter,
                                  receivedDamage: ReceivedDamage,
                                  result?: AttackResult): AttackReport {
  return {
    attackerName: attacker?.character.name ?? null,
    targetName: before.character.name,
    bodyLocalization: TextResourceService.getTranslation('bodyLocalizations', receivedDamage.bodyLocalization).nameTranslation
      || receivedDamage.bodyLocalization,
    damage: result?.damage ?? receivedDamage.damage ?? 0,
    damageOverridden: result?.damageOverridden ?? false,
    mitigation: result ? {
      toughnessBonus: result.toughnessBonus,
      armorReduction: result.armorReduction,
      woundsLost: result.woundsLost
    } : null,
    woundsBefore: before.currentWounds,
    woundsAfter: after.currentWounds,
    hasDied: !before.isDead && after.isDead,
    armorChanges: findArmorChanges(before, after),
    newInjuries: findNewInjuries(before, after),
    conditionChanges: findConditionChanges(before, after),
    shieldChange: result?.shieldChange ?? null,
    breakdown: result?.breakdown ?? [],
    qualities: result?.qualities ?? []
  };
}

function findArmorChanges(before: SkirmishCharacter, after: SkirmishCharacter): ValueChange[] {
  const changes: ValueChange[] = [];
  for (const beforeLocalization of before.character.bodyLocalizations) {
    const afterLocalization = after.character.bodyLocalizations
      .find(localization => localization.bodyLocalization.name === beforeLocalization.bodyLocalization.name);
    if (!afterLocalization) {
      continue;
    }
    const beforePoints = (beforeLocalization.armorPoints ?? 0) + (beforeLocalization.additionalArmorPoints ?? 0);
    const afterPoints = (afterLocalization.armorPoints ?? 0) + (afterLocalization.additionalArmorPoints ?? 0);
    if (beforePoints !== afterPoints) {
      changes.push({
        name: beforeLocalization.bodyLocalization.nameTranslation,
        before: beforePoints,
        after: afterPoints
      });
    }
  }
  return changes;
}

function findNewInjuries(before: SkirmishCharacter, after: SkirmishCharacter): string[] {
  const injuryKey = (localizationName: string, injuryName: string) => `${localizationName}:${injuryName}`;
  const knownInjuries = new Map<string, number>();
  for (const localization of before.character.bodyLocalizations) {
    for (const injury of localization.injuries ?? []) {
      knownInjuries.set(injuryKey(localization.bodyLocalization.name, injury.model.name), +injury.value || 1);
    }
  }

  const newInjuries: string[] = [];
  for (const localization of after.character.bodyLocalizations) {
    for (const injury of localization.injuries ?? []) {
      const knownValue = knownInjuries.get(injuryKey(localization.bodyLocalization.name, injury.model.name));
      if (knownValue === undefined || (+injury.value || 1) > knownValue) {
        newInjuries.push(`${injury.model.nameTranslation || injury.model.name} (${localization.bodyLocalization.nameTranslation})`);
      }
    }
  }
  return newInjuries;
}

function findConditionChanges(before: SkirmishCharacter, after: SkirmishCharacter): ValueChange[] {
  const changes: ValueChange[] = [];
  const names = new Set([...before.character.conditions, ...after.character.conditions]
    .map(characterCondition => characterCondition.condition.name));

  for (const name of names) {
    const beforeCondition = before.character.conditions.find(condition => condition.condition.name === name);
    const afterCondition = after.character.conditions.find(condition => condition.condition.name === name);
    const beforeValue = beforeCondition?.value ?? 0;
    const afterValue = afterCondition?.value ?? 0;
    if (beforeValue !== afterValue) {
      const source = (afterCondition ?? beforeCondition)!.condition;
      changes.push({name: source.nameTranslation || source.name, before: beforeValue, after: afterValue});
    }
  }
  return changes;
}
