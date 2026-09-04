import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  ActivityIndicator, Platform, Pressable,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Globe } from 'lucide-react-native';
import { useAI } from '@/context/AIContext';

import { KNM_TOPICS, KNMLanguage, KNMQuestion } from '@/data/knm_topics';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AIQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// ---------------------------------------------------------------------------
// AI question parser
// ---------------------------------------------------------------------------

function parseAIQuestion(raw: string): AIQuestion | null {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.question && Array.isArray(parsed.options) && parsed.correctAnswer) {
        return parsed as AIQuestion;
      }
    }
  } catch {
    // fallthrough to line-based parser
  }

  // Fallback: line-based parse
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const question = lines.find((l) => /^(question|q)[:]/i.test(l))?.replace(/^.*?:\s*/, '') ?? lines[0];
  const options: string[] = [];
  const optionLines = lines.filter((l) => /^[a-dA-D][.)]\s/.test(l) || /^[-•*]\s/.test(l));
  optionLines.forEach((l) => options.push(l.replace(/^[a-dA-D][.)]\s|^[-•*]\s/, '')));
  const correctLine = lines.find((l) => /correct answer/i.test(l));
  const correctAnswer = correctLine?.replace(/.*correct answer[:]\s*/i, '') ?? options[0] ?? '';
  const explanationLine = lines.find((l) => /explanation/i.test(l));
  const explanation = explanationLine?.replace(/.*explanation[:]\s*/i, '') ?? '';

  if (!question || options.length < 2) return null;
  return { question, options, correctAnswer, explanation };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function KNMTopicScreen() {
  const { generate } = useAI();
  const { id, lang } = useLocalSearchParams<{ id: string; lang?: string }>();
  const [language, setLanguage] = useState<KNMLanguage>((lang as KNMLanguage) ?? 'en');
  const [tab, setTab] = useState<'learn' | 'practice'>('learn');

  // Quiz state — static questions
  const [qIndex, setQIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // AI quiz state
  const [aiTab, setAiTab] = useState<'static' | 'ai'>('static');
  const [aiQuestion, setAiQuestion] = useState<AIQuestion | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiSelected, setAiSelected] = useState<number | null>(null);
  const [aiFeedback, setAiFeedback] = useState<{ correct: boolean; explanation: string } | null>(null);
  const [aiIsFallback, setAiIsFallback] = useState(false);

  const topic = KNM_TOPICS.find((t) => t.id === id);

  // -------------------------------------------------------------------------
  // AI quiz logic — must be declared before any early return (rules of hooks)
  // -------------------------------------------------------------------------

  // When Apple Intelligence is unavailable, surface a shuffled static question
  const useStaticFallback = useCallback(() => {
    const staticQuestions = topic?.quizQuestions ?? [];
    if (staticQuestions.length === 0) return;
    const q = staticQuestions[Math.floor(Math.random() * staticQuestions.length)];
    // Shuffle options while keeping track of the correct answer text
    const correctText = q.options[language][q.correctIndex];
    const shuffled = [...q.options[language]].sort(() => Math.random() - 0.5);
    setAiQuestion({
      question: q.question[language],
      options: shuffled,
      correctAnswer: correctText,
      explanation: q.explanation[language],
    });
    setAiIsFallback(true);
  }, [topic, language]);

  const generateAIQuestion = useCallback(async () => {
    setAiLoading(true);
    setAiError('');
    setAiQuestion(null);
    setAiSelected(null);
    setAiFeedback(null);
    setAiIsFallback(false);
    try {
      const langNote = language === 'nl'
        ? 'Write the question and all options in Dutch.'
        : 'Write the question and all options in English.';

      const prompt = `Create a KNM exam question about "${topic?.title.en ?? ''}" in the Netherlands.
${langNote}
Include:
- question (realistic multiple-choice style, as on the real KNM exam)
- 4 options (A, B, C, D)
- correct answer (just the letter, e.g. "A")
- explanation (1-2 sentences)

Respond ONLY in JSON format:
{
  "question": "...",
  "options": ["...", "...", "...", "..."],
  "correctAnswer": "A",
  "explanation": "..."
}`;

      const raw = await generate(prompt);
      const parsed = parseAIQuestion(raw);
      if (parsed) {
        // Normalize correctAnswer letter (A/B/C/D) to the actual option text
        const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
        const idx = letterMap[parsed.correctAnswer.toUpperCase().trim()] ?? 0;
        setAiQuestion({ ...parsed, correctAnswer: parsed.options[idx] ?? parsed.correctAnswer });
      } else {
        // AI returned something unparseable (e.g. JS fallback on simulator).
        // Show a shuffled static question so the tab always works.
        useStaticFallback();
      }
    } catch {
      useStaticFallback();
    } finally {
      setAiLoading(false);
    }
  }, [topic?.title.en, language]);

  // -------------------------------------------------------------------------
  // Early return — after all hooks
  // -------------------------------------------------------------------------

  if (!topic) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'KNM' }} />
        <View style={styles.center}>
          <Text style={styles.errorText}>Topic not found.</Text>
        </View>
      </View>
    );
  }

  const questions: KNMQuestion[] = topic.quizQuestions;
  const currentQ = questions[qIndex];
  const topicColor = topic.color;

  // -------------------------------------------------------------------------
  // Static quiz logic
  // -------------------------------------------------------------------------

  const handleOptionPress = (index: number) => {
    if (feedback) return;
    setSelectedIndex(index);
    const isCorrect = index === currentQ.correctIndex;
    setFeedback({ correct: isCorrect, explanation: currentQ.explanation[language] });
    if (isCorrect) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
      setSelectedIndex(null);
      setFeedback(null);
    } else {
      setFinished(true);
    }
  };

  const resetQuiz = () => {
    setQIndex(0);
    setSelectedIndex(null);
    setFeedback(null);
    setScore(0);
    setFinished(false);
  };

  const handleAIOption = (index: number) => {
    if (aiFeedback || !aiQuestion) return;
    setAiSelected(index);
    const selected = aiQuestion.options[index];
    const isCorrect = selected === aiQuestion.correctAnswer;
    setAiFeedback({ correct: isCorrect, explanation: aiQuestion.explanation });
  };

  // -------------------------------------------------------------------------
  // Render Learn Tab
  // -------------------------------------------------------------------------

  const renderLearn = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {/* Explanation */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>
          {language === 'en' ? 'EXPLANATION' : 'UITLEG'}
        </Text>
        <Text style={styles.explanationText}>{topic.explanation[language]}</Text>
      </View>

      {/* Key Points */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>
          {language === 'en' ? 'KEY POINTS' : 'KERNPUNTEN'}
        </Text>
        {topic.keyPoints.map((point, idx) => (
          <View key={idx} style={styles.bulletRow}>
            <View style={[styles.bullet, { backgroundColor: topicColor }]} />
            <Text style={styles.bulletText}>{point[language]}</Text>
          </View>
        ))}
      </View>

      {/* Examples */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>
          {language === 'en' ? 'EXAMPLES' : 'VOORBEELDEN'}
        </Text>
        {topic.examples.map((ex, idx) => (
          <View key={idx} style={[styles.exampleBox, idx < topic.examples.length - 1 && styles.exampleBorder]}>
            <Ionicons name="chatbubble-outline" size={14} color={topicColor} style={{ marginTop: 2 }} />
            <Text style={styles.exampleText}>{ex[language]}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <TouchableOpacity
        style={[styles.ctaBtn, { backgroundColor: topicColor }]}
        onPress={() => { resetQuiz(); setTab('practice'); }}
      >
        <Ionicons name="school-outline" size={18} color="white" />
        <Text style={styles.ctaBtnText}>
          {language === 'en' ? 'Start Quiz' : 'Start Quiz'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );

  // -------------------------------------------------------------------------
  // Render Practice Tab
  // -------------------------------------------------------------------------

  const renderFinished = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      <View style={styles.finishedCard}>
        <Text style={styles.finishedEmoji}>
          {score >= questions.length * 0.7 ? '🏆' : '💪'}
        </Text>
        <Text style={styles.finishedTitle}>
          {score >= questions.length * 0.7
            ? (language === 'en' ? 'Great job!' : 'Goed gedaan!')
            : (language === 'en' ? 'Keep practising!' : 'Blijf oefenen!')}
        </Text>
        <Text style={styles.finishedScore}>
          {score} / {questions.length} {language === 'en' ? 'correct' : 'correct'}
        </Text>
        <View style={styles.finishedActions}>
          <TouchableOpacity style={[styles.finishedBtn, { backgroundColor: topicColor }]} onPress={resetQuiz}>
            <Text style={styles.finishedBtnText}>{language === 'en' ? 'Try Again' : 'Opnieuw'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.finishedBtn, { backgroundColor: '#e5e7eb' }]}
            onPress={() => setTab('learn')}
          >
            <Text style={[styles.finishedBtnText, { color: '#374151' }]}>
              {language === 'en' ? 'Review Lesson' : 'Herhaal Les'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderStaticQuestion = () => {
    if (finished) return renderFinished();

    return (
      <ScrollView contentContainerStyle={styles.tabContent}>
        {/* Progress */}
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            {language === 'en' ? `Question ${qIndex + 1} of ${questions.length}` : `Vraag ${qIndex + 1} van ${questions.length}`}
          </Text>
          <Text style={[styles.scoreText, { color: topicColor }]}>
            {score} {language === 'en' ? 'correct' : 'goed'}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${(qIndex / questions.length) * 100}%`, backgroundColor: topicColor }]}
          />
        </View>

        {/* Question card */}
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{currentQ.question[language]}</Text>
          {currentQ.options[language].map((opt, idx) => {
            let optStyle = styles.optDefault;
            if (feedback && idx === selectedIndex) {
              optStyle = feedback.correct ? styles.optCorrect : styles.optWrong;
            }
            if (feedback && idx === currentQ.correctIndex && !feedback.correct) {
              optStyle = styles.optCorrect;
            }
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.optBtn, optStyle]}
                onPress={() => handleOptionPress(idx)}
                disabled={!!feedback}
              >
                <Text style={[
                  styles.optText,
                  feedback && (idx === selectedIndex || idx === currentQ.correctIndex) && { color: 'white' },
                ]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Feedback */}
        {feedback && (
          <View style={[styles.feedbackCard, feedback.correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
            <View style={styles.feedbackHeader}>
              <Ionicons
                name={feedback.correct ? 'checkmark-circle' : 'close-circle'}
                size={20}
                color={feedback.correct ? '#16a34a' : '#dc2626'}
              />
              <Text style={[styles.feedbackTitle, { color: feedback.correct ? '#16a34a' : '#dc2626' }]}>
                {feedback.correct
                  ? (language === 'en' ? 'Correct!' : 'Goed!')
                  : (language === 'en' ? 'Not quite right' : 'Niet helemaal goed')}
              </Text>
            </View>
            <Text style={styles.feedbackText}>{feedback.explanation}</Text>
            <TouchableOpacity
              style={[styles.nextBtn, { backgroundColor: topicColor }]}
              onPress={handleNext}
            >
              <Text style={styles.nextBtnText}>
                {qIndex < questions.length - 1
                  ? (language === 'en' ? 'Next Question →' : 'Volgende Vraag →')
                  : (language === 'en' ? 'See Results' : 'Bekijk Resultaten')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderAIQuestion = () => (
    <ScrollView contentContainerStyle={styles.tabContent}>
      {/* Generate button */}
      <TouchableOpacity
        style={[styles.generateBtn, { backgroundColor: topicColor }, aiLoading && { opacity: 0.6 }]}
        onPress={generateAIQuestion}
        disabled={aiLoading}
      >
        {aiLoading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <Ionicons name="sparkles" size={16} color="white" />
            <Text style={styles.generateBtnText}>
              {language === 'en'
                ? (aiQuestion ? 'Generate New Question' : 'Generate AI Question')
                : (aiQuestion ? 'Genereer nieuwe vraag' : 'Genereer AI-vraag')}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* AI Info */}
      {!aiQuestion && !aiLoading && !aiError && (
        <View style={styles.aiInfo}>
          <Text style={styles.aiInfoEmoji}>✨</Text>
          <Text style={styles.aiInfoTitle}>
            {language === 'en' ? 'Apple Intelligence Quiz' : 'Apple Intelligence Quiz'}
          </Text>
          <Text style={styles.aiInfoText}>
            {language === 'en'
              ? 'Tap the button above to generate a unique KNM exam question using Apple Intelligence. Each question is freshly created — great for extra practice beyond the static questions.'
              : 'Tik op de knop hierboven om een unieke KNM-examenvraag te genereren met Apple Intelligence. Elke vraag wordt vers aangemaakt — geweldig voor extra oefening naast de statische vragen.'}
          </Text>
        </View>
      )}

      {/* Error */}
      {aiError ? (
        <View style={styles.errorCard}>
          <Ionicons name="warning-outline" size={20} color="#b45309" />
          <Text style={styles.errorCardText}>{aiError}</Text>
        </View>
      ) : null}

      {/* AI Question */}
      {aiQuestion && !aiLoading && (
        <View style={styles.questionCard}>
          <View style={[styles.aiBadge, aiIsFallback && styles.aiBadgeFallback]}>
            <Ionicons name={aiIsFallback ? 'library-outline' : 'sparkles'} size={12} color={aiIsFallback ? '#0369a1' : '#7c3aed'} />
            <Text style={[styles.aiBadgeText, aiIsFallback && { color: '#0369a1' }]}>
              {aiIsFallback
                ? (language === 'en' ? 'Practice Question' : 'Oefenvraag')
                : 'AI Generated'}
            </Text>
          </View>
          <Text style={styles.questionText}>{aiQuestion.question}</Text>
          {aiQuestion.options.map((opt, idx) => {
            let optStyle = styles.optDefault;
            if (aiFeedback && idx === aiSelected) {
              optStyle = aiFeedback.correct ? styles.optCorrect : styles.optWrong;
            }
            if (aiFeedback && opt === aiQuestion.correctAnswer && aiSelected !== idx) {
              optStyle = styles.optCorrect;
            }
            return (
              <TouchableOpacity
                key={idx}
                style={[styles.optBtn, optStyle]}
                onPress={() => handleAIOption(idx)}
                disabled={!!aiFeedback}
              >
                <Text style={[
                  styles.optText,
                  aiFeedback && (idx === aiSelected || opt === aiQuestion.correctAnswer) && { color: 'white' },
                ]}>
                  {opt}
                </Text>
              </TouchableOpacity>
            );
          })}

          {aiFeedback && (
            <View style={[styles.feedbackCard, aiFeedback.correct ? styles.feedbackCorrect : styles.feedbackWrong, { marginTop: 12 }]}>
              <View style={styles.feedbackHeader}>
                <Ionicons
                  name={aiFeedback.correct ? 'checkmark-circle' : 'close-circle'}
                  size={20}
                  color={aiFeedback.correct ? '#16a34a' : '#dc2626'}
                />
                <Text style={[styles.feedbackTitle, { color: aiFeedback.correct ? '#16a34a' : '#dc2626' }]}>
                  {aiFeedback.correct
                    ? (language === 'en' ? 'Correct!' : 'Goed!')
                    : (language === 'en' ? 'Not quite' : 'Niet helemaal')}
                </Text>
              </View>
              <Text style={styles.feedbackText}>{aiFeedback.explanation}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );

  const renderPractice = () => (
    <View style={{ flex: 1 }}>
      {/* Sub-tab toggle */}
      <View style={styles.subTabRow}>
        <TouchableOpacity
          style={[styles.subTab, aiTab === 'static' && { backgroundColor: topicColor }]}
          onPress={() => setAiTab('static')}
        >
          <Ionicons name="list-outline" size={14} color={aiTab === 'static' ? 'white' : '#6b7280'} />
          <Text style={[styles.subTabText, aiTab === 'static' && { color: 'white' }]}>
            {language === 'en' ? 'Practice' : 'Oefenen'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.subTab, aiTab === 'ai' && { backgroundColor: '#7c3aed' }]}
          onPress={() => setAiTab('ai')}
        >
          <Ionicons name="sparkles" size={14} color={aiTab === 'ai' ? 'white' : '#6b7280'} />
          <Text style={[styles.subTabText, aiTab === 'ai' && { color: 'white' }]}>
            {language === 'en' ? 'AI Questions' : 'AI-vragen'}
          </Text>
        </TouchableOpacity>
      </View>
      {aiTab === 'static' ? renderStaticQuestion() : renderAIQuestion()}
    </View>
  );

  // -------------------------------------------------------------------------
  // Main render
  // -------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: topic.title[language],
          headerRight: () => (
            <Pressable
              onPress={() => setLanguage(language === 'en' ? 'nl' : 'en')}
              style={styles.headerLangBtn}
              hitSlop={8}
            >
              <Globe size={16} color="#3b82f6" />
              <Text style={styles.headerLangText}>{language === 'en' ? 'NL' : 'EN'}</Text>
            </Pressable>
          ),
        }}
      />

      {/* Main Tab toggle */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'learn' && { backgroundColor: topicColor }]}
          onPress={() => setTab('learn')}
        >
          <Ionicons name="book-outline" size={16} color={tab === 'learn' ? 'white' : '#6b7280'} />
          <Text style={[styles.tabBtnText, tab === 'learn' && { color: 'white' }]}>
            {language === 'en' ? 'Learn' : 'Leren'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === 'practice' && { backgroundColor: topicColor }]}
          onPress={() => setTab('practice')}
        >
          <Ionicons name="school-outline" size={16} color={tab === 'practice' ? 'white' : '#6b7280'} />
          <Text style={[styles.tabBtnText, tab === 'practice' && { color: 'white' }]}>
            {language === 'en' ? 'Practice' : 'Oefenen'}
          </Text>
        </TouchableOpacity>
      </View>

      {tab === 'learn' ? renderLearn() : renderPractice()}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: 16, color: '#6b7280' },

  headerLangBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#eff6ff',
    borderRadius: 8,
  },
  headerLangText: { fontSize: 13, fontWeight: '700', color: '#3b82f6' },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 6,
    gap: 8,
    backgroundColor: '#f3f4f6',
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  tabBtnText: { fontSize: 14, fontWeight: '700', color: '#6b7280' },

  // Sub-tab toggle
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#f3f4f6',
  },
  subTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
  },
  subTabText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },

  // Content
  tabContent: { padding: 14, paddingTop: 6, paddingBottom: 40 },

  // Card
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9ca3af',
    letterSpacing: 1,
    marginBottom: 10,
  },

  explanationText: { fontSize: 15, color: '#374151', lineHeight: 24 },

  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 7, marginRight: 10, flexShrink: 0 },
  bulletText: { flex: 1, fontSize: 14, color: '#374151', lineHeight: 21 },

  exampleBox: { flexDirection: 'row', gap: 8, paddingVertical: 10 },
  exampleBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  exampleText: { flex: 1, fontSize: 14, color: '#4b5563', lineHeight: 21, fontStyle: 'italic' },

  ctaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 4,
  },
  ctaBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  // Quiz progress
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressText: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  scoreText: { fontSize: 13, fontWeight: '700' },
  progressBar: {
    height: 5,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    marginBottom: 14,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },

  // Question
  questionCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  questionText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: 26,
    marginBottom: 16,
  },

  // Options
  optBtn: {
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  optDefault: { backgroundColor: '#f9fafb', borderColor: '#e5e7eb' },
  optCorrect: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  optWrong: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  optText: { fontSize: 15, fontWeight: '500', color: '#374151' },

  // Feedback
  feedbackCard: { borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 12 },
  feedbackCorrect: { backgroundColor: '#f0fdf4', borderColor: '#bbf7d0' },
  feedbackWrong: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  feedbackHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  feedbackTitle: { fontSize: 15, fontWeight: 'bold' },
  feedbackText: { fontSize: 14, color: '#374151', lineHeight: 21, marginBottom: 12 },

  nextBtn: {
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextBtnText: { color: 'white', fontSize: 14, fontWeight: 'bold' },

  // Finished
  finishedCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  finishedEmoji: { fontSize: 48, marginBottom: 12 },
  finishedTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937' },
  finishedScore: { fontSize: 18, color: '#6b7280', marginTop: 4, marginBottom: 24 },
  finishedActions: { flexDirection: 'row', gap: 12, width: '100%' },
  finishedBtn: {
    flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center',
  },
  finishedBtnText: { color: 'white', fontSize: 15, fontWeight: 'bold' },

  // AI section
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  generateBtnText: { color: 'white', fontSize: 15, fontWeight: 'bold' },

  aiInfo: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  aiInfoEmoji: { fontSize: 32, marginBottom: 10 },
  aiInfoTitle: { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 8 },
  aiInfoText: { fontSize: 14, color: '#6b7280', lineHeight: 22, textAlign: 'center' },

  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ede9fe',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 12,
  },
  aiBadgeText: { fontSize: 11, fontWeight: '700', color: '#7c3aed' },
  aiBadgeFallback: { backgroundColor: '#e0f2fe' },

  errorCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#fde68a',
    marginBottom: 14,
  },
  errorCardText: { flex: 1, fontSize: 14, color: '#92400e', lineHeight: 21 },
});
