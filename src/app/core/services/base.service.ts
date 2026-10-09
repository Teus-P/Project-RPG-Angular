import {environment} from "../../../environments/environment"
import {HttpClient} from "@angular/common/http";
import {Model} from "../model/model";
import {Subject, firstValueFrom} from "rxjs";
import {TextResourceService} from "./text-resource-service/text-resource.service";
import {TextResourceKeys} from "../model/types";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class BaseService {

  url = `${environment.apiUrl}/`

  constructor(private http: HttpClient) {
  }

  async fetchMethod(endpoint: string, resourceType: TextResourceKeys, list: Model[], listChanged?: Subject<Model[]>) {
    const data = await firstValueFrom(this.http.get<Model[]>(this.url + endpoint));
    if (data) {
      this.prepareListTranslation(data, resourceType);
      list.length = 0;
      list.push(...data);
    } else {
      list.length = 0;
    }
    if (listChanged) {
      listChanged.next(list.slice());
    }
  }

  public prepareListTranslation(list: Model[], resourceType: TextResourceKeys): void {
    for (let item of list) {
      const translation = TextResourceService.getTranslation(resourceType, item.name);
      item.nameTranslation = translation.nameTranslation;
      if(translation.description != null) {
        item.description = translation.description;
      }
    }
    list.sort(
      (a, b) => (a.nameTranslation > b.nameTranslation) ? 1 : ((b.nameTranslation > a.nameTranslation) ? -1 : 0)
    )
  }
}
