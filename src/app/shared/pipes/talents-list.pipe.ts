import {Pipe, PipeTransform} from '@angular/core'
import {Character} from "../../core/model/character/character.model"
import {ValueModel} from "../../core/model/value-model"
import {Talent} from "../../core/model/talent/talent.model"

@Pipe({name: 'talentsList', standalone: true})
export class TalentsListPipe implements PipeTransform {

  transform(character: Character, onlySkirmishTalents: boolean): ValueModel<Talent>[] {
    return character.getTalentsList(onlySkirmishTalents)
  }
}
