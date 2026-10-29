import {BreakdownEntry, ShieldChange} from "../../core/model/receive-damage/attack-result.model";
import {TextResourceService} from "../../core/services/text-resource-service/text-resource.service";

const signed = (value: number) => value > 0 ? `+${value}` : `${value}`

export function describeBreakdownEntry(entry: BreakdownEntry): string {
  const text = TextResourceService.getText()
  const quality = TextResourceService.getTranslation('weaponQualities', entry.key).nameTranslation
  switch (entry.key) {
    case 'BASE_STRENGTH':
      return `${text.baseStrengthLabel}: ${signed(entry.value)}`
    case 'WEAPON_DAMAGE':
      return `${text.weaponDamageLabel}: ${signed(entry.value)}`
    case 'TALENT_BONUS':
      return `${text.talentBonusLabel}: ${signed(entry.value)}`
    case 'SUCCESS_POINTS':
      return `${text.successPointsLabel}: ${signed(entry.value)}`
    case 'HACK':
      return `${quality}: ${text.destroysArmorPointsLabel} ${entry.value}`
    case 'HACK_SHIELD': {
      const hack = TextResourceService.getTranslation('weaponQualities', 'HACK').nameTranslation
      return `${hack}: ${text.shieldLosesPointLabel}`
    }
    case 'PENETRATING':
      return `${quality}: ${text.ignoresArmorPointsLabel} ${entry.value}`
    case 'UNDAMAGING':
      return `${quality}: ${text.doublesArmorLabel}`
    default:
      return `${quality || entry.key}: ${signed(entry.value)}`
  }
}

export interface Mitigation {
  toughnessBonus: number
  armorReduction: number
  woundsLost: number
}

export function describeMitigation(mitigation: Mitigation): string {
  const text = TextResourceService.getText()
  return `${text.mitigatedByTargetLabel}: ${text.toughnessBonusLabel} −${mitigation.toughnessBonus}` +
    `, ${text.armorReductionLabel} −${mitigation.armorReduction}` +
    ` → ${text.woundsLostLabel}: ${mitigation.woundsLost}`
}

export function describeShieldChange(change: ShieldChange): string {
  const text = TextResourceService.getText()
  const after = change.after > 0 ? `${text.shieldLabel} ${change.after}` : text.shieldDestroyedLabel
  return `${change.nameTranslation}: ${text.shieldLabel} ${change.before} → ${after}`
}
