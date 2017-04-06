import * as Lint from 'tslint';

import {UsePropertyDecorator} from './propertyDecoratorBase';

export class Rule extends UsePropertyDecorator {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'use-host-property-decorator-rule',
    type: 'style',
    description: `Use @HostProperty decorator rather than the \`host\` property of \`@Component\` and \`@Directive\` metadata.`,
    descriptionDetails: `See more at https://angular.io/styleguide#!#06-03.`,
    rationale: `The property associated with \`@HostBinding\` or the method associated with \`@HostListener\` ` +
    `can be modified only in a single place: in the directive's class. If you use the \`host\` metadata ` +
    `property, you must modify both the property declaration inside the controller, and the metadata ` +
    `associated with the directive.`,
    options: null,
    optionsDescription: `Not configurable.`,
    typescriptOnly: true,
  };

  constructor(options: Lint.IOptions) {
    super({
      decoratorName: ['HostBindings', 'HostListeners'],
      propertyName: 'host',
      errorMessage: 'Use @HostBindings and @HostListeners instead of the host property ($$06-03$$)'
    }, options);
  }
}

