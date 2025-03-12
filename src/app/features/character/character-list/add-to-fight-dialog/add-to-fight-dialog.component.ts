import {Component, Inject, OnInit} from '@angular/core';
import {TextResourceService} from "../../../../core/services/text-resource-service/text-resource.service";
import {SkirmishService} from "../../../../core/services/skirmish-service/skirmish.service";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {SkirmishGroup} from "../../../../core/model/skirmish/skirmish-group.model";
import {MatButtonToggle, MatButtonToggleGroup} from "@angular/material/button-toggle";
import {MatFormField, MatLabel, MatOption, MatSelect} from "@angular/material/select";
import {FormsModule} from "@angular/forms";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {NgForOf, NgIf} from "@angular/common";
import {ColorSketchModule} from "ngx-color/sketch";

@Component({
  selector: 'app-add-to-fight-dialog',
  imports: [
    MatDialogTitle,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatSelect,
    MatLabel,
    MatFormField,
    MatOption,
    FormsModule,
    MatInput,
    MatDialogActions,
    MatButton,
    MatDialogContent,
    NgForOf,
    NgIf,
    ColorSketchModule
  ],
  templateUrl: './add-to-fight-dialog.component.html',
  styleUrl: './add-to-fight-dialog.component.css'
})
export class AddToFightDialogComponent implements OnInit {
  text = TextResourceService;
  number: number = 1;
  skirmishGroups: SkirmishGroup[] = [];
  selectedItem?: SkirmishGroup;
  newGroup = new SkirmishGroup();
  mode: 'select' | 'add' = 'select';
  randomColor: {r: number, g: number, b: number, a: number};

  constructor(@Inject(MAT_DIALOG_DATA) public data: {groupName: string, isAddingGroup: boolean},
              public dialogRef: MatDialogRef<AddToFightDialogComponent>,
              private skirmishService: SkirmishService) {
    this.randomColor = this.generateRandomColor();
    this.newGroup.colorR = this.randomColor.r;
    this.newGroup.colorG = this.randomColor.g;
    this.newGroup.colorB = this.randomColor.b;
  }

  ngOnInit() {
    this.newGroup.name = this.data.groupName;
    this.skirmishGroups = this.skirmishService.skirmishGroupsList;
    if(this.data.isAddingGroup) {
      this.number = 0;
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    if (this.mode === 'select') {
      this.dialogRef.close({skirmishGroup: this.selectedItem, number: this.number});
    } else if (this.mode === 'add') {
      this.dialogRef.close({skirmishGroup: this.newGroup, number: this.number});
    }
  }

  isFormValid(): boolean {
    if (this.mode === 'select') {
      return !!this.selectedItem;
    } else if (this.mode === 'add') {
      return this.newGroup.name.trim() !== '';
    }
    return false;
  }

  handleColorChange(event: any): void {
    this.newGroup.colorR = event.color.rgb.r;
    this.newGroup.colorG = event.color.rgb.g;
    this.newGroup.colorB = event.color.rgb.b;
  }

  generateRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return {r: r, g: g, b: b, a: 1};
  }
}
