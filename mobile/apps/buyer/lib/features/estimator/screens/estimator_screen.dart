import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:ui_kit/app_color_tokens.dart';
import 'package:ui_kit/app_error_view.dart';
import 'package:ui_kit/app_loader.dart';
import 'package:ui_kit/app_primary_button.dart';
import 'package:ui_kit/app_spacing.dart';
import 'package:ui_kit/app_text_field.dart';
import 'package:ui_kit/app_typography.dart';

import '../../../l10n/messages.dart';
import '../../../l10n/messages_provider.dart';
import '../domain/estimate_params.dart';
import '../domain/estimate_result.dart';
import '../domain/estimator_state.dart';
import '../providers/estimator_controller.dart';
import '../widgets/estimate_item_card.dart';

/// Экран расчёта черновых материалов (публичный, гость допускается). Покупатель
/// вводит параметры помещения/работ → бэкенд считает количества и подбирает
/// товары по сегментам. Форма — эфемерное состояние виджета; расчёт и результат
/// ведёт контроллер. Собран только из ui_kit.
class EstimatorScreen extends ConsumerStatefulWidget {
  const EstimatorScreen({super.key});

  @override
  ConsumerState<EstimatorScreen> createState() => _EstimatorScreenState();
}

class _EstimatorScreenState extends ConsumerState<EstimatorScreen> {
  final _area = TextEditingController();
  final _volume = TextEditingController();
  final _length = TextEditingController();
  final _height = TextEditingController();
  final _count = TextEditingController();
  final _note = TextEditingController();

  @override
  void dispose() {
    _area.dispose();
    _volume.dispose();
    _length.dispose();
    _height.dispose();
    _count.dispose();
    _note.dispose();
    super.dispose();
  }

  /// Парсит числовое поле: пустое → null, запятая → точка.
  num? _parse(TextEditingController controller) {
    final text = controller.text.trim().replaceAll(',', '.');
    if (text.isEmpty) return null;
    return num.tryParse(text);
  }

  Future<void> _calculate(Messages messages) async {
    FocusScope.of(context).unfocus();
    final params = EstimateParams(
      area: _parse(_area),
      volume: _parse(_volume),
      length: _parse(_length),
      height: _parse(_height),
      count: _parse(_count),
      note: _note.text,
    );
    if (!params.hasAnyMeasure) {
      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(content: Text(messages.estimatorParamsRequired)),
        );
      return;
    }
    await ref.read(estimatorControllerProvider.notifier).calculate(params);
  }

  @override
  Widget build(BuildContext context) {
    final messages = ref.watch(messagesProvider);
    final state = ref.watch(estimatorControllerProvider);
    final isLoading = state.status == EstimatorStatus.loading;

    return Scaffold(
      appBar: AppBar(title: Text(messages.estimatorTitle)),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          Text(messages.estimatorIntro, style: AppTypography.bodyLarge),
          const SizedBox(height: AppSpacing.lg),
          _numberField(_area, messages.estimatorAreaLabel, isLoading),
          const SizedBox(height: AppSpacing.lg),
          _numberField(_volume, messages.estimatorVolumeLabel, isLoading),
          const SizedBox(height: AppSpacing.lg),
          _numberField(_length, messages.estimatorLengthLabel, isLoading),
          const SizedBox(height: AppSpacing.lg),
          _numberField(_height, messages.estimatorHeightLabel, isLoading),
          const SizedBox(height: AppSpacing.lg),
          _numberField(_count, messages.estimatorCountLabel, isLoading),
          const SizedBox(height: AppSpacing.lg),
          AppTextField(
            controller: _note,
            label: messages.estimatorNoteLabel,
            textInputAction: TextInputAction.done,
            enabled: !isLoading,
          ),
          const SizedBox(height: AppSpacing.xl),
          AppPrimaryButton(
            label: messages.estimatorCalculate,
            onPressed: isLoading ? null : () => _calculate(messages),
          ),
          const SizedBox(height: AppSpacing.xl),
          ..._resultSection(messages, state),
        ],
      ),
    );
  }

  Widget _numberField(
    TextEditingController controller,
    String label,
    bool isLoading,
  ) {
    return AppTextField(
      controller: controller,
      label: label,
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      textInputAction: TextInputAction.next,
      enabled: !isLoading,
    );
  }

  List<Widget> _resultSection(Messages messages, EstimatorState state) {
    switch (state.status) {
      case EstimatorStatus.initial:
        return const [];
      case EstimatorStatus.loading:
        return const [
          Padding(
            padding: EdgeInsets.only(top: AppSpacing.lg),
            child: AppLoader(),
          ),
        ];
      case EstimatorStatus.error:
        return [
          AppErrorView(
            message: messages.estimatorError,
            retryLabel: messages.retry,
            onRetry: () => _calculate(messages),
          ),
        ];
      case EstimatorStatus.success:
        return _successContent(messages, state.result);
    }
  }

  List<Widget> _successContent(Messages messages, EstimateResult? result) {
    if (result == null || result.isEmpty) {
      return [
        Center(
          child: Text(
            messages.estimatorEmpty,
            style: AppTypography.bodyLarge,
            textAlign: TextAlign.center,
          ),
        ),
      ];
    }
    return [
      Text(messages.estimatorResultTitle, style: AppTypography.titleMedium),
      const SizedBox(height: AppSpacing.xs),
      Text(
        messages.estimatorDisclaimer,
        style: AppTypography.caption.copyWith(
          color: AppColorTokens.of(context).inkSecondary,
        ),
      ),
      const SizedBox(height: AppSpacing.md),
      for (final item in result.items) ...[
        EstimateItemCard(
          item: item,
          currencyCode: result.currencyCode,
          messages: messages,
        ),
        const SizedBox(height: AppSpacing.md),
      ],
    ];
  }
}
