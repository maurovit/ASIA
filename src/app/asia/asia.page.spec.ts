import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsiaPage } from './asia.page';

describe('AsiaPage', () => {
  let component: AsiaPage;
  let fixture: ComponentFixture<AsiaPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AsiaPage],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsiaPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
