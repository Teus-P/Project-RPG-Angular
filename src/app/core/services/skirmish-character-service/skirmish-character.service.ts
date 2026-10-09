import {environment} from "../../../../environments/environment"
import {Injectable} from '@angular/core'
import {Subject, firstValueFrom} from "rxjs"
import {SkirmishCharacter} from "../../model/skirmish/skirmish-character.model"
import {HttpClient} from "@angular/common/http"
import {TranslateService} from "../translate-service/translate.service"
import {Character} from "../../model/character/character.model";
import {SkirmishGroup} from "../../model/skirmish/skirmish-group.model";

@Injectable({
  providedIn: 'root'
})
export class SkirmishCharacterService {

  skirmishCharactersChanged = new Subject<SkirmishCharacter[]>()
  skirmishCharactersList: SkirmishCharacter[]

  constructor(private http: HttpClient,
              private translateService: TranslateService) {
    if (JSON.parse(<string>localStorage.getItem('skirmishCharacters')) == null) {
      this.skirmishCharactersList = []
      localStorage.setItem('skirmishCharacters', JSON.stringify(this.skirmishCharactersList))
    } else {
      this.skirmishCharactersList = this.getSkirmishCharacters()
    }
  }

  getSkirmishCharacters() {
    this.skirmishCharactersList = SkirmishCharacter.arrayFromJSON(JSON.parse(<string>localStorage.getItem('skirmishCharacters')))
    return this.skirmishCharactersList.slice()
  }

  getSkirmishCharacter(id: number) {
    this.skirmishCharactersList = SkirmishCharacter.arrayFromJSON(<SkirmishCharacter[]>JSON.parse(<string>localStorage.getItem('skirmishCharacters')))
    return <SkirmishCharacter>this.skirmishCharactersList.find(skirmishCharacter => skirmishCharacter.id == id)
  }

  fetchSkirmishCharacter() {
    return firstValueFrom(this.http.get<SkirmishCharacter[]>(`${environment.apiUrl}/skirmishCharacter`))
      .then(data => {
        this.skirmishCharactersList = []
        if (data != null) {
          for (let dataSkirmishCharacter of data) {
            let skirmishCharacter = SkirmishCharacter.fromJSON(dataSkirmishCharacter)
            this.translateService.prepareCharacter(skirmishCharacter.character)
            this.skirmishCharactersList.push(skirmishCharacter)
          }
        }
        localStorage.setItem('skirmishCharacters', JSON.stringify(this.skirmishCharactersList))
        this.skirmishCharactersChanged.next(this.skirmishCharactersList.slice())
      })
  }

  private putSkirmishCharacter(skirmishCharacter: SkirmishCharacter) {
    return firstValueFrom(this.http
      .put(`${environment.apiUrl}/skirmishCharacter`, skirmishCharacter))
  }

  async storeSkirmishCharactersGroup(characters: Character[], skirmishGroup: SkirmishGroup, number: number) {
    let skirmishCharacters: SkirmishCharacter[] = []

    if (number > 1) {
      for (let i = 0; i < number; i++) {
        skirmishCharacters.push(this.createSkirmishCharacter(characters[0], skirmishGroup, i));
      }
    } else {
      characters.forEach(character => {
        skirmishCharacters.push(this.createSkirmishCharacter(character, skirmishGroup, 0));
      })
    }

    await this.updateSkirmishCharacters(skirmishCharacters);
  }

  private createSkirmishCharacter(character: Character, skirmishGroup: SkirmishGroup, sequenceNumber: number) {
    let clonedCharacter = character.clone()
    clonedCharacter.id = null
    let newSkirmishCharacter: SkirmishCharacter = new SkirmishCharacter(clonedCharacter)
    let numberOfSameCharacters = this.skirmishCharactersList.filter(skirmishCharacter => skirmishCharacter.character.name.includes(newSkirmishCharacter.character.name)).length

    if (sequenceNumber > 0) {
      newSkirmishCharacter.sequenceNumber = numberOfSameCharacters + sequenceNumber + 1
    } else {
      newSkirmishCharacter.sequenceNumber = numberOfSameCharacters + 1
    }

    newSkirmishCharacter.skirmishGroup = skirmishGroup
    return newSkirmishCharacter;
  }

  public async updateSkirmishCharacters(skirmishCharacters: SkirmishCharacter[]) {
    await this.putSkirmishCharacters(skirmishCharacters).then(
      async () => {
        await this.fetchSkirmishCharacter().then()
      }
    )
  }

  private putSkirmishCharacters(skirmishCharacters: SkirmishCharacter[]) {
    return firstValueFrom(this.http
      .put(`${environment.apiUrl}/skirmishCharacters`, skirmishCharacters))
  }

  async updateSkirmishCharacter(skirmishCharacter: SkirmishCharacter) {

    if (skirmishCharacter.id == null) {
      throw new Error("Cannot update a character without an id.");
    }

    this.skirmishCharactersList[this.getCharacterIndexById(skirmishCharacter.id)] = skirmishCharacter
    this.skirmishCharactersChanged.next(this.skirmishCharactersList.slice())
    await this.putSkirmishCharacter(skirmishCharacter).then(
      async () => {
        await this.fetchSkirmishCharacter().then()
      }
    )
  }

  private getCharacterIndexById(id: number) {
    let characterInArray = this.skirmishCharactersList.find(skirmishCharacter => skirmishCharacter.id == id)
    return this.skirmishCharactersList.indexOf(<SkirmishCharacter>characterInArray)
  }

  async removeSkirmishCharacter(id: number) {
    await this.deleteSkirmishCharacter(id).then(
      async () => {
        await this.fetchSkirmishCharacter().then()
      }
    )
  }

  private deleteSkirmishCharacter(id: number) {
    return firstValueFrom(this.http
      .delete(`${environment.apiUrl}/skirmishCharacter/${id}`))
  }

  async removeAllSkirmishCharacters() {
    await this.deleteAllSkirmishCharacters().then(
      async () => {
        await this.fetchSkirmishCharacter().then()
      }
    )
  }

  private deleteAllSkirmishCharacters() {
    return firstValueFrom(this.http
      .delete(`${environment.apiUrl}/skirmishCharacter`))
  }

  async reloadSkirmishCharacter(id: number) {
    await this.fetchSkirmishCharacter()
    return this.getSkirmishCharacter(id)
  }
}
