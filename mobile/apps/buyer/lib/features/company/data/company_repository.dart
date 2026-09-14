import '../domain/company.dart';
import '../domain/company_application_file.dart';
import '../domain/company_membership.dart';

/// Контракт раздела «Компания». Реализация по умолчанию — поверх Medusa Store
/// API (`GET /store/companies/me`, `POST /store/companies`,
/// `POST /store/companies/me`); в тестах
/// переопределяется фейком. Токен покупателя добавляет общий интерцептор
/// (`core`) — раздел доступен только авторизованному.
abstract interface class CompanyRepository {
  /// Компания текущего покупателя и его роль в ней. `null` — покупатель не
  /// состоит в компании (контракт отвечает 404).
  Future<CompanyMembership?> fetchMyCompany();

  /// Подать заявку юрлица: компания заводится в статусе «на модерации»,
  /// покупатель становится её сотрудником-админом.
  Future<CompanyMembership> registerCompany({
    required String name,
    required String bin,
    required List<CompanyApplicationFile> files,
  });

  /// Правка своей заявки админом компании: исправить реквизиты после отказа
  /// модератора и/или догрузить учредительные документы. Хотя бы одно поле
  /// обязательно (пустая правка — 400); отклонённую заявку бэкенд возвращает в
  /// очередь модерации, реквизиты одобренной компании менять нельзя. Роль
  /// покупателя правка не меняет, поэтому возвращается только компания.
  Future<Company> updateApplication({
    String? name,
    String? bin,
    required List<CompanyApplicationFile> files,
  });
}
