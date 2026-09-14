import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/company_file_picker.dart';
import '../data/platform_company_file_picker.dart';

/// Провайдер выбора учредительных документов. По умолчанию — системный диалог;
/// в тестах переопределяется фейком (иначе форму не прогнать).
final companyFilePickerProvider = Provider<CompanyFilePicker>((ref) {
  return const PlatformCompanyFilePicker();
});
