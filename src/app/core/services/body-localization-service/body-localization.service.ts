import {environment} from "../../../../environments/environment"
import {Injectable} from '@angular/core'
import {Subject, firstValueFrom} from "rxjs"
import {BodyLocalization} from "../../model/body-localization/body-localization.model"
import {HttpClient} from "@angular/common/http"
import {TextResourceService} from "../text-resource-service/text-resource.service"

@Injectable({
  providedIn: 'root'
})
export class BodyLocalizationService {
  bodyLocalizationsChanged = new Subject<BodyLocalization[]>()
  bodyLocalizationsList: BodyLocalization[] = []

  constructor(private http: HttpClient) {
  }

  fetchBodyLocalizations() {
    return firstValueFrom(this.http.get<BodyLocalization[]>(`${environment.apiUrl}/bodyLocalization`))
      .then(data => {
        if (data != null) {
          this.prepareBodyLocalizationTranslation(data)
          this.bodyLocalizationsList = data
        } else {
          this.bodyLocalizationsList = []
        }
        this.bodyLocalizationsChanged.next(this.bodyLocalizationsList.slice())
      })
  }

  private prepareBodyLocalizationTranslation(bodyLocalizations: BodyLocalization[]) {
    for (let bodyLocalization of bodyLocalizations) {
      bodyLocalization.nameTranslation = TextResourceService.getTranslation("bodyLocalizations", bodyLocalization.name).nameTranslation
    }
  }
}
