import { Component, OnInit } from '@angular/core';
import { VrpcHandlerService } from '@eisengrind/ng-v-rpc';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { MyErrorStateMatcher } from '../error-state-matcher';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  matcher = new MyErrorStateMatcher();

  registerForm: FormGroup;

  constructor(private vrpc: VrpcHandlerService,
              private fb: FormBuilder) {
                this.registerForm = this.fb.group({
                  email: ['', [Validators.required, Validators.email]],
                  login: ['', [Validators.required]],
                  passwordGroup: this.fb.group({
                    password: ['', [Validators.required, Validators.minLength(3)]],
                    confirmPassword: ['', [Validators.required]]
                  }, { validator: checkPasswords })
                });
              }

  ngOnInit(): void {
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.registerForm.get(controlName).hasError(errorName);
  }

  public submit(): void {
    if (!this.registerForm.valid) {
      console.warn('incorrect input in form');
      return;
    }
  }
}

function checkPasswords(group: FormGroup) {
  const pass = group.get('password').value;
  const confirmPass = group.get('confirmPassword').value;

  return pass === confirmPass ? null : { notSame: true };
}
