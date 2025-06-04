import {Injectable} from '@angular/core'
import {Character} from "../../model/character/character.model"
import {Subject} from "rxjs"
import {HttpClient} from "@angular/common/http"
import {TranslateService} from "../translate-service/translate.service"

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  charactersChanged = new Subject<Character[]>()
  charactersList: Character[] = []

  constructor(private http: HttpClient,
              public translateService: TranslateService) {
    if (JSON.parse(<string>localStorage.getItem('characters')) == null) {
      this.charactersList = []
      localStorage.setItem('characters', JSON.stringify(this.charactersList))
    } else {
      this.charactersList = this.getCharacters()
    }
  }

  async fetchCharacters() {
    const data = await this.http.get<Character[]>('http://localhost:8080/character').toPromise()
    this.charactersList = []
    if (data != null) {
      for (let element of data) {
        let character = Character.fromJSON(element)
        this.translateService.prepareCharacter(character)
        this.charactersList.push(character)
      }
    }
    localStorage.setItem('characters', JSON.stringify(this.charactersList))
    this.charactersChanged.next(this.charactersList.slice())
  }

  async storeCharacter(character: Character) {
    await this.putCharacter(character).then(data => {
        if (data != null) {
          let newCharacter = Character.fromJSON(data)
          this.translateService.prepareCharacter(newCharacter)
          this.charactersList.find(character => character.id == newCharacter.id)
          const index = this.charactersList.findIndex(character => character.id == newCharacter.id)

          if (index !== -1) {
            this.charactersList[index] = newCharacter
          } else {
            this.charactersList.push(newCharacter)
          }

          localStorage.setItem('characters', JSON.stringify(this.charactersList))
          this.charactersChanged.next(this.charactersList)
        }
      }
    )
  }

  private putCharacter(character: Character) {
    return this.http
      .put<Character>('http://localhost:8080/character', character)
      .toPromise()
  }

  async removeCharacter(id: number) {
    await this.deleteCharacter(id).then(
      async () => {
        await this.fetchCharacters().then()
      }
    )
  }

  private deleteCharacter(id: number) {
    return this.http
      .delete(`http://localhost:8080/character/${id}`)
      .toPromise()
  }

  getCharacters() {
    this.charactersList = Character.arrayFromJSON(JSON.parse(<string>localStorage.getItem('characters')))
    return this.charactersList.slice()
  }

  getCharacter(id: number): Character {
    this.charactersList = Character.arrayFromJSON(JSON.parse(<string>localStorage.getItem('characters')))
    return <Character>this.charactersList.find(value => value.id == id)
  }

  getCharacterGroupsTypes() {
    return this.createCharacterGroupsTypes()
  }

  private createCharacterGroupsTypes() {
    const groupsTypes: { name: string, groups: { name: string, characters: Character[] }[] }[] = []

    this.charactersList.filter(character => character.type === 'BASE').forEach(character => {
      let isTypeExist = false
      for (let groupType of groupsTypes) {
        let isGroupExist = false
        if (groupType.name === character.groupType) {
          for (let group of groupType.groups) {
            if (group.name === character.group) {
              group.characters.push(character)
              isGroupExist = true
              break
            }
          }

          if (!isGroupExist) {
            groupType.groups.push({name: character.group, characters: [character]})
          }
          isTypeExist = true
          break
        }
      }

      if (!isTypeExist) {
        groupsTypes.push({name: character.groupType, groups: [{name: character.group, characters: [character]}]})
      }
    })

    groupsTypes.forEach(groupType => {
      groupType.groups.sort(
        (a, b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0)
      )
    })

    return groupsTypes
  }

  async reloadCharacter(id: number) {
    return this.getCharacter(id)
  }
}
