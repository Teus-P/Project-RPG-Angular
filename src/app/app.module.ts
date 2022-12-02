import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HeaderComponent} from './header/header.component';
import {RouterModule} from "@angular/router";
import {HomeComponent} from './home/home.component';
import {AppRoutingModule} from "./app-routing.module";
import {CharacterComponent} from './character/character.component';
import {CharacterListComponent} from './character/character-list/character-list.component';
import {CharacterDetailComponent} from './character/character-detail/character-detail.component';
import {CharacterEditComponent} from './character/character-edit/character-edit.component';
import {CharacterStartComponent} from './character/character-start/character-start.component';
import {CharacterItemComponent} from './character/character-list/character-item/character-item.component';
import {DropdownDirective} from './shared/directives/dropdown.directive';
import {SkirmishComponent} from './skirmish/skirmish.component';
import {SkirmishCharactersListComponent} from './skirmish/skirmish-characters-list/skirmish-characters-list.component';
import {
  SkirmishCharacterItemComponent
} from './skirmish/skirmish-characters-list/skirmish-character-item/skirmish-character-item.component';
import {
  SkirmishCharacterDetailsComponent
} from './skirmish/skirmish-character-details/skirmish-character-details.component';
import {SkirmishCharacterEditComponent} from './skirmish/skirmish-character-edit/skirmish-character-edit.component';
import {InitiativeDialog} from './dialog-window/initiative-dialog/initiative-dialog.component';
import {ValidationAlertComponent} from './validation/validation-alert/validation-alert.component';
import {HttpClientModule} from '@angular/common/http';
import {EditArmorDialog} from './dialog-window/edit-armor-dialog/edit-armor-dialog.component';
import {RollDialogWindow} from "./dialog-window/roll-dialog-window/roll-dialog-window.component";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {EditWeaponDialog} from './dialog-window/edit-weapon-dialog/edit-weapon-dialog.component';
import {ReceiveDamageDialog} from './dialog-window/receive-damage-dialog/receive-damage-dialog.component';
import {
  BottomSheetDescription
} from './shared/bottom-sheet/bottom-sheet-description/bottom-sheet-description.component';
import {MAT_BOTTOM_SHEET_DEFAULT_OPTIONS} from "@angular/material/bottom-sheet";
import {MaterialModule} from "../material.module";

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    HomeComponent,
    CharacterComponent,
    CharacterListComponent,
    CharacterDetailComponent,
    CharacterEditComponent,
    CharacterStartComponent,
    CharacterItemComponent,
    DropdownDirective,
    SkirmishComponent,
    SkirmishCharactersListComponent,
    SkirmishCharacterItemComponent,
    SkirmishCharacterDetailsComponent,
    SkirmishCharacterEditComponent,
    InitiativeDialog,
    RollDialogWindow,
    ValidationAlertComponent,
    EditArmorDialog,
    EditWeaponDialog,
    ReceiveDamageDialog,
    BottomSheetDescription
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MaterialModule
  ],
  providers: [
    {provide: MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, useValue: {hasBackdrop: true}}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
