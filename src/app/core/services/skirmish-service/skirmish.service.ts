import {Injectable} from '@angular/core'
import {HttpClient} from "@angular/common/http"
import {ReceivedDamage} from "../../model/receive-damage/receive-damage.model"
import {CharacterBodyLocalization} from "../../model/body-localization/character-body-localization.model"
import {AddConditions} from "../../model/condition/add-conditions.model"
import {SkirmishGroup} from "../../model/skirmish/skirmish-group.model";
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SkirmishService {

  skirmishGroupsList: SkirmishGroup[] = [];
  skirmishGroupsChanged = new Subject<SkirmishGroup[]>()

  constructor(private http: HttpClient) {
  }

  async receiveDamage(receivedDamage: ReceivedDamage) {
    await this.postReceiveDamage(receivedDamage)
  }

  postReceiveDamage(receivedDamage: ReceivedDamage) {
    return this.http.post('http://localhost:8080/receiveDamage', receivedDamage).toPromise().then()
  }

  async addAdvantagePoint(skirmishCharacterId: number) {
    await this.postAddAdvantagePoint(skirmishCharacterId)
  }

  private async postAddAdvantagePoint(skirmishCharacterId: number) {
    return this.http.post('http://localhost:8080/addAdvantagePoint', skirmishCharacterId).toPromise().then()
  }

  async removeAdvantagePoint(skirmishCharacterId: number) {
    await this.postRemoveAdvantagePoint(skirmishCharacterId)
  }

  private async postRemoveAdvantagePoint(skirmishCharacterId: number) {
    return this.http.post('http://localhost:8080/removeAdvantagePoint', skirmishCharacterId).toPromise().then()
  }

  async addGroupAdvantagePoint(groupId: number) {
    await this.http.post('http://localhost:8080/addGroupAdvantagePoint', groupId).toPromise()
    await this.fetchSkirmishGroups()
  }

  async removeGroupAdvantagePoint(groupId: number) {
    await this.http.post('http://localhost:8080/removeGroupAdvantagePoint', groupId).toPromise()
    await this.fetchSkirmishGroups()
  }

  async addAdditionalArmorPoint(bodyLocalization: CharacterBodyLocalization) {
    await this.postAddAdditionalArmorPoint(bodyLocalization)
  }

  private async postAddAdditionalArmorPoint(bodyLocalization: CharacterBodyLocalization) {
    return this.http.post('http://localhost:8080/addAdditionalArmorPoint', bodyLocalization).toPromise().then()
  }

  async removeAdditionalArmorPoint(bodyLocalization: CharacterBodyLocalization) {
    await this.postRemoveAdditionalArmorPoint(bodyLocalization)
  }

  private async postRemoveAdditionalArmorPoint(bodyLocalization: CharacterBodyLocalization) {
    return this.http.post('http://localhost:8080/removeAdditionalArmorPoint', bodyLocalization).toPromise().then()
  }

  async addConditions(addConditions: AddConditions) {
    return this.http.post('http://localhost:8080/addConditions', addConditions).toPromise().then()
  }

  async fetchSkirmishGroups() {
    return this.http.get<SkirmishGroup[]>('http://localhost:8080/skirmishGroups').toPromise()
      .then(data => {
        if (data != null) {
          this.skirmishGroupsList = data
        } else {
          this.skirmishGroupsList = []
        }
        this.skirmishGroupsChanged.next(this.skirmishGroupsList.slice())
      })
  }

  async addSkirmishGroup(skirmishGroup: SkirmishGroup) {
    const newGroup= await this.http.post<SkirmishGroup>('http://localhost:8080/skirmishGroups', skirmishGroup).toPromise()
    await this.fetchSkirmishGroups().then()
    return newGroup
  }

  async deleteAllSkirmishGroups() {
    return this.http.delete('http://localhost:8080/skirmishGroups').toPromise().then(
      async () => {
        await this.fetchSkirmishGroups().then()
      }
    )
  }
}
