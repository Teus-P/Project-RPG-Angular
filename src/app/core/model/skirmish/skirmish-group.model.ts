export class SkirmishGroup {
  id!: number;
  name!: string;
  advantages!: number;
  colorR!: number;
  colorG!: number;
  colorB!: number;

  constructor() {
    this.name = '';
    this.advantages = 0;
    this.colorR = 0;
    this.colorG = 0;
    this.colorB = 0;
  }
}
