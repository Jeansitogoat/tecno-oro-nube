import { HttpInterceptorFn } from '@angular/common/http';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('tecno-oro-token');
  if (!token) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }));
};
