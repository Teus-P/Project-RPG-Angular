import {Component, OnInit, ViewChild} from '@angular/core';
import {SkirmishCharacter} from "../../../core/model/skirmish/skirmish-character.model";
import {Subscription} from "rxjs";
import {SkirmishCharacterService} from "../../../core/services/skirmish-character-service/skirmish-character.service";
import {Router} from "@angular/router";
import {RoundService} from "../../../core/services/round-service/round.service";
import {TextResourceService} from "../../../core/services/text-resource-service/text-resource.service";
import {MatDialog} from "@angular/material/dialog";
import {InitiativeDialog} from "./dialog-window/initiative-dialog/initiative-dialog.component";
import {MatTable} from "@angular/material/table";
import {SkirmishService} from "../../../core/services/skirmish-service/skirmish.service";
import {SkirmishGroup} from "../../../core/model/skirmish/skirmish-group.model";

@Component({
  selector: 'app-skirmish-characters-list',
  templateUrl: './skirmish-characters-list.component.html',
  styleUrls: ['./skirmish-characters-list.component.css'],
  standalone: false
})
export class SkirmishCharactersListComponent implements OnInit {
  skirmishCharacters!: SkirmishCharacter[];
  subscription!: Subscription;
  roundNumber!: number;
  skirmishGroups: SkirmishGroup[] = [];

  text = TextResourceService;

  @ViewChild(MatTable) table!: MatTable<String>;

  constructor(private skirmishCharacterService: SkirmishCharacterService,
              private skirmishService: SkirmishService,
              private router: Router,
              private roundService: RoundService,
              private dialog: MatDialog) {
  }

  async ngOnInit() {
    this.subscription = this.skirmishCharacterService.skirmishCharactersChanged.subscribe(
      (skirmishCharacters: SkirmishCharacter[]) => {
        this.skirmishCharacters = skirmishCharacters;
      }
    )

    this.skirmishService.skirmishGroupsChanged.subscribe(
      (skirmishGroups: SkirmishGroup[]) => {
        this.skirmishGroups = skirmishGroups;
      }
    )

    this.roundNumber = this.roundService.roundNumber;
    this.skirmishCharacters = this.skirmishCharacterService.getSkirmishCharacters();
    this.skirmishGroups = this.skirmishService.skirmishGroupsList;
  }

  async endTurn() {
    await this.roundService.nextRound();
    this.roundNumber = this.roundService.roundNumber;

    await this.reloadSkirmishCharacters();
  }

  async reloadSkirmishCharacters() {
    await this.skirmishCharacterService.fetchSkirmishCharacter();
    this.skirmishCharacters = this.skirmishCharacterService.getSkirmishCharacters();
  }

  initiativeRolls() {
    const dialogRef = this.dialog.open(InitiativeDialog, {
      width: '20%',
      data: this.skirmishCharacters.slice(),
    });

    dialogRef.afterClosed().subscribe(skirmishCharacters => {
      this.skirmishCharacterService.updateSkirmishCharacters(skirmishCharacters)
    })
  }

  addGroupAdvantage(groupId: number) {
    this.skirmishService.addGroupAdvantagePoint(groupId)
  }

  removeGroupAdvantage(groupId: number) {
    this.skirmishService.removeGroupAdvantagePoint(groupId)
  }

  async clearData() {
    await this.skirmishCharacterService.removeAllSkirmishCharacters().then();
    await this.skirmishService.deleteAllSkirmishGroups().then();
    this.roundService.clearData();
    this.roundNumber = this.roundService.roundNumber;
    this.router.navigate(['skirmish']);
  }
}
