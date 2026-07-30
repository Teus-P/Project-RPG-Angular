import {Model} from "../model";
import {WeaponQualityValue} from "./weapon-quality-value.model";

export class Weapon extends Model {
  public id: number | null = null;
  public weaponType: Model;
  public weaponGroup: Model;
  public weaponReach: Model;
  public weaponRange: number;
  public isUsingStrength: boolean;
  public isUsingStrengthInRange: boolean;
  public damage: number;
  public weaponQualities: WeaponQualityValue[];
  public price: string;
  public encumbrance: string;
  public availability: Model;
  public isBaseWeapon: boolean;

  constructor(name?: string, nameTranslation?: string, weaponType?: Model, weaponGroup?: Model, reach?: Model, range?: number, isUsingStrength?: boolean, isUsingStrengthInRange?: boolean, damage?: number, qualities?: WeaponQualityValue[], id?: number, price?: string, encumbrance?: string, availability?: Model, isBaseWeapon?: boolean) {
    super(name, nameTranslation)
    this.weaponType = <Model>weaponType
    this.weaponGroup = <Model>weaponGroup
    this.weaponReach = <Model>reach
    this.weaponRange = <number>range
    this.damage = <number>damage
    this.isUsingStrength = <boolean>isUsingStrength
    this.isUsingStrengthInRange = <boolean>isUsingStrengthInRange
    this.weaponQualities = <WeaponQualityValue[]>qualities
    this.id = <number>id
    this.price = <string>price
    this.encumbrance = <string>encumbrance
    this.availability = <Model>availability
    this.isBaseWeapon = <boolean>isBaseWeapon
  }

  static fromJSON(object: Object): Weapon {
    let weapon = Object.assign(new Weapon(), object);
    weapon.weaponType = Model.fromJSON(weapon['weaponType']);
    weapon.weaponGroup = Model.fromJSON(weapon['weaponGroup']);
    weapon.weaponReach = Model.fromJSON(weapon['weaponReach']);
    weapon.weaponQualities = WeaponQualityValue.arrayFromJSON(weapon['weaponQualities']);
    weapon.availability = Model.fromJSON(weapon['availability']);
    return weapon;
  }

  static arrayFromJSON(objectsArray: Object[]): Weapon[] {
    let weapons = [];
    for (let object of objectsArray) {
      let weapon = Weapon.fromJSON(object);
      weapons.push(weapon);
    }
    return weapons;
  }
}
