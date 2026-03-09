// src/directives/arabicNumbers.ts

const arabicDigits: Record<string, string> = {
    '٠':'0','١':'1','٢':'2','٣':'3','٤':'4',
    '٥':'5','٦':'6','٧':'7','٨':'8','٩':'9'
};

const handler = (e: KeyboardEvent) => {
    const input = e.target as HTMLInputElement;
    if (!arabicDigits[e.key]) return;

    e.preventDefault();
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype, 'value'
    )?.set;

    const start = input.selectionStart ?? 0;
    const end = input.selectionEnd ?? 0;
    const newVal = input.value.slice(0, start) + arabicDigits[e.key] + input.value.slice(end);

    nativeInputValueSetter?.call(input, newVal);
    input.dispatchEvent(new Event('input', { bubbles: true }));
};

export const arabicNumbersDirective = {
    mounted(el: HTMLElement) {
        const input = el.tagName === 'INPUT' ? el : el.querySelector('input');
        input?.addEventListener('keydown', handler);
    },
    unmounted(el: HTMLElement) {
        const input = el.tagName === 'INPUT' ? el : el.querySelector('input');
        input?.removeEventListener('keydown', handler);
    }
};