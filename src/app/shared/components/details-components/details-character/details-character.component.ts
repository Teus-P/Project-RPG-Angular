import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {MatBottomSheet} from "@angular/material/bottom-sheet";
import {MatDialog} from "@angular/material/dialog";
import {Character} from "../../../../core/model/character/character.model";
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {Model} from "../../../../core/model/model";
import {BottomSheetDescription} from "../../bottom-sheet/bottom-sheet-description/bottom-sheet-description.component";
import {Spell} from "../../../../core/model/spell/spell.model";
import {MatMenuTrigger} from "@angular/material/menu";
import {Armor} from "../../../../core/model/armor/armor.model";
import {
  EditArmorPointsWindowComponent
} from "../../dialog-window/edit-armor-points-window/edit-armor-points-window.component";
import {CharacterArmor} from "../../../../core/model/armor/character-armor.model";
import {CharacterService} from "../../../../core/services/character-service/character.service";
import {ValueModel} from "../../../../core/model/value-model";
import {Talent} from "../../../../core/model/talent/talent.model";
import {Skill} from "../../../../core/model/skill/skill.model";

export interface Group {
  name: string;
  isGroup: boolean;
}

@Component({
  selector: 'app-details-character',
  templateUrl: './details-character.component.html',
  styleUrls: ['./details-character.component.css'],
  standalone: false
})
export class DetailsCharacterComponent implements OnInit {
  @Input() character!: Character
  @Input() isSkirmishMode!: boolean
  text = TextResourceService
  characteristicsColumns: string[] = this.fillCharacteristicsColumn()
  notesColumns: string[] = ['note']
  spellColumns: string[] = ['spell']
  baseColumns: string[] = ['name', 'level']
  weaponColumns: string[] = ['name', 'category', 'reach', 'damage', 'advantagesAndDisadvantages']
  armorsColumns: string[] = ['name', 'category', 'localization', 'armorPoints', 'penalties', 'qualities']

  talentsCheckbox: boolean = this.isSkirmishMode;
  talentsList: ValueModel<Talent>[] = [];

  skillsCheckbox: boolean = this.isSkirmishMode;
  skillsList: ValueModel<Skill>[] = [];

  @ViewChild(MatMenuTrigger) contextMenu!: MatMenuTrigger
  contextMenuPosition = {x: '0px', y: '0px'}

  constructor(protected characterService: CharacterService,
              protected router: Router,
              protected bottomSheet: MatBottomSheet,
              protected dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.talentsCheckbox = this.isSkirmishMode;
    this.talentsList = this.character.getTalentsList(this.isSkirmishMode);

    this.skillsCheckbox = this.isSkirmishMode;
    this.skillsList = this.character.getSkillsList(this.isSkirmishMode);
  }

  private fillCharacteristicsColumn() {
    return [
      "MOVEMENT",
      "WEAPON_SKILL",
      "BALLISTIC_SKILL",
      "STRENGTH",
      "TOUGHNESS",
      "INITIATIVE",
      "AGILITY",
      "DEXTERITY",
      "INTELLIGENCE",
      "WILLPOWER",
      "FELLOWSHIP",
      "WOUNDS"
    ]
  }

  protected createListOfSpells(spells: Spell[]): (Spell | Group)[] {
    spells.sort((a, b) => a.spellGroup.nameTranslation!.localeCompare(b.spellGroup.nameTranslation!));

    const result: (Spell | Group)[] = [];
    let currentGroupName = '';

    for (const spell of spells) {
      const groupName = spell.spellGroup.nameTranslation!;
      if (groupName !== currentGroupName) {
        result.push({isGroup: true, name: groupName});
        currentGroupName = groupName;
      }
      result.push(spell);
    }

    return result;
  }

  isGroup(index: number, item: Group): boolean {
    return item.isGroup;
  }

  openBottomSheet(model: Model) {
    this.bottomSheet.open(BottomSheetDescription, {
      data: {nameTranslation: model.nameTranslation, description: model.description},
      panelClass: 'bottom-sheet'
    })
  }

  onContextMenu(event: MouseEvent, armor: Armor) {
    event.preventDefault()
    this.contextMenuPosition.x = event.clientX + 'px'
    this.contextMenuPosition.y = event.clientY + 'px'
    this.contextMenu.menuData = {'armor': armor}
    // @ts-ignore
    this.contextMenu.menu.focusFirstItem('mouse')
    this.contextMenu.openMenu()
  }

  async onEditArmor(armor: CharacterArmor) {
    await this.createEditArmorPointsWindow(armor)
  }

  createEditArmorPointsWindow(armor: CharacterArmor) {
    const dialogRef = this.dialog.open(EditArmorPointsWindowComponent, {
      width: '20%',
      data: armor,
    })

    dialogRef.afterClosed().subscribe(async armor => {
      if (armor != undefined) {
        const index = this.character.armors.indexOf(armor);
        if (index !== -1) {
          this.character.armors[index] = armor;
          await this.characterService.storeCharacter(this.character);
          this.character = await this.characterService.reloadCharacter(this.character.id)
        }
      }
    })
  }

  talentsCheckboxUpdate(checked: boolean) {
    this.talentsList = this.character.getTalentsList(checked);
  }

  skillsCheckboxUpdate(checked: boolean) {
    this.skillsList = this.character.getSkillsList(checked);
  }
}
