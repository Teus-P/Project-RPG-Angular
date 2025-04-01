import {Injectable} from '@angular/core'
import {HttpClient} from "@angular/common/http"
import {Subject} from "rxjs"
import {Weapon} from "../../model/weapon/weapon.model"
import {Model} from "../../model/model"
import {TranslateService} from "../translate-service/translate.service"
import {WeaponGroup} from "../../model/weapon/weapon-group.model"
import {BaseService} from "../base.service";
import {TextResourceKeys} from "../../model/types";

@Injectable({
  providedIn: 'root'
})
export class WeaponService {
  weaponTypesListChanged = new Subject<Model[]>()
  weaponTypesList: Model[] = []
  weaponGroupsListChanged = new Subject<Model[]>()
  weaponGroupsList: Model[] = []
  weaponReachesListChanged = new Subject<Model[]>()
  weaponReachesList: Model[] = []
  weaponQualitiesListChanged = new Subject<Model[]>()
  weaponQualitiesList: Model[] = []

  weaponGroupsChanged = new Subject<WeaponGroup[]>()
  weaponGroups: WeaponGroup[] = []
  weaponsList: Weapon[] = []

  constructor(private http: HttpClient,
              private translateService: TranslateService,
              private baseService: BaseService) {
  }

  fetchWeapons() {
    return this.http.get<Weapon[]>('http://localhost:8080/weapon').toPromise()
      .then(data => {
        if (data != null) {
          this.prepareWeaponsList(data)
          this.groupWeapons(data)
          this.weaponsList = data
        } else {
          this.weaponsList = []
          this.weaponGroups = []
        }
        this.weaponGroupsChanged.next(this.weaponGroups.slice())
        localStorage.setItem('weapons', JSON.stringify(this.weaponsList))
        localStorage.setItem('weaponGroups', JSON.stringify(this.weaponGroups))
      })
  }

  public prepareWeaponsList(weapons: Weapon[]) {
    for (let weapon of weapons) {
      this.translateService.prepareWeaponTranslation(weapon)
    }
    weapons.sort(
      (a, b) => (a.weaponGroup > b.weaponGroup) ? 1 : ((b.weaponGroup > a.weaponGroup) ? -1 : 0)
    )
  }

  groupWeapons(weapons: Weapon[]) {
    this.weaponGroups = []
    weapons.forEach(weapon => {
      let weaponGroup = this.weaponGroups.find(weaponGroup => weaponGroup.name === weapon.weaponGroup.nameTranslation)
      if (weaponGroup != undefined) {
        weaponGroup.weapons.push(weapon)
        weaponGroup.type = weapon.weaponType.nameTranslation
      } else {
        this.weaponGroups.push(new WeaponGroup(weapon.weaponGroup.nameTranslation, [weapon], weapon.weaponType.nameTranslation))
      }
    })

    this.weaponGroups.forEach(weaponGroup => {
      weaponGroup.weapons.sort(
        (a, b) => (a.nameTranslation > b.nameTranslation) ? 1 : ((b.nameTranslation > a.nameTranslation) ? -1 : 0)
      )
    })

    this.weaponGroups.sort((a, b) => a.name.localeCompare(b.name));
  }

  async storeWeapon(weapon: Weapon) {
    await this.putWeapon(weapon).then(
      async () => {
        await this.fetchWeapons().then()
      }
    )
  }

  putWeapon(weapon: Weapon) {
    return this.http
      .put('http://localhost:8080/weapon', weapon)
      .toPromise()
  }

  getWeaponGroups() {
    this.weaponGroups = WeaponGroup.arrayFromJSON(JSON.parse(<string>localStorage.getItem('weaponGroups')))
    return this.weaponGroups.slice();
  }

  fetchWeaponTypes() {
    return this.baseService.fetchMethod('weaponType', <TextResourceKeys>'weaponType',
      this.weaponTypesList, this.weaponTypesListChanged)
  }

  fetchWeaponGroups() {
    return this.baseService.fetchMethod('weaponGroup', <TextResourceKeys>'weaponGroup',
      this.weaponGroupsList, this.weaponGroupsListChanged)
  }

  fetchWeaponReaches() {
    return this.baseService.fetchMethod('weaponReach', <TextResourceKeys>'weaponReach',
      this.weaponReachesList, this.weaponReachesListChanged)
  }

  fetchWeaponQualities() {
    return this.baseService.fetchMethod('weaponQuality', <TextResourceKeys>'weaponQualities',
      this.weaponQualitiesList, this.weaponQualitiesListChanged)
  }

  async removeWeapon(id: number) {
    await this.deleteWeapon(id).then(
      async () => {
        await this.fetchWeapons().then()
      }
    )
  }

  private deleteWeapon(id: number) {
    return this.http
      .delete(`http://localhost:8080/weapon/${id}`)
      .toPromise()
  }
}
