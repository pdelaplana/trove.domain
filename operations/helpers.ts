import { DomainEvent } from '../events/domainEvent';

/*
// Result type with  error handling
type Result<C, D = DomainEvent, E = Error> = {
  success: boolean;
  context?: C;
  error?: E;
  event?: D;
};

// Helper for composing functions with error handling
const pipe =
  <T>(...fns: Array<(arg: T) => Result<T>>) =>
  (input: T): Result<T> =>
    fns.reduce(
      (result, fn) => {
        if (!result.success) return result;
        return fn(result.context as T);
      },
      { success: true, context: input } as Result<T>
    );
*/

// Define the Result type that includes both context and result
type Result<TContext, TAggregate, TError = Error> = {
  success: boolean;
  context: TContext;
  aggregate: TAggregate;
  error?: TError;
};

// Define the function type that takes both context and result
type PipeFunction<TContext, TAggregate = any> = (
  context: TContext,
  aggregate: TAggregate
) => Result<TContext, TAggregate>;

// The pipe function implementation
const pipe =
  <TContext, TAggregate = any>(
    ...fns: Array<PipeFunction<TContext, TAggregate>>
  ) =>
  (input: TContext, output: TAggregate): Result<TContext, TAggregate> =>
    fns.reduce(
      (prev, fn) => {
        if (!prev.success) return prev;
        return fn(prev.context, prev.aggregate);
      },
      {
        success: true,
        context: input,
        aggregate: output,
      } as Result<TContext, TAggregate>
    );

const extractEvent = (
  type: string,
  events: DomainEvent[] | undefined
): DomainEvent => {
  if (!events) {
    throw new Error('Events not initialized');
  }
  return events.find((e) => e.type === type) as DomainEvent;
};

const updateEventPayload = (
  events: DomainEvent[],
  eventType: string,
  updateFn: (payload: any) => any
): DomainEvent[] => {
  return events.map((event) =>
    event.type === eventType
      ? {
          ...event,
          payload: updateFn(event.payload),
        }
      : event
  );
};

export type { Result, PipeFunction, pipe, extractEvent, updateEventPayload };
