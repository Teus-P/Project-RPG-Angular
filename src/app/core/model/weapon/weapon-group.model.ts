import {Weapon} from "./weapon.model"

export class WeaponGroup {
  public name: string
  public type: string
  public weapons: Weapon[]

  constructor(group?: string, weapon?: Weapon[], type?: string) {
    this.name = <string>group
    this.weapons = <Weapon[]>weapon
    this.type = <string>type
  }

  static fromJSON(object: Object): WeaponGroup {
    let weaponGroup = Object.assign(new WeaponGroup(), object)
    weaponGroup.weapons = Weapon.arrayFromJSON(weaponGroup['weapons'])
    return weaponGroup
  }

  static arrayFromJSON(objectsArray: Object[]): WeaponGroup[] {
    let weaponGroups = []
    for (let object of objectsArray) {
      let weaponGroup = WeaponGroup.fromJSON(object)
      weaponGroups.push(weaponGroup)
    }
    return weaponGroups
  }
}
