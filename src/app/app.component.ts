import {Component, OnInit} from '@angular/core'
import {ArmorService} from "./core/services/armor-service/armor.service"
import {WeaponService} from "./core/services/weapon-service/weapon.service"
import {SkillService} from "./core/services/skill-service/skill.service"
import {TalentService} from "./core/services/talent-service/talent.service"
import {TraitService} from "./core/services/trait-service/trait.service"
import {BodyLocalizationService} from "./core/services/body-localization-service/body-localization.service"
import {CharacterService} from "./core/services/character-service/character.service"
import {InjuryService} from "./core/services/injuries-service/injury.service"
import {ConditionService} from "./core/services/condition-service/condition.service"
import {SpellService} from "./core/services/spell-service/spell.service"
import {MatDialog} from "@angular/material/dialog"
import {SkirmishCharacterService} from "./core/services/skirmish-character-service/skirmish-character.service"
import {AvailabilityService} from "./core/services/availability-service/availability.service";
import {SkirmishService} from "./core/services/skirmish-service/skirmish.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    standalone: false
})
export class AppComponent implements OnInit {

  dataLoaded = false;

  constructor(public armorService: ArmorService,
              public weaponService: WeaponService,
              public skillService: SkillService,
              public talentService: TalentService,
              public traitService: TraitService,
              public bodyLocalizationService: BodyLocalizationService,
              public characterService: CharacterService,
              public skirmishCharacterService: SkirmishCharacterService,
              public injuryService: InjuryService,
              public conditionService: ConditionService,
              public spellService: SpellService,
              public availabilityService: AvailabilityService,
              public skirmishService: SkirmishService,
              public dialog: MatDialog) {
  }

  async ngOnInit() {
    this.dataLoaded = false
    await this.fetchData().then(() => {
        this.dataLoaded = true
      }
    )
  }

  protected async fetchData() {
    await Promise.all([
      this.armorService.fetchArmors(),
      this.armorService.fetchArmorCategories(),
      this.armorService.fetchArmorPenalties(),
      this.armorService.fetchArmorQualities(),
      this.armorService.fetchArmorTypes(),
      this.bodyLocalizationService.fetchBodyLocalizations(),
      this.injuryService.fetchInjuries(),
      this.conditionService.fetchConditions(),
      this.weaponService.fetchWeapons(),
      this.weaponService.fetchWeaponTypes(),
      this.weaponService.fetchWeaponGroups(),
      this.weaponService.fetchWeaponReaches(),
      this.weaponService.fetchWeaponQualities(),
      this.skillService.fetchSkills(),
      this.talentService.fetchTalents(),
      this.traitService.fetchTraits(),
      this.spellService.fetchSpells(),
      this.characterService.fetchCharacters(),
      this.skirmishCharacterService.fetchSkirmishCharacter(),
      this.availabilityService.fetchAvailabilities(),
      this.skirmishService.fetchSkirmishGroups()
    ])
  }
}
