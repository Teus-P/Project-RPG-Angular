import {environment} from "../../../../environments/environment"
import {Injectable} from '@angular/core'
import {HttpClient} from "@angular/common/http"
import {Armor} from "../../model/armor/armor.model"
import {Subject, firstValueFrom} from "rxjs"
import {Model} from "../../model/model"
import {TranslateService} from "../translate-service/translate.service"
import {tap} from "rxjs/operators";
import {BaseService} from "../base.service";
import {TextResourceKeys} from "../../model/types";
import {ArmorGroup} from "../../model/armor/armor-group.model";

@Injectable({
  providedIn: 'root'
})
export class ArmorService {
  armorsListChanged = new Subject<Armor[]>()
  armorsList: Armor[] = []
  armorCategoriesListChanged = new Subject<Model[]>()
  armorCategoriesList: Model[] = []
  armorPenaltiesListChanged = new Subject<Model[]>()
  armorPenaltiesList: Model[] = []
  armorQualitiesListChanged = new Subject<Model[]>()
  armorQualitiesList: Model[] = []
  armorTypesList: Model[] = []

  armorsGroupsChanged = new Subject<ArmorGroup[]>()
  armorsGroups: ArmorGroup[] = []

  constructor(private http: HttpClient,
              private translateService: TranslateService,
              private baseService: BaseService) {
  }

  fetchArmors() {
    return firstValueFrom(this.http.get<Armor[]>(`${environment.apiUrl}/armor`).pipe(
      tap(data => {
        if (data) {
          this.translateService.prepareArmorsList(data);
          this.groupArmors(data)
          this.armorsList = data;
        } else {
          this.armorsList = [];
        }
        this.armorsListChanged.next(this.armorsList.slice());
        this.armorsGroupsChanged.next(this.armorsGroups.slice());
      })
    ));
  }

  async storeArmor(armor: Armor) {
    await firstValueFrom(this.putArmor(armor));
    await this.fetchArmors();
  }

  putArmor(armor: Armor) {
    return this.http.put(`${environment.apiUrl}/armor`, armor)
  }

  private groupArmors(armors: Armor[]) {
    this.armorsGroups = []
    armors.forEach(armor => {
      let armorGroup = this.armorsGroups.find(armorGroup => armorGroup.name === armor.armorCategory.nameTranslation)
      if (armorGroup != undefined) {
        armorGroup.armors.push(armor);
      } else {
        this.armorsGroups.push(new ArmorGroup(armor.armorCategory.nameTranslation, [armor]))
      }
    })

    this.armorsGroups.forEach(armorGroup => {
      armorGroup.armors.sort(
        (a, b) => (a.nameTranslation > b.nameTranslation) ? 1 : ((b.nameTranslation > a.nameTranslation) ? -1 : 0)
      );
    })

    this.armorsGroups.sort((a, b) => a.name.localeCompare(b.name))
  }

  async fetchArmorCategories() {
    return this.baseService.fetchMethod('armorCategory', <TextResourceKeys>'armorCategory',
      this.armorCategoriesList, this.armorCategoriesListChanged)
  }

  fetchArmorPenalties() {
    return this.baseService.fetchMethod('armorPenalty', <TextResourceKeys>'armorPenalties',
      this.armorPenaltiesList, this.armorPenaltiesListChanged)
  }

  fetchArmorQualities() {
    return this.baseService.fetchMethod('armorQuality', <TextResourceKeys>'armorQualities',
      this.armorQualitiesList, this.armorQualitiesListChanged)
  }

  fetchArmorTypes() {
    return this.baseService.fetchMethod('armorType', <TextResourceKeys>'armorType', this.armorTypesList)
  }

  async removeArmor(id: number) {
    await this.deleteArmor(id).then(
      async () => {
        await this.fetchArmors().then()
      }
    )
  }

  private deleteArmor(id: number) {
    return firstValueFrom(this.http
      .delete(`${environment.apiUrl}/armor/${id}`))
  }
}
