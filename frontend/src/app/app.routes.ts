import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { AdminComponent } from './paginas/admin.component';
import { CuentaComponent } from './paginas/cuenta.component';
import { EntrarComponent } from './paginas/entrar.component';
import { InicioComponent } from './paginas/inicio.component';
import { TiendaComponent } from './paginas/tienda.component';
import { AuthService } from './servicios/auth.service';

const exigir = (rol: 'USER' | 'ADMIN'): CanActivateFn => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.token()) {
    return router.createUrlTree(['/entrar']);
  }
  const usuario = auth.usuario();
  if (usuario && usuario.rol !== rol) {
    return router.createUrlTree([usuario.rol === 'ADMIN' ? '/admin' : '/tienda']);
  }
  return true;
};

export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'entrar', component: EntrarComponent },
  { path: 'tienda', component: TiendaComponent, canActivate: [exigir('USER')] },
  { path: 'cuenta', component: CuentaComponent, canActivate: [exigir('USER')] },
  { path: 'admin', component: AdminComponent, canActivate: [exigir('ADMIN')] },
  { path: '**', redirectTo: '' },
];
