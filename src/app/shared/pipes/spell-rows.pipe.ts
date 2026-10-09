import {Pipe, PipeTransform} from '@angular/core'
import {Spell} from "../../core/model/spell/spell.model"

export interface SpellGroupRow {
  name: string
  isGroup: boolean
}

@Pipe({name: 'spellRows', standalone: true})
export class SpellRowsPipe implements PipeTransform {

  transform(spells: Spell[]): (Spell | SpellGroupRow)[] {
    const sortedSpells = [...spells].sort(
      (a, b) => a.spellGroup.nameTranslation!.localeCompare(b.spellGroup.nameTranslation!)
    )

    const rows: (Spell | SpellGroupRow)[] = []
    let currentGroupName = ''

    for (const spell of sortedSpells) {
      const groupName = spell.spellGroup.nameTranslation!
      if (groupName !== currentGroupName) {
        rows.push({isGroup: true, name: groupName})
        currentGroupName = groupName
      }
      rows.push(spell)
    }

    return rows
  }
}
