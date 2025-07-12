import {Component, Input} from '@angular/core';
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {SkirmishCharacter} from "../../../../core/model/skirmish/skirmish-character.model";
import {
  SkirmishCharacterService
} from "../../../../core/services/skirmish-character-service/skirmish-character.service";
import {SkirmishService} from "../../../../core/services/skirmish-service/skirmish.service";
import {Model} from "../../../../core/model/model";
import {
  BottomSheetDescription
} from "../../../../shared/components/bottom-sheet/bottom-sheet-description/bottom-sheet-description.component";
import {MatBottomSheet} from "@angular/material/bottom-sheet";

@Component({
  selector: 'app-skirmish-character-parameters',
  templateUrl: './skirmish-character-parameters.component.html',
  styleUrls: ['./skirmish-character-parameters.component.css'],
  standalone: false
})
export class SkirmishCharacterParametersComponent {
  text = TextResourceService
  @Input() skirmishCharacter!: SkirmishCharacter
  temporaryParametersColumns: string[] = ['isAlive', 'currentWounds', 'initiative', 'advantage']
  baseColumns: string[] = ['name', 'level']

  constructor(public skirmishCharacterService: SkirmishCharacterService,
              public skirmishService: SkirmishService,
              protected bottomSheet: MatBottomSheet) {
  }

  async addWoundPoint() {
    await this.skirmishService.addWoundPoint(this.skirmishCharacter.id)
    this.skirmishCharacter = await this.skirmishCharacterService.reloadSkirmishCharacter(this.skirmishCharacter.id)
  }

  async removeWoundPoint() {
    await this.skirmishService.removeWoundPoint(this.skirmishCharacter.id)
    this.skirmishCharacter = await this.skirmishCharacterService.reloadSkirmishCharacter(this.skirmishCharacter.id)
  }

  async addAdvantagePoint() {
    await this.skirmishService.addAdvantagePoint(this.skirmishCharacter.id)
    this.skirmishCharacter = await this.skirmishCharacterService.reloadSkirmishCharacter(this.skirmishCharacter.id)
  }

  async removeAdvantagePoint() {
    await this.skirmishService.removeAdvantagePoint(this.skirmishCharacter.id)
    this.skirmishCharacter = await this.skirmishCharacterService.reloadSkirmishCharacter(this.skirmishCharacter.id)
  }

  async onToggleAlive(value: any) {
    await this.skirmishService.changeIsDeadValue(this.skirmishCharacter.id, value)
    this.skirmishCharacter = await this.skirmishCharacterService.reloadSkirmishCharacter(this.skirmishCharacter.id)
  }

  openBottomSheet(model: Model) {
    this.bottomSheet.open(BottomSheetDescription, {
      data: {nameTranslation: model.nameTranslation, description: model.description},
      panelClass: 'bottom-sheet'
    })
  }
}
