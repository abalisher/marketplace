import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../domain/company_membership.dart';
import 'company_repository_provider.dart';

/// Компания текущего покупателя. `null` — заявки ещё нет, экран показывает
/// форму. После подачи заявки провайдер инвалидируется контроллером.
final myCompanyProvider = FutureProvider<CompanyMembership?>((ref) {
  return ref.watch(companyRepositoryProvider).fetchMyCompany();
});
