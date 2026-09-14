import 'company_document.dart';
import 'company_status.dart';

/// Компания покупателя: то, что показывается в разделе «Компания». Внутренние
/// идентификаторы в домен не поднимаются — на экране их быть не должно
/// (правило UI seller-first, DECISIONS).
class Company {
  const Company({
    required this.name,
    required this.bin,
    required this.status,
    this.rejectionReason,
    this.documents = const [],
    this.createdAt,
    this.resubmittedAt,
  });

  final String name;

  /// БИН — 12 цифр, показывается как есть.
  final String bin;

  final CompanyStatus status;

  /// Причина отказа модератора (только у [CompanyStatus.rejected]).
  final String? rejectionReason;

  /// Приложенные к заявке учредительные документы.
  final List<CompanyDocument> documents;

  /// Когда подана заявка.
  final DateTime? createdAt;

  /// Когда заявку подали повторно после отказа модератора; `null` — не
  /// переподавали.
  final DateTime? resubmittedAt;
}
