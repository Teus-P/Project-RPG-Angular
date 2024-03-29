import {Component} from '@angular/core'
import {ThemePalette} from "@angular/material/core"
import {TextResourceService} from "../shared/services/text-resource-service/text-resource.service"

@Component({
  selector: 'app-header',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBar {
  activeLink: string | null
  background: ThemePalette = 'primary'
  text = TextResourceService

  constructor() {
    this.activeLink = localStorage.getItem('activeLink')
    if(this.activeLink == null) {
      this.activeLink = '/'
    }
  }

  setActiveLink(activeLink: string) {
    this.activeLink = activeLink
    localStorage.setItem('activeLink', activeLink)
  }


}
