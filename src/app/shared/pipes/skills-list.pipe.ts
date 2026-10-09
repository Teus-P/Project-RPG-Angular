import {Pipe, PipeTransform} from '@angular/core'
import {Character} from "../../core/model/character/character.model"
import {ValueModel} from "../../core/model/value-model"
import {Skill} from "../../core/model/skill/skill.model"

@Pipe({name: 'skillsList', standalone: true})
export class SkillsListPipe implements PipeTransform {

  transform(character: Character, onlySkirmishSkills: boolean): ValueModel<Skill>[] {
    return character.getSkillsList(onlySkirmishSkills)
  }
}
