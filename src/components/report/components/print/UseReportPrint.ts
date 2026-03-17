/**
 * useReportPrint
 * ─────────────────────────────────────────────────────────────
 * Composable لفتح صفحة التقرير في تبويب جديد.
 *
 * الاستخدام:
 *   const { openReport } = useReportPrint()
 *   openReport(requestId, partialData?)
 *
 * آلية العمل:
 *   1. تُخزَّن البيانات الجزئية مؤقتاً في localStorage
 *   2. يُفتح تبويب جديد على مسار /reports/:id
 *   3. صفحة التقرير تقرأ localStorage أولاً، ثم تجلب من API إذا لزم
 *   4. يُحذف المفتاح من localStorage بعد قراءته
 * ─────────────────────────────────────────────────────────────
 */

export function useReportPrint() {

  /**
   * فتح التقرير في تبويب جديد
   * @param id          معرّف طلب الشراء
   * @param partialData بيانات جزئية محمّلة مسبقاً (اختياري)
   */
  const openReport = (id: number, partialData?: Record<string, any>) => {
    // تخزين البيانات الجزئية مؤقتاً إن وُجدت
    if (partialData && Object.keys(partialData).length > 0) {
      try {
        localStorage.setItem(`report_data_${id}`, JSON.stringify(partialData))
      } catch (e) {
        console.warn('[useReportPrint] تعذّر تخزين البيانات مؤقتاً:', e)
      }
    }

    // فتح التبويب الجديد
    const url = `/reports/${id}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  /**
   * تنظيف بيانات تقرير معين من localStorage
   * (يُستدعى تلقائياً من الصفحة، لكن يمكن استدعاؤه يدوياً)
   */
  const clearCachedReport = (id: number) => {
    localStorage.removeItem(`report_data_${id}`)
  }

  return { openReport, clearCachedReport }
}