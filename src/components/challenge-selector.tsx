import { useRouter } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { getAllChallenges } from '../constants/challenges';
import { useTheme } from '../contexts/ThemeContext';
import { useChallengeStore } from '../store/challengeStore';

export const ChallengeSelector: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { setSelectedChallenge } = useChallengeStore();
  const challenges = getAllChallenges();

  const handleSelectChallenge = (challengeId: string) => {
    setSelectedChallenge(challengeId as any);
    router.push('/');
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Selecione um Desafio
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Sprint Mobile Development & IoT
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {challenges.map((challenge) => (
            <TouchableOpacity
              key={challenge.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                },
              ]}
              activeOpacity={0.8}
              onPress={() => handleSelectChallenge(challenge.id)}
            >
              <View
                style={[
                  styles.cardHeader,
                  { borderBottomColor: theme.colors.border },
                ]}
              >
                <Text style={styles.icon}>{challenge.icon}</Text>
                <Text
                  style={[styles.cardTitle, { color: theme.colors.text }]}
                >
                  {challenge.name}
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text
                  style={[
                    styles.description,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {challenge.description}
                </Text>

                <View style={styles.featuresList}>
                  <Text
                    style={[
                      styles.featuresLabel,
                      { color: theme.colors.text },
                    ]}
                  >
                    Funcionalidades:
                  </Text>
                  {challenge.keyFeatures.slice(0, 3).map((feature, idx) => (
                    <Text
                      key={idx}
                      style={[
                        styles.feature,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      • {feature}
                    </Text>
                  ))}
                </View>

                <View style={styles.metaInfo}>
                  <View style={styles.metaItem}>
                    <Text
                      style={[
                        styles.metaLabel,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      Público:
                    </Text>
                    <Text
                      style={[styles.metaValue, { color: theme.colors.text }]}
                    >
                      {challenge.targetAudience}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.selectButton,
                    { backgroundColor: challenge.color },
                  ]}
                  onPress={() => handleSelectChallenge(challenge.id)}
                >
                  <Text style={styles.selectButtonText}>
                    Selecionar Desafio →
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardsContainer: {
    padding: 16,
    gap: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  icon: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  cardContent: {
    padding: 16,
    gap: 12,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  featuresList: {
    gap: 6,
  },
  featuresLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  feature: {
    fontSize: 12,
    lineHeight: 16,
  },
  metaInfo: {
    marginTop: 8,
  },
  metaItem: {
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 12,
  },
  selectButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  selectButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default ChallengeSelector;
