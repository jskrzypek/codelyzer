import * as Lint from 'tslint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import SyntaxKind = require('./util/syntaxKind');

export interface IUsePropertyDecoratorConfig {
  propertyName: string;
  decoratorName: string | string[];
  errorMessage: string;
}

export class UsePropertyDecorator extends Lint.Rules.AbstractRule {
  public static formatFailureString(config: IUsePropertyDecoratorConfig, decoratorName: string, className: string) {
    let decorators = config.decoratorName;
    if (decorators instanceof Array) {
      decorators = (<string[]>decorators).map(d => `"@${d}"`).join(', ');
    } else {
      decorators = `"@${decorators}"`;
    }
    return sprintf(config.errorMessage, decoratorName, className, config.propertyName, decorators);
  }

  constructor(private config: IUsePropertyDecoratorConfig, options: Lint.IOptions) {
    super(options);
  }

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    let documentRegistry = ts.createDocumentRegistry();
    return this.applyWithWalker(
      new DirectiveMetadataWalker(sourceFile,
        this.ruleName,
        this.getOptions(),
        this.config));
  }
}

class DirectiveMetadataWalker extends Lint.AbstractWalker<Lint.IOptions> {

  constructor(sourceFile: ts.SourceFile, ruleName: string, options: Lint.IOptions, private config: IUsePropertyDecoratorConfig) {
      super(sourceFile, ruleName, options);
  }

  public walk(sourceFile: ts.SourceFile) {
        const cb = (node: ts.Node): void => {
            // Finds specific node types and do checking.
            if (node.kind === ts.SyntaxKind.ClassDeclaration) {
                this.validateClassDeclaration(node as ts.ClassDeclaration);
            }
            // Continue rescursion: call function `cb` for all children of the current node.
            return ts.forEachChild(node, cb);
        };
        // Start recursion for all children of `sourceFile`.
        return ts.forEachChild(sourceFile, cb);
    }

  validateClassDeclaration(node: ts.ClassDeclaration) {
    (<ts.Decorator[]>node.decorators || [])
      .forEach(this.validateDecorator.bind(this, node.name.text));
  }

  private validateDecorator(className: string, decorator: ts.Decorator) {
    let baseExpr = <any>decorator.expression || {};
    let expr = baseExpr.expression || {};
    let name = expr.text;
    let args = baseExpr.arguments || [];
    let arg = args[0];
    if (/^(Component|Directive)$/.test(name) && arg) {
      this.validateProperty(className, name, arg);
    }
  }

  private validateProperty(className: string, decoratorName: string, arg: ts.ObjectLiteralExpression) {
    if (arg.kind === SyntaxKind.current().ObjectLiteralExpression) {
      (<ts.ObjectLiteralExpression>arg)
        .properties
        .filter(prop => (<any>prop.name).text === this.config.propertyName)
        .forEach(prop => {
          let p = <any>prop;
          this.addFailureAt(
              p.getStart(),
              p.getWidth(),
              UsePropertyDecorator.formatFailureString(this.config, decoratorName, className));
      });
    }
  }
}
