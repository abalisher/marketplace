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

/// Контроллер правки поданной заявки: догрузка учредительных документов к
/// заявке на модерации и повторная подача после отказа (исправленные
/// реквизиты + документы). Логика держится здесь — виджет только рисует
/// состояние.
class CompanyUpdateController extends Notifier<CompanyApplicationState> {
  @override
  CompanyApplicationState build() => const CompanyApplicationState();

  CompanyRepository get _repository => ref.read(companyRepositoryProvider);

  CompanyFilePicker get _picker => ref.read(companyFilePickerProvider);

  /// Открывает выбор файлов и добавляет принятые к правке. [capacity] —
  /// сколько файлов компания ещё может приложить: лимит 4 документа ОБЩИЙ, уже
  /// загруженные считаются вместе с догружаемыми.
  Future<void> pickFiles({required int capacity}) async {
    final picked = await _picker.pickFiles();
    if (picked.isEmpty) return;

    final selection = acceptCompanyFiles(
      current: state.files,
      picked: picked,
      capacity: capacity,
    );
    state = state.copyWith(
      files: selection.files,
      error: selection.error,
      clearError: selection.error == null,
    );
  }

  /// Убирает файл из правки (до отправки).
  void removeFile(int index) {
    if (index < 0 || index >= state.files.length) return;
    final files = [...state.files]..removeAt(index);
    state = state.copyWith(files: files, clearError: true);
  }

  /// Отправляет правку: [name]/[bin] передаются только если покупатель их
  /// изменил (реквизиты одобренной компании бэкенд менять не даёт). Пустая
  /// правка не отправляется вовсе — контракт отвечает на неё 400. При успехе
  /// инвалидирует [myCompanyProvider], и карточка перерисовывается с новым
  /// статусом. Возвращает `true`, если правка принята.
  Future<bool> submit({String? name, String? bin}) async {
    if (state.isSubmitting) return false;
    if (name == null && bin == null && state.files.isEmpty) {
      state = state.copyWith(error: CompanyApplicationError.nothingToUpdate);
      return false;
    }
    state = state.copyWith(isSubmitting: true, clearError: true);
    try {
      await _repository.updateApplication(
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
      CompanyErrorKind.rejected => CompanyApplicationError.updateRejected,
      CompanyErrorKind.network => CompanyApplicationError.network,
      CompanyErrorKind.unknown => CompanyApplicationError.unknown,
    };
  }
}

/// Провайдер контроллера правки заявки юрлица.
final companyUpdateControllerProvider =
    NotifierProvider<CompanyUpdateController, CompanyApplicationState>(
      CompanyUpdateController.new,
    );
