import 'package:core/network/medusa_api_provider.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/assembly_repository.dart';
import '../data/medusa_assembly_repository.dart';

/// Провайдер репозитория заданий сборки. По умолчанию — реализация поверх
/// admin API; в тестах переопределяется фейком.
final assemblyRepositoryProvider = Provider<AssemblyRepository>((ref) {
  return MedusaAssemblyRepository(ref.watch(medusaApiProvider));
});
