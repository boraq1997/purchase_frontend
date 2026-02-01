import messages from "../i18n/messages/ar";

export function resolveMessages(Key?: string): string {
    if (!Key) {
        return messages.UNKNOWN_ERROR;
    }

    return messages[Key as keyof typeof messages]
        ?? messages.UNKNOWN_ERROR;
}