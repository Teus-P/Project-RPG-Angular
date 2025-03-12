import {Component, OnInit} from '@angular/core';
import {Character} from "../../../core/model/character/character.model";
import {CharacterService} from "../../../core/services/character-service/character.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs";
import {TextResourceService} from "../../../core/services/text-resource-service/text-resource.service";
import {SkirmishCharacterService} from "../../../core/services/skirmish-character-service/skirmish-character.service";
import {MatDialog} from "@angular/material/dialog";
import {AddToFightDialogComponent} from "./add-to-fight-dialog/add-to-fight-dialog.component";
import {SkirmishService} from "../../../core/services/skirmish-service/skirmish.service";

@Component({
  selector: 'app-character-list',
  templateUrl: './character-list.component.html',
  styleUrls: ['./character-list.component.css'],
  standalone: false
})
export class CharacterListComponent implements OnInit {

  subscription!: Subscription;
  characterGroupsTypes: { name: string, groups: { name: string, characters: Character[] }[] }[] = [];

  text = TextResourceService;

  constructor(public characterService: CharacterService,
              public skirmishCharacterService: SkirmishCharacterService,
              public skirmishService: SkirmishService,
              private router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog) {
  }

  async ngOnInit() {
    this.subscription = this.characterService.charactersChanged.subscribe(
      () => {
        this.characterGroupsTypes = this.characterService.getCharacterGroupsTypes();
      }
    )
    this.characterGroupsTypes = this.characterService.getCharacterGroupsTypes();
  }

  onAddCharacter() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }

  onAddGroupToFight(characters: Character[]) {
    const dialogRef = this.dialog.open(AddToFightDialogComponent, {
      width: '30%',
      data: {groupName: characters[0].group, isAddingGroup: true}
    })

    dialogRef.afterClosed().subscribe(result => {
      if (result.skirmishGroup != undefined) {
        this.skirmishService.addSkirmishGroup(result.skirmishGroup).then(newGroup => {
          if (newGroup != undefined) {
            this.skirmishCharacterService.storeSkirmishCharactersGroup(characters, newGroup, 0);
          }
        });
      }
    })
    // @ts-ignore
    event.stopPropagation()
  }

  onAddToGroup(type: string, characterGroup: string) {
    this.router.navigate(['new'], {
      relativeTo: this.route,
      queryParams: {groupType: type, group: characterGroup},
      queryParamsHandling: 'merge'
    })
  }
}
