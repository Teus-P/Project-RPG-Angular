import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppComponent} from './app.component';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NavBar} from './core/components/header/nav-bar.component';
import {RouterModule} from "@angular/router";
import {HomeComponent} from './core/components/home/home.component';
import {AppRoutingModule} from "./app-routing.module";
import {CharacterComponent} from './features/character/character.component';
import {CharacterListComponent} from './features/character/character-list/character-list.component';
import {CharacterDetailComponent} from './features/character/character-detail/character-detail.component';
import {CharacterEditComponent} from './features/character/character-edit/character-edit.component';
import {CharacterStartComponent} from './features/character/character-start/character-start.component';
import {CharacterItemComponent} from './features/character/character-list/character-item/character-item.component';
import {DropdownDirective} from './shared/directives/dropdown.directive';
import {SkirmishComponent} from './features/skirmish/skirmish.component';
import {SkirmishCharactersListComponent} from './features/skirmish/skirmish-characters-list/skirmish-characters-list.component';
import {
  SkirmishCharacterItemComponent
} from './features/skirmish/skirmish-characters-list/skirmish-character-item/skirmish-character-item.component';
import {
  SkirmishCharacterDetailsComponent
} from './features/skirmish/skirmish-character-details/skirmish-character-details.component';
import {SkirmishCharacterEditComponent} from './features/skirmish/skirmish-character-edit/skirmish-character-edit.component';
import {ValidationAlertComponent} from './shared/validation/validation-alert/validation-alert.component';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {EditArmorDialog} from './shared/components/dialog-window/edit-armor-dialog/edit-armor-dialog.component';
import {RollDialogWindow} from "./shared/components/dialog-window/roll-dialog-window/roll-dialog-window.component";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {EditWeaponDialog} from './shared/components/dialog-window/edit-weapon-dialog/edit-weapon-dialog.component';
import {ReceiveDamageDialog} from './features/skirmish/skirmish-character-details/skirmish-character-buttons/dialog-window/receive-damage-dialog/receive-damage-dialog.component';
import {
  BottomSheetDescription
} from './shared/components/bottom-sheet/bottom-sheet-description/bottom-sheet-description.component';
import {MAT_BOTTOM_SHEET_DEFAULT_OPTIONS} from "@angular/material/bottom-sheet";
import {MaterialModule} from "../material.module";
import {WeaponListComponent} from './features/list-of-elements/weapon-list/weapon-list.component';
import {WeaponTypeListComponent} from './features/list-of-elements/weapon-list/weapon-type-list/weapon-type-list.component';
import {WeaponListStartComponent} from './features/list-of-elements/weapon-list/weapon-start/weapon-list-start.component';
import {WeaponGroupItemListComponent} from './features/list-of-elements/weapon-list/weapon-group-item-list/weapon-group-item-list.component';
import {ArmorListComponent} from './features/list-of-elements/armor-list/armor-list.component';
import {ArmorGroupItemList} from './features/list-of-elements/armor-list/armor-group-item-list/armor-group-item-list.component';
import {InitiativeDialog} from './features/skirmish/skirmish-characters-list/dialog-window/initiative-dialog/initiative-dialog.component';
import {FlexLayoutModule} from "@angular/flex-layout";
import {LoaderComponent} from './shared/components/loader/loader.component';
import {ConfirmationDialogComponent} from './shared/components/dialog-window/confirmation-dialog/confirmation-dialog.component';
import {AddConditionDialogComponent} from './features/skirmish/skirmish-character-details/skirmish-character-buttons/dialog-window/add-condition-dialog/add-condition-dialog.component';
import {ConditionListComponent} from './features/list-of-elements/condition-list/condition-list.component';
import {DetailsNameComponent} from './shared/components/details-components/details-name/details-name.component';
import {SharedButtonsComponent} from './shared/components/details-components/shared-buttons/shared-buttons.component';
import {
  CharacterButtonsComponent
} from './features/character/character-detail/character-buttons/character-buttons.component';
import {
  SkirmishCharacterButtonsComponent
} from './features/skirmish/skirmish-character-details/skirmish-character-buttons/skirmish-character-buttons.component';
import {DetailsDescriptionsComponent} from './shared/components/details-components/details-descriptions/details-descriptions.component';
import {
  SkirmishCharacterParametersComponent
} from './features/skirmish/skirmish-character-details/skirmish-character-parameters/skirmish-character-parameters.component';
import {DetailsCharacterComponent} from './shared/components/details-components/details-character/details-character.component';
import {
  DetailsBodyLocalizationsComponent
} from './shared/components/details-components/details-body-localizations/details-body-localizations.component';
import {DescriptionEditComponent} from './shared/components/edit-form-components/description-edit/description-edit.component';
import {TemporaryParametersComponent} from './shared/components/edit-form-components/temporary-parameters/temporary-parameters.component';
import {ConditionsEditComponent} from './shared/components/edit-form-components/conditions-edit/conditions-edit.component';
import {CharacteristicsEditComponent} from './shared/components/edit-form-components/characteristics-edit/characteristics-edit.component';
import {NotesEditComponent} from './shared/components/edit-form-components/notes-edit/notes-edit.component';
import {SpellsEditComponent} from './shared/components/edit-form-components/spells-edit/spells-edit.component';
import {WeaponsEditComponent} from './shared/components/edit-form-components/weapons-edit/weapons-edit.component';
import {ArmorEditComponent} from './shared/components/edit-form-components/armor-edit/armor-edit.component';
import {MatTabsModule} from "@angular/material/tabs";
import {SpellListComponent} from './features/list-of-elements/spell-list/spell-list.component';
import {QualityListComponent} from './features/list-of-elements/quality-list/quality-list.component';
import {ItemListComponent} from './shared/components/item-list/item-list.component';
import {SelectListComponent} from './shared/components/edit-form-components/select-list/select-list.component';
import { TalentAndTraitListComponent } from './features/list-of-elements/talent-and-trait-list/talent-and-trait-list.component';
import { ListFilterComponent } from './shared/components/list-filter/list-filter.component';
import { WeaponGroupTableComponent } from './features/list-of-elements/weapon-list/weapon-group-item-list/weapon-group-table/weapon-group-table.component';
import { EditArmorPointsWindowComponent } from './shared/components/dialog-window/edit-armor-points-window/edit-armor-points-window.component';
import {NgOptimizedImage} from "@angular/common";
import {SkirmishBattlefieldComponent} from "./features/skirmish/skirmish-battlefield/skirmish-battlefield.component";

