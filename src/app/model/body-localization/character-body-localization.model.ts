import {BodyLocalization} from "./body-localization.model";

export class CharacterBodyLocalization {
  public bodyLocalization: BodyLocalization;
  public armorPoints: number;
  public brokenArmorPoints: number;

  constructor(bodyLocalization?: BodyLocalization, armorPoints?: number, brokenArmorPoints?: number) {
    this.bodyLocalization = <BodyLocalization>bodyLocalization;
    this.armorPoints = <number>armorPoints;
    this.brokenArmorPoints = <number>brokenArmorPoints;
  }

  static fromJSON(object: Object): CharacterBodyLocalization {
    let characterBodyLocalization = Object.assign(new CharacterBodyLocalization(), object);
    characterBodyLocalization.bodyLocalization = BodyLocalization.fromJSON(characterBodyLocalization['bodyLocalization']);
    return characterBodyLocalization;
  }

  static arrayFromJSON(objectsArray: Object[]): CharacterBodyLocalization[] {
    let bodyLocalizations = [];
    for (let object of objectsArray) {
      let bodyLocalization = CharacterBodyLocalization.fromJSON(object);
      bodyLocalizations.push(bodyLocalization);
    }
    return bodyLocalizations;
  }
}
