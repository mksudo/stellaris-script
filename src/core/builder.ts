import { $Keys, $Values, Assign, Diff, Overwrite } from 'utility-types';

export namespace Builder {
  export type IStateful<State extends {}> = {
    state: State;
  };

  export type BuilderMethodNames<State extends {}> = {
    [Key in $Keys<State>]: Key extends string ? `$${Key}` : never;
  };

  export type ExtractStateKey<MethodName> = MethodName extends `$${infer Key}`
    ? Key
    : never;

  export type SetState<CurrState extends {}, Key, Value> = Key extends string
    ? Assign<CurrState, { [_ in Key]: Value }>
    : never;

  export type ExtendState<
    CurrState extends {},
    Key,
    Value,
  > = Key extends keyof CurrState
    ? Overwrite<CurrState, { [_ in Key]: [CurrState[Key], Value] }>
    : SetState<CurrState, Key, Value>;

  export type ExtractEnforceValueType<
    Key,
    ValueType,
    OverwriteState extends {},
  > = Key extends keyof OverwriteState ? OverwriteState[Key] : ValueType;

  export type IBuilder<
    State extends {},
    OverwriteState extends {} = {},
    ForceState extends {} = {},
    CurrState extends {} = {},
  > = IStateful<
    Overwrite<CurrState, Diff<CurrState, OverwriteState>> & ForceState
  > & {
    [MethodName in $Values<
      BuilderMethodNames<State>
    >]: ExtractStateKey<MethodName> extends keyof State
      ? State[ExtractStateKey<MethodName>] extends {
          replace: infer Replace;
          valueType: infer ValueType;
        }
        ? <
            Value extends ExtractEnforceValueType<
              ExtractStateKey<MethodName>,
              ValueType,
              OverwriteState
            >,
          >(
            value: Value,
          ) => Replace extends true
            ? IBuilder<
                State,
                OverwriteState,
                ForceState,
                SetState<CurrState, ExtractStateKey<MethodName>, Value>
              >
            : Replace extends false
              ? IBuilder<
                  State,
                  OverwriteState,
                  ForceState,
                  ExtendState<CurrState, ExtractStateKey<MethodName>, Value>
                >
              : never
        : never
      : never;
  };

  export type UpdateBuilderCurrState<Builder, UpdateState extends {}> =
    Builder extends IBuilder<
      infer State,
      infer OverwriteState,
      infer ForceState,
      infer CurrState
    >
      ? IBuilder<
          State,
          OverwriteState,
          ForceState,
          Assign<CurrState, UpdateState>
        >
      : never;
}
