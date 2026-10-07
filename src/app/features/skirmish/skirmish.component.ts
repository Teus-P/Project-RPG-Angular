import { Component, OnInit } from '@angular/core';
import {TextResourceService} from "../../core/services/text-resource-service/text-resource.service";

@Component({
    selector: 'app-skirmish',
    templateUrl: './skirmish.component.html',
    styleUrls: ['./skirmish.component.css'],
    standalone: false
})
export class SkirmishComponent implements OnInit {

  text = TextResourceService
  isMapTabActive = false

  constructor() { }

  ngOnInit(): void {
  }

}
