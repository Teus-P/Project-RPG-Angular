import {Component, Input, OnInit, DestroyRef, inject} from '@angular/core';
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {Character} from "../../../../core/model/character/character.model";
import {SkirmishCharacter} from "../../../../core/model/skirmish/skirmish-character.model";
import {
  SkirmishCharacterService
} from "../../../../core/services/skirmish-character-service/skirmish-character.service";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {Model} from "../../../../core/model/model";
import {BottomSheetDescription} from "../../bottom-sheet/bottom-sheet-description/bottom-sheet-description.component";
import {CharacterService} from "../../../../core/services/character-service/character.service";

@Component({
  selector: 'app-details-body-localizations',
  templateUrl: './details-body-localizations.component.html',
  styleUrls: ['./details-body-localizations.component.css'],
  standalone: false
})
export class DetailsBodyLocalizationsComponent implements OnInit {
  private destroyRef = inject(DestroyRef)

  @Input() isSkirmishMode!: boolean
  @Input() character!: Character
  @Input() skirmishCharacter?: SkirmishCharacter
  text = TextResourceService

  private readonly columnsWithInjuries: string[] = ['name', 'armorPoints', 'injuries']
  private readonly columnsWithoutInjuries: string[] = ['name', 'armorPoints']

  get bodyLocalizationsColumns(): string[] {
    const hasInjuries = this.character.bodyLocalizations.some(localization => localization.injuries?.length > 0)
    return hasInjuries ? this.columnsWithInjuries : this.columnsWithoutInjuries
  }

  constructor(public skirmishCharacterService: SkirmishCharacterService,
              public characterService: CharacterService,
              protected bottomSheet: MatBottomSheet) {
  }

  ngOnInit(): void {
    if (this.isSkirmishMode && this.skirmishCharacter != undefined) {
      this.character = this.skirmishCharacter.character
    }

    this.characterService.charactersChanged.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      (characters: Character[]) => {
        const foundCharacter = characters.find(item => item.id === this.character.id);
        this.character = foundCharacter ? foundCharacter : this.character;
      }
    )
  }

  openBottomSheet(model: Model) {
    this.bottomSheet.open(BottomSheetDescription, {
      data: {nameTranslation: model.nameTranslation, description: model.description},
      panelClass: 'bottom-sheet'
    })
  }
}
