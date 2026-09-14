import 'package:file_picker/file_picker.dart';

import '../domain/company_application_file.dart';
import 'company_file_picker.dart';

/// Системный выбор файлов через `file_picker`. Содержимое запрашивается сразу
/// (`withData`), потому что заявка уходит в JSON base64 — путь к файлу в вебе
/// недоступен вовсе.
class PlatformCompanyFilePicker implements CompanyFilePicker {
  const PlatformCompanyFilePicker();

  @override
  Future<List<CompanyApplicationFile>> pickFiles() async {
    final result = await FilePicker.platform.pickFiles(
      allowMultiple: true,
      withData: true,
      type: FileType.custom,
      allowedExtensions: CompanyApplicationFile.allowedExtensions,
    );
    if (result == null) return const [];
    return [
      for (final file in result.files)
        if (file.bytes != null)
          CompanyApplicationFile(
            name: file.name,
            mimeType: _mimeType(file.extension),
            bytes: file.bytes!,
          ),
    ];
  }

  /// Тип содержимого по расширению: диалог фильтрует по нему же, но на части
  /// платформ фильтр обходится («все файлы»), поэтому нераспознанное
  /// расширение отдаём пустым типом — контроллер откажет с внятной причиной.
  String _mimeType(String? extension) {
    return switch (extension?.toLowerCase()) {
      'pdf' => 'application/pdf',
      'jpg' || 'jpeg' => 'image/jpeg',
      'png' => 'image/png',
      _ => '',
    };
  }
}
