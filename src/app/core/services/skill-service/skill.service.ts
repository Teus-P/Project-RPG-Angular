import {environment} from "../../../../environments/environment"
import {Injectable} from '@angular/core'
import {Subject, firstValueFrom} from "rxjs"
import {HttpClient} from "@angular/common/http"
import {TextResourceService} from "../text-resource-service/text-resource.service"
import {Model} from "../../model/model";

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  skillListChanged = new Subject<Model[]>()
  skillList: Model[] = []

  constructor(private http: HttpClient) {
  }

  fetchSkills() {
    return firstValueFrom(this.http.get<Model[]>(`${environment.apiUrl}/skill`))
      .then(data => {
        if (data != null) {
          for (let skill of data) {
            skill.nameTranslation = TextResourceService.getTranslation("skills", skill.name).nameTranslation
          }
          this.skillList = data
          this.skillList.sort(
            (a, b) => (a.nameTranslation > b.nameTranslation) ? 1 : ((b.nameTranslation > a.nameTranslation) ? -1 : 0)
          )
        } else {
          this.skillList = []
        }
        this.skillListChanged.next(this.skillList.slice())
      })
  }
}
