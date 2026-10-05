import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useAppTheme } from '../../context/ThemeContext';
import { triggerHaptic } from '../../utils/haptics';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { Input } from '../common/Input';

interface UrlInputCardProps {
  url: string;
  setUrl: (url: string) => void;
  onSubmit: () => void;
  loading: boolean;
  onClear: () => void;
  onLoadSample: () => void;
}

export function UrlInputCard({
  url,
  setUrl,
  onSubmit,
  loading,
  onClear,
  onLoadSample,
}: UrlInputCardProps) {
  const { colors } = useAppTheme();

  const handlePasteClipboard = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text && text.trim()) {
        triggerHaptic('medium');
        setUrl(text.trim());
      }
    } catch {
      // Fallback
    }
  };

  return (
    <Card elevated style={styles.card}>
      <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
        Import Public Google Form
      </Text>
      <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
        Paste any Google Forms link (including short forms.gle links) to extract all pages into Word or PowerPoint.
      </Text>

      <Input
        placeholder="https://forms.gle/... or docs.google.com/..."
        value={url}
        onChangeText={setUrl}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        returnKeyType="go"
        onSubmitEditing={onSubmit}
        onClear={onClear}
        containerStyle={styles.inputContainer}
      />

      <View style={styles.actionsRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handlePasteClipboard}
          style={[styles.clipboardBtn, { borderColor: colors.border, backgroundColor: colors.badgeBg }]}
        >
          <Text style={[styles.clipboardText, { color: colors.textPrimary }]}>
            📋 Paste from Clipboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onLoadSample}
          style={[styles.sampleBtn, { borderColor: colors.border, backgroundColor: colors.badgeBg }]}
        >
          <Text style={[styles.sampleText, { color: colors.accent }]}>
            ⚡ Test 35-Page Form
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        title={loading ? 'Reading Form (All Pages)...' : 'Read & Extract Form'}
        onPress={onSubmit}
        loading={loading}
        disabled={!url.trim()}
        size="lg"
        style={styles.submitBtn}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 18,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  clipboardBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clipboardText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sampleBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sampleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    marginTop: 4,
  },
});
