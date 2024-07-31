import { Builder } from './builder';

export namespace Expression {
  export type ExpressionKey = string;
  export type ExpressionOperator = '>' | '>=' | '<' | '<=' | '=';
  export type ExpressionValue = string | number | boolean | IBuilder;

  export type ExpressionBuilderConfig = {
    key: {
      replace: true;
      valueType: ExpressionKey;
    };
    operator: {
      replace: true;
      valueType: ExpressionOperator;
    };
    value: {
      replace: false;
      valueType: ExpressionValue;
    };
  };

  export type IBuilder = Builder.IBuilder<ExpressionBuilderConfig>;

  export class Builder implements IBuilder {
    state: Record<string, any>;

    constructor(overwriteState?: Partial<IExpressionState>) {
      this.state = overwriteState ? { ...overwriteState } : {};
    }

    $key<Value extends string>(value: Value) {
      this.state.key = value;
      return this as any;
    }

    $operator<Value extends ExpressionOperator>(value: Value) {
      this.state.operator = value;
      return this as any;
    }

    $value<Value extends ExpressionValue>(value: Value) {
      const currValue = this.state.value;

      if (currValue === undefined) {
        this.state.value = value;
      } else if (Array.isArray(currValue)) {
        this.state.value = [...currValue, value];
      } else {
        this.state.value = [currValue, value];
      }

      return this as any;
    }
  }

  export const $expr = (): IBuilder => new Builder();

  export type BuilderWithKey<ExprBuilder, key extends string> =
    ExprBuilder extends Builder.IBuilder<
      infer _,
      infer OverwriteState,
      infer ForceState,
      infer CurrState
    >
      ? Builder.IBuilder<
          ExpressionBuilderConfig,
          OverwriteState,
          ForceState & { key: key },
          CurrState
        >
      : never;
  export type INumericBuilder = Builder.IBuilder<
    ExpressionBuilderConfig,
    { value: number | string }
  >;
  export type IForceNumericBuilder = Builder.IBuilder<
    ExpressionBuilderConfig,
    { value: number | string },
    { value: number | string }
  >;
  export type NumericExprBuilder = () => INumericBuilder;
  export const $numericExpr: NumericExprBuilder = $expr;

  export type IBooleanBuilder = Builder.IBuilder<
    ExpressionBuilderConfig,
    { operator: '='; value: boolean }
  >;
  export type IForceBooleanBuilder = Builder.IBuilder<
    ExpressionBuilderConfig,
    { operator: '='; value: boolean },
    { operator: '='; value: boolean }
  >;
  export type BooleanExprBuilder = () => IBooleanBuilder;
  export const $boolExpr: BooleanExprBuilder = $expr;

  export type INarrowableBuilder = Builder.IBuilder<
    ExpressionBuilderConfig,
    { operator: '='; value: string | boolean }
  >;
  export type IForceNarrowableBuilder = Builder.IBuilder<
    ExpressionBuilderConfig,
    { operator: '='; value: string | boolean },
    { operator: '='; value: string | boolean }
  >;
  export type NarrowableExprBuilder = () => INarrowableBuilder;
  export const $narrowableExpr: NarrowableExprBuilder = $expr;

  export type IConstantBuilder = Builder.IBuilder<
    Omit<ExpressionBuilderConfig, 'operator' | 'value'>
  >;
  export type ConstantExprBuilder = () => IConstantBuilder;
  export const $constantExpr: ConstantExprBuilder = () =>
    new Builder({ isConstant: true });

  export type IEquationBuilder = Builder.IBuilder<
    ExpressionBuilderConfig,
    { operator: '=' }
  >;
  export type IForceEquationBuilder = Builder.IBuilder<
    ExpressionBuilderConfig,
    { operator: '=' },
    { operator: '=' }
  >;
  export type EquationExprBuilder = () => IEquationBuilder;
  export const $equationExpr: EquationExprBuilder = $expr;

  export type IExpressionState = {
    key?: ExpressionKey;
    operator?: ExpressionOperator;
    value?: ExpressionValue | ExpressionValue[];
    isConstant?: boolean;
  };

  const indent = (level: number) => '\t'.repeat(level);

  export const $stringify = (
    expr: IBuilder,
    indentLevel: number = 0,
  ): string => {
    const state: IExpressionState = expr.state;
    if (state.key === undefined) {
      throw new Error('Missing Key For Expression');
    }
    const indentation = indent(indentLevel);
    if (state.isConstant) {
      return `${indentation}${state.key}`;
    }
    if (state.operator === undefined) {
      throw new Error('Missing Operator For Expression');
    }
    if (state.value === undefined) {
      throw new Error('Missing Value For Expression');
    }

    if (Array.isArray(state.value)) {
      const subExprs = state.value.map((value) =>
        parseValue(value, indentLevel + 1),
      );
      const exprBlock = subExprs.join('\n');
      return `${indentation}${state.key} ${state.operator} {\n${exprBlock}\n${indentation}}`;
    } else if (state.value instanceof Builder) {
      return `${indentation}${state.key} ${state.operator} {\n${parseValue(state.value, indentLevel + 1)}\n${indentation}}`;
    } else {
      return `${indentation}${state.key} ${state.operator} ${parseValue(state.value, indentLevel + 1)}`;
    }
  };

  const parseValue = (value: ExpressionValue, indentLevel: number) => {
    switch (typeof value) {
      case 'boolean':
        return value ? 'yes' : 'no';
      case 'number':
        return value.toString();
      case 'string':
        return value;
      case 'object':
        if (value instanceof Builder) {
          return $stringify(value as IBuilder, indentLevel + 1);
        }
        throw new Error('Invalid Value Type');
      default:
        throw new Error('Invalid Value Type');
    }
  };
}
