import {Component, Inject, OnInit} from '@angular/core'
import {TextResourceService} from "../../../../../../core/services/text-resource-service/text-resource.service"
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog"
import {ReceivedDamage} from "../../../../../../core/model/receive-damage/receive-damage.model"
import {SkirmishCharacter} from "../../../../../../core/model/skirmish/skirmish-character.model"
import {Model} from "../../../../../../core/model/model"

@Component({
    selector: 'app-receive-damage-dialog',
    templateUrl: './receive-damage-dialog.component.html',
    styleUrls: ['./receive-damage-dialog.component.css'],
    standalone: false
})
export class ReceiveDamageDialog implements OnInit {

  receivedDamage!: ReceivedDamage
  isArmorDestroyed!: boolean
  text = TextResourceService

  constructor(@Inject(MAT_DIALOG_DATA) public skirmishCharacter: SkirmishCharacter,
              public dialogRef: MatDialogRef<ReceiveDamageDialog>) {
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
    this.receivedDamage.shield = this.checkShieldValue()
  }

  checkShieldValue(): number {
    let shieldValue = 0;
    this.skirmishCharacter.character.weapons.forEach(characterWeapon => {
      characterWeapon.weapon.weaponQualities.forEach(quality => {
        if(quality.weaponQuality.name === "SHIELD") {
          if(shieldValue < Number.parseInt(quality.value)) {
            shieldValue = Number.parseInt(quality.value);
          }
        }
      })
    })
    return shieldValue;
  }

  compareModels(c1: Model, c2: Model): boolean {
    return c1 && c2 ? c1.name === c2.name : c1 === c2
  }

  saveAndCloseDialog() {
    if (!this.receivedDamage.damage
      || !this.receivedDamage.bodyLocalization) {
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
