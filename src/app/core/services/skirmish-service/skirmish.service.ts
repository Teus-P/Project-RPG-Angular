import {environment} from "../../../../environments/environment"
import {Injectable} from '@angular/core'
import {HttpClient} from "@angular/common/http"
import {ReceivedDamage} from "../../model/receive-damage/receive-damage.model"
import {AddConditions} from "../../model/condition/add-conditions.model"
import {SkirmishGroup} from "../../model/skirmish/skirmish-group.model";
import {Subject, firstValueFrom} from "rxjs";

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
    return firstValueFrom(this.http.post(`${environment.apiUrl}/receiveDamage`, receivedDamage))
  }

  async addWoundPoint(skirmishCharacterId: number) {
    await this.postAddWoundPoint(skirmishCharacterId)
  }

  private async postAddWoundPoint(skirmishCharacterId: number) {
    return firstValueFrom(this.http.post(`${environment.apiUrl}/addWoundPoint`, skirmishCharacterId))
  }

  async removeWoundPoint(skirmishCharacterId: number) {
    await this.postRemoveWoundPoint(skirmishCharacterId)
  }

  private async postRemoveWoundPoint(skirmishCharacterId: number) {
    return firstValueFrom(this.http.post(`${environment.apiUrl}/removeWoundPoint`, skirmishCharacterId))
  }

  async addAdvantagePoint(skirmishCharacterId: number) {
    await this.postAddAdvantagePoint(skirmishCharacterId)
  }

  private async postAddAdvantagePoint(skirmishCharacterId: number) {
    return firstValueFrom(this.http.post(`${environment.apiUrl}/addAdvantagePoint`, skirmishCharacterId))
  }

  async removeAdvantagePoint(skirmishCharacterId: number) {
    await this.postRemoveAdvantagePoint(skirmishCharacterId)
  }

  private async postRemoveAdvantagePoint(skirmishCharacterId: number) {
    return firstValueFrom(this.http.post(`${environment.apiUrl}/removeAdvantagePoint`, skirmishCharacterId))
  }

  async addGroupAdvantagePoint(groupId: number) {
    await firstValueFrom(this.http.post(`${environment.apiUrl}/addGroupAdvantagePoint`, groupId))
    await this.fetchSkirmishGroups()
  }

  async removeGroupAdvantagePoint(groupId: number) {
    await firstValueFrom(this.http.post(`${environment.apiUrl}/removeGroupAdvantagePoint`, groupId))
    await this.fetchSkirmishGroups()
  }

  async addConditions(addConditions: AddConditions) {
    return firstValueFrom(this.http.post(`${environment.apiUrl}/addConditions`, addConditions))
  }

  async fetchSkirmishGroups() {
    return firstValueFrom(this.http.get<SkirmishGroup[]>(`${environment.apiUrl}/skirmishGroups`))
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
    const newGroup = await firstValueFrom(this.http.post<SkirmishGroup>(`${environment.apiUrl}/skirmishGroups`, skirmishGroup))
    await this.fetchSkirmishGroups().then()
    return newGroup
  }

  async deleteAllSkirmishGroups() {
    return firstValueFrom(this.http.delete(`${environment.apiUrl}/skirmishGroups`)).then(
      async () => {
        await this.fetchSkirmishGroups().then()
      }
    )
  }

  async changeIsDeadValue(id: number, value: any) {
    const body = {id, value}
    return firstValueFrom(this.http.post(`${environment.apiUrl}/changeIsDeadValue`, body))
  }
}
