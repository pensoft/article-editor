import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IUserDetail } from '../../../core/interfaces/auth.interface';
import { ICountriesData } from '../../../core/interfaces/country.interface';
import { IDemographic } from '../../../core/interfaces/demographic.interface';
import { AuthService } from '@app/core/services/auth.service';
import { CountriesService } from '../../../core/services/countries.service';
import { DemogrphicService } from '../../../core/services/demogrphic.service';
import { Location } from '@angular/common';

import { countriesInfo } from '../../../../assets/json/country';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  public userName?: string;
  public demographicForm!: FormGroup;
  public countriesData: ICountriesData[] = [];

  countriesInfo: any = countriesInfo;

  public demogrophData: IDemographic = {
    country: 'Bulgaria',
    yearOfBirth: '1981',
    area: 'Plovdiv',
    workRole: 'dev',
  };

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    public countriesService: CountriesService,
    public demogrphicService: DemogrphicService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((response) => {
      const name = response.name;
      this.userName = name;
    });

    this.buildForm();
  }

  private buildForm(): void {
    this.demographicForm = this.formBuilder.group({
      country: [this.demogrophData.country],
      yearOfBirth: [
        this.demogrophData.yearOfBirth,
        Validators.pattern('^\\+(?:[0-9] ?){6,14}[0-9]$'),
      ],
      area: [this.demogrophData.area],
      workRole: [this.demogrophData.workRole],
    });
  }
  backClicked() {
    this.location.back();
  }

  public submitDemographicForm() {
    this.demogrphicService.submitDemographicForm(this.demographicForm.value);
  }
}
