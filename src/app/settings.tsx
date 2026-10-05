import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useFormState } from '../context/FormContext';
import { useAppTheme } from '../context/ThemeContext';
import { clearAllHistory } from '../services/historyStorage';
import { ThemeMode } from '../utils/theme';
import { triggerHaptic } from '../utils/haptics';

export default function SettingsScreen() {
  const { mode, setMode, colors } = useAppTheme();
  const { recentForms, setRecentForms } = useFormState();

  const handleSelectTheme = (newMode: ThemeMode) => {
    triggerHaptic('light');
    setMode(newMode);
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear All Recent History',
      'This will delete all saved forms from your device. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            triggerHaptic('medium');
            await clearAllHistory();
            setRecentForms([]);
            Alert.alert('History Cleared', 'All saved forms have been removed.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Section 1: Appearance Theme */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Appearance
        </Text>
        <Card elevated style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
            Color Theme
          </Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
            Choose between System default, Light, or Dark mode.
          </Text>

          <View style={styles.themeOptionsRow}>
            {(['system', 'light', 'dark'] as ThemeMode[]).map((themeItem) => {
              const isSelected = mode === themeItem;
              return (
                <TouchableOpacity
                  key={themeItem}
                  activeOpacity={0.7}
                  onPress={() => handleSelectTheme(themeItem)}
                  style={[
                    styles.themeBtn,
                    {
                      backgroundColor: isSelected ? colors.accent : colors.badgeBg,
                      borderColor: isSelected ? colors.accent : colors.border,
                    },
                  ]}
                >
                  <Text style={styles.themeEmoji}>
                    {themeItem === 'system' ? '🌓' : themeItem === 'light' ? '☀️' : '🌙'}
                  </Text>
                  <Text
                    style={[
                      styles.themeBtnText,
                      { color: isSelected ? '#FFFFFF' : colors.textPrimary },
                    ]}
                  >
                    {themeItem === 'system' ? 'System' : themeItem === 'light' ? 'Light' : 'Dark'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Section 2: Storage & Cache */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          Storage & History
        </Text>
        <Card elevated style={styles.card}>
          <View style={styles.historyInfoRow}>
            <View>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Cached Forms History
              </Text>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
                {recentForms.length} {recentForms.length === 1 ? 'form' : 'forms'} saved locally
              </Text>
            </View>

            <Button
              title="Clear History"
              onPress={handleClearHistory}
              variant="outline"
              size="sm"
              disabled={recentForms.length === 0}
              style={{ borderColor: colors.danger }}
              textStyle={{ color: colors.danger }}
            />
          </View>
        </Card>

        {/* Section 3: Privacy & Security */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          100% On-Device Privacy
        </Text>
        <Card elevated style={styles.card}>
          <View style={styles.privacyRow}>
            <Text style={styles.privacyIcon}>🔒</Text>
            <View style={styles.privacyContent}>
              <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                Zero Data Tracking
              </Text>
              <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
                FormScribe operates strictly client-side on your device. When you paste a link, the HTML is fetched directly and parsed locally into .docx / .pptx files using built-in JavaScript engines.
              </Text>
              <Text style={[styles.privacyText, { color: colors.textSecondary, marginTop: 8 }]}>
                No questions, answers, documents, or personal data are ever transmitted to any third-party server or backend.
              </Text>
            </View>
          </View>
        </Card>

        {/* Section 4: About FormScribe */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
          About FormScribe
        </Text>
        <Card elevated style={styles.card}>
          <View style={styles.aboutHeader}>
            <View style={[styles.aboutLogoBox, { backgroundColor: colors.accent }]}>
              <Text style={styles.aboutLogoEmoji}>📝</Text>
            </View>
            <View>
              <Text style={[styles.appName, { color: colors.textPrimary }]}>
                FormScribe
              </Text>
              <Text style={[styles.appVersion, { color: colors.textMuted }]}>
                Version 1.0.0 (SDK 57)
              </Text>
            </View>
          </View>

          <Text style={[styles.aboutDesc, { color: colors.textSecondary }]}>
            FormScribe transforms complex, multi-page Google Forms (30+ pages) into beautifully structured Microsoft Word (.docx) and PowerPoint (.pptx) documents in seconds.
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <Text style={[styles.featureListTitle, { color: colors.textPrimary }]}>
            ✨ Supported Google Form Features:
          </Text>
          <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
            • Multi-page section navigation & titles
          </Text>
          <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
            • Multiple choice, Checkboxes & Dropdowns
          </Text>
          <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
            • Linear scales & Multi-row question grids
          </Text>
          <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
            • Short answer, Paragraphs, Dates, Times & File uploads
          </Text>
          <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
            • Printable worksheet mode with handwriting lines
          </Text>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />

          <Text style={[styles.licenseText, { color: colors.textMuted }]}>
            Released under the open-source MIT License.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    padding: 16,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  themeOptionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  themeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  themeBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  historyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  privacyIcon: {
    fontSize: 28,
    marginRight: 14,
    marginTop: 2,
  },
  privacyContent: {
    flex: 1,
  },
  privacyText: {
    fontSize: 13,
    lineHeight: 19,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  aboutLogoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  aboutLogoEmoji: {
    fontSize: 22,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
  },
  appVersion: {
    fontSize: 12,
    marginTop: 2,
  },
  aboutDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  featureListTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  featureItem: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 2,
  },
  licenseText: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
