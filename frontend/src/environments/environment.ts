// Desarrollo en la Mac. El build de producción usa environment.production.ts
// y ahí va la URL https de Railway, no localhost.
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
};
