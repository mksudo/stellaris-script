import { Builder } from 'src/core/builder';
import { Expression } from 'src/core/expression';

export namespace Utils {
  export const $blockTmpl =
    <Key extends string>(key: Key) =>
    <const Triggers extends readonly Expression.IBuilder[]>(
      ...triggers: [...Triggers]
    ) => {
      const base = Expression.$equationExpr().$key(key).$operator('=');
      const result: Builder.UpdateBuilderCurrState<
        typeof base,
        { value: Triggers }
      > = triggers.reduce((expr, trigger) => expr.$value(trigger), base) as any;
      return result;
    };
  export const $block = <
    Key extends string,
    const Triggers extends readonly Expression.IBuilder[],
  >(
    key: Key,
    ...triggers: [...Triggers]
  ) => $blockTmpl(key)(...triggers);

  export const $eqBuilder =
    <Key extends string>(key: Key) =>
    <Value extends string>(value: Value) =>
      Expression.$equationExpr().$key(key).$operator('=').$value(value);
  export const $eq = <Key extends string, Value extends string>(
    key: Key,
    value: Value,
  ) => $eqBuilder(key)(value);

  export const $numericBuilder =
    <Key extends string>(key: Key) =>
    () =>
      Expression.$numericExpr().$key(key);
  export const $numeric = <Key extends string>(key: Key) =>
    $numericBuilder(key)();

  export const $boolBuilder =
    <Key extends string>(key: Key) =>
    <Value extends boolean>(value: Value) =>
      Expression.$boolExpr().$key(key).$operator('=').$value(value);
  export const $bool = <Key extends string, Value extends boolean>(
    key: Key,
    value: Value,
  ) => $boolBuilder(key)(value);

  export const $narrowableBuilder =
    <Key extends string>(key: Key) =>
    <Value extends boolean | string>(value: Value) =>
      Expression.$narrowableExpr().$key(key).$operator('=').$value(value);
  export const $narrowable = <
    Key extends string,
    Value extends boolean | string,
  >(
    key: Key,
    value: Value,
  ) => $narrowableBuilder(key)(value);

  export const $constantBuilder =
    <Key extends string>(key: Key) =>
    () =>
      Expression.$constantExpr().$key(key);
  export const $constant = <Key extends string>(key: Key) =>
    $constantBuilder(key)();

  export const $countBuilder =
    <Key extends string>(key: Key) =>
    <
      CountExpr extends Expression.BuilderWithKey<
        Expression.IForceNumericBuilder,
        'count'
      >,
      LimitExpr extends Expression.BuilderWithKey<
        Expression.IForceEquationBuilder,
        'limit'
      >,
    >(
      countExpr: CountExpr,
      limitExpr: LimitExpr,
    ) =>
      $block(key, countExpr, limitExpr);
}
