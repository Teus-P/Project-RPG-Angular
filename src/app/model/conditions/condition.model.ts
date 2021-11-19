import {Model} from "../model";

export class Condition {
  base: Model;
  value: number;

  constructor(model?: Model, value?: number) {
    this.base = <Model>model
    this.value = <number>value;
  }

  static fromJSON(object: Object): Condition {
    let condition = Object.assign(new Condition(), object);
    condition.base = Model.fromJSON(condition['base']);
    return condition;
  }

  static arrayFromJSON(objectsArray: Object[]): Condition[] {
    let conditions = [];
    for (let object of objectsArray) {
      let condition = Condition.fromJSON(object);
      conditions.push(condition);
    }
    return conditions;
  }
}
