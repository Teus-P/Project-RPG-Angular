import {Component, DestroyRef, inject, Inject, OnInit} from '@angular/core'
import {takeUntilDestroyed} from "@angular/core/rxjs-interop"
import {catchError, debounceTime, EMPTY, filter, from, Subject, switchMap} from "rxjs"
import {TextResourceService} from "../../../../../../core/services/text-resource-service/text-resource.service"
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog"
import {ReceivedDamage} from "../../../../../../core/model/receive-damage/receive-damage.model"
import {AttackResult, AttackWeapon} from "../../../../../../core/model/receive-damage/attack-result.model"
import {SkirmishCharacter} from "../../../../../../core/model/skirmish/skirmish-character.model"
import {Model} from "../../../../../../core/model/model"
import {SkirmishService} from "../../../../../../core/services/skirmish-service/skirmish.service"
import {describeBreakdownEntry, describeMitigation, describeShieldChange} from "../../../../../../shared/utils/attack-breakdown"

export interface ReceiveDamageDialogData {
  target: SkirmishCharacter
  attacker?: SkirmishCharacter
}

@Component({
    selector: 'app-receive-damage-dialog',
    templateUrl: './receive-damage-dialog.component.html',
    styleUrls: ['./receive-damage-dialog.component.css'],
    standalone: false
})
export class ReceiveDamageDialog implements OnInit {

  private destroyRef = inject(DestroyRef)
  receivedDamage!: ReceivedDamage
  isArmorDestroyed!: boolean
  text = TextResourceService
  describeBreakdownEntry = describeBreakdownEntry
  describeShieldChange = describeShieldChange
  skirmishCharacter: SkirmishCharacter
  attacker?: SkirmishCharacter

  // ATTACK mode: the backend calculates the damage, the dialog only collects the input and shows the preview.
  attackWeapons: AttackWeapon[] = []
  selectedWeaponId: number | null = null
  attackRoll: number | null = null
  successPoints = 0
  isCharging = false
  damageOverride: number | null = null
  manualEdit = false
  shieldOptions: {id: number, label: string, value: number}[] = []
  shieldChoice: number | 'none' | 'manual' = 'none'
  preview: AttackResult | null = null
  private previewRequests = new Subject<void>()

  constructor(@Inject(MAT_DIALOG_DATA) data: ReceiveDamageDialogData,
              public dialogRef: MatDialogRef<ReceiveDamageDialog>,
              private skirmishService: SkirmishService) {
    this.skirmishCharacter = data.target
    this.attacker = data.attacker
  }

