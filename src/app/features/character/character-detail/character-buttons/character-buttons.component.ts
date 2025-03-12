import {Component, Input} from '@angular/core';
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {SkirmishCharacterService} from "../../../../core/services/skirmish-character-service/skirmish-character.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {Character} from "../../../../core/model/character/character.model";
import {AddToFightDialogComponent} from "../../character-list/add-to-fight-dialog/add-to-fight-dialog.component";
import {SkirmishService} from "../../../../core/services/skirmish-service/skirmish.service";

@Component({
    selector: 'app-character-buttons',
    templateUrl: './character-buttons.component.html',
    styleUrls: ['./character-buttons.component.css'],
    standalone: false
})
export class CharacterButtonsComponent {
  @Input() character!: Character
  text = TextResourceService

  constructor(public skirmishCharacterService: SkirmishCharacterService,
              public skirmishService : SkirmishService,
              protected route: ActivatedRoute,
              protected router: Router,
              protected dialog: MatDialog) {
  }

  onAddToFight() {
    const dialogRef = this.dialog.open(AddToFightDialogComponent, {
      width: '30%',
      data: {groupName: this.character.group, isAddingGroup: false}
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result.skirmishGroup != undefined) {
        this.skirmishService.addSkirmishGroup(result.skirmishGroup).then(newSkirmishGroup => {
          if (newSkirmishGroup != undefined) {
            this.skirmishCharacterService.storeSkirmishCharactersGroup([this.character], newSkirmishGroup, result.number);
          }
        });
      }
    })
  }

  onCopyCharacter() {
    this.router.navigate(['copy'], {relativeTo: this.route, queryParams: {copy: true}, queryParamsHandling: 'merge'})
  }
}
