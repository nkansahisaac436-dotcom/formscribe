import { EncodingType, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { ExportedFileInfo } from '../types/export';
import '../utils/polyfills';

/**
 * Sanitizes a title string into a safe file name.
 */
export function sanitizeFileName(title: string, format: 'docx' | 'pptx'): string {
  const clean = (title || 'FormScribe_Export')
    .replace(/[^\w\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '_')
    .slice(0, 50);

  const timestamp = new Date().toISOString().slice(0, 10);
  return `${clean || 'FormScribe_Export'}_${timestamp}.${format}`;
}

/**
 * Writes a base64 encoded document to the device cache directory using Expo SDK 57 File API and returns file info.
 */
export async function saveBase64ToCache(
  base64Data: string,
  fileName: string,
  format: 'docx' | 'pptx'
): Promise<ExportedFileInfo> {
  const targetFile = new File(Paths.cache, fileName);

  // Create or overwrite file
  targetFile.create({ overwrite: true });

  // Write base64 string
  targetFile.write(base64Data, {
    encoding: EncodingType.Base64,
  });

  const fileInfo = targetFile.info();
  const fileSizeBytes = fileInfo.size || 0;

  return {
    format,
    fileName,
    fileUri: targetFile.uri,
    fileSizeBytes,
  };
}

/**
 * Opens native OS share sheet for the specified file.
 */
export async function shareExportedFile(
  fileUri: string,
  format: 'docx' | 'pptx',
  dialogTitle = 'Share Form Export'
): Promise<boolean> {
  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device.');
  }

  const mimeType =
    format === 'docx'
      ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      : 'application/vnd.openxmlformats-officedocument.presentationml.presentation';

  const uti =
    format === 'docx'
      ? 'org.openxmlformats.wordprocessingml.document'
      : 'org.openxmlformats.presentationml.presentation';

  await Sharing.shareAsync(fileUri, {
    mimeType,
    dialogTitle,
    UTI: uti,
  });

  return true;
}

/**
 * Formats byte size into human readable string (KB, MB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
