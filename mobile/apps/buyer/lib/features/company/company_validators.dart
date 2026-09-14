import '../../l10n/messages.dart';

/// Валидаторы формы заявки юрлица. Проверяют только формат ввода на клиенте
/// (обязательность, вид БИН) — приём заявки, занятость БИН и модерация
/// остаются за бэкендом.
class CompanyValidators {
  const CompanyValidators._();

  static final RegExp _bin = RegExp(r'^\d{12}$');

  static String? name(String? value, Messages messages) {
    return (value?.trim() ?? '').isEmpty ? messages.fieldRequired : null;
  }

  static String? bin(String? value, Messages messages) {
    final text = value?.trim() ?? '';
    if (text.isEmpty) return messages.fieldRequired;
    if (!_bin.hasMatch(text)) return messages.companyBinInvalid;
    return null;
  }
}
