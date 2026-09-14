import 'dart:typed_data';

/// Собирает WAV-файл из сырых PCM16-сэмплов (T10.3).
///
/// Зачем вообще: запись идёт ПОТОКОМ сэмплов (`AudioRecorder.startStream`) —
/// один и тот же путь на Android, iOS и вебе, без временных файлов, blob-URL и
/// условных импортов `dart:io`. Контейнер поверх сэмплов клеим сами, и это
/// именно WAV — тот единственный формат, который прогон T10.2 проверил живьём
/// против Gemini (webm, который пишет браузер, в перечне аудиоформатов модели
/// не значится).
///
/// Заголовок RIFF/WAVE, 44 байта, little-endian — канонический PCM без
/// расширений.
Uint8List wavFromPcm16({
  required List<int> pcmBytes,
  required int sampleRate,
  required int numChannels,
}) {
  const headerSize = 44;
  const bitsPerSample = 16;
  final byteRate = sampleRate * numChannels * bitsPerSample ~/ 8;
  final blockAlign = numChannels * bitsPerSample ~/ 8;
  final dataSize = pcmBytes.length;

  final wav = Uint8List(headerSize + dataSize);
  final header = ByteData.view(wav.buffer, 0, headerSize);

  void ascii(int offset, String value) {
    for (var i = 0; i < value.length; i++) {
      header.setUint8(offset + i, value.codeUnitAt(i));
    }
  }

  ascii(0, 'RIFF');
  // Размер файла без первых 8 байт («RIFF» + это поле).
  header.setUint32(4, headerSize - 8 + dataSize, Endian.little);
  ascii(8, 'WAVE');
  ascii(12, 'fmt ');
  header.setUint32(16, 16, Endian.little); // длина блока fmt
  header.setUint16(20, 1, Endian.little); // 1 = PCM без сжатия
  header.setUint16(22, numChannels, Endian.little);
  header.setUint32(24, sampleRate, Endian.little);
  header.setUint32(28, byteRate, Endian.little);
  header.setUint16(32, blockAlign, Endian.little);
  header.setUint16(34, bitsPerSample, Endian.little);
  ascii(36, 'data');
  header.setUint32(40, dataSize, Endian.little);

  wav.setRange(headerSize, headerSize + dataSize, pcmBytes);
  return wav;
}
