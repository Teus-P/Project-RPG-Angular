import {Component, Input} from '@angular/core';
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {ReceiveDamageDialog} from "./dialog-window/receive-damage-dialog/receive-damage-dialog.component";
import {AddConditionDialogComponent} from "./dialog-window/add-condition-dialog/add-condition-dialog.component";
import {SkirmishService} from "../../../../core/services/skirmish-service/skirmish.service";
import {Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {SkirmishCharacter} from "../../../../core/model/skirmish/skirmish-character.model";
import {SkirmishCharacterService} from "../../../../core/services/skirmish-character-service/skirmish-character.service";

@Component({
    selector: 'app-skirmish-character-buttons',
    templateUrl: './skirmish-character-buttons.component.html',
    styleUrls: ['./skirmish-character-buttons.component.css'],
    standalone: false
})
export class SkirmishCharacterButtonsComponent {
  text = TextResourceService
  @Input() skirmishCharacter!: SkirmishCharacter

  constructor(public skirmishService: SkirmishService,
              public skirmishCharacterService: SkirmishCharacterService,
              protected router: Router,
              protected dialog: MatDialog) {
  }

  async onReceiveDamage() {
    const dialogRef = this.dialog.open(ReceiveDamageDialog, {
      width: '20%',
      data: this.skirmishCharacter,
    })

    dialogRef.afterClosed().subscribe(async receivedDamage => {
      if (receivedDamage != undefined) {
        if (this.skirmishCharacter.id == null) {
          throw new Error("Character is without an id.");
        }
        await this.skirmishService.receiveDamage(receivedDamage)
        this.skirmishCharacter = await this.skirmishCharacterService.reloadSkirmishCharacter(this.skirmishCharacter.id)
      }
    })
  }

  async onAddCondition() {
    const dialogRef = this.dialog.open(AddConditionDialogComponent, {
      width: '40%',
      data: this.skirmishCharacter,
    })

    dialogRef.afterClosed().subscribe(async addConditions => {
      if (this.skirmishCharacter.id == null) {
        throw new Error("Character is without an id.");
      }
      if (addConditions != undefined) {
        await this.skirmishService.addConditions(addConditions)
        this.skirmishCharacter = await this.skirmishCharacterService.reloadSkirmishCharacter(this.skirmishCharacter.id)
      }
    })
  }
}
