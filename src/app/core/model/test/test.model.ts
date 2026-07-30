import {SkirmishCharacter} from "../skirmish/skirmish-character.model";
import {Condition} from "../condition/condition.model";
import {Model} from "../model";

export class Test {
  public skirmishCharacter: SkirmishCharacter;
  public skillType: Model;
  public condition: Condition;
  public modifier: number;
  public result: number;
  public isFeasible: boolean;

  constructor(skirmishCharacter?: SkirmishCharacter, skillType?: Model, condition?: Condition, modifier?: number, result?: number, isFeasible?: boolean) {
    this.skirmishCharacter = <SkirmishCharacter>skirmishCharacter;
    this.skillType = <Model>skillType;
    this.condition = <Condition>condition;
    this.modifier = <number>modifier;
    this.result = <number>result;
    this.isFeasible = <boolean>isFeasible;
  }
}
