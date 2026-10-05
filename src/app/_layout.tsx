import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { FormProvider } from '../context/FormContext';
import { ThemeProvider, useAppTheme } from '../context/ThemeContext';
import '../utils/polyfills';

function RootNavigation() {
  const { colors, isDark } = useAppTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.card,
          },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="preview"
          options={{
            title: 'Form Preview',
            headerBackTitle: 'Home',
          }}
        />
        <Stack.Screen
          name="export"
          options={{
            title: 'Export Options',
            presentation: 'modal',
            headerBackTitle: 'Cancel',
          }}
        />
        <Stack.Screen
          name="export-success"
          options={{
            title: 'Export Complete',
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            title: 'Settings & About',
            headerBackTitle: 'Back',
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <FormProvider>
          <RootNavigation />
        </FormProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
