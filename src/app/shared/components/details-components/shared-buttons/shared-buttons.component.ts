import {Component, Input, numberAttribute} from '@angular/core';
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {CharacterService} from "../../../../core/services/character-service/character.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {SkirmishCharacterService} from "../../../../core/services/skirmish-character-service/skirmish-character.service";

@Component({
    selector: 'app-shared-buttons',
    templateUrl: './shared-buttons.component.html',
    styleUrls: ['./shared-buttons.component.css'],
    standalone: false
})
export class SharedButtonsComponent {
  text = TextResourceService
  @Input({transform: numberAttribute}) id!: number
  @Input() isSkirmishMode!: boolean

  constructor(public characterService: CharacterService,
              public skirmishCharacterService: SkirmishCharacterService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected dialog: MatDialog) {
  }

  onEditCharacter() {
    this.router.navigate(['edit'], {relativeTo: this.route})
  }

  onDeleteCharacter() {
    if(this.isSkirmishMode) {
      this.skirmishCharacterService.removeSkirmishCharacter(this.id)
      this.router.navigate(['skirmish'])
    } else {
      this.characterService.removeCharacter(this.id)
      this.router.navigate(['characters'])
    }
  }
}
