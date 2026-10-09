import {environment} from "../../../../environments/environment"
import {Injectable} from '@angular/core'
import {Subject, firstValueFrom} from "rxjs"
import {HttpClient} from "@angular/common/http"
import {TranslateService} from "../translate-service/translate.service"
import {Trait} from "../../model/trait/trait.model"

@Injectable({
  providedIn: 'root'
})
export class TraitService {

  traitListChanged = new Subject<Trait[]>()
  traitList: Trait[] = []

  constructor(private http: HttpClient,
              private translationService: TranslateService) {
  }

  fetchTraits() {
    return firstValueFrom(this.http.get<Trait[]>(`${environment.apiUrl}/creatureTrait`))
      .then(data => {
        if (data != null) {
          for (let trait of data) {
            this.translationService.prepareTrait(trait)
          }
          this.traitList = data
          this.traitList.sort(
            (a, b) => (a.nameTranslation > b.nameTranslation) ? 1 : ((b.nameTranslation > a.nameTranslation) ? -1 : 0)
          )
        } else {
          this.traitList = []
        }
        this.traitListChanged.next(this.traitList.slice())
      })
  }
}
