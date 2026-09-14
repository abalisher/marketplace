import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_primary_button.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_text_field.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../company_error_message.dart';
import '../company_validators.dart';
import '../providers/company_application_controller.dart';
import 'company_picked_file_tile.dart';

/// Форма заявки юрлица: название, БИН и учредительные документы файлами.
/// Проверку формата делают валидаторы, приём файлов и отправку —
/// [CompanyApplicationController]; виджет только рисует состояние.
class CompanyApplicationForm extends ConsumerStatefulWidget {
  const CompanyApplicationForm({super.key});

  @override
  ConsumerState<CompanyApplicationForm> createState() =>
      _CompanyApplicationFormState();
}

class _CompanyApplicationFormState
    extends ConsumerState<CompanyApplicationForm> {
  final _formKey = GlobalKey<FormState>();
  final _name = TextEditingController();
  final _bin = TextEditingController();

  @override
  void dispose() {
    _name.dispose();
    _bin.dispose();
    super.dispose();
  }

  Future<void> _submit(Messages messages) async {
    if (!_formKey.currentState!.validate()) return;
    final messenger = ScaffoldMessenger.of(context);
    final ok = await ref
        .read(companyApplicationControllerProvider.notifier)
        .submit(name: _name.text.trim(), bin: _bin.text.trim());
    // При успехе экран сам сменится на карточку статуса (провайдер компании
    // инвалидирован) — снекбар подтверждает, что заявка ушла.
    if (ok && mounted) {
      messenger
        ..hideCurrentSnackBar()
        ..showSnackBar(SnackBar(content: Text(messages.companySubmitted)));
    }
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(messagesProvider);
    final colors = AppColorTokens.of(context);
    final state = ref.watch(companyApplicationControllerProvider);
    final controller = ref.read(companyApplicationControllerProvider.notifier);
    final busy = state.isSubmitting;
    final error = state.error;

    return Form(
      key: _formKey,
      child: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          Text(messages.companyFormTitle, style: AppTypography.headingMedium),
          const SizedBox(height: AppSpacing.sm),
          Text(
            messages.companyFormIntro,
            style: AppTypography.bodyMedium.copyWith(
              color: colors.inkSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
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
          const SizedBox(height: AppSpacing.xl),
          Text(
            messages.companyDocumentsLabel,
            style: AppTypography.titleMedium,
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            messages.companyDocumentsHint,
            style: AppTypography.caption.copyWith(color: colors.inkSecondary),
          ),
          const SizedBox(height: AppSpacing.md),
          for (final (index, file) in state.files.indexed)
            CompanyPickedFileTile(
              file: file,
              messages: messages,
              onRemove: busy ? null : () => controller.removeFile(index),
            ),
          const SizedBox(height: AppSpacing.sm),
          OutlinedButton.icon(
            onPressed: busy ? null : controller.pickFiles,
            icon: const Icon(Icons.attach_file_outlined),
            label: Text(messages.companyAddFiles),
          ),
          if (error != null) ...[
            const SizedBox(height: AppSpacing.md),
            Text(
              companyErrorMessage(error, messages),
              style: AppTypography.bodyMedium.copyWith(color: colors.error),
            ),
          ],
          const SizedBox(height: AppSpacing.xl),
          AppPrimaryButton(
            label: messages.companySubmit,
            onPressed: busy ? null : () => _submit(messages),
          ),
        ],
      ),
    );
  }
}
