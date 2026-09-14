import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ui_kit/app_card.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_primary_button.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_text_field.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../company_error_message.dart';
import '../company_validators.dart';
import '../domain/company.dart';
import '../domain/company_application_file.dart';
import '../domain/company_status.dart';
import '../providers/company_update_controller.dart';
import 'company_picked_file_tile.dart';

/// Правка поданной заявки админом компании: у отклонённой — исправить
/// реквизиты и подать снова, у заявки на модерации — догрузить учредительные
/// документы. Реквизиты одобренной компании неизменяемы (другой БИН — другое
/// юрлицо), поэтому у неё формы нет вовсе — решает [CompanyStatusCard].
class CompanyUpdateForm extends ConsumerStatefulWidget {
  const CompanyUpdateForm({required this.company, super.key});

  final Company company;

  @override
  ConsumerState<CompanyUpdateForm> createState() => _CompanyUpdateFormState();
}

class _CompanyUpdateFormState extends ConsumerState<CompanyUpdateForm> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name;
  late final TextEditingController _bin;

  /// Реквизиты правит только отклонённая заявка: заявку на модерации ещё не
  /// смотрели — менять в ней нечего, документы догружаются и так.
  bool get _editableRequisites =>
      widget.company.status == CompanyStatus.rejected;

  /// Сколько документов компания ещё может приложить: лимит 4 — ОБЩИЙ, уже
  /// загруженные считаются.
  int get _capacity {
    final free =
        CompanyApplicationFile.maxFiles - widget.company.documents.length;
    return free < 0 ? 0 : free;
  }

  @override
  void initState() {
    super.initState();
    _name = TextEditingController(text: widget.company.name);
    _bin = TextEditingController(text: widget.company.bin);
  }

  @override
  void dispose() {
    _name.dispose();
    _bin.dispose();
    super.dispose();
  }

  Future<void> _submit(Messages messages) async {
    if (_editableRequisites && !_formKey.currentState!.validate()) return;
    final name = _name.text.trim();
    final bin = _bin.text.trim();
    final messenger = ScaffoldMessenger.of(context);
    final ok = await ref
        .read(companyUpdateControllerProvider.notifier)
        .submit(
          // Отправляем только изменённые реквизиты: неизменные поля правкой не
          // считаются, а у заявки на модерации их нет вовсе.
          name: _editableRequisites && name != widget.company.name
              ? name
              : null,
          bin: _editableRequisites && bin != widget.company.bin ? bin : null,
        );
    if (ok && mounted) {
      messenger
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(
            content: Text(
              _editableRequisites
                  ? messages.companyResubmitted
                  : messages.companyDocumentsSent,
            ),
          ),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(messagesProvider);
    final colors = AppColorTokens.of(context);
    final state = ref.watch(companyUpdateControllerProvider);
    final controller = ref.read(companyUpdateControllerProvider.notifier);
    final busy = state.isSubmitting;
    final error = state.error;
    final capacity = _capacity;
    final free = capacity - state.files.length;

    return AppCard(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              _editableRequisites
                  ? messages.companyResubmitTitle
                  : messages.companyAddDocumentsTitle,
              style: AppTypography.titleMedium,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              _editableRequisites
                  ? messages.companyResubmitIntro
                  : messages.companyAddDocumentsIntro,
              style: AppTypography.bodyMedium.copyWith(
                color: colors.inkSecondary,
              ),
            ),
            if (_editableRequisites) ...[
              const SizedBox(height: AppSpacing.lg),
              AppTextField(
                controller: _name,
                label: messages.companyNameLabel,
                textInputAction: TextInputAction.next,
                enabled: !busy,
                validator: (value) => CompanyValidators.name(value, messages),
              ),
              const SizedBox(height: AppSpacing.lg),
              AppTextField(
                controller: _bin,
                label: messages.companyBinLabel,
                helperText: messages.companyBinHelper,
                keyboardType: TextInputType.number,
                textInputAction: TextInputAction.done,
                enabled: !busy,
                validator: (value) => CompanyValidators.bin(value, messages),
              ),
            ],
            const SizedBox(height: AppSpacing.lg),
            for (final (index, file) in state.files.indexed)
              CompanyPickedFileTile(
                file: file,
                messages: messages,
                onRemove: busy ? null : () => controller.removeFile(index),
              ),
            if (capacity == 0)
              // Все четыре места заняты: выбирать файл незачем — объясняем, а
              // не показываем кнопку, которая заведомо получит отказ.
              Text(
                messages.companyDocumentsLimitNote,
                style: AppTypography.caption.copyWith(
                  color: colors.inkSecondary,
                ),
              )
            else ...[
              Text(
                messages.companyDocumentsSlots(free),
                style: AppTypography.caption.copyWith(
                  color: colors.inkSecondary,
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              OutlinedButton.icon(
                onPressed: busy
                    ? null
                    : () => controller.pickFiles(capacity: capacity),
                icon: const Icon(Icons.attach_file_outlined),
                label: Text(messages.companyAddFiles),
              ),
            ],
            if (error != null) ...[
              const SizedBox(height: AppSpacing.md),
              Text(
                companyErrorMessage(error, messages),
                style: AppTypography.bodyMedium.copyWith(color: colors.error),
              ),
            ],
            const SizedBox(height: AppSpacing.lg),
            AppPrimaryButton(
              label: _editableRequisites
                  ? messages.companyResubmitSubmit
                  : messages.companyAddDocumentsSubmit,
              onPressed: busy ? null : () => _submit(messages),
            ),
          ],
        ),
      ),
    );
  }
}
