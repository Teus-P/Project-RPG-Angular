import {Model} from "../../model";
import {ListModel} from "../../list-model";
import {SkirmishCharacter} from "../../skirmish/skirmish-character.model";

export class WeaponTrait extends Model {

  static fromJSON(object: Object): WeaponTrait {
    return Object.assign(new WeaponTrait(), object);
  }

  static arrayFromJSON(objectsArray: Object[]): WeaponTrait[] {
    let weaponsTraits = [];
    for (let object of objectsArray) {
      let weaponTrait = WeaponTrait.fromJSON(object);
      weaponsTraits.push(weaponTrait);
    }
    return weaponsTraits;
  }
}

export class WeaponTraitsList extends ListModel {
  public static list = [
    new WeaponTrait('Fast', 'Szybka'),
  ]

  static get fast() {
    return <WeaponTrait>this.getListItemByName('Fast');
  }

  static checkIfExist(array: WeaponTrait[], advantage: WeaponTrait) {
    return array.some(({}) => advantage);
  }

  static checkFast(owner: SkirmishCharacter, opponent: SkirmishCharacter) {
    if(this.checkIfExist(owner.usedWeapon.advantages, this.fast)) {
      if (owner.isAttacker) {
        if (opponent.isDodging) {
          opponent.roll.modifier -= 10;
        } else if (!this.checkIfExist(opponent.usedWeapon.advantages, this.fast)) {
          opponent.roll.modifier -= 10;
        }
      }
    }
  }
}