  ngOnInit(): void {
    if (this.skirmishCharacter.id == null) {
      throw new Error("Character is without an id.");
    }
    this.receivedDamage = new ReceivedDamage(
      this.skirmishCharacter.id,
      false,
      true,
      true,
      1,
      false)
    this.initShield()

    this.previewRequests.pipe(
      debounceTime(250),
      filter(() => this.canRequestPreview()),
      switchMap(() => {
        if (this.isAttack) {
          this.syncAttackFields()
        }
        return from(this.skirmishService.previewDamage(this.previewPayload())).pipe(catchError(() => EMPTY))
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(result => this.preview = result)

    if (this.attacker?.id != null) {
      this.receivedDamage.mode = 'ATTACK'
      this.receivedDamage.attackerId = this.attacker.id
      this.skirmishService.getAttackWeapons(this.attacker.id).then(weapons => {
        this.attackWeapons = weapons
        this.selectedWeaponId = weapons[0]?.id ?? null
        this.onInputChanged()
      })
    }
  }

  get isAttack(): boolean {
    return this.receivedDamage?.mode === 'ATTACK'
  }

  get isMeleeAttack(): boolean {
    return this.attackWeapons.find(weapon => weapon.id === this.selectedWeaponId)?.weaponType?.name === 'MELEE'
  }

  get shownDamage(): number | null {
    if (!this.isAttack) {
      return this.receivedDamage?.damage ?? null
    }
    return this.damageOverride ?? this.preview?.damage ?? null
  }

  get rollUnits(): number | null {
    return this.attackRoll === null || this.attackRoll === undefined ? null : this.attackRoll % 10
  }

  get breakdownSummary(): string {
    return (this.preview?.breakdown ?? []).map(describeBreakdownEntry).join(', ')
  }

  get mitigationSummary(): string {
    return this.preview ? describeMitigation(this.preview) : ''
  }

  changeSuccessPoints(delta: number) {
    this.successPoints = (this.successPoints || 0) + delta
    this.onInputChanged()
  }

  toggleManualEdit() {
    this.manualEdit = !this.manualEdit
    if (!this.manualEdit) {
      this.damageOverride = null
      this.onInputChanged()
    }
  }

  onLocationSelected(name: string) {
    this.receivedDamage.bodyLocalization = name
    this.onInputChanged()
  }

  onInputChanged() {
    this.previewRequests.next()
  }

  /** Destroying armor (or damaging the shield) counts only when it is switched on, also in the preview. */
  private previewPayload(): ReceivedDamage {
    if (this.isAttack) {
      return this.receivedDamage
    }
    return {
      ...this.receivedDamage,
      destroyArmorValue: this.isArmorDestroyed ? this.receivedDamage.destroyArmorValue : 0
    } as ReceivedDamage
  }

  private canRequestPreview(): boolean {
    if (!this.receivedDamage.bodyLocalization) {
      return false
    }
    return this.isAttack ? this.selectedWeaponId != null : this.receivedDamage.damage != null
  }

  private syncAttackFields() {
    this.receivedDamage.weaponId = this.selectedWeaponId ?? undefined
    this.receivedDamage.attackRoll = this.attackRoll ?? undefined
    this.receivedDamage.successPoints = this.successPoints || 0
    this.receivedDamage.isCharging = this.isCharging
    this.receivedDamage.damage = this.damageOverride ?? undefined
  }

  /** The target's shields. The strongest one is chosen by default, as the target is assumed to have parried with it. */
  private initShield() {
    this.shieldOptions = this.skirmishCharacter.character.weapons
      .map(characterWeapon => {
        const shield = characterWeapon.weapon.weaponQualities
          .find(quality => quality.weaponQuality.name === "SHIELD")
        return shield && characterWeapon.weapon.id != null
          ? {id: characterWeapon.weapon.id, label: characterWeapon.weapon.nameTranslation,
              value: Number.parseInt(shield.value) || 1}
          : null
      })
      .filter(option => option !== null)
      .sort((first, second) => second.value - first.value)
    this.shieldChoice = this.shieldOptions[0]?.id ?? 'none'
    this.onShieldChoiceChanged(false)
  }

  onShieldChoiceChanged(refreshPreview = true) {
    const chosen = this.shieldOptions.find(option => option.id === this.shieldChoice)
    this.receivedDamage.shieldWeaponId = chosen?.id
    if (chosen) {
      this.receivedDamage.shield = chosen.value
    } else if (this.shieldChoice === 'none') {
      this.receivedDamage.shield = 0
    }
    if (refreshPreview) {
    }
      this.onInputChanged()
    }

  compareModels(c1: Model, c2: Model): boolean {
    return c1 && c2 ? c1.name === c2.name : c1 === c2
  }

  saveAndCloseDialog() {
    if (!this.receivedDamage.bodyLocalization) {
      return
    }
    if (this.isAttack) {
      if (this.selectedWeaponId == null) {
        return
      }
      this.syncAttackFields()
    } else if (!this.receivedDamage.damage) {
      return
    }

    this.returnReceivedDamage().then((result) => {
      this.dialogRef.close(result)
    })
  }

  returnReceivedDamage(): Promise<ReceivedDamage> {
    return new Promise((resolve => {
      if (!this.isArmorDestroyed) {
        this.receivedDamage.destroyArmorValue = 0
      }
      resolve(this.receivedDamage)
    }))
  }
}
