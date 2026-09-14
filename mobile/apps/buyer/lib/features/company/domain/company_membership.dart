import 'company.dart';

/// Компания покупателя вместе с его ролью в ней (`admin` — подавший заявку,
/// `member` — принятый сотрудник). Роль приходит кодом из контракта и
/// переводится словарём локали.
class CompanyMembership {
  const CompanyMembership({required this.company, required this.role});

  final Company company;

  /// Код роли сотрудника: `admin` / `member`.
  final String role;
}
