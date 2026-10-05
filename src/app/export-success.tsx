import React from 'react';
import {
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
import { useFormState } from '../context/FormContext';
import { useAppTheme } from '../context/ThemeContext';
import { formatFileSize, shareExportedFile } from '../services/fileStorage';
import { triggerHaptic } from '../utils/haptics';

export default function ExportSuccessScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { lastExportResult } = useFormState();

  const handleShareFile = async (fileUri: string, format: 'docx' | 'pptx') => {
    triggerHaptic('medium');
    try {
      await shareExportedFile(
        fileUri,
        format,
        lastExportResult?.documentTitle || 'FormScribe Export'
      );
    } catch {
      // User cancelled
    }
  };

  const handleBackHome = () => {
    triggerHaptic('light');
    router.replace('/');
  };

  const handleBackPreview = () => {
    triggerHaptic('light');
    router.replace('/preview');
  };

  const files = lastExportResult?.files || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Celebration Header */}
        <View style={styles.celebrateHeader}>
          <View style={[styles.successCircle, { backgroundColor: colors.successLight }]}>
            <Text style={styles.successEmoji}>🎉</Text>
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            Export Generated Successfully!
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Your Google Form document is ready and stored locally on your device.
          </Text>
        </View>

        {/* Exported Files List */}
        <View style={styles.filesSection}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Generated Files ({files.length})
          </Text>

          {files.map((file, idx) => {
            const isDocx = file.format === 'docx';
            return (
              <Card key={idx} elevated style={styles.fileCard}>
                <View style={styles.fileHeaderRow}>
                  <View style={[styles.fileIconBox, { backgroundColor: isDocx ? '#EFF6FF' : '#FEF3C7' }]}>
                    <Text style={styles.fileIcon}>{isDocx ? '📄' : '📊'}</Text>
                  </View>

                  <View style={styles.fileDetails}>
                    <Text style={[styles.fileName, { color: colors.textPrimary }]} numberOfLines={2}>
                      {file.fileName}
                    </Text>
                    <Text style={[styles.fileMeta, { color: colors.textMuted }]}>
                      {isDocx ? 'Microsoft Word (.docx)' : 'PowerPoint Presentation (.pptx)'} • {formatFileSize(file.fileSizeBytes)}
                    </Text>
                  </View>
                </View>

                <Button
                  title="Open / Share Again"
                  onPress={() => handleShareFile(file.fileUri, file.format)}
                  variant="outline"
                  size="sm"
                  icon={<Text style={{ fontSize: 13 }}>📤</Text>}
                  style={styles.shareBtn}
                />
              </Card>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="View Form Preview Again"
            onPress={handleBackPreview}
            variant="secondary"
            size="md"
            style={styles.actionBtn}
          />

          <Button
            title="Back to Home"
            onPress={handleBackHome}
            variant="primary"
            size="md"
            style={styles.actionBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
  },
  celebrateHeader: {
    alignItems: 'center',
    marginBottom: 28,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successEmoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  filesSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fileCard: {
    padding: 16,
    marginBottom: 12,
  },
  fileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  fileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  fileIcon: {
    fontSize: 22,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 4,
  },
  fileMeta: {
    fontSize: 12,
  },
  shareBtn: {
    width: '100%',
  },
  actionsContainer: {
    gap: 10,
    marginTop: 8,
  },
  actionBtn: {
    width: '100%',
  },
});
