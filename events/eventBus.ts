import { DomainEvent } from './domainEvent';

export function getHandlerResult(
  handlerId: string,
  handlerResults: Map<string, HandlerResult>[]
) {
  const result = handlerResults.find((r) => r.has(handlerId));
  if (!result) {
    throw new Error('Handler result not found');
  }
  return result.get(handlerId);
}

export function publishAll(
  eventBus: EventBus,
  events: DomainEvent[]
): Promise<Map<string, HandlerResult>[]> {
  return Promise.all(
    events.map(async (event) => await eventBus.publish(event))
  );
}

export type HandlerResult = {
  data: any;
};

export type HandlerEntry = {
  handler: (event: DomainEvent) => Promise<HandlerResult>;
  id: string;
};

export type EventBus = {
  publish: (event: DomainEvent) => Promise<Map<string, HandlerResult>>;
  publishAll: (events: DomainEvent[]) => Promise<Map<string, HandlerResult>[]>;
  subscribe: <T extends DomainEvent>(
    eventType: T['type'],
    handler: (event: T) => Promise<HandlerResult>,
    handlerId?: string | ''
  ) => void;
  unsubscribe: <T extends DomainEvent>(
    eventType: T['type'],
    handlerId: string
  ) => void;
};
