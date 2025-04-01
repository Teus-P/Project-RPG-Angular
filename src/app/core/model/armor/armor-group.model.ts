import {Armor} from "./armor.model";

export class ArmorGroup {
  public name: string;
  public armors: Armor[];

  constructor(name?: string, armors?: Armor[]) {
    this.name = <string>name;
    this.armors = <Armor[]>armors;
  }

  static fromJSON(object: Object): ArmorGroup {
    let armorGroup = Object.assign(new ArmorGroup(), object);
    armorGroup.armors = Armor.arrayFromJSON(armorGroup['armors'])
    return armorGroup;
  }

  static arrayFromJson(objectsArray: Object[]): ArmorGroup[] {
    let armorGroups = []
    for (let object of objectsArray) {
      let armorGroup = ArmorGroup.fromJSON(object);
      armorGroups.push(armorGroup);
    }
    return armorGroups;
  }
}
