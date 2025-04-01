import {Component, OnInit} from '@angular/core';
import {WeaponGroup} from "../../../../core/model/weapon/weapon-group.model";
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {ActivatedRoute, Params} from "@angular/router";
import {WeaponService} from "../../../../core/services/weapon-service/weapon.service";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-weapon-group-item-list',
  templateUrl: './weapon-group-item-list.component.html',
  styleUrls: ['./weapon-group-item-list.component.css'],
  standalone: false
})
export class WeaponGroupItemListComponent implements OnInit {
  name!: string
  weaponGroup!: WeaponGroup
  weaponGroups!: WeaponGroup[]
  text = TextResourceService
  filterValue?: string;

  constructor(private route: ActivatedRoute,
              private weaponService: WeaponService,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
        this.name = params['name'];
        this.groupWeaponCategories(this.weaponService.getWeaponGroups())
      }
    )
  }

  groupWeaponCategories(weaponGroups: WeaponGroup[]) {
    weaponGroups.sort((a, b) => a.name.localeCompare(b.name));
    this.weaponGroups = weaponGroups.filter(g => g.type === this.name)
  }

  applyFilter(newFilterValue: string) {
    this.filterValue = newFilterValue;
  }
}
