import {CharacterCharacteristic} from "../characteristic/character-characteristic.model"
import {CharacterWeapon} from "../weapon/character-weapon.model"
import {CharacterBodyLocalization} from "../body-localization/character-body-localization.model"
import {CharacterCondition} from "../condition/character-condition.model"
import {Spell} from "../spell/spell.model"
import {Note} from "../note/note.model";
import {ValueModel} from "../value-model";
import {Talent} from "../talent/talent.model";
import {Trait} from "../trait/trait.model";
import {Model} from "../model";
import {CharacterArmor} from "../armor/character-armor.model";
import {Skill} from "../skill/skill.model";

export class Character {
  id!: number
  name!: string
  description!: string
  groupType!: string
  group!: string
  status!: string
  characteristics!: CharacterCharacteristic[]
  skills!: ValueModel<Skill>[]
  talents!: ValueModel<Talent>[]
  traits!: ValueModel<Trait>[]
  isRightHanded!: boolean
  weapons!: CharacterWeapon[]
  armors!: CharacterArmor[]
  bodyLocalizations!: CharacterBodyLocalization[]
  conditions!: CharacterCondition[]
  notes!: Note[]
  spells!: Spell[]
  type!: string

  constructor(name?: string, description?: string, groupType?: string, group?: string, status?: string, characteristics?: CharacterCharacteristic[], skills?: ValueModel<Model>[], talents?: ValueModel<Talent>[], traits?: ValueModel<Trait>[], rightHanded?: boolean, weapons?: CharacterWeapon[], armor?: CharacterArmor[], conditions?: CharacterCondition[], notes?: Note[], spells?: Spell[], bodyLocalizations?: CharacterBodyLocalization[]) {
    this.name = <string>name
    this.description = <string>description
    this.groupType = <string>groupType
    this.group = <string>group
    this.characteristics = <CharacterCharacteristic[]>characteristics
    this.skills = <ValueModel<Skill>[]>skills
    this.talents = <ValueModel<Talent>[]>talents
    this.traits = <ValueModel<Trait>[]>traits
    this.isRightHanded = <boolean>rightHanded
    this.weapons = <CharacterWeapon[]>weapons
    this.armors = <CharacterArmor[]>armor
    this.bodyLocalizations = <CharacterBodyLocalization[]>bodyLocalizations
    this.conditions = <CharacterCondition[]>conditions
    this.notes = <Note[]>notes
    this.spells = <Spell[]>spells
    this.status = <string>status
  }

  clone(): Character {
    return Object.assign(new Character(), this)
  }

  clearIds() {
    this.characteristics.forEach(value => value.id = 0)
    this.bodyLocalizations.forEach(value => value.id = 0)
    this.skills.forEach(value => value.id = 0)
    this.talents.forEach(value => value.id = 0)
    this.traits.forEach(value => value.id = 0)
    this.weapons.forEach(value => value.id = 0)
    this.conditions.forEach(value => value.id = 0)
    this.notes.forEach(value => value.id = 0)
  }

  getCharacteristic(name: string): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == name)
  }

  get movement(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'MOVEMENT')
  }

  get weaponSkill(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'WEAPON_SKILL')
  }

  get ballisticSkill(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'BALLISTIC_SKILL')
  }

  get strength(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'STRENGTH')
  }

  get toughness(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'TOUGHNESS')
  }

  get initiative(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'INITIATIVE')
  }

  get agility(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'AGILITY')
  }

  get dexterity(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'DEXTERITY')
  }

  get intelligence(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'INTELLIGENCE')
  }

  get willpower(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'WILLPOWER')
  }

  get fellowship(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'FELLOWSHIP')
  }

  get wounds(): CharacterCharacteristic {
    return <CharacterCharacteristic>this.characteristics.find(x => x.characteristic.name == 'WOUNDS')
  }

  getSkillsList(onlySkirmishSkills: boolean): ValueModel<Skill>[] {
    if (onlySkirmishSkills)
      return this.skills.filter(skill => skill.model.isSkirmishSkill);
    return this.skills;
  }

  getTalentsList(onlySkirmishTalents: boolean): ValueModel<Talent>[] {
    if (onlySkirmishTalents)
      return this.talents.filter(talent => talent.model.isSkirmishTalent);
    return this.talents;
  }

  static fromJSON(object: Object): Character {
    let character = Object.assign(new Character(), object)
    character.characteristics = CharacterCharacteristic.arrayFromJSON(character['characteristics'])
    character.skills = ValueModel.arrayFromJSON<Skill>(character["skills"], Skill)
    character.talents = ValueModel.arrayFromJSON<Talent>(character["talents"], Talent)
    character.traits = ValueModel.arrayFromJSON<Trait>(character["traits"], Trait)
    character.weapons = CharacterWeapon.arrayFromJSON(character['weapons'])
    character.armors = CharacterArmor.arrayFromJSON(character['armors'])
    character.bodyLocalizations = CharacterBodyLocalization.arrayFromJSON(character['bodyLocalizations'])
    character.conditions = CharacterCondition.arrayFromJSON(character['conditions'])
    character.spells = Spell.arrayFromJSON(character['spells'])
    character.notes = Note.arrayFromJSON(character['notes'])
    return character
  }

  static arrayFromJSON(objectsArray: Object[]): Character[] {
    let characters = []
    for (let object of objectsArray) {
      let character = Character.fromJSON(object)
      characters.push(character)
    }
    return characters
  }
}
