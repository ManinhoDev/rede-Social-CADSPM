import { Routes } from '@angular/router';
import { LoginComponent } from './componentes/login/login.component';
import { FeedComponent } from './componentes/feed/feed.component';
import { ForumComponent } from './componentes/forum/forum.component';
import { ChatComponent } from './componentes/chat/chat.component';
import { PerfilComponent } from './componentes/perfil/perfil.component';
import { AdminComponent } from './componentes/admin/admin.component';
import { AuthGuard } from './guards/auth.guard';
import { HomeComponent } from './componentes/home/home.component';
import { GaleriaComponent } from './componentes/galeria/galeria.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home', component: HomeComponent, },
  { path: 'galeria', component: GaleriaComponent, canActivate: [AuthGuard] },
  { path: 'feed', component: FeedComponent, canActivate: [AuthGuard] },
  { path: 'forum', component: ForumComponent, canActivate: [AuthGuard] },
  { path: 'chat', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home' }
];
