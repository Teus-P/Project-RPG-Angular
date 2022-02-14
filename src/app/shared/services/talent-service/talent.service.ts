import {Injectable} from '@angular/core';
import {Subject} from "rxjs";
import {Talent} from "../../../model/talent/talent.model";
import {HttpClient} from "@angular/common/http";
import {tap} from "rxjs/operators";
import {TextResourceService} from "../text-resource-service/text-resource.service";

@Injectable({
  providedIn: 'root'
})
export class TalentService {
  talentListChanged = new Subject<Talent[]>();
  talentList: Talent[] = [];

  constructor(private http: HttpClient) {
  }

  fetchTalent() {
    return this.http.get<Talent[]>('http://localhost:8080/talent').toPromise()
      .then(data => {
          for (let talent of data) {
            talent.nameTranslation = TextResourceService.getTalentNameTranslation(talent.name).nameTranslation;
            this.talentList.push(talent);
          }
          this.talentList.sort(
            (a, b) => (a.nameTranslation > b.nameTranslation) ? 1 : ((b.nameTranslation > a.nameTranslation) ? -1 : 0)
          );
          this.talentListChanged.next(this.talentList.slice());
        });
  }
}
