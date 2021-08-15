import {AttackType} from "./attack-type.model";
import {AttacksCategoryList} from "./attacks-category-list.model";

export class AttacksTypeList {
  public static attacksTypeList = [
    new AttackType('BasicAttack', 'Zwykły atak', AttacksCategoryList.getAttacksCategoryByName('RangedAttack')),
    new AttackType('BasicAttack', 'Zwykły atak', AttacksCategoryList.getAttacksCategoryByName('MeleeAttack')),
    new AttackType('TestAttack', 'Atak testowy', AttacksCategoryList.getAttacksCategoryByName('MeleeAttack')),
  ]
}