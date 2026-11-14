# amcfrontend

## Dependency security checks

Run `pnpm audit` after dependency updates and commit both `package.json` and
`pnpm-lock.yaml`. Validate updates with `pnpm build` and `pnpm test --runInBand`.

The Nx-scoped `pnpm.overrides` entries replace vulnerable exact pins with fixed
versions in the same major release. The version-scoped glob and minimatch
overrides apply security fixes that are only available in newer major releases;
older callback-based glob/minimatch APIs are deliberately left untouched.
Validate these overrides with builds and tests, and remove them when upstream
callers declare safe versions themselves.

Quill and deepmerge currently have advisories without a published fix.
These advisories are not excluded from `pnpm audit`.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 15.2.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

ng g c xyz --skip-tests -s [--flat]Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
