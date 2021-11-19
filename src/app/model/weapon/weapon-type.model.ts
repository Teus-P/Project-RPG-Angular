import {ListModel} from "../list-model";
import {Skill, SkillsList} from "../skill/skill.model";
import {Model} from "../model";
import {Characteristic} from "../characteristic/characteristic.model";

export class WeaponGroup extends Model {
  public usedSkill: Skill;

  constructor(name?: string, nameTranslation?: string, usedSkill?: Skill) {
    super(name, nameTranslation);
    this.usedSkill = <Skill>usedSkill;
  }

  static fromJSON(object: Object): WeaponGroup {
    let weaponGroup = Object.assign(new WeaponGroup(), object);
    weaponGroup.usedSkill = Characteristic.fromJSON(weaponGroup['usedSkill']);
    return weaponGroup;
  }
}

export class WeaponGroupsList extends ListModel {
  public static list = [
    new WeaponGroup('Basic', 'Podstawowa', SkillsList.meleeBasic),
    new WeaponGroup('Fencing', 'Szermiercza', SkillsList.meleeFencing),
    new WeaponGroup('Crossbow', 'Kusze', SkillsList.rangedCrossbow),
  ]

  static get basic() {
    return <WeaponGroup>this.getListItemByName('Basic');
  }

  static get fencing() {
    return <WeaponGroup>this.getListItemByName('Fencing');
  }

  static get crossbow() {
    return <WeaponGroup>this.getListItemByName('Crossbow');
  }
}
