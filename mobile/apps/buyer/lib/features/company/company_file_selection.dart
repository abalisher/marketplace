import 'domain/company_application_error.dart';
import 'domain/company_application_file.dart';

/// Итог отсева выбранных файлов: что приложено к заявке и причина отказа
/// первого непринятого файла (остальные принятые сохраняются — покупателю не
/// приходится выбирать заново).
class CompanyFileSelection {
  const CompanyFileSelection({required this.files, this.error});

  final List<CompanyApplicationFile> files;
  final CompanyApplicationError? error;
}

/// Отсеивает выбранные файлы по правилам контракта: тип PDF/JPEG/PNG, размер
/// до 3 МБ и свободные места ([capacity] — сколько файлов ещё можно приложить;
/// при догрузке лимит 4 файла ОБЩИЙ на компанию, уже загруженные считаются).
/// Проверку всё равно делает бэкенд — здесь она нужна, чтобы не гнать заведомо
/// отказной запрос и сказать это на месте.
CompanyFileSelection acceptCompanyFiles({
  required List<CompanyApplicationFile> current,
  required List<CompanyApplicationFile> picked,
  int capacity = CompanyApplicationFile.maxFiles,
}) {
  final files = [...current];
  CompanyApplicationError? error;
  for (final file in picked) {
    if (!CompanyApplicationFile.allowedMimeTypes.contains(file.mimeType)) {
      error ??= CompanyApplicationError.unsupportedType;
      continue;
    }
    if (file.bytes.length > CompanyApplicationFile.maxSizeBytes) {
      error ??= CompanyApplicationError.fileTooLarge;
      continue;
    }
    if (files.length >= capacity) {
      error ??= CompanyApplicationError.tooManyFiles;
      continue;
    }
    files.add(file);
  }
  return CompanyFileSelection(files: files, error: error);
}
