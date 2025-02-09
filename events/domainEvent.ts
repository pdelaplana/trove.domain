export interface DomainEvent {
  readonly type: string;
  readonly payload: any;
}
