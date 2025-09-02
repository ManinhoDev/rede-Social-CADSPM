import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosOnlineComponent } from './usuarios-online.component';

describe('UsuariosOnlineComponent', () => {
  let component: UsuariosOnlineComponent;
  let fixture: ComponentFixture<UsuariosOnlineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosOnlineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuariosOnlineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
