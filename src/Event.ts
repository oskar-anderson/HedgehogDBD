
export function subscribe(eventName: string, listener: (e: any) => void) {
    document.addEventListener(eventName, listener)
}

export function unsubscribe(eventName: string, listener: (e: any) => void) {
    document.removeEventListener(eventName, listener);
}

export function publish(eventName: string, data: any) {
    console.log("publish", eventName)
    const event = new CustomEvent(eventName, { detail: data, cancelable: true });
    document.dispatchEvent(event);
}