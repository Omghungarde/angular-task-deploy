import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { ProjectComponent } from './project/project.component';
import { SignupComponent } from './signup/signup.component';
import { authGuard } from './auth.guard';
import { LayoutComponent } from './layout/layout.component';
import { TaskComponent } from './task/task.component';

export const routes: Routes = [
    { path: '', component: WelcomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },

    {
        path:'',
        component:LayoutComponent,
        children:
        [
            { path: 'project', component: ProjectComponent, canActivate:[authGuard] },
            {
                path:'task/:id',
                component:TaskComponent, canActivate:[authGuard]
            }
        ]
    }
    
   
];
