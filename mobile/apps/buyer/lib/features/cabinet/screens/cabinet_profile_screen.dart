import 'package:core/auth/auth_controller.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ui_kit/app_card.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_loader.dart';
import 'package:ui_kit/app_primary_button.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages_provider.dart';
import '../domain/buyer_profile.dart';
import '../domain/cabinet_section.dart';
import '../providers/buyer_profile_provider.dart';
import '../widgets/cabinet_scaffold.dart';

/// Раздел «Профиль» кабинета (T10.6): ФИО, телефон и сохранённые адреса
/// доставки — то, что ассистент подставляет при оформлении заказа (T10.8), и
/// то, ради чего покупатель сюда заходит. Правка полей идёт через ассистента:
/// названное в диалоге ФИО и адрес он сохраняет в учётку сам, поэтому вторая
/// форма ввода здесь только развела бы данные.
class CabinetProfileScreen extends ConsumerWidget {
  const CabinetProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.watch(messagesProvider);
    final profileAsync = ref.watch(buyerProfileProvider);

    return CabinetScaffold(
      section: CabinetSection.profile,
      child: profileAsync.when(
        loading: () => const AppLoader(),
        error: (_, _) => AppErrorView(
          message: t.cabinetProfileLoadError,
          retryLabel: t.retry,
          onRetry: () => ref.invalidate(buyerProfileProvider),
        ),
        data: (profile) => _ProfileBody(profile: profile),
      ),
    );
  }
}

class _ProfileBody extends ConsumerWidget {
  const _ProfileBody({required this.profile});

  final BuyerProfile profile;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final t = ref.watch(messagesProvider);
    final colors = AppColorTokens.of(context);

    return ListView(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.lg,
        0,
        AppSpacing.lg,
        AppSpacing.lg,
      ),
      children: [
        _field(
          colors,
          t.cabinetProfileName,
          profile.name ?? t.cabinetProfileNotSet,
        ),
        const SizedBox(height: AppSpacing.md),
        _field(
          colors,
          t.cabinetProfilePhone,
          profile.phone ?? t.cabinetProfileNotSet,
        ),
        const SizedBox(height: AppSpacing.xl),
        Text(
          t.cabinetProfileAddresses,
          style: AppTypography.titleMedium.copyWith(color: colors.ink),
        ),
        const SizedBox(height: AppSpacing.sm),
        if (profile.addresses.isEmpty)
          Text(
            t.cabinetProfileNoAddresses,
            style: AppTypography.bodyLarge.copyWith(color: colors.inkSecondary),
          )
        else
          for (final address in profile.addresses) ...[
            AppCard(
              child: Row(
                children: [
                  Icon(Icons.place_outlined, color: colors.inkSecondary),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Text(
                      address,
                      style: AppTypography.bodyLarge.copyWith(
                        color: colors.ink,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
          ],
        const SizedBox(height: AppSpacing.xl),
        AppPrimaryButton(
          label: t.signOut,
          icon: Icons.logout_outlined,
          onPressed: () => ref.read(authControllerProvider.notifier).signOut(),
        ),
      ],
    );
  }

  /// Поле профиля: подпись сверху, значение под ней (та же форма, что у
  /// «Изменить»-строк витрины, но без формы правки).
  Widget _field(AppColorTokens colors, String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: AppTypography.overline.copyWith(color: colors.inkSecondary),
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          value,
          style: AppTypography.bodyLargeSemibold.copyWith(color: colors.ink),
        ),
      ],
    );
  }
}
