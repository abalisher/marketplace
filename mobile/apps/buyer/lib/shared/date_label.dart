/// Дата человекочитаемо: «14.08.2026». Формат числовой и одинаковый в ru и kk,
/// поэтому словарь локали для него не нужен. Время приводится к местному —
/// бэкенд отдаёт UTC.
String formatDateLabel(DateTime date) {
  final local = date.toLocal();
  String two(int value) => value.toString().padLeft(2, '0');
  return '${two(local.day)}.${two(local.month)}.${local.year}';
}
