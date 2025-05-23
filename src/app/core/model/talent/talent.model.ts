import {Model} from "../model";

export class Talent extends Model {
  public maxLevel: string;
  public isSkirmishTalent: boolean;
  public hasSpecialisation: boolean;

  constructor(name?: string, nameTranslation?: string, maxLevel?: string, isSkirmishTalent?: boolean, hasSpecialisation?: boolean) {
    super(name, nameTranslation);
    this.maxLevel = <string>maxLevel;
    this.isSkirmishTalent = <boolean>isSkirmishTalent;
    this.hasSpecialisation = <boolean>hasSpecialisation;
  }

  static fromJSON(object: Object): Talent {
    return Object.assign(new Talent(), object);
  }

  static arrayFromJSON(objectsArray: Object[]): Talent[] {
    let talents = [];
    for (let object of objectsArray) {
      let talent = Talent.fromJSON(object);
      talents.push(talent);
    }
    return talents;
  }
}
