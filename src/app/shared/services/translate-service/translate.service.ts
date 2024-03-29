import {Injectable} from '@angular/core';
import {CharacterSkill} from "../../../model/skill/character-skill.model";
import {TextResourceService} from "../text-resource-service/text-resource.service";
import {CharacterTalent} from "../../../model/talent/character-talent.model";
import {CharacterWeapon} from "../../../model/weapon/character-weapon.model";
import {CharacterBodyLocalization} from "../../../model/body-localization/character-body-localization.model";
import {CharacterCondition} from "../../../model/condition/character-condition.model";
import {Weapon} from "../../../model/weapon/weapon.model";
import {Armor} from "../../../model/armor/armor.model";
import {Character} from "../../../model/character/character.model";
import {Talent} from "../../../model/talent/talent.model";
import {Model} from "../../../model/model";
import {Trait} from "../../../model/trait/trait.model";
import {CharacterTrait} from "../../../model/trait/character-trait.model";
import {Spell} from "../../../model/spell/spell.model";
import {Condition} from "../../../model/condition/condition.model";

@Injectable({
  providedIn: 'root'
})
export class TranslateService {

  constructor() {
  }

  public prepareCharacter(character: Character) {
    this.prepareCharacterSkills(character.skills);
    this.prepareCharacterTalents(character.talents);
    this.prepareCharacterTraits(character.traits)
    this.prepareSpellList(character.spells);
    this.prepareWeapons(character.weapons);
    this.prepareArmorsList(character.armors);
    this.prepareBodyLocalizations(character.bodyLocalizations);
    this.prepareCharacterConditions(character.conditions);
  }

  private prepareCharacterSkills(skills: CharacterSkill[]) {
    for (let skill of skills) {
      skill.skill.nameTranslation = TextResourceService.getSkillNameTranslation(skill.skill.name).nameTranslation
    }
    skills.sort((a, b) => this.compareModels(a.skill, b.skill));
  }

  private prepareCharacterTalents(talents: CharacterTalent[]) {
    for (let characterTalent of talents) {
      this.prepareTalent(characterTalent.talent);
    }
    talents.sort((a, b) => this.compareModels(a.talent, b.talent));
  }

  public prepareTalentList(talents: Talent[]) {
    talents.forEach(talent => {
      this.prepareTalent(talent)
    });

    talents.sort((a, b) => this.compareModels(a, b))
  }

  private prepareTalent(talent: Talent) {
    let talentTranslation = TextResourceService.getTalentNameTranslation(talent.name);
    talent.nameTranslation = talentTranslation.nameTranslation;
    talent.description = talentTranslation.description;
  }

  private prepareCharacterTraits(traits: CharacterTrait[]) {
    for (let characterTrait of traits) {
      this.prepareTrait(characterTrait.trait);
    }
    traits.sort((a, b) => this.compareModels(a.trait, b.trait))
  }

  public prepareTrait(trait: Trait) {
    let traitTranslation = TextResourceService.getTraitNameTranslation(trait.name);
    trait.nameTranslation = traitTranslation.nameTranslation;
    trait.description = traitTranslation.description;
  }

  public prepareSpellList(spells: Spell[]) {
    for (const spell of spells) {
      this.prepareSpell(spell);
    }

    spells.sort((a, b) => (a.nameTranslation > b.nameTranslation) ? 1 : ((b.nameTranslation > a.nameTranslation) ? -1 : 0))
  }

  private prepareSpell(spell: Spell) {
    let spellTranslation = TextResourceService.getSpellNameTranslation(spell.name);
    spell.nameTranslation = spellTranslation.nameTranslation;
    spell.description = spellTranslation.description;
    spell.spellGroup.nameTranslation = TextResourceService.getSpellGroupNameTranslation(spell.spellGroup.name).nameTranslation;
  }

  private prepareWeapons(weapons: CharacterWeapon[]) {
    for (let weapon of weapons) {
      this.prepareWeaponTranslation(weapon.weapon);
    }
  }

