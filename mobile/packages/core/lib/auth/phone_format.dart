/// Человекочитаемый вид номера телефона для экранов: канон бэкенда
/// `+77012345678` → `+7 701 234 56 78`. Номер в каноне остаётся ключом для
/// вызовов API — форматируется только показ (правило «номера
/// человекочитаемые», гейт U).
String formatPhone(String phone) {
  final digits = phone.replaceAll(RegExp(r'\D'), '');
  if (digits.length != 11 || !digits.startsWith('7')) return phone;
  final national = digits.substring(1);
  return '+7 ${national.substring(0, 3)} ${national.substring(3, 6)} '
      '${national.substring(6, 8)} ${national.substring(8)}';
}
