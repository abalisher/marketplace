import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_loader.dart';

import '../../../l10n/messages_provider.dart';
import '../providers/my_company_provider.dart';
import '../widgets/company_application_form.dart';
import '../widgets/company_status_card.dart';

/// Раздел «Компания» (защищённый маршрут): пока заявки нет — форма юрлица,
/// после подачи — карточка со статусом модерации. Паритет с разделом
/// «Аккаунт → Компания» на витрине (T3.8).
class CompanyScreen extends ConsumerWidget {
  const CompanyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final messages = ref.watch(messagesProvider);
    final companyAsync = ref.watch(myCompanyProvider);

    return Scaffold(
      appBar: AppBar(title: Text(messages.companyTitle)),
      body: companyAsync.when(
        loading: () => const AppLoader(),
        error: (_, _) => AppErrorView(
          message: messages.companyLoadError,
          retryLabel: messages.retry,
          onRetry: () => ref.invalidate(myCompanyProvider),
        ),
        data: (membership) => membership == null
            ? const CompanyApplicationForm()
            : CompanyStatusCard(membership: membership),
      ),
    );
  }
}
