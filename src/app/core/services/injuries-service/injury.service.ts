import {environment} from "../../../../environments/environment"
import {Injectable} from '@angular/core'
import {Subject, firstValueFrom} from "rxjs"
import {Model} from "../../model/model"
import {HttpClient} from "@angular/common/http"
import {TextResourceService} from "../text-resource-service/text-resource.service"

@Injectable({
  providedIn: 'root'
})
export class InjuryService {

  injuriesChanged = new Subject<Model[]>()
  injuriesList: Model[] = []

  constructor(private http: HttpClient) {
  }

  fetchInjuries() {
    return firstValueFrom(this.http.get<Model[]>(`${environment.apiUrl}/injury`))
      .then(data => {
        if (data != null) {
          this.prepareInjuryNameTranslation(data)
          this.injuriesList = data
        } else {
          this.injuriesList = []
        }
        this.injuriesChanged.next(this.injuriesList.slice())
      })
  }

  private prepareInjuryNameTranslation(data: Model[]) {
    for (let injury of data) {
      let injuryTranslation = TextResourceService.getTranslation("injury", injury.name);
      injury.nameTranslation = injuryTranslation.nameTranslation;
      injury.description = injuryTranslation.description;
    }
  }
}
