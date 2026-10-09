import {environment} from "../../../../environments/environment"
import {Injectable} from '@angular/core'
import {Subject, firstValueFrom} from "rxjs"
import {HttpClient} from "@angular/common/http"
import {TranslateService} from "../translate-service/translate.service"
import {Condition} from "../../model/condition/condition.model"

@Injectable({
  providedIn: 'root'
})
export class ConditionService {

  conditionsChanged = new Subject<Condition[]>()
  conditionsList: Condition[] = []

  constructor(private http: HttpClient,
              private translateService: TranslateService) {
  }

  fetchConditions() {
    return firstValueFrom(this.http.get<Condition[]>(`${environment.apiUrl}/condition`))
      .then(data => {
        if (data != null) {
          this.translateService.prepareConditionList(data)
          this.conditionsList = data
        } else {
          this.conditionsList = []
        }
        this.conditionsChanged.next(this.conditionsList.slice())
      })
  }
}
