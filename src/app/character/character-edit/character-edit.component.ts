import {Component, HostListener, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from "@angular/router";
import {AbstractControl, FormArray, FormControl, FormGroup} from "@angular/forms";
import {CharacterService} from "../../shared/services/character-service/character.service";
import {Character} from "../../model/character/character.model";
import {CharacterFormArraysWrapper} from "../../model/character/character-form-arrays-wrapper.model";
import {ArmorService} from "../../shared/services/armor-service/armor.service";
import {WeaponService} from "../../shared/services/weapon-service/weapon.service";
import {SkillService} from "../../shared/services/skill-service/skill.service";
import {TalentService} from "../../shared/services/talent-service/talent.service";
import {CharacterCharacteristic} from "../../model/characteristic/character-characteristic.model";
import {CharacterSkill} from "../../model/skill/character-skill.model";
import {CharacterTalent} from "../../model/talent/character-talent.model";
import {Armor} from "../../model/armor/armor.model";
import {CharacterWeapon} from "../../model/weapon/character-weapon.model";
import {CharacterBodyLocalization} from "../../model/body-localization/character-body-localization.model";
import {BodyLocalizationList} from "../../model/body-localization/body-localization.model";
import {BodyLocalizationService} from "../../shared/services/body-localization-service/body-localization.service";
import {InjuryService} from "../../shared/services/injuries-service/injury.service";
import {CharacterInjury} from "../../model/injury/character-injury.model";
import {ConditionService} from "../../shared/services/condition-service/condition.service";
import {CharacterCondition} from "../../model/condition/character-condition.model";
import {MatDialog} from "@angular/material/dialog";
import {Skill} from "../../model/skill/skill.model";
import {Talent} from "../../model/talent/talent.model";
import {TextResourceService} from "../../shared/services/text-resource-service/text-resource.service";
import {Characteristic} from "../../model/characteristic/characteristic.model";
import {Model} from "../../model/model";
import {EditArmorDialog} from "../../dialog-window/edit-armor-dialog/edit-armor-dialog.component";
import {EditWeaponDialog} from "../../dialog-window/edit-weapon-dialog/edit-weapon-dialog.component";
import {TraitService} from "../../shared/services/trait-service/trait.service";
import {Trait} from "../../model/trait/trait.model";
import {CharacterTrait} from "../../model/trait/character-trait.model";
import {WeaponGroup} from "../../model/weapon/weapons-group.model";
import {SpellService} from "../../shared/services/spell-service/spell.service";
import {SpellGroup} from "../../model/spell/spell-group.model";
import {Spell} from "../../model/spell/spell.model";

@Component({
  selector: 'app-character-edit',
  templateUrl: './character-edit.component.html',
  styleUrls: ['./character-edit.component.css']
})
export class CharacterEditComponent implements OnInit {

  isDataAvailable: boolean = false;
  isSkirmishMode = false;
  editMode = false;
  editCharacterForm!: FormGroup;
  skillsList: Skill[] = [];
  talentsList: Talent[] = [];
  traitsList: Trait[] = [];
  spellGroups: SpellGroup[] = [];
  weaponGroups: WeaponGroup[] = [];
  armorsList: Armor[] = [];
  isRightHanded = true;
  isDead!: boolean;
  id!: number;

  characterBodyLocalizations!: CharacterBodyLocalization[];

  characteristicsColumns: string[] = this.fillCharacteristicsColumn();
  text = TextResourceService;

  constructor(public router: Router,
              public route: ActivatedRoute,
              public armorService: ArmorService,
              public weaponService: WeaponService,
              public skillService: SkillService,
              public talentService: TalentService,
              public traitService: TraitService,
              public bodyLocalizationService: BodyLocalizationService,
              public characterService: CharacterService,
              public injuryService: InjuryService,
              public conditionService: ConditionService,
              public spellService: SpellService,
              public dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.fetchData().then(() => {
      this.armorsList = this.armorService.armorsList;
      this.weaponGroups = this.weaponService.weaponGroups;
      this.skillsList = this.skillService.skillList;
      this.talentsList = this.talentService.talentList;
      this.traitsList = this.traitService.traitList;
      this.spellGroups = this.spellService.spellGroups;
      this.route.params.subscribe(
        (params: Params) => {
          this.id = +params['id'];
          this.editMode = params['id'] != null;
          this.initForm();
        }
      );
      this.isDataAvailable = true;
    });
  }

  initForm() {
    let character = new Character();
    let formArrays = new CharacterFormArraysWrapper();

    if (this.editMode) {
      character = this.getCharacter();
      formArrays.characteristics = CharacterEditComponent.initEditCharacteristicsTable(character);
      this.isRightHanded = character.isRightHanded;
      this.prepareEditData(character, formArrays)
      this.characterBodyLocalizations = character.bodyLocalizations;
    } else {
      character.name = '';
      character.description = '';
      formArrays.characteristics = CharacterEditComponent.initCharacteristicsTable();
    }

    this.createEditCharacterForm(character, formArrays);
  }

  createEditCharacterForm(character: Character, formArrays: CharacterFormArraysWrapper) {
    this.editCharacterForm = new FormGroup({
      'name': new FormControl(character.name),
      'description': new FormControl(character.description),
      'group': new FormControl(character.group),
      'characteristics': formArrays.characteristics,
      'skills': formArrays.skills,
      'talents': formArrays.talents,
      'traits': formArrays.traits,
      'isRightHanded': new FormControl(this.isRightHanded),
      'weapons': formArrays.weapons,
      'armors': formArrays.armors,
      'injuries': formArrays.injuries,
      'notes': formArrays.notes,
      'conditions': formArrays.conditions,
      'spells': formArrays.spells
    });
  }

  private static initCharacteristicsTable() {
    return new FormArray([
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("MOVEMENT")),
        'value': new FormControl('')
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("WEAPON_SKILL")),
        'value': new FormControl('')
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("BALLISTIC_SKILL")),
        'value': new FormControl('')
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("STRENGTH")),
        'value': new FormControl('')
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("TOUGHNESS")),
        'value': new FormControl('')
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("INITIATIVE")),
        'value': new FormControl('')
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("AGILITY")),
        'value': new FormControl('')
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("DEXTERITY")),
        'value': new FormControl('')
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("INTELLIGENCE")),
        'value': new FormControl('')
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("WILLPOWER")),
        'value': new FormControl('')
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("FELLOWSHIP")),
        'value': new FormControl('')
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("WOUNDS")),
        'value': new FormControl('')
      }),
    ]);
  }

  onSubmit() {
    let character = this.createCharacter();
    if (this.editMode) {
      character.id = this.id;
    }
    this.characterService.storeCharacter(character).then(() => {
      this.onCancel();
    });
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  createCharacter() {
    const name = this.editCharacterForm.value.name;
    const description = this.editCharacterForm.value.description;
    const group = this.editCharacterForm.value.group;
    const characteristics = <CharacterCharacteristic[]>this.editCharacterForm.value.characteristics;
    const skills = <CharacterSkill[]>this.editCharacterForm.value.skills;
    const talents = <CharacterTalent[]>this.editCharacterForm.value.talents;
    const traits = <CharacterTrait[]>this.editCharacterForm.value.traits;
    const isRightHanded = this.editCharacterForm.value.isRightHanded;
    const weapons = <CharacterWeapon[]>this.editCharacterForm.value.weapons;
    const armors = <Armor[]>this.editCharacterForm.value.armors;
    const conditions = <CharacterCondition[]>this.editCharacterForm.value.conditions;
    const notes = <string[]>this.editCharacterForm.value.notes;
    const spells = <Spell[]>this.editCharacterForm.value.spells;

    const character = new Character(
      name,
      description,
      group,
      characteristics,
      skills,
      talents,
      traits,
      isRightHanded,
      weapons,
      armors,
      conditions,
      notes,
      spells
    );

    this.prepareCharacterBodyLocalizations(character);

    return character;
  }

  protected prepareCharacterBodyLocalizations(character: Character) {

    if (this.characterBodyLocalizations == null || this.characterBodyLocalizations.length == 0) {
      const head = new CharacterBodyLocalization(BodyLocalizationList.head, 0, 0, []);
      const rightArm = new CharacterBodyLocalization(BodyLocalizationList.rightArm, 0, 0, []);
      const leftArm = new CharacterBodyLocalization(BodyLocalizationList.leftArm, 0, 0, []);
      const body = new CharacterBodyLocalization(BodyLocalizationList.body, 0, 0, []);
      const rightLeg = new CharacterBodyLocalization(BodyLocalizationList.rightLeg, 0, 0, []);
      const leftLeg = new CharacterBodyLocalization(BodyLocalizationList.leftLeg, 0, 0, []);
      character.bodyLocalizations = [];
      character.bodyLocalizations.push(head, rightArm, leftArm, body, rightLeg, leftLeg);
    } else {
      character.bodyLocalizations = this.characterBodyLocalizations;
      for (let bodyLocalization of character.bodyLocalizations) {
        bodyLocalization.armorPoints = 0;
      }
    }

    for (let armor of character.armors) {
      for (let armorBodyLocalization of armor.armorBodyLocalizations) {
        for (let characterBodyLocalization of character.bodyLocalizations) {
          if (armorBodyLocalization.bodyLocalization.name === characterBodyLocalization.bodyLocalization.name) {
            characterBodyLocalization.armorPoints += armorBodyLocalization.armorPoints;
            characterBodyLocalization.armorPoints -= armorBodyLocalization.brokenArmorPoints;
            break;
          }
        }
      }
    }


    for (let characterBodyLocalization of character.bodyLocalizations) {
      characterBodyLocalization.injuries = [];
      for (let injury of this.injuries) {
        if (injury.value.bodyLocalization.name === characterBodyLocalization.bodyLocalization.name) {
          let characterInjury = new CharacterInjury();
          characterInjury.value = injury.value.value;
          characterInjury.injury = injury.value.injury;
          characterBodyLocalization.injuries.push(characterInjury);
        }
      }
    }
  }

  protected async fetchData() {
    await this.armorService.fetchArmors();
    await this.armorService.fetchArmorCategories();
    await this.armorService.fetchArmorPenalties();
    await this.armorService.fetchArmorQualities();
    await this.bodyLocalizationService.fetchBodyLocalizations();
    await this.injuryService.fetchInjuries();
    await this.conditionService.fetchConditions();
    await this.weaponService.fetchWeapons();
    await this.weaponService.fetchWeaponTypes();
    await this.weaponService.fetchWeaponGroups();
    await this.weaponService.fetchWeaponReaches();
    await this.weaponService.fetchWeaponQualities();
    await this.skillService.fetchSkills();
    await this.talentService.fetchTalents();
    await this.traitService.fetchTraits();
    await this.spellService.fetchSpells();
    await this.characterService.fetchCharacters();
  }

  protected prepareEditData(character: Character, formArrays: CharacterFormArraysWrapper) {
    if (character.skills) {
      this.prepareSkillsList(formArrays.skills, character.skills);
    }
    if (character.talents) {
      this.prepareTalentsList(formArrays.talents, character.talents);
    }
    if (character.traits) {
      this.prepareTraitsList(formArrays.traits, character.traits);
    }
    if (character.weapons) {
      this.prepareWeaponsList(formArrays.weapons, character.weapons);
    }
    if (character.armors) {
      this.prepareArmorList(formArrays.armors, character.armors);
    }
    if (character.notes) {
      this.prepareNotesList(formArrays.notes, character.notes)
    }
    this.prepareInjuriesList(formArrays.injuries, character.bodyLocalizations);
    this.prepareConditionsList(formArrays.conditions, character.conditions);
    this.prepareSpellsList(formArrays.spells, character.spells);
  }

  prepareSkillsList(skills: FormArray, skillsList: CharacterSkill[]) {
    for (let characterSkill of skillsList) {
      skills.push(
        new FormGroup({
          'skill': new FormControl(characterSkill.skill),
          'value': new FormControl(characterSkill.value),
        })
      )
    }
  }

  prepareTalentsList(talents: FormArray, talentsList: CharacterTalent[]) {
    for (let talent of talentsList) {
      talents.push(
        new FormGroup({
          'talent': new FormControl(talent.talent),
          'value': new FormControl(talent.value),
        })
      )
    }
  }

  prepareTraitsList(traits: FormArray, traitsList: CharacterTrait[]) {
    for (let trait of traitsList) {

      let value = new FormControl(trait.value);
      if (!trait.trait.hasValue) {
        value.disable()
      }

      traits.push(
        new FormGroup({
          'trait': new FormControl(trait.trait),
          'value': value,
        })
      )
    }
  }

  prepareWeaponsList(weapons: FormArray, weaponsList: CharacterWeapon[]) {
    for (let weapon of weaponsList) {
      weapons.push(
        new FormGroup({
          'weapon': new FormControl(weapon.weapon),
          'value': new FormControl(weapon.value)
        })
      )
    }
  }

  prepareArmorList(armorsForms: FormArray, characterArmors: Armor[]) {
    for (let armor of characterArmors) {
      armorsForms.push(
        new FormControl(armor)
      )
    }
  }

  prepareNotesList(notes: FormArray, notesList: string[]) {
    for (let note of notesList) {
      notes.push(new FormControl(note))
    }
  }

  prepareInjuriesList(injuries: FormArray, bodyLocalizations: CharacterBodyLocalization[]) {
    for (let bodyLocalization of bodyLocalizations) {
      for (let injury of bodyLocalization.injuries) {
        injuries.push(
          new FormGroup({
            'injury': new FormControl(injury.injury),
            'bodyLocalization': new FormControl(bodyLocalization.bodyLocalization),
            'value': new FormControl(injury.value)
          })
        )
      }
    }
  }

  prepareConditionsList(conditions: FormArray, conditionsList: CharacterCondition[]) {
    for (let characterCondition of conditionsList) {

      let counter = new FormControl(characterCondition.condition.hasCounter);
      if(!characterCondition.condition.hasCounter) {
        counter.disable()
      }

      conditions.push(
        new FormGroup({
          'condition': new FormControl(characterCondition.condition),
          'value': new FormControl(characterCondition.value),
          'counter': counter
        })
      )
    }
  }

  prepareSpellsList(spells: FormArray, spellsList: Spell[]) {
    for (let spell of spellsList) {
      spells.push(
        new FormControl(spell)
      )
    }
  }

  protected static initEditCharacteristicsTable(character: Character) {
    return new FormArray([
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("MOVEMENT")),
        'value': new FormControl(character.movement.value)
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("WEAPON_SKILL")),
        'value': new FormControl(character.weaponSkill.value)
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("BALLISTIC_SKILL")),
        'value': new FormControl(character.ballisticSkill.value)
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("STRENGTH")),
        'value': new FormControl(character.strength.value)
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("TOUGHNESS")),
        'value': new FormControl(character.toughness.value)
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("INITIATIVE")),
        'value': new FormControl(character.initiative.value)
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("AGILITY")),
        'value': new FormControl(character.agility.value)
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("DEXTERITY")),
        'value': new FormControl(character.dexterity.value)
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("INTELLIGENCE")),
        'value': new FormControl(character.intelligence.value)
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("WILLPOWER")),
        'value': new FormControl(character.willpower.value)
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("FELLOWSHIP")),
        'value': new FormControl(character.fellowship.value)
      }),
      new FormGroup({
        'characteristic': new FormControl(this.prepareCharacteristic("WOUNDS")),
        'value': new FormControl(character.wounds.value)
      }),
    ]);
  }

  protected static prepareCharacteristic(name: string) {
    return new Characteristic(name, TextResourceService.getCharacteristicNameTranslation(name).nameTranslation);
  }

  checkIfTraitHasValue(traitControl: AbstractControl) {
    if (traitControl.value.trait != null && !traitControl.value.trait.hasValue) {
      (<FormGroup>traitControl.get('value')).disable();
    } else {
      (<FormGroup>traitControl.get('value')).enable();
    }
  }

  checkIfConditionHasCounter(conditionControl: AbstractControl) {
    if (conditionControl.value.condition.hasCounter != null && !conditionControl.value.condition.hasCounter) {
      (<FormGroup>conditionControl.get('counter')).disable();
    } else {
      (<FormGroup>conditionControl.get('counter')).enable();
    }
  }

  compareModels(c1: Model, c2: Model): boolean {
    return c1 && c2 ? c1.name === c2.name : c1 === c2;
  }

  onAddSkill() {
    (<FormArray>this.editCharacterForm.get('skills')).push(
      new FormGroup({
        'skill': new FormControl(null),
        'value': new FormControl(null),
      })
    )
  }

  onAddTalent() {
    (<FormArray>this.editCharacterForm.get('talents')).push(
      new FormGroup({
        'talent': new FormControl(null),
        'value': new FormControl(null),
      })
    )
  }

  onAddTrait() {
    (<FormArray>this.editCharacterForm.get('traits')).push(
      new FormGroup({
        'trait': new FormControl(null),
        'value': new FormControl(null),
      })
    )
  }

  onAddSpell() {
    (<FormArray>this.editCharacterForm.get('spells')).push(
      new FormControl(null),
    )
  }

  onAddWeapon() {
    (<FormArray>this.editCharacterForm.get('weapons')).push(
      new FormGroup({
        'weapon': new FormControl(null),
        'value': new FormControl(null),
      })
    )
  }

  onAddArmor() {
    (<FormArray>this.editCharacterForm.get('armors')).push(
      new FormControl(null),
    )
  }

  onAddInjury() {
    (<FormArray>this.editCharacterForm.get('injuries')).push(
      new FormGroup({
        'injury': new FormControl(null),
        'bodyLocalization': new FormControl(null),
        'value': new FormControl(null),
      })
    )
  }

  onAddCondition() {
    (<FormArray>this.editCharacterForm.get('conditions')).push(
      new FormGroup({
        'condition': new FormControl(null),
        'value': new FormControl(null),
        'counter': new FormControl(null)
      })
    )
  }

  onAddNote() {
    (<FormArray>this.editCharacterForm.get('notes')).push(
      new FormControl(null),
    )
  }

  async onEditArmor(index: number) {
    await this.createEditArmorDialogWindow(index);
    this.armorsList = this.armorService.armorsList;
  }

  createEditArmorDialogWindow(index: number) {
    const dialogRef = this.dialog.open(EditArmorDialog, {
      width: '30%',
      data: (<FormControl>this.armors[index]).value,
    });

    dialogRef.afterClosed().subscribe(armor => {
      if (armor != undefined) {
        this.armorService.storeArmor(armor).then(() => {
          if (armor != null) {
            return Promise.resolve({weapon: armor});
          } else {
            return Promise.resolve({weapon: (<FormControl>this.armors[index]).value});
          }
        })
      }
    })
  }

  async onEditWeapon(index: number) {
    await this.createEditWeaponDialog(index);
    this.weaponGroups = this.weaponService.weaponGroups;
  }

  createEditWeaponDialog(index: number) {
    const dialogRef = this.dialog.open(EditWeaponDialog, {
      width: '30%',
      data: (<FormControl>this.weapons[index]).value.weapon,
    });

    dialogRef.afterClosed().subscribe(weapon => {
      if (weapon != undefined) {
        this.weaponService.storeWeapon(weapon).then(() => {
          if (weapon != null) {
            return Promise.resolve({weapon: weapon});
          } else {
            return Promise.resolve({weapon: (<FormControl>this.weapons[index]).value});
          }
        })
      }
    })
  }

  protected fillCharacteristicsColumn() {
    return [
      "MOVEMENT",
      "WEAPON_SKILL",
      "BALLISTIC_SKILL",
      "STRENGTH",
      "TOUGHNESS",
      "INITIATIVE",
      "AGILITY",
      "DEXTERITY",
      "INTELLIGENCE",
      "WILLPOWER",
      "FELLOWSHIP",
      "WOUNDS"
    ];
  }

  getCharacter() {
    return <Character>this.characterService.getCharacter(this.id);
  }

  get characteristics() {
    return (<FormArray>this.editCharacterForm.get('characteristics')).controls;
  }

  get skills() {
    return (<FormArray>this.editCharacterForm.get('skills')).controls;
  }

  get talents() {
    return (<FormArray>this.editCharacterForm.get('talents')).controls;
  }

  get traits() {
    return (<FormArray>this.editCharacterForm.get('traits')).controls;
  }

  get spells() {
    return <FormControl[]>(<FormArray>this.editCharacterForm.get('spells')).controls;
  }

  get weapons() {
    return <FormControl[]>(<FormArray>this.editCharacterForm.get('weapons')).controls;
  }

  get armors() {
    return <FormControl[]>(<FormArray>this.editCharacterForm.get('armors')).controls;
  }

  get injuries() {
    return <FormControl[]>(<FormArray>this.editCharacterForm.get('injuries')).controls;
  }

  get conditions() {
    return <FormControl[]>(<FormArray>this.editCharacterForm.get('conditions')).controls;
  }

  get notes() {
    return (<FormArray>this.editCharacterForm.get('notes')).controls;
  }

  onDeleteSkill(index: number) {
    (<FormArray>this.editCharacterForm.get('skills')).removeAt(index);
  }

  onDeleteTalent(index: number) {
    (<FormArray>this.editCharacterForm.get('talents')).removeAt(index);
  }

  onDeleteTrait(index: number) {
    (<FormArray>this.editCharacterForm.get('traits')).removeAt(index);
  }

  onDeleteSpell(index: number) {
    (<FormArray>this.editCharacterForm.get('spells')).removeAt(index);
  }

  onDeleteWeapon(index: number) {
    (<FormArray>this.editCharacterForm.get('weapons')).removeAt(index);
  }

  onDeleteArmor(index: number) {
    (<FormArray>this.editCharacterForm.get('armors')).removeAt(index);
  }

  onDeleteInjury(index: number) {
    (<FormArray>this.editCharacterForm.get('injuries')).removeAt(index);
  }

  onDeleteCondition(index: number) {
    (<FormArray>this.editCharacterForm.get('conditions')).removeAt(index);
  }

  onDeleteNote(index: number) {
    (<FormArray>this.editCharacterForm.get('notes')).removeAt(index);
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key == 'Enter') {
      this.onSubmit();
    }
    if (event.key == 'Escape') {
      this.onCancel();
    }
  }
}
