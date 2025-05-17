import {Model} from "../model";

export class Skill extends Model {
  public isSkirmishSkill: boolean;

  constructor(name?: string, nameTranslation?: string, isSkirmishSkill?: boolean) {
    super(name, nameTranslation);
    this.isSkirmishSkill = <boolean>isSkirmishSkill;
  }

  static fromJSON(object: Object): Skill {
    return Object.assign(new Skill(), object);
  }

  static arrayFromJSON(objectsArray: Object[]): Skill[] {
    let skills = [];
    for (let object of objectsArray) {
      let skill = Skill.fromJSON(object);
      skills.push(skill);
    }
    return skills;
  }
}
