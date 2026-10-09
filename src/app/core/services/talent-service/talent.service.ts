import {environment} from "../../../../environments/environment"
import {Injectable} from '@angular/core'
import {Subject, firstValueFrom} from "rxjs"
import {Talent} from "../../model/talent/talent.model"
import {HttpClient} from "@angular/common/http"
import {TranslateService} from "../translate-service/translate.service"

@Injectable({
  providedIn: 'root'
})
export class TalentService {
  talentListChanged = new Subject<Talent[]>()
  talentList: Talent[] = []

  constructor(private http: HttpClient,
              private translationService: TranslateService) {
  }

  fetchTalents() {
    return firstValueFrom(this.http.get<Talent[]>(`${environment.apiUrl}/talent`))
      .then(data => {
        if (data != null) {
          this.translationService.prepareTalentList(data)
          this.talentList = data
        } else {
          this.talentList = []
        }
        this.talentListChanged.next(this.talentList.slice())
      })
  }
}