  public prepareWeaponTranslation(weapon: Weapon) {
    weapon.weaponType.nameTranslation = TextResourceService.getWeaponTypeNameTranslation(weapon.weaponType.name).nameTranslation;
    weapon.weaponGroup.nameTranslation = TextResourceService.getWeaponGroupNameTranslation(weapon.weaponGroup.name).nameTranslation;
    weapon.weaponReach.nameTranslation = TextResourceService.getWeaponReachNameTranslation(weapon.weaponReach.name).nameTranslation;
    weapon.availability.nameTranslation = TextResourceService.getAvailabilityNameTranslation(weapon.availability.name).nameTranslation;

    for (let quality of weapon.weaponQualities) {
      this.prepareWeaponQuality(quality.weaponQuality);
    }
  }

  public prepareWeaponQuality(quality: Model) {
    let weaponQualityTranslation = TextResourceService.getWeaponQualityNameTranslation(quality.name);
    quality.nameTranslation = weaponQualityTranslation.nameTranslation;
    quality.description = weaponQualityTranslation.description;
  }

  public prepareArmorsList(armors: Armor[]) {
    for (let armor of armors) {
      this.prepareArmorTranslation(armor);
    }
    armors.sort((a, b) => (a.armorCategory.nameTranslation > b.armorCategory.nameTranslation) ? 1 : ((b.armorCategory.nameTranslation > a.armorCategory.nameTranslation) ? -1 : 0));
  }

  public prepareArmorQuality(quality: Model) {
    let armorQualityTranslation = TextResourceService.getArmorQualityTranslation(quality.name);
    quality.nameTranslation = armorQualityTranslation.nameTranslation;
    quality.description = armorQualityTranslation.description;
  }

  private prepareBodyLocalizations(bodyLocalizations: CharacterBodyLocalization[]) {
    for (let characterBodyLocalization of bodyLocalizations) {
      characterBodyLocalization.bodyLocalization.nameTranslation = TextResourceService.getCharacterBodyLocalizationNameTranslation(characterBodyLocalization.bodyLocalization.name).nameTranslation;
      for (let characterInjury of characterBodyLocalization.injuries) {
        characterInjury.injury.nameTranslation = TextResourceService.getInjuryNameTranslation(characterInjury.injury.name).nameTranslation;
      }
    }
  }

  private prepareArmorTranslation(armor: Armor) {
    armor.armorCategory.nameTranslation = TextResourceService.getArmorCategoryNameTranslation(armor.armorCategory.name).nameTranslation;
    armor.availability.nameTranslation = TextResourceService.getAvailabilityNameTranslation(armor.availability.name).nameTranslation;

    for (let armorBodyLocalization of armor.armorBodyLocalizations) {
      armorBodyLocalization.bodyLocalization.nameTranslation = TextResourceService.getBodyLocalizationNameTranslation(armorBodyLocalization.bodyLocalization.name).nameTranslation;
    }

    if (armor.armorPenalties != undefined) {
      for (let penalty of armor.armorPenalties) {
        penalty.nameTranslation = TextResourceService.getArmorPenaltyNameTranslation(penalty.name).nameTranslation;
      }
    }

    if (armor.armorQualities != undefined) {
      for (let quality of armor.armorQualities) {
        this.prepareArmorQuality(quality);
      }
    }
  }

  public prepareCharacterConditions(conditions: CharacterCondition[]) {
    for (let characterCondition of conditions) {
      this.prepareCondition(characterCondition.condition);
    }
    conditions.sort((a, b) => (a.condition.nameTranslation > b.condition.nameTranslation) ? 1 : ((b.condition.nameTranslation > a.condition.nameTranslation) ? -1 : 0));
  }

  public prepareConditionList(conditions: Condition[]) {
    for (const condition of conditions) {
      this.prepareCondition(condition);
    }
    conditions.sort((a, b) => (a.nameTranslation > b.nameTranslation) ? 1 : ((b.nameTranslation > a.nameTranslation) ? -1 : 0));
  }

  public prepareCondition(condition: Condition) {
    let conditionTranslation = TextResourceService.getConditionTranslation(condition.name);
    condition.nameTranslation = conditionTranslation.nameTranslation;
    condition.description = conditionTranslation.description;
  }

  compareModels(c1: Model, c2: Model): number {
    return c1.nameTranslation.localeCompare(c2.nameTranslation);
  }
}
