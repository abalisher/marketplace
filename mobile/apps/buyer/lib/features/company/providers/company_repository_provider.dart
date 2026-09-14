import 'package:core/config/app_config_provider.dart';
import 'package:core/network/medusa_api_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/company_repository.dart';
import '../data/medusa_company_repository.dart';

/// Провайдер репозитория раздела «Компания». По умолчанию — реализация поверх
/// Medusa; в тестах переопределяется фейком.
final companyRepositoryProvider = Provider<CompanyRepository>((ref) {
  final api = ref.watch(medusaApiProvider);
  final config = ref.watch(appConfigProvider);
  return MedusaCompanyRepository(api, config.publishableKey);
});
