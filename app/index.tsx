import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.tagline}>Your Executive Coach</Text>
          <Text style={styles.heroHeadline}>
            A coach who remembers every pattern you've shared
          </Text>
          <Text style={styles.heroBody}>
            Unlike generic AI chatbots that forget everything between sessions,
            your coach builds a deep understanding of you over time — your goals,
            habits, emotions, and growth areas.
          </Text>
        </View>

        {/* Comparison Card */}
        <View style={styles.comparisonCard}>
          <Text style={styles.comparisonTitle}>
            Persistent memory, not a fresh start
          </Text>
          <View style={styles.comparisonRow}>
            {/* Generic Chatbot Column */}
            <View style={[styles.comparisonColumn, styles.genericColumn]}>
              <Text style={styles.columnLabel}>Generic Chatbot</Text>
              <View style={styles.comparisonItem}>
                <Text style={styles.crossIcon}>✗</Text>
                <Text style={styles.comparisonItemText}>Forgets every session</Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.crossIcon}>✗</Text>
                <Text style={styles.comparisonItemText}>No context about you</Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.crossIcon}>✗</Text>
                <Text style={styles.comparisonItemText}>Generic advice</Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.crossIcon}>✗</Text>
                <Text style={styles.comparisonItemText}>No pattern tracking</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.columnDivider} />

            {/* Executive Coach AI Column */}
            <View style={[styles.comparisonColumn, styles.coachColumn]}>
              <Text style={[styles.columnLabel, styles.coachColumnLabel]}>
                Executive Coach AI
              </Text>
              <View style={styles.comparisonItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.comparisonItemText}>Remembers everything</Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.comparisonItemText}>Deep personal context</Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.comparisonItemText}>Personalized guidance</Text>
              </View>
              <View style={styles.comparisonItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.comparisonItemText}>Tracks your patterns</Text>
              </View>
            </View>
          </View>
        </View>

        {/* What Your Coach Will Track Section */}
        <View style={styles.trackingSection}>
          <Text style={styles.trackingSectionTitle}>What Your Coach Will Track</Text>
          <Text style={styles.trackingSectionSubtitle}>
            Build a complete picture of your professional growth
          </Text>

          <View style={styles.trackingTilesRow}>
            {/* Tasks Tile */}
            <View style={styles.trackingTile}>
              <Text style={styles.tileIcon}>✅</Text>
              <Text style={styles.tileName}>Tasks</Text>
              <Text style={styles.tileDescription}>
                Goals, commitments, and follow-through
              </Text>
            </View>

            {/* Emotions Tile */}
            <View style={styles.trackingTile}>
              <Text style={styles.tileIcon}>💡</Text>
              <Text style={styles.tileName}>Emotions</Text>
              <Text style={styles.tileDescription}>
                Mood patterns and emotional trends
              </Text>
            </View>

            {/* Patterns Tile */}
            <View style={styles.trackingTile}>
              <Text style={styles.tileIcon}>📈</Text>
              <Text style={styles.tileName}>Patterns</Text>
              <Text style={styles.tileDescription}>
                Recurring behaviors and growth areas
              </Text>
            </View>
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={styles.primaryCTA}
            onPress={() => router.push('/sign-up')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryCTAText}>Create your account</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryCTA}
            onPress={() => router.push('/sign-in')}
            activeOpacity={0.75}
          >
            <Text style={styles.secondaryCTAText}>
              Already have an account?{' '}
              <Text style={styles.signInLink}>Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    paddingBottom: 48,
  },

  /* Hero */
  heroSection: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    alignItems: 'center',
  },
  tagline: {
    fontSize: 13,
    fontWeight: '600',
    color: '#818CF8',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  heroHeadline: {
    fontSize: 30,
    fontWeight: '800',
    color: '#F1F5F9',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 16,
  },
  heroBody: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 24,
  },

  /* Comparison Card */
  comparisonCard: {
    marginHorizontal: 20,
    marginBottom: 32,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  comparisonTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 20,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  comparisonColumn: {
    flex: 1,
  },
  genericColumn: {
    paddingRight: 12,
  },
  coachColumn: {
    paddingLeft: 12,
  },
  columnDivider: {
    width: 1,
    backgroundColor: '#334155',
    alignSelf: 'stretch',
  },
  columnLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 12,
    textAlign: 'center',
  },
  coachColumnLabel: {
    color: '#818CF8',
  },
  comparisonItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 6,
  },
  crossIcon: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '700',
    marginTop: 1,
  },
  checkIcon: {
    fontSize: 13,
    color: '#22C55E',
    fontWeight: '700',
    marginTop: 1,
  },
  comparisonItemText: {
    fontSize: 13,
    color: '#94A3B8',
    flex: 1,
    lineHeight: 18,
  },

  /* Tracking Section */
  trackingSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  trackingSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F1F5F9',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackingSectionSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
  },
  trackingTilesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  trackingTile: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tileIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  tileName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F1F5F9',
    marginBottom: 6,
  },
  tileDescription: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 16,
  },

  /* CTA */
  ctaSection: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  primaryCTA: {
    backgroundColor: '#6366F1',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryCTAText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  secondaryCTA: {
    paddingVertical: 8,
  },
  secondaryCTAText: {
    fontSize: 14,
    color: '#64748B',
  },
  signInLink: {
    color: '#818CF8',
    fontWeight: '600',
  },
});
