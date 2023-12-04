export function createEventEmitter(eventName, target) {
  const customEvent = new CustomEvent(eventName, { bubbles: true });
  const customEventHandler = (handler) => target.on(eventName, handler);

  return [customEvent, customEventHandler];
}
