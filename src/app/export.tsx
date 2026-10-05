import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { OptionToggle } from '../components/common/OptionToggle';
import { useFormState } from '../context/FormContext';
import { useAppTheme } from '../context/ThemeContext';
import { generateDocxBase64 } from '../services/exportDocx';
import { generatePptxBase64 } from '../services/exportPptx';
import { sanitizeFileName, saveBase64ToCache, shareExportedFile } from '../services/fileStorage';
import { ExportConfig, ExportedFileInfo, ExportFormat, ExportStyle } from '../types/export';
import { triggerHaptic } from '../utils/haptics';

export default function ExportScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { activeForm, setLastExportResult } = useFormState();

  const [format, setFormat] = useState<ExportFormat>('both');
  const [style, setStyle] = useState<ExportStyle>('full');
  const [includeAnswerLines, setIncludeAnswerLines] = useState<boolean>(true);
  const [includeCoverPage, setIncludeCoverPage] = useState<boolean>(true);
  const [includeTableOfContents, setIncludeTableOfContents] = useState<boolean>(true);
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);
  const [documentTitle, setDocumentTitle] = useState<string>(activeForm?.title || 'FormScribe Export');
  const [authorName, setAuthorName] = useState<string>('FormScribe');
  const [exporting, setExporting] = useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<string>('');

  if (!activeForm) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>No Form Loaded</Text>
          <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: 16 }} />
        </View>
      </SafeAreaView>
    );
  }

  const handleExport = async () => {
    triggerHaptic('medium');
    setExporting(true);
    setProgressStatus('Initializing export engine...');

    const config: ExportConfig = {
      format,
      style,
      includeAnswerLines,
      includeCoverPage,
      includeTableOfContents,
      includePageNumbers,
      documentTitle: documentTitle.trim() || activeForm.title,
      authorName: authorName.trim() || 'FormScribe',
    };

    const exportedFiles: ExportedFileInfo[] = [];

    try {
      // 1. Generate DOCX if selected
      if (format === 'docx' || format === 'both') {
        setProgressStatus('Building Microsoft Word (.docx) document...');
        const docxBase64 = await generateDocxBase64(activeForm, config);
        const fileName = sanitizeFileName(config.documentTitle, 'docx');
        const fileInfo = await saveBase64ToCache(docxBase64, fileName, 'docx');
        exportedFiles.push(fileInfo);
      }

      // 2. Generate PPTX if selected
      if (format === 'pptx' || format === 'both') {
        setProgressStatus('Building PowerPoint (.pptx) presentation...');
        const pptxBase64 = await generatePptxBase64(activeForm, config);
        const fileName = sanitizeFileName(config.documentTitle, 'pptx');
        const fileInfo = await saveBase64ToCache(pptxBase64, fileName, 'pptx');
        exportedFiles.push(fileInfo);
      }

      setProgressStatus('Opening share sheet...');
      triggerHaptic('success');

      // 3. Prompt OS share sheet for the primary file
      if (exportedFiles.length > 0) {
        const primaryFile = exportedFiles[0];
        try {
          await shareExportedFile(primaryFile.fileUri, primaryFile.format, config.documentTitle);
        } catch {
          // Sharing cancelled or dismissed
        }
      }

      // 4. Save result and navigate to success screen
      setLastExportResult({
        files: exportedFiles,
        exportedAt: new Date().toISOString(),
        documentTitle: config.documentTitle,
      });

      router.replace('/export-success');
    } catch (err) {
      triggerHaptic('error');
      console.error('Export error:', err);
      Alert.alert(
        'Export Failed',
        err instanceof Error ? err.message : 'An error occurred while generating the document.'
      );
    } finally {
      setExporting(false);
      setProgressStatus('');
    }
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Form Overview Summary Pill */}
          <View style={[styles.summaryCard, { backgroundColor: colors.badgeBg, borderColor: colors.border }]}>
            <Text style={[styles.summaryTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              {activeForm.title}
            </Text>
            <Text style={[styles.summaryMeta, { color: colors.textMuted }]}>
              {activeForm.totalPages} Sections / Pages • {activeForm.totalQuestions} Questions Extracted
            </Text>
          </View>

          {/* Section 1: Output Format Choice (3-way) */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            1. Output Format
          </Text>
          <View style={styles.formatSegmentContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic('light');
                setFormat('docx');
              }}
              style={[
                styles.formatOption,
                {
                  backgroundColor: format === 'docx' ? colors.accent : colors.card,
                  borderColor: format === 'docx' ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={styles.formatEmoji}>📄</Text>
              <Text
                style={[
                  styles.formatLabel,
                  { color: format === 'docx' ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                Word (.docx)
              </Text>
              <Text
                style={[
                  styles.formatSub,
                  { color: format === 'docx' ? '#E0E7FF' : colors.textMuted },
                ]}
              >
                Printable Doc
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic('light');
                setFormat('pptx');
              }}
              style={[
                styles.formatOption,
                {
                  backgroundColor: format === 'pptx' ? colors.accent : colors.card,
                  borderColor: format === 'pptx' ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={styles.formatEmoji}>📊</Text>
              <Text
                style={[
                  styles.formatLabel,
                  { color: format === 'pptx' ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                PowerPoint (.pptx)
              </Text>
              <Text
                style={[
                  styles.formatSub,
                  { color: format === 'pptx' ? '#E0E7FF' : colors.textMuted },
                ]}
              >
                Slide Deck
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic('light');
                setFormat('both');
              }}
              style={[
                styles.formatOption,
                {
                  backgroundColor: format === 'both' ? colors.accent : colors.card,
                  borderColor: format === 'both' ? colors.accent : colors.border,
                },
              ]}
            >
              <Text style={styles.formatEmoji}>📦</Text>
              <Text
                style={[
                  styles.formatLabel,
                  { color: format === 'both' ? '#FFFFFF' : colors.textPrimary },
                ]}
              >
                Both Formats
              </Text>
              <Text
                style={[
                  styles.formatSub,
                  { color: format === 'both' ? '#E0E7FF' : colors.textMuted },
                ]}
              >
                Docx + Pptx
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section 2: Document Detail Style */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            2. Document Style
          </Text>
          <View style={styles.styleContainer}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic('light');
                setStyle('full');
              }}
              style={[
                styles.styleCard,
                {
                  backgroundColor: style === 'full' ? (colors.isDark ? '#1E3A8A33' : '#EFF6FF') : colors.card,
                  borderColor: style === 'full' ? colors.accent : colors.border,
                },
              ]}
            >
              <View style={styles.styleRadioRow}>
                <Text style={[styles.radioCircle, { color: style === 'full' ? colors.accent : colors.border }]}>
                  {style === 'full' ? '●' : '○'}
                </Text>
                <Text style={[styles.styleTitle, { color: colors.textPrimary }]}>
                  Full Detail (Worksheet)
                </Text>
              </View>
              <Text style={[styles.styleDesc, { color: colors.textSecondary }]}>
                Includes questions, all options, required markers, type badges, help text, and jump navigation notes.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                triggerHaptic('light');
                setStyle('simple');
              }}
              style={[
                styles.styleCard,
                {
                  backgroundColor: style === 'simple' ? (colors.isDark ? '#1E3A8A33' : '#EFF6FF') : colors.card,
                  borderColor: style === 'simple' ? colors.accent : colors.border,
                },
              ]}
            >
              <View style={styles.styleRadioRow}>
                <Text style={[styles.radioCircle, { color: style === 'simple' ? colors.accent : colors.border }]}>
                  {style === 'simple' ? '●' : '○'}
                </Text>
                <Text style={[styles.styleTitle, { color: colors.textPrimary }]}>
                  Simple List
                </Text>
              </View>
              <Text style={[styles.styleDesc, { color: colors.textSecondary }]}>
                Clean layout containing only the question titles and choices.
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section 3: Document Content Toggles */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            3. Formatting & Toggles
          </Text>
          <Card elevated style={styles.togglesCard}>
            <OptionToggle
              label="Include Answer Lines / Blank Boxes"
              description="Adds blank handwriting answer lines so the file works as a printable paper worksheet."
              value={includeAnswerLines}
              onValueChange={setIncludeAnswerLines}
              icon={<Text style={styles.toggleIcon}>✍️</Text>}
            />

            <OptionToggle
              label="Include Cover Page"
              description="Generates an executive cover / title slide with metadata, author, and date."
              value={includeCoverPage}
              onValueChange={setIncludeCoverPage}
              icon={<Text style={styles.toggleIcon}>📑</Text>}
            />

            <OptionToggle
              label="Include Table of Contents"
              description="Creates a section-by-section outline of all pages in the form."
              value={includeTableOfContents}
              onValueChange={setIncludeTableOfContents}
              icon={<Text style={styles.toggleIcon}>🗂️</Text>}
            />

            <OptionToggle
              label="Include Page Numbers"
              description="Adds professional header/footer page numbering."
              value={includePageNumbers}
              onValueChange={setIncludePageNumbers}
              icon={<Text style={styles.toggleIcon}>🔢</Text>}
              style={{ borderBottomWidth: 0 }}
            />
          </Card>

          {/* Section 4: Document Metadata Inputs */}
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            4. Document Metadata
          </Text>
          <Card elevated style={styles.metadataCard}>
            <Input
              label="Document Title"
              value={documentTitle}
              onChangeText={setDocumentTitle}
              placeholder="e.g. Annual School Survey 2026"
            />

            <Input
              label="Author / Extractor Name"
              value={authorName}
              onChangeText={setAuthorName}
              placeholder="e.g. FormScribe or Your Name"
              containerStyle={{ marginBottom: 0 }}
            />
          </Card>

          {/* Export Action CTA */}
          <View style={styles.exportActionContainer}>
            {exporting && (
              <Text style={[styles.progressText, { color: colors.accent }]}>
                ⏳ {progressStatus}
              </Text>
            )}

            <Button
              title={exporting ? 'Generating Documents...' : 'Generate & Export Now'}
              onPress={handleExport}
              loading={exporting}
              size="lg"
              icon={<Text style={{ fontSize: 18 }}>🚀</Text>}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formatSegmentContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  formatOption: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formatEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  formatLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  formatSub: {
    fontSize: 10,
    marginTop: 2,
  },
  styleContainer: {
    gap: 8,
    marginBottom: 12,
  },
  styleCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
  },
  styleRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  radioCircle: {
    fontSize: 18,
    marginRight: 8,
    fontWeight: 'bold',
  },
  styleTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  styleDesc: {
    fontSize: 12,
    lineHeight: 16,
    paddingLeft: 26,
  },
  togglesCard: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 12,
  },
  toggleIcon: {
    fontSize: 18,
  },
  metadataCard: {
    padding: 16,
    marginBottom: 20,
  },
  exportActionContainer: {
    marginTop: 4,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
});
