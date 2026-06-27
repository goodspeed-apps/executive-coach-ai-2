/**
 * GAS Template — Master Configuration
 *
 * Auto-generated from AppArchitecture by DevAgent.
 * This is the SINGLE SOURCE OF TRUTH for app identity, design, features, and navigation.
 *
 * Usage:
 *   import { gasConfig } from '../gas.config';
 */

// ─── Types (single-sourced from the schema; see gas.config.types.ts) ─────────
export type * from './gas.config.types';
import type { GasConfig } from './gas.config.types';

// Template-local augmentation (NOT part of the schema GasConfig). settings.tsx hides a
// row whose URL is empty, so '' is a valid "no link" value.
export interface GasLegalConfig {
  privacyUrl: string;
  termsUrl: string;
}

// ─── Configuration ────────────────────────────────────────────────────────────

export const gasConfig: GasConfig & { legal: GasLegalConfig } = {
  app: {
    name: "Executive Coach AI",
    slug: "executive-coach-ai-2",
    description: "Executive Coach AI builds a persistent behavioral model of each user — tracking task completion patterns, emotional triggers, and avoidance cycles across months — to deliver structured weekly retrospectives generated FROM your own behavioral history and real-time nudges when it detects drift. Unlike generic coaching apps that reset to zero context each session, coaching quality here compounds the longer you stay. Built for the $60K+ professional with ADHD who can't afford a $200/hr human coach.",
    scheme: "executive-coach-ai-2",
    version: "1.0.0",
    minRuntimeVersion: "1.0.0",
    updateBranch: "production",
    appStoreUrl: "",
    owner: "goodspeed_app_studio",
  },

  design: {
    mood: "calm",
    colors: {
      text: "#F9FAFB",
      error: "#C44536",
      accent: "#F4A261",
      border: "#1E1E24",
      primary: "#E8622A",
      success: "#10B981",
      surface: "#111114",
      warning: "#F59E0B",
      textDark: "#F9FAFB",
      secondary: "#2D6A4F",
      background: "#0D0D0F",
      borderDark: "#1E1E24",
      primaryDark: "#E8622A",
      surfaceDark: "#111114",
      textSecondary: "#9CA3AF",
      backgroundDark: "#0D0D0F",
      textSecondaryDark: "#9CA3AF",
    },
    typography: {
      bodyFont: "Manrope",
      monoFont: "Sora",
      displayFont: "Outfit",
      headingWeight: "600",
    },
    layout: {
      spacing: "spacious",
      cardStyle: "outlined",
      buttonStyle: "rounded",
      borderRadius: "xl",
      navigationStyle: "standard",
    },
    designIntent: {
      descriptor: "warm midnight coaching desk — grounded executive calm",
      params: {
        elevation: 0.25,
        density: 0.35,
        warmth: 0.7,
        cornerSoftness: 0.6,
        typeWeight: 0.55,
        motionEnergy: 0.35,
      },
    },
    motion: {
      springStiffness: 190,
      springDamping: 21.8,
      durationMs: 336,
      entrance: "slide",
    },
    expression: {
      concept: "The Pocket Coaching Desk — a calm, lamp-lit corner office that lives in your phone, where a single grounded coach sits across from you and never makes you scan, decide, or feel behind.",
      layoutPhilosophy: "standard",
      signatureElements: ["The Coach's Seat", "The Memory-Depth Meter", "The Note-Slide"],
    },
    variants: {
      auth: "centered-card",
      settings: "grouped-cards",
    },
    kitSeed: "0000",
  },

  features: {
    auth: {
      email: true,
      google: false,
      apple: false,
      twitter: false,
      github: false,
      facebook: false,
      discord: false,
      linkedin: false,
      microsoft: false,
      spotify: false,
      slack: false,
      twitch: false,
      notion: false,
      figma: false,
      biometric: {
        enabled: false,
        timeoutMinutes: 5,
      },
      magicLink: false,
      guestMode: false,
      mfa: false,
    },
    pushNotifications: {
      enabled: false,
      permissionTiming: "onboarding",
      channels: ["default"],
    },
    inAppPurchases: {
      enabled: true,
      tiers: [
        {
          name: "Free",
          productId: "free_tier",
          price: "$0",
          features: [
            "Daily check-ins with mood + energy logging",
            "Basic streak tracking",
            "First weekly retrospective",
            "Limited coach chat (capped messages/week)",
            "Basic insights overview",
          ],
        },
        {
          name: "Pro Monthly",
          productId: "executive_coach_pro_monthly",
          price: "$29/month",
          features: [
            "Unlimited weekly retrospectives from your behavioral data",
            "Real-time drift detection and nudges",
            "Unlimited memory-grounded coach chat",
            "Full behavioral memory insights and trend charts",
            "Data export",
            "Priority pattern analysis",
          ],
          trialDays: 7,
        },
        {
          name: "Pro Annual",
          productId: "executive_coach_pro_annual",
          price: "$249/year",
          features: [
            "Everything in Pro Monthly",
            "~28% savings vs monthly",
            "Compounding memory model preserved across the full year",
            "Annual progress retrospective",
          ],
          trialDays: 7,
        },
      ],
      oneTimePurchases: [],
      credits: {
        enabled: false,
        currencyName: "credit",
        currencyNamePlural: "credits",
        iconName: "Coins",
        packs: [],
      },
      marketplace: {
        enabled: false,
        platformFeePercent: 0,
        sellerPayoutMethod: "stripe_connect",
        listingCategories: [],
        requiresApproval: true,
        escrowEnabled: false,
      },
    },
    analytics: {
      enabled: true,
      provider: "posthog",
      crashReporting: false,
      sessionRecording: false,
      featureFlags: false,
    },
    darkMode: {
      enabled: true,
      default: "light",
    },
    offlineSync: {
      enabled: false,
      cachedEntities: [],
      syncStrategy: "on_reconnect",
      encrypted: false,
    },
    gamification: {
      enabled: false,
      elements: [],
    },
    onboarding: {
      enabled: false,
      steps: [],
    },
    helpSystem: false,
    search: {
      enabled: false,
      entities: [],
      implementation: "client-side",
    },
    socialSharing: {
      enabled: false,
      content: [],
      platforms: [],
    },
    i18n: {
      enabled: false,
      locales: ["en"],
      defaultLocale: "en",
    },
    media: {
      imagePicker: false,
      camera: false,
      audioPlayback: false,
      videoPlayback: false,
      fileUpload: false,
    },
    compliance: {
      attDialog: false,
      gdprConsent: false,
      ccpaNotice: false,
      ageGate: false,
      dataExport: true,
    },
    ads: {
      enabled: false,
      provider: "admob",
    },
    notifications: {
      enabled: false,
      categories: {
        transactional: {
          enabled: true,
          defaultOn: true,
        },
        product: {
          enabled: true,
          defaultOn: true,
        },
        marketing: {
          enabled: true,
          defaultOn: false,
        },
      },
      receiptPolling: {
        enabled: true,
        intervalMinutes: 5,
        expireAfterMinutes: 30,
      },
    },
    telemetry: {
      enabled: true,
      flushIntervalMs: 30000,
      maxQueueSize: 200,
      debugOverlay: false,
      ingestUrl: "https://goodspeed.app/api/telemetry/ingest",
    },
    anonymousAuth: {
      enabled: false,
      tables: [],
    },
    backgroundFetch: false,
    csvExport: false,
    showBuiltWithBadge: false,
  },

  navigation: {
    tabs: [
      {
        id: "initial-habits-commitments",
        label: "Initial Habits & Commitments",
        icon: "ListChecks",
        file: "initial-habits-commitments",
      },
      {
        id: "home-coaching-dashboard",
        label: "Home / Coaching Dashboard",
        icon: "Home",
        file: "home-coaching-dashboard",
      },
      {
        id: "weekly-retrospective",
        label: "Weekly Retrospective",
        icon: "ListChecks",
        file: "weekly-retrospective",
      },
      {
        id: "task-commitment-detail",
        label: "Task / Commitment Detail",
        icon: "BarChart3",
        file: "task-commitment-detail",
      },
      {
        id: "settings",
        label: "Settings",
        icon: "Settings",
        file: "settings",
      },
    ],
    hiddenScreens: [],
    modals: ["paywall"],
    navigationPattern: "tab-bar",
    tabBarVariant: "standard",
  },

  releaseChannels: {
    current: "production",
    storeUrl: {
      ios: "",
      android: "",
    },
  },

  compliance: {
    accountDeletionGracePeriod: {
      days: 30,
    },
    allowImmediateDeletion: true,
    exportTables: [
      "profiles",
      "push_tokens",
      "notifications",
      "user_bookmarks",
      "feedback",
      "consent_log",
    ],
    consentBannerRequired: "eu_only",
  },

  ui: {
    breakpoints: {
      tablet: 600,
      desktop: 1024,
    },
    honorDynamicType: true,
    honorReducedMotion: true,
  },

  multiTenancy: {
    enabled: false,
    defaultRole: "member",
  },

  integrations: {
    oauthProviders: [],
  },

  growth: {
    experimentsEnabled: true,
    defaultBackgroundSyncInterval: 60000,
    referralCodeLength: 8,
  },

  media: {
    provider: "supabase",
    maxUploadBytes: 10485760,
    allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
    defaultBucket: "uploads",
    maxImageEdge: 2048,
    signedUrlTtlSeconds: 3600,
  },

  search: {
    defaultLanguage: "en",
    defaultLimit: 20,
    maxLimit: 100,
  },

  realtime: {
    presenceTimeoutMs: 30000,
    autoReconnect: true,
    defaultRetries: 3,
  },

  llm: {
    provider: "anthropic",
    defaultChatModel: "claude-opus-4-1",
    defaultEmbedModel: "claude-3-5-sonnet-20241022",
    defaultTranscribeModel: "whisper-1",
    costScope: "monthly",
    budgetPeriod: "month",
  },

  privacy: {
    dataCategories: [
      {
        type: "NSPrivacyCollectedDataTypeName",
        linked: true,
        tracking: false,
        purposes: ["NSPrivacyCollectedDataTypePurposeAppFunctionality"],
      },
      {
        type: "NSPrivacyCollectedDataTypeEmailAddress",
        linked: true,
        tracking: false,
        purposes: ["NSPrivacyCollectedDataTypePurposeAppFunctionality"],
      },
      {
        type: "NSPrivacyCollectedDataTypeUserID",
        linked: true,
        tracking: false,
        purposes: ["NSPrivacyCollectedDataTypePurposeAppFunctionality"],
      },
      {
        type: "NSPrivacyCollectedDataTypeCrashData",
        linked: false,
        tracking: false,
        purposes: ["NSPrivacyCollectedDataTypePurposeAppFunctionality"],
      },
      {
        type: "NSPrivacyCollectedDataTypePerformanceData",
        linked: false,
        tracking: false,
        purposes: ["NSPrivacyCollectedDataTypePurposeAnalytics"],
      },
      {
        type: "NSPrivacyCollectedDataTypeProductInteraction",
        linked: false,
        tracking: false,
        purposes: ["NSPrivacyCollectedDataTypePurposeAnalytics"],
      },
    ],
    trackingDomains: [],
    attUsageDescription: "We use device identifiers to deliver relevant content and measure engagement. You can opt out in Settings.",
    attTriggerEvent: "first_launch",
  },

  observability: {
    sentryDsn: process.env.SENTRY_DSN ?? '',
    tracesSampleRate: 0.1,
    enableSessionReplay: true,
  },

  costBudgets: {
    defaults: {},
  },

  performance: {
    maxBundleSizeMB: 8,
    coldStartTargetMs: 2500,
  },

  e2e: {
    framework: "maestro",
    cloudWorkspaceId: "",
  },

  admin: {
    enabled: true,
    defaultRoleCheck: "profiles.role",
  },

  monitoring: {
    crashFreeThresholds: {
      production: {
        ios: 99.5,
        android: 99,
      },
      staging: 95,
      preview: 0,
    },
    crashFreeWindow: "24h",
  },

  legal: {
    privacyUrl: "",
    termsUrl: "",
  },

  backend: {
    supabase: {
      url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
      anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    },
    revenuecat: {
      iosKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? '',
      androidKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? '',
    },
    posthog: {
      apiKey: process.env.EXPO_PUBLIC_POSTHOG_API_KEY ?? '',
      host: process.env.EXPO_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com',
    },
    telemetry: {
      // EXPO_PUBLIC_TELEMETRY_INGEST_SECRET — ingest identity HMAC key. Public-bundle
      // value, not an auth secret. TelemetryProvider reads .ingestSecret at module
      // init; the field MUST be present (empty string is OK) or the React tree
      // crashes on first mount. See gas-template GasBackendConfig.telemetry.
      ingestSecret: process.env.EXPO_PUBLIC_TELEMETRY_INGEST_SECRET ?? '',
    },
    stripe: {
      // Same always-emit pattern as telemetry: safe-off empty string at codegen,
      // runtime decides whether to init Stripe based on marketplace.enabled.
      publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
    },
  },
};
