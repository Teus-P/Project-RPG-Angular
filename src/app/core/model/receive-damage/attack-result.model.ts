export interface BreakdownEntry {
  key: string
  value: number
}

export type QualityRelevance = 'APPLIED' | 'REMINDER' | 'NONE'

export interface AttackQuality {
  name: string
  value: string | null
  relevance: QualityRelevance
}

export interface ShieldChange {
  nameTranslation: string
  before: number
  after: number
}

export interface AttackResult {
  damage: number
  damageOverridden: boolean
  destroyArmorValue: number
  isWeaponUndamaging: boolean
  isIgnoringArmor: boolean
  ignoredArmorPoints: number
  damagesShield: boolean
  shieldChange: ShieldChange | null
  toughnessBonus: number
  armorReduction: number
  woundsLost: number
  missingRoll: boolean
  breakdown: BreakdownEntry[]
  qualities: AttackQuality[]
}

export interface AttackWeapon {
  id: number
  nameTranslation: string
  weaponType?: { name: string }
}
