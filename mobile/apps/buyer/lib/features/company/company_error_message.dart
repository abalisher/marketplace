import '../../l10n/messages.dart';
import 'domain/company_application_error.dart';

/// Переводит причину отказа заявки в локализованное сообщение для формы.
String companyErrorMessage(CompanyApplicationError error, Messages messages) {
  return switch (error) {
    CompanyApplicationError.tooManyFiles => messages.companyErrorTooManyFiles,
    CompanyApplicationError.fileTooLarge => messages.companyErrorFileTooLarge,
    CompanyApplicationError.unsupportedType =>
      messages.companyErrorUnsupportedType,
    CompanyApplicationError.rejected => messages.companyErrorRejected,
    CompanyApplicationError.nothingToUpdate =>
      messages.companyErrorNothingToUpdate,
    CompanyApplicationError.updateRejected =>
      messages.companyErrorUpdateRejected,
    CompanyApplicationError.network => messages.companyErrorNetwork,
    CompanyApplicationError.unknown => messages.companyErrorUnknown,
  };
}
