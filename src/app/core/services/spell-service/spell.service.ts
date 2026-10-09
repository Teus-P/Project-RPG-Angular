import {environment} from "../../../../environments/environment"
import {Injectable} from '@angular/core'
import {Subject, firstValueFrom} from "rxjs"
import {SpellGroup} from "../../model/spell/spell-group.model"
import {HttpClient} from "@angular/common/http"
import {TranslateService} from "../translate-service/translate.service"
import {Spell} from "../../model/spell/spell.model"

@Injectable({
  providedIn: 'root'
})
export class SpellService {

  spellGroupsChanged = new Subject<SpellGroup[]>()
  spellGroups: SpellGroup[] = []

  constructor(private http: HttpClient,
              private translateService: TranslateService) {
  }

  fetchSpells() {
    return firstValueFrom(this.http.get<Spell[]>(`${environment.apiUrl}/spell`))
      .then(data => {
        if (data != null) {
          this.translateService.prepareSpellList(data)
          this.groupSpells(data)
        } else {
          this.spellGroups = []
        }
        this.spellGroupsChanged.next(this.spellGroups.slice())
      })
  }

  groupSpells(spells: Spell[]) {
    this.spellGroups = []
    spells.forEach(spell => {
      let spellGroup = this.spellGroups.find(spellGroup => spellGroup.name === spell.spellGroup.nameTranslation)
      if (spellGroup != undefined) {
        spellGroup.spells.push(spell)
      } else {
        this.spellGroups.push(new SpellGroup(spell.spellGroup.nameTranslation, [spell]))
      }
    })
  }
}
