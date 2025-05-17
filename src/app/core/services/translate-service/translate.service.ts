import {Injectable} from '@angular/core';
import {TextResourceService} from "../text-resource-service/text-resource.service";
import {CharacterWeapon} from "../../model/weapon/character-weapon.model";
import {CharacterBodyLocalization} from "../../model/body-localization/character-body-localization.model";
import {CharacterCondition} from "../../model/condition/character-condition.model";
import {Weapon} from "../../model/weapon/weapon.model";
import {Armor} from "../../model/armor/armor.model";
import {Character} from "../../model/character/character.model";
import {Talent} from "../../model/talent/talent.model";
import {Model} from "../../model/model";
import {Trait} from "../../model/trait/trait.model";
import {Spell} from "../../model/spell/spell.model";
import {Condition} from "../../model/condition/condition.model";
import {ValueModel} from "../../model/value-model";
import {CharacterArmor} from "../../model/armor/character-armor.model";
import {TextResourceKeys} from "../../model/types";
import {Skill} from "../../model/skill/skill.model";

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
    this.prepareCharacterArmorsList(character.armors);
    this.prepareBodyLocalizations(character.bodyLocalizations);
    this.prepareCharacterConditions(character.conditions);
  }

  private prepareCharacterSkills(skills: ValueModel<Skill>[]) {
    for (let skill of skills) {
      skill.model.nameTranslation = TextResourceService.getTranslation("skills", skill.model.name).nameTranslation
    }
    skills.sort((a, b) => this.compareModels(a.model, b.model));
  }

  private prepareCharacterTalents(talents: ValueModel<Talent>[]) {
    for (let characterTalent of talents) {
      this.prepareTalent(characterTalent.model);
    }
    talents.sort((a, b) => this.compareModels(a.model, b.model));
  }

  public prepareTalentList(talents: Talent[]) {
    talents.forEach(talent => {
      this.prepareTalent(talent)
    });

    talents.sort((a, b) => this.compareModels(a, b))
  }

  private prepareTalent(talent: Talent) {
    let talentTranslation = TextResourceService.getTranslation("talents", talent.name);
    talent.nameTranslation = talentTranslation.nameTranslation;
    talent.description = talentTranslation.description;
  }

  private prepareCharacterTraits(traits: ValueModel<Trait>[]) {
    for (let characterTrait of traits) {
      this.prepareTrait(characterTrait.model);
    }
    traits.sort((a, b) => this.compareModels(a.model, b.model))
  }

  public prepareTrait(trait: Trait) {
    // let traitTranslation = TextResourceService.getTraitNameTranslation(trait.name);
    let traitTranslation = TextResourceService.getTranslation("traits", trait.name)
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
    let spellTranslation = TextResourceService.getTranslation("spells", spell.name);
    spell.nameTranslation = spellTranslation.nameTranslation;
    spell.description = spellTranslation.description;
    spell.spellGroup.nameTranslation = TextResourceService.getTranslation("spellGroups", spell.spellGroup.name).nameTranslation;
  }

  private prepareWeapons(weapons: CharacterWeapon[]) {
    for (let weapon of weapons) {
      this.prepareWeaponTranslation(weapon.weapon);
    }
  }

  public prepareWeaponTranslation(weapon: Weapon) {
    weapon.weaponType.nameTranslation = TextResourceService.getTranslation("weaponType", weapon.weaponType.name).nameTranslation;
    weapon.weaponGroup.nameTranslation = TextResourceService.getTranslation("weaponGroup", weapon.weaponGroup.name).nameTranslation;
    weapon.weaponReach.nameTranslation = TextResourceService.getTranslation("weaponReach", weapon.weaponReach.name).nameTranslation;
    weapon.availability.nameTranslation = TextResourceService.getTranslation("availability", weapon.availability.name).nameTranslation;

    for (let quality of weapon.weaponQualities) {
      this.prepareWeaponQuality(quality.weaponQuality);
    }
  }

  public prepareWeaponQuality(quality: Model) {
    let weaponQualityTranslation = TextResourceService.getTranslation("weaponQualities", quality.name);
    quality.nameTranslation = weaponQualityTranslation.nameTranslation;
    quality.description = weaponQualityTranslation.description;
  }

  public prepareCharacterArmorsList(armors: CharacterArmor[]) {
    for (let armor of armors) {
      this.prepareTranslation(armor.armor);
      armor.armorBodyLocalizations.forEach(armorBodyLocalization => {
        armorBodyLocalization.bodyLocalization.nameTranslation = TextResourceService.getTranslation("bodyLocalizations", armorBodyLocalization.bodyLocalization.name).nameTranslation;
      })
    }
    armors.sort((a, b) => (a.armor.armorCategory.nameTranslation > b.armor.armorCategory.nameTranslation) ? 1 : ((b.armor.armorCategory.nameTranslation > a.armor.armorCategory.nameTranslation) ? -1 : 0));
  }

  private prepareBodyLocalizations(bodyLocalizations: CharacterBodyLocalization[]) {
    for (let characterBodyLocalization of bodyLocalizations) {
      characterBodyLocalization.bodyLocalization.nameTranslation = TextResourceService.getTranslation("characterBodyLocalizations", characterBodyLocalization.bodyLocalization.name).nameTranslation;
      for (let characterInjury of characterBodyLocalization.injuries) {
        let injuryTranslation = TextResourceService.getTranslation("injury", characterInjury.model.name);
        characterInjury.model.nameTranslation = injuryTranslation.nameTranslation;
        characterInjury.model.description = injuryTranslation.description;
      }
    }
  }

  private prepareTranslation<T extends object>(item: T) {
    Object.keys(item).forEach((key) => {
      const value = (item as any)[key];

      if (value && this.isModel(value)) {
        this.setTranslations(<TextResourceKeys>key, value)
      }

      if (Array.isArray(value) && value.length > 0 && this.isModel(value[0])) {
        value.forEach((model: Model) => {
          this.setTranslations(<TextResourceKeys>key, model)
        })
      }
    })
  }

  private setTranslations(key: TextResourceKeys, model: Model) {
    model.nameTranslation = TextResourceService.getTranslation(key, model.name).nameTranslation
    model.description = TextResourceService.getTranslation(key, model.name).description
  }

  private isModel(obj: any): obj is Model {
    return obj && typeof obj.name === 'string';
  }

  public prepareArmorsList(armors: Armor[]) {
    for (let armor of armors) {
      this.prepareTranslation(armor);
    }
    armors.sort((a, b) => (a.armorCategory.nameTranslation > b.armorCategory.nameTranslation) ? 1 : ((b.armorCategory.nameTranslation > a.armorCategory.nameTranslation) ? -1 : 0));
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
    let conditionTranslation = TextResourceService.getTranslation("condition", condition.name);
    condition.nameTranslation = conditionTranslation.nameTranslation;
    condition.description = conditionTranslation.description;
  }

  compareModels(c1: Model, c2: Model): number {
    return c1.nameTranslation.localeCompare(c2.nameTranslation);
  }
}
