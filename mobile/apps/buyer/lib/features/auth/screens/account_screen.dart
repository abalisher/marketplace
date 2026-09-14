import 'package:core/auth/auth_controller.dart';
import 'package:core/auth/auth_customer.dart';
import 'package:core/config/app_config_provider.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ui_kit/app_card.dart';
import 'package:ui_kit/app_loader.dart';
import 'package:ui_kit/app_primary_button.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages_provider.dart';

/// Экран аккаунта (защищённый гардом роутинга — сюда попадает только
/// авторизованный покупатель). Показывает имя/email/телефон и кнопку выхода.
/// После выхода редирект роутера уводит на экран входа.
class AccountScreen extends ConsumerWidget {
  const AccountScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final messages = ref.watch(messagesProvider);
    final customer = ref.watch(authControllerProvider).valueOrNull;

    return Scaffold(
      appBar: AppBar(title: Text(messages.account)),
      body: customer == null
          ? const AppLoader()
          : _AccountBody(customer: customer),
    );
  }
}

class _AccountBody extends ConsumerWidget {
  const _AccountBody({required this.customer});

  final AuthCustomer customer;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final messages = ref.watch(messagesProvider);
    final phone = customer.phone;
    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        Text(customer.displayName, style: AppTypography.headingMedium),
        const SizedBox(height: AppSpacing.sm),
        Text(customer.contact, style: AppTypography.bodyLarge),
        if (phone != null) ...[
          const SizedBox(height: AppSpacing.xs),
          Text(phone, style: AppTypography.bodyLarge),
        ],
        const SizedBox(height: AppSpacing.xl),
        _NavTile(
          icon: Icons.receipt_long_outlined,
          label: messages.myOrders,
          onTap: () => context.push('/cabinet/orders'),
        ),
        const SizedBox(height: AppSpacing.md),
        _NavTile(
          icon: Icons.card_giftcard_outlined,
          label: messages.bonuses,
          onTap: () => context.push('/bonuses'),
        ),
        // Юрлица заморожены на MVP (T10.9) — пункт возвращает флаг.
        if (ref.watch(appConfigProvider).featureCompanies) ...[
          const SizedBox(height: AppSpacing.md),
          _NavTile(
            icon: Icons.apartment_outlined,
            label: messages.companyTitle,
            onTap: () => context.push('/company'),
          ),
        ],
        const SizedBox(height: AppSpacing.xl),
        AppPrimaryButton(
          label: messages.signOut,
          icon: Icons.logout_outlined,
          onPressed: () => ref.read(authControllerProvider.notifier).signOut(),
        ),
      ],
    );
  }
}

/// Тайл навигации в аккаунте (иконка + подпись + шеврон) поверх [AppCard].
class _NavTile extends StatelessWidget {
  const _NavTile({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      child: Row(
        children: [
          Icon(icon),
          const SizedBox(width: AppSpacing.md),
          Expanded(child: Text(label, style: AppTypography.titleMedium)),
          const Icon(Icons.chevron_right),
        ],
      ),
    );
  }
}
