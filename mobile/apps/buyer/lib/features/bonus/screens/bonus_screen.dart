import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ui_kit/app_card.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_loader.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../../../shared/price_label.dart';
import '../domain/bonus_account.dart';
import '../providers/bonus_provider.dart';
import '../widgets/bonus_entry_tile.dart';

/// Экран бонусов покупателя (защищённый маршрут): баланс + история операций.
/// Данные из бэкенда; экран отображает. Вывод деньгами не предусмотрен —
/// бонусы тратятся частичной оплатой в чекауте.
class BonusScreen extends ConsumerWidget {
  const BonusScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final messages = ref.watch(messagesProvider);
    final bonusAsync = ref.watch(bonusProvider);

    return Scaffold(
      appBar: AppBar(title: Text(messages.bonuses)),
      body: bonusAsync.when(
        loading: () => const AppLoader(),
        error: (_, _) => AppErrorView(
          message: messages.bonusLoadError,
          retryLabel: messages.retry,
          onRetry: () => ref.invalidate(bonusProvider),
        ),
        data: (account) => _BonusBody(account: account, messages: messages),
      ),
    );
  }
}

class _BonusBody extends StatelessWidget {
  const _BonusBody({required this.account, required this.messages});

  final BonusAccount account;
  final Messages messages;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: AppCard(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(messages.bonusBalance, style: AppTypography.titleMedium),
                Text(
                  formatPriceLabel(
                    amount: account.balance,
                    currencyCode: account.currencyCode,
                    unavailableLabel: messages.priceUnavailable,
                  ),
                  style: AppTypography.headingMedium,
                ),
              ],
            ),
          ),
        ),
        Expanded(
          child: account.isEmpty
              ? Center(
                  child: Text(
                    messages.bonusEmpty,
                    style: AppTypography.bodyLarge,
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(
                    AppSpacing.lg,
                    0,
                    AppSpacing.lg,
                    AppSpacing.lg,
                  ),
                  itemCount: account.entries.length,
                  separatorBuilder: (_, _) =>
                      const SizedBox(height: AppSpacing.md),
                  itemBuilder: (context, index) => BonusEntryTile(
                    entry: account.entries[index],
                    currencyCode: account.currencyCode,
                    messages: messages,
                  ),
                ),
        ),
      ],
    );
  }
}
