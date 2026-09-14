import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../company_file_selection.dart';
import '../data/company_file_picker.dart';
import '../data/company_repository.dart';
import '../domain/company_application_error.dart';
import '../domain/company_application_state.dart';
import '../domain/company_exception.dart';
import 'company_file_picker_provider.dart';
import 'company_repository_provider.dart';
import 'my_company_provider.dart';

/// Контроллер заявки юрлица: выбор и отсев учредительных документов, отправка
/// заявки. Логика держится здесь — виджет только рисует состояние.
class CompanyApplicationController extends Notifier<CompanyApplicationState> {
  @override
  CompanyApplicationState build() => const CompanyApplicationState();

  CompanyRepository get _repository => ref.read(companyRepositoryProvider);

  CompanyFilePicker get _picker => ref.read(companyFilePickerProvider);

  /// Открывает выбор файлов и добавляет принятые к заявке. Причина отказа
  /// первого непринятого файла показывается на форме; остальные принятые
  /// файлы при этом сохраняются — покупателю не приходится выбирать заново.
  Future<void> pickFiles() async {
    final picked = await _picker.pickFiles();
    if (picked.isEmpty) return;

    final selection = acceptCompanyFiles(current: state.files, picked: picked);
    state = state.copyWith(
      files: selection.files,
      error: selection.error,
      clearError: selection.error == null,
    );
  }

  /// Убирает файл из заявки (до отправки).
  void removeFile(int index) {
    if (index < 0 || index >= state.files.length) return;
    final files = [...state.files]..removeAt(index);
    state = state.copyWith(files: files, clearError: true);
  }

  /// Отправляет заявку. При успехе инвалидирует [myCompanyProvider] — экран
  /// сам сменит форму на карточку статуса. Возвращает `true`, если заявка
  /// принята.
  Future<bool> submit({required String name, required String bin}) async {
    if (state.isSubmitting) return false;
    state = state.copyWith(isSubmitting: true, clearError: true);
    try {
      await _repository.registerCompany(
        name: name,
        bin: bin,
        files: state.files,
      );
      state = const CompanyApplicationState();
      ref.invalidate(myCompanyProvider);
      return true;
    } catch (error) {
      state = state.copyWith(isSubmitting: false, error: _toError(error));
      return false;
    }
  }

  CompanyApplicationError _toError(Object error) {
    if (error is! CompanyException) return CompanyApplicationError.unknown;
    return switch (error.kind) {
      CompanyErrorKind.rejected => CompanyApplicationError.rejected,
      CompanyErrorKind.network => CompanyApplicationError.network,
      CompanyErrorKind.unknown => CompanyApplicationError.unknown,
    };
  }
}

/// Провайдер контроллера заявки юрлица.
final companyApplicationControllerProvider =
    NotifierProvider<CompanyApplicationController, CompanyApplicationState>(
      CompanyApplicationController.new,
    );
