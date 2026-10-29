export type DamageMode = 'MANUAL' | 'ATTACK'

export class ReceivedDamage {
  public mode: DamageMode = 'MANUAL'
  public characterId: number
  public damage?: number
  public bodyLocalization!: string
  public isWeaponUndamaging!: boolean
  public isLosingTest!: boolean
  public shield!: number
  public shieldWeaponId?: number
  public isSuddenDeath!: boolean
  public destroyArmorValue!: number
  public isIgnoringArmor!: boolean

  // ATTACK mode only
  public attackerId?: number
  public weaponId?: number
  public attackRoll?: number
  public successPoints = 0
  public isCharging = false


  constructor(characterId: number, isWeaponUndamaging: boolean, isLosingTest: boolean, isSuddenDeath: boolean, destroyArmorValue: number, isIgnoringArmor: boolean) {
    this.characterId = characterId
    this.isWeaponUndamaging = isWeaponUndamaging
    this.isLosingTest = isLosingTest
    this.isSuddenDeath = isSuddenDeath
    this.destroyArmorValue = destroyArmorValue
    this.isIgnoringArmor = isIgnoringArmor
  }
}
