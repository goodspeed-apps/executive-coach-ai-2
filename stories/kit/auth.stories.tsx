import type { Meta, StoryObj } from '@storybook/react';
import { AuthCenteredCard } from '../../components/kit/auth/AuthCenteredCard';
import { AuthSplitHero } from '../../components/kit/auth/AuthSplitHero';
import { AuthMinimalStack } from '../../components/kit/auth/AuthMinimalStack';
import { AuthBoldHeader } from '../../components/kit/auth/AuthBoldHeader';
import { AuthCompact } from '../../components/kit/auth/AuthCompact';
import type { AuthVariantProps } from '../../components/kit/auth/types';

// A fixture view-model shared by every variant story. Mirrors the controller
// surface the variants read: nothing loading, no sub-screens, both OAuth shown,
// all handlers/setters no-op. Each story sets `mode` via args.
const noop = () => {};
const fixtureVm: any = {
  email: 'you@example.com',
  password: '',
  confirmPassword: '',
  passwordError: '',
  appName: 'Acme',
  minPasswordLength: 8,
  loading: false,
  verificationSent: false,
  sent: false,
  appleAvailable: true,
  oauthProvider: null,
  emailUnconfirmed: false,
  resending: false,
  resendCooldown: 0,
  resentConfirmation: false,
  canSubmit: false,
  showGoogle: true,
  showApple: true,
  showTwitter: false,
  showLinkedIn: false,
  showMicrosoft: false,
  hasOAuth: true,
  setEmail: noop,
  setPassword: noop,
  onPasswordChange: noop,
  onConfirmPasswordChange: noop,
  handleEmailLogin: noop,
  handleEmailSignup: noop,
  handleResendVerification: noop,
  handleOAuthLogin: noop,
  handleOAuthSignup: noop,
  handleAppleLogin: noop,
  handleAppleSignup: noop,
  handleSendResetLink: noop,
  handleUpdatePassword: noop,
  backToLogin: noop,
};

// ─── Centered Card (DEFAULT) ──────────────────────────────────────────────
const centeredCardMeta: Meta<typeof AuthCenteredCard> = {
  title: 'Kit/Auth/CenteredCard',
  component: AuthCenteredCard,
  args: { mode: 'login', vm: fixtureVm } as AuthVariantProps,
};
export default centeredCardMeta;
type CenteredCardStory = StoryObj<typeof AuthCenteredCard>;
export const CenteredCard: CenteredCardStory = { name: 'centered-card', args: { mode: 'login', vm: fixtureVm } as AuthVariantProps };

// ─── Split Hero ───────────────────────────────────────────────────────────
export const SplitHero: StoryObj<typeof AuthSplitHero> = {
  name: 'split-hero',
  render: (args) => <AuthSplitHero {...(args as AuthVariantProps)} />,
  args: { mode: 'login', vm: fixtureVm } as AuthVariantProps,
};

// ─── Minimal Stack ────────────────────────────────────────────────────────
export const MinimalStack: StoryObj<typeof AuthMinimalStack> = {
  name: 'minimal-stack',
  render: (args) => <AuthMinimalStack {...(args as AuthVariantProps)} />,
  args: { mode: 'login', vm: fixtureVm } as AuthVariantProps,
};

// ─── Bold Header ──────────────────────────────────────────────────────────
export const BoldHeader: StoryObj<typeof AuthBoldHeader> = {
  name: 'bold-header',
  render: (args) => <AuthBoldHeader {...(args as AuthVariantProps)} />,
  args: { mode: 'login', vm: fixtureVm } as AuthVariantProps,
};

// ─── Compact ──────────────────────────────────────────────────────────────
export const Compact: StoryObj<typeof AuthCompact> = {
  name: 'compact',
  render: (args) => <AuthCompact {...(args as AuthVariantProps)} />,
  args: { mode: 'login', vm: fixtureVm } as AuthVariantProps,
};
