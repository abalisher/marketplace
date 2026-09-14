import 'company_application_error.dart';
import 'company_application_file.dart';

/// Состояние формы заявки юрлица — первой подачи и правки (догрузка
/// документов, повторная подача): приложенные файлы, идёт ли отправка и
/// последняя причина отказа. Название и БИН живут в полях формы — сюда
/// поднимается только то, чем управляет контроллер.
class CompanyApplicationState {
  const CompanyApplicationState({
    this.files = const [],
    this.isSubmitting = false,
    this.error,
  });

  final List<CompanyApplicationFile> files;
  final bool isSubmitting;
  final CompanyApplicationError? error;

  CompanyApplicationState copyWith({
    List<CompanyApplicationFile>? files,
    bool? isSubmitting,
    CompanyApplicationError? error,
    bool clearError = false,
  }) {
    return CompanyApplicationState(
      files: files ?? this.files,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      error: clearError ? null : (error ?? this.error),
    );
  }
}
