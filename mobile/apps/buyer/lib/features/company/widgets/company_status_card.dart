import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:ui_kit/app_card.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_primary_button.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_status_badge.dart';
import 'package:ui_kit/app_typography.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../../../shared/date_label.dart';
import '../domain/company_document.dart';
import '../domain/company_membership.dart';
import '../domain/company_status.dart';
import 'company_update_form.dart';

/// Карточка поданной заявки: название и БИН, статус модерации, что он значит
/// для заказов, причина отказа, дата подачи, роль и приложенные документы.
/// Админу компании ниже даётся форма правки (повторная подача после отказа,
/// догрузка документов к заявке на модерации — T2.14).
class CompanyStatusCard extends ConsumerWidget {
  const CompanyStatusCard({required this.membership, super.key});

  final CompanyMembership membership;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final messages = ref.watch(messagesProvider);
    final colors = AppColorTokens.of(context);
    final company = membership.company;
    final createdAt = company.createdAt;
    final resubmittedAt = company.resubmittedAt;
    final rejectionReason = company.rejectionReason;
    // Править заявку может только админ компании (правило контракта); принятый
    // сотрудник видит карточку read-only.
    final isAdmin = membership.role == 'admin';
    final canUpdate =
        isAdmin &&
        (company.status == CompanyStatus.rejected ||
            company.status == CompanyStatus.pending);

    return ListView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      children: [
        AppCard(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(company.name, style: AppTypography.headingMedium),
              const SizedBox(height: AppSpacing.xs),
              Text(
                messages.companyBinValue(company.bin),
                style: AppTypography.bodyMedium.copyWith(
                  color: colors.inkSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              AppStatusBadge(
                label: _statusLabel(company.status, messages),
                color: _statusColor(company.status, context),
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                _statusNote(company.status, isAdmin, messages),
                style: AppTypography.bodyMedium,
              ),
              if (createdAt != null) ...[
                const SizedBox(height: AppSpacing.md),
                _InfoRow(
                  label: messages.companySubmittedAtLabel,
                  value: formatDateLabel(createdAt),
                ),
              ],
              if (resubmittedAt != null)
                _InfoRow(
                  label: messages.companyResubmittedAtLabel,
                  value: formatDateLabel(resubmittedAt),
                ),
              const SizedBox(height: AppSpacing.xs),
              _InfoRow(
                label: messages.companyRoleLabel,
                value: _roleLabel(membership.role, messages),
              ),
            ],
          ),
        ),
        if (company.status == CompanyStatus.rejected &&
            rejectionReason != null &&
            rejectionReason.isNotEmpty) ...[
          const SizedBox(height: AppSpacing.lg),
          AppCard(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  messages.companyRejectionReasonLabel,
                  style: AppTypography.titleMedium.copyWith(
                    color: colors.error,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(rejectionReason, style: AppTypography.bodyMedium),
              ],
            ),
          ),
        ],
        const SizedBox(height: AppSpacing.lg),
        AppCard(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                messages.companyDocumentsTitle,
                style: AppTypography.titleMedium,
              ),
              const SizedBox(height: AppSpacing.sm),
              if (company.documents.isEmpty)
                Text(
                  messages.companyNoDocuments,
                  style: AppTypography.bodyMedium.copyWith(
                    color: colors.inkSecondary,
                  ),
                )
              else
                for (final document in company.documents)
                  _DocumentTile(document: document, messages: messages),
            ],
          ),
        ),
        if (canUpdate) ...[
          const SizedBox(height: AppSpacing.lg),
          CompanyUpdateForm(company: company),
        ],
        const SizedBox(height: AppSpacing.xl),
        if (company.status == CompanyStatus.approved)
          AppPrimaryButton(
            label: messages.companyOrderInChat,
            onPressed: () => context.go('/chat'),
          )
        // Заявку правит сам покупатель (форма выше); сотруднику без прав
        // администратора остаётся единственный канал — диалог с ассистентом.
        else if (company.status == CompanyStatus.rejected && !isAdmin)
          AppPrimaryButton(
            label: messages.companyOpenChat,
            onPressed: () => context.go('/chat'),
          ),
      ],
    );
  }

  String _statusLabel(CompanyStatus status, Messages messages) {
    return switch (status) {
      CompanyStatus.pending => messages.companyStatusPending,
      CompanyStatus.approved => messages.companyStatusApproved,
      CompanyStatus.rejected => messages.companyStatusRejected,
      CompanyStatus.unknown => messages.companyStatusUnknown,
    };
  }

  Color _statusColor(CompanyStatus status, BuildContext context) {
    final colors = AppColorTokens.of(context);
    return switch (status) {
      CompanyStatus.pending => colors.warning,
      CompanyStatus.approved => colors.success,
      CompanyStatus.rejected => colors.error,
      CompanyStatus.unknown => colors.inkSecondary,
    };
  }

  String _statusNote(CompanyStatus status, bool isAdmin, Messages messages) {
    return switch (status) {
      CompanyStatus.pending => messages.companyPendingNote,
      CompanyStatus.approved => messages.companyApprovedNote,
      // Отказ чинит администратор компании формой ниже; сотруднику остаётся
      // обратиться к нему — обещать самостоятельную правку было бы неправдой.
      CompanyStatus.rejected =>
        isAdmin
            ? messages.companyRejectedNote
            : messages.companyRejectedNoteMember,
      CompanyStatus.unknown => messages.companyPendingNote,
    };
  }

  String _roleLabel(String role, Messages messages) {
    return role == 'admin'
        ? messages.companyRoleAdmin
        : messages.companyRoleMember;
  }
}

/// Пара «подпись — значение» в карточке компании.
class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Text(
              label,
              style: AppTypography.bodyMedium.copyWith(
                color: colors.inkSecondary,
              ),
            ),
          ),
          const SizedBox(width: AppSpacing.md),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: AppTypography.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }
}

/// Строка приложенного документа: имя и открытие файла по ссылке.
class _DocumentTile extends StatelessWidget {
  const _DocumentTile({required this.document, required this.messages});

  final CompanyDocument document;
  final Messages messages;

  Future<void> _open(BuildContext context) async {
    final url = Uri.tryParse(document.url);
    // Открываем только http(s)-ссылку (File Module отдаёт такие); чужую схему
    // не запускаем. Сбой запуска не роняет экран — показываем снекбар.
    final ok = url != null && (url.isScheme('http') || url.isScheme('https'));
    final messenger = ScaffoldMessenger.of(context);
    try {
      final launched =
          ok && await launchUrl(url, mode: LaunchMode.externalApplication);
      if (!launched && context.mounted) {
        messenger.showSnackBar(
          SnackBar(content: Text(messages.companyDocumentOpenError)),
        );
      }
    } catch (_) {
      if (context.mounted) {
        messenger.showSnackBar(
          SnackBar(content: Text(messages.companyDocumentOpenError)),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final colors = AppColorTokens.of(context);
    return InkWell(
      onTap: () => _open(context),
      child: Container(
        constraints: const BoxConstraints(minHeight: 48),
        child: Row(
          children: [
            Icon(
              Icons.description_outlined,
              size: 20,
              color: colors.inkSecondary,
            ),
            const SizedBox(width: AppSpacing.md),
            Expanded(
              child: Text(document.name, style: AppTypography.bodyMedium),
            ),
            Icon(Icons.open_in_new, size: 20, color: colors.accent),
          ],
        ),
      ),
    );
  }
}