@NgModule({ declarations: [
        AppComponent,
        NavBar,
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
        RollDialogWindow,
        ValidationAlertComponent,
        EditArmorDialog,
        EditWeaponDialog,
        ReceiveDamageDialog,
        BottomSheetDescription,
        WeaponListComponent,
        WeaponTypeListComponent,
        WeaponListStartComponent,
        WeaponGroupItemListComponent,
        ArmorListComponent,
        ArmorGroupItemList,
        InitiativeDialog,
        LoaderComponent,
        ConfirmationDialogComponent,
        AddConditionDialogComponent,
        ConditionListComponent,
        DetailsNameComponent,
        SharedButtonsComponent,
        CharacterButtonsComponent,
        SkirmishCharacterButtonsComponent,
        DetailsDescriptionsComponent,
        SkirmishCharacterParametersComponent,
        DetailsCharacterComponent,
        DetailsBodyLocalizationsComponent,
        DescriptionEditComponent,
        TemporaryParametersComponent,
        ConditionsEditComponent,
        CharacteristicsEditComponent,
        NotesEditComponent,
        SpellsEditComponent,
        WeaponsEditComponent,
        ArmorEditComponent,
        SpellListComponent,
        QualityListComponent,
        ItemListComponent,
        SelectListComponent,
        TalentAndTraitListComponent,
        ListFilterComponent,
        WeaponGroupTableComponent,
        EditArmorPointsWindowComponent,
    ],
    bootstrap: [AppComponent], imports: [BrowserModule,
        FormsModule,
        RouterModule,
        AppRoutingModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        MaterialModule,
        FlexLayoutModule,
        MatTabsModule,
        NgOptimizedImage, SkirmishBattlefieldComponent], providers: [
        { provide: MAT_BOTTOM_SHEET_DEFAULT_OPTIONS, useValue: { hasBackdrop: true } },
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule {
}
