// utils/numbers.ts
export const toEnglishNumbers = (value: string): string => {
    return value
        .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
        .replace(/[^\d.]/g, ''); // احذف أي رمز غير رقمي
};