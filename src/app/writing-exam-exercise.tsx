import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import {
  BookOpen,
  PenLine,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Globe,
  BrainCircuit,
  Mail,
  ClipboardList,
  FileText,
  StickyNote,
  ArrowLeft,
  Lightbulb,
} from 'lucide-react-native';
import { useAI } from '@/context/AIContext';
import Colors, { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import {
  getExerciseById,
  WritingExercise,
  ExerciseType,
  FormField,
} from '@/data/writing_exam_exercises';

// ─── Types ─────────────────────────────────────────────────────────────────

type TabMode = 'example' | 'practice';

interface FeedbackResult {
  overallPass: boolean;
  score: string;          // e.g. "3/4 points"
  summary: string;        // short summary sentence
  pointsChecked: Array<{ criterion: string; met: boolean; explanation: string }>;
  grammarNotes: string;
  correctedVersion?: string;
}

// ─── AI Prompt + Parser ────────────────────────────────────────────────────

function buildEvaluationPrompt(exercise: WritingExercise, userAnswer: string): string {
  const criteria = exercise.evaluationCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n');
  const bullets = exercise.bulletPoints.map(b => `- ${b.dutch} (${b.english})`).join('\n');

  return `[writing-exam-evaluate]
You are evaluating a Dutch A2 writing exam answer. Be constructive and educational.

Exercise: "${exercise.title}" (${exercise.titleEnglish})
Type: ${exercise.type}

Task instructions (Dutch/English):
${bullets}

Evaluation criteria:
${criteria}

Student's answer:
"""
${userAnswer}
"""

Respond ONLY in the following JSON format (no extra text before or after):
{
  "overallPass": true or false,
  "score": "X/${exercise.evaluationCriteria.length}",
  "summary": "One sentence summary of the answer quality.",
  "pointsChecked": [
    { "criterion": "criterion text", "met": true or false, "explanation": "Why it was or was not met. If not met, explain exactly what is missing or wrong." }
  ],
  "grammarNotes": "List any grammar or spelling mistakes found, with corrections. If none, say 'No grammar mistakes found.'",
  "correctedVersion": "If there are significant grammar issues, provide a corrected version of the student's text. Otherwise leave empty string."
}`;
}

function parseFeedback(raw: string): FeedbackResult | null {
  try {
    // Extract JSON from the response (handle any leading/trailing text)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed as FeedbackResult;
  } catch {
    return null;
  }
}

// ─── Sub-components ────────────────────────────────────────────────────────

function TypeIcon({ type, color, size }: { type: ExerciseType; color: string; size: number }) {
  switch (type) {
    case 'email': return <Mail size={size} color={color} />;
    case 'form': return <ClipboardList size={size} color={color} />;
    case 'article': return <FileText size={size} color={color} />;
    case 'note': return <StickyNote size={size} color={color} />;
  }
}

const TYPE_COLOR: Record<ExerciseType, string> = {
  email: '#3b82f6',
  article: '#10b981',
  form: '#f59e0b',
  note: '#8b5cf6',
};

// Email template display component
function EmailTemplateDisplay({
  exercise,
  theme,
  showEnglish,
  children,
}: {
  exercise: WritingExercise;
  theme: typeof Colors.light;
  showEnglish: boolean;
  children?: React.ReactNode;
}) {
  const tpl = exercise.emailTemplate!;
  return (
    <View style={[emailStyles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      <View style={[emailStyles.header, { borderBottomColor: theme.border }]}>
        <View style={emailStyles.headerRow}>
          <Text style={[emailStyles.headerLabel, { color: theme.textSecondary }]}>
            {showEnglish ? 'To' : 'Aan'}
          </Text>
          <Text style={[emailStyles.headerValue, { color: theme.text }]}>{tpl.to}</Text>
        </View>
        <View style={emailStyles.headerRow}>
          <Text style={[emailStyles.headerLabel, { color: theme.textSecondary }]}>
            {showEnglish ? 'Subject' : 'Onderwerp'}
          </Text>
          <Text style={[emailStyles.headerValue, { color: theme.text }]}>{tpl.subject}</Text>
        </View>
      </View>
      <View style={emailStyles.body}>
        <Text style={[emailStyles.greeting, { color: theme.text }]}>{tpl.greeting}</Text>
        {children}
        <Text style={[emailStyles.closing, { color: theme.text }]}>{tpl.closing}</Text>
      </View>
    </View>
  );
}

const emailStyles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
  },
  headerRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
  },
  headerLabel: {
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.medium,
    width: 60,
  },
  headerValue: {
    fontSize: FontSize.footnote,
    flex: 1,
  },
  body: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  greeting: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.sm,
  },
  closing: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.sm,
  },
});

// Form example display
function FormExampleDisplay({
  exercise,
  theme,
  showEnglish,
}: {
  exercise: WritingExercise;
  theme: typeof Colors.light;
  showEnglish: boolean;
}) {
  return (
    <View style={[formStyles.container, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
      {exercise.formFields!.map((field, idx) => (
        <View
          key={field.id}
          style={[
            formStyles.fieldRow,
            { borderBottomColor: theme.divider },
            idx === exercise.formFields!.length - 1 && { borderBottomWidth: 0 },
          ]}
        >
          <Text style={[formStyles.fieldLabel, { color: theme.textSecondary }]}>
            {showEnglish ? field.labelEnglish : field.label}
          </Text>
          <Text style={[formStyles.fieldValue, { color: theme.text }]}>{field.sampleValue}</Text>
        </View>
      ))}
    </View>
  );
}

const formStyles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fieldRow: {
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fieldLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: FontSize.subhead,
    lineHeight: 22,
  },
});

// Feedback display component
function FeedbackDisplay({
  feedback,
  theme,
  showEnglish,
}: {
  feedback: FeedbackResult;
  theme: typeof Colors.light;
  showEnglish: boolean;
}) {
  const [showCorrection, setShowCorrection] = useState(false);

  return (
    <View style={feedbackStyles.container}>
      {/* Overall result */}
      <View
        style={[
          feedbackStyles.overallCard,
          {
            backgroundColor: feedback.overallPass ? theme.successLight : theme.dangerLight,
            borderColor: feedback.overallPass ? theme.success + '40' : theme.danger + '40',
          },
        ]}
      >
        <View style={feedbackStyles.overallRow}>
          {feedback.overallPass ? (
            <CheckCircle2 size={26} color={theme.success} />
          ) : (
            <XCircle size={26} color={theme.danger} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={[feedbackStyles.overallTitle, { color: feedback.overallPass ? theme.success : theme.danger }]}>
              {feedback.overallPass
                ? (showEnglish ? 'Good work!' : 'Goed gedaan!')
                : (showEnglish ? 'Needs improvement' : 'Kan beter')}
            </Text>
            <Text style={[feedbackStyles.scoreText, { color: theme.text }]}>
              {showEnglish ? 'Score' : 'Score'}: {feedback.score} {showEnglish ? 'criteria met' : 'criteria gehaald'}
            </Text>
          </View>
        </View>
        <Text style={[feedbackStyles.summary, { color: theme.text }]}>{feedback.summary}</Text>
      </View>

      {/* Points breakdown */}
      <View style={[feedbackStyles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[feedbackStyles.sectionTitle, { color: theme.text }]}>
          {showEnglish ? 'Criteria Breakdown' : 'Criteria'}
        </Text>
        {feedback.pointsChecked.map((point, idx) => (
          <View
            key={idx}
            style={[
              feedbackStyles.criterionRow,
              { borderBottomColor: theme.divider },
              idx === feedback.pointsChecked.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={feedbackStyles.criterionHeader}>
              {point.met ? (
                <CheckCircle2 size={16} color={theme.success} />
              ) : (
                <XCircle size={16} color={theme.danger} />
              )}
              <Text style={[feedbackStyles.criterionText, { color: theme.text }]}>
                {point.criterion}
              </Text>
            </View>
            {!point.met && (
              <View style={[feedbackStyles.explanationBox, { backgroundColor: theme.dangerLight }]}>
                <Lightbulb size={13} color={theme.danger} />
                <Text style={[feedbackStyles.explanationText, { color: theme.text }]}>
                  {point.explanation}
                </Text>
              </View>
            )}
            {point.met && point.explanation && point.explanation !== 'Met.' && (
              <Text style={[feedbackStyles.metNote, { color: theme.textSecondary }]}>
                {point.explanation}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Grammar notes */}
      <View style={[feedbackStyles.section, { backgroundColor: theme.cardBackground }]}>
        <Text style={[feedbackStyles.sectionTitle, { color: theme.text }]}>
          {showEnglish ? 'Grammar & Spelling' : 'Grammatica & Spelling'}
        </Text>
        <Text style={[feedbackStyles.grammarText, { color: theme.text }]}>
          {feedback.grammarNotes}
        </Text>
      </View>

      {/* Corrected version */}
      {feedback.correctedVersion && feedback.correctedVersion.trim().length > 0 && (
        <View style={[feedbackStyles.section, { backgroundColor: theme.cardBackground }]}>
          <Pressable
            onPress={() => setShowCorrection(v => !v)}
            style={feedbackStyles.correctionHeader}
          >
            <Text style={[feedbackStyles.sectionTitle, { color: theme.text }]}>
              {showEnglish ? 'Improved version' : 'Verbeterde versie'}
            </Text>
            {showCorrection ? (
              <ChevronUp size={18} color={theme.textSecondary} />
            ) : (
              <ChevronDown size={18} color={theme.textSecondary} />
            )}
          </Pressable>
          {showCorrection && (
            <View style={[feedbackStyles.correctionBox, { backgroundColor: theme.surfaceSecondary }]}>
              <Text style={[feedbackStyles.correctionText, { color: theme.text }]}>
                {feedback.correctedVersion}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const feedbackStyles = StyleSheet.create({
  container: { gap: Spacing.md },
  overallCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  overallRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  overallTitle: {
    fontSize: FontSize.title3,
    fontWeight: FontWeight.bold,
  },
  scoreText: {
    fontSize: FontSize.footnote,
    marginTop: 2,
  },
  summary: {
    fontSize: FontSize.subhead,
    lineHeight: 22,
  },
  section: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  sectionTitle: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.md,
  },
  criterionRow: {
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  criterionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  criterionText: {
    flex: 1,
    fontSize: FontSize.subhead,
    lineHeight: 20,
  },
  explanationBox: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'flex-start',
    marginTop: Spacing.xs,
  },
  explanationText: {
    flex: 1,
    fontSize: FontSize.footnote,
    lineHeight: 20,
  },
  metNote: {
    fontSize: FontSize.footnote,
    lineHeight: 18,
    marginLeft: 24,
  },
  grammarText: {
    fontSize: FontSize.subhead,
    lineHeight: 22,
  },
  correctionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  correctionBox: {
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  correctionText: {
    fontSize: FontSize.subhead,
    lineHeight: 24,
  },
});

// ─── Main Screen ───────────────────────────────────────────────────────────

export default function WritingExamExerciseScreen() {
  const { id, showEnglish: showEnParam } = useLocalSearchParams<{ id: string; showEnglish: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { generate } = useAI();

  const exercise = getExerciseById(id ?? '');
  const [showEnglish, setShowEnglish] = useState(showEnParam === '1');
  const [activeTab, setActiveTab] = useState<TabMode>('example');
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [showSampleInPractice, setShowSampleInPractice] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  if (!exercise) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Exercise not found.</Text>
      </View>
    );
  }

  const typeColor = TYPE_COLOR[exercise.type];

  const handleEvaluate = async () => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);
    setFeedback(null);

    try {
      const prompt = buildEvaluationPrompt(exercise, userAnswer);
      const raw = await generate(prompt);
      const parsed = parseFeedback(raw);
      if (parsed) {
        setFeedback(parsed);
        setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
      } else {
        Alert.alert(
          showEnglish ? 'Feedback Error' : 'Fout',
          showEnglish
            ? 'Could not parse the AI response. Please try again.'
            : 'Kon de AI-reactie niet lezen. Probeer het opnieuw.',
        );
      }
    } catch (err) {
      Alert.alert(
        showEnglish ? 'AI Unavailable' : 'AI niet beschikbaar',
        showEnglish
          ? 'The on-device AI model is not available. Install it from Settings › On-device AI.'
          : 'Het AI-model is niet beschikbaar. Installeer het via Instellingen › AI op het apparaat.',
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleReset = () => {
    setUserAnswer('');
    setFeedback(null);
    setShowSampleInPractice(false);
  };

  // ── EXAMPLE TAB ──────────────────────────────────────────────────────────
  const renderExampleTab = () => (
    <View style={styles.tabContent}>
      {/* Context */}
      <View style={[styles.contextCard, { backgroundColor: typeColor + '12', borderColor: typeColor + '30' }]}>
        <Text style={[styles.contextLabel, { color: typeColor }]}>
          {showEnglish ? 'Situation' : 'Situatie'}
        </Text>
        <Text style={[styles.contextText, { color: theme.text }]}>
          {showEnglish ? exercise.contextEnglish : exercise.context}
        </Text>
      </View>

      {/* Bullet points */}
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          {showEnglish ? 'What to include:' : 'Wat moet erin:'}
        </Text>
        {exercise.bulletPoints.map((b, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={[styles.bulletDot, { backgroundColor: typeColor }]} />
            <Text style={[styles.bulletText, { color: theme.text }]}>
              {showEnglish ? b.english : b.dutch}
            </Text>
          </View>
        ))}
      </View>

      {/* Sample answer */}
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          {showEnglish ? 'Example answer:' : 'Voorbeeldantwoord:'}
        </Text>

        {exercise.type === 'email' ? (
          <EmailTemplateDisplay exercise={exercise} theme={theme} showEnglish={showEnglish}>
            <Text style={[styles.sampleBodyText, { color: theme.text }]}>
              {/* Extract just the body (between greeting and closing) */}
              {extractEmailBody(exercise.sampleAnswer)}
            </Text>
          </EmailTemplateDisplay>
        ) : exercise.type === 'form' ? (
          <FormExampleDisplay exercise={exercise} theme={theme} showEnglish={showEnglish} />
        ) : exercise.type === 'note' ? (
          <EmailTemplateDisplay exercise={exercise} theme={theme} showEnglish={showEnglish}>
            <Text style={[styles.sampleBodyText, { color: theme.text }]}>
              {extractEmailBody(exercise.sampleAnswer)}
            </Text>
          </EmailTemplateDisplay>
        ) : (
          <View style={[styles.articleBox, { backgroundColor: theme.surfaceSecondary }]}>
            <Text style={[styles.articleText, { color: theme.text }]}>
              {showEnglish ? exercise.sampleAnswerEnglish : exercise.sampleAnswer}
            </Text>
          </View>
        )}

        {/* Show English translation toggle for non-English users */}
        {!showEnglish && (
          <Pressable
            style={[styles.translationToggle, { borderColor: theme.border }]}
            onPress={() => setShowEnglish(true)}
          >
            <Globe size={14} color={theme.textSecondary} />
            <Text style={[styles.translationToggleText, { color: theme.textSecondary }]}>
              Show English translation
            </Text>
          </Pressable>
        )}
        {showEnglish && exercise.type !== 'form' && (
          <View style={[styles.translationBox, { backgroundColor: theme.surfaceSecondary }]}>
            <Text style={[styles.translationLabel, { color: theme.textSecondary }]}>
              English translation:
            </Text>
            <Text style={[styles.translationText, { color: theme.text }]}>
              {exercise.sampleAnswerEnglish}
            </Text>
          </View>
        )}
      </View>

      {/* Evaluation criteria */}
      <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          {showEnglish ? 'Grading criteria:' : 'Beoordelingscriteria:'}
        </Text>
        {exercise.evaluationCriteria.map((c, i) => (
          <View key={i} style={styles.criteriaRow}>
            <Text style={[styles.criteriaNum, { color: typeColor }]}>{i + 1}</Text>
            <Text style={[styles.criteriaText, { color: theme.text }]}>{c}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ── PRACTICE TAB ─────────────────────────────────────────────────────────
  const renderPracticeTab = () => (
    <View style={styles.tabContent}>
      {/* Context reminder */}
      <View style={[styles.contextCard, { backgroundColor: typeColor + '12', borderColor: typeColor + '30' }]}>
        <Text style={[styles.contextLabel, { color: typeColor }]}>
          {showEnglish ? 'Your task' : 'Jouw opgave'}
        </Text>
        <Text style={[styles.contextText, { color: theme.text }]}>
          {showEnglish ? exercise.contextEnglish : exercise.context}
        </Text>
        <View style={styles.bulletListSmall}>
          {exercise.bulletPoints.map((b, i) => (
            <View key={i} style={styles.bulletRow}>
              <View style={[styles.bulletDot, { backgroundColor: typeColor }]} />
              <Text style={[styles.bulletTextSmall, { color: theme.text }]}>
                {showEnglish ? b.english : b.dutch}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Input area */}
      {exercise.type === 'email' || exercise.type === 'note' ? (
        // Email/Note: show template with textarea inside
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {showEnglish ? 'Write your answer:' : 'Schrijf uw antwoord:'}
          </Text>
          <EmailTemplateDisplay exercise={exercise} theme={theme} showEnglish={showEnglish}>
            <TextInput
              style={[styles.bodyInput, { backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: feedback ? (feedback.overallPass ? theme.success + '60' : theme.danger + '60') : theme.border }]}
              placeholder={showEnglish ? 'Write your message here...' : 'Schrijf uw bericht hier...'}
              placeholderTextColor={theme.textSecondary}
              value={userAnswer}
              onChangeText={text => { setUserAnswer(text); if (feedback) setFeedback(null); }}
              multiline
              textAlignVertical="top"
              autoCapitalize="sentences"
              autoCorrect={false}
              editable={!isEvaluating}
            />
          </EmailTemplateDisplay>
        </View>
      ) : exercise.type === 'form' ? (
        // Form: show fields with text inputs
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {showEnglish ? 'Fill in the form:' : 'Vul het formulier in:'}
          </Text>
          <View style={[formStyles.container, { borderColor: theme.border }]}>
            <TextInput
              style={[styles.formTextArea, { backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: theme.border }]}
              placeholder={showEnglish
                ? 'Fill in all the form fields here (name, address, answers to questions...).\n\nExample:\nName: Your Name\nAddress: ...'
                : 'Vul hier alle formuliervelden in (naam, adres, antwoorden op vragen...).\n\nVoorbeeld:\nNaam: Uw naam\nAdres: ...'}
              placeholderTextColor={theme.textSecondary}
              value={userAnswer}
              onChangeText={text => { setUserAnswer(text); if (feedback) setFeedback(null); }}
              multiline
              textAlignVertical="top"
              autoCapitalize="sentences"
              autoCorrect={false}
              editable={!isEvaluating}
            />
          </View>
          {/* Show field labels as a hint */}
          <View style={[styles.fieldHintsBox, { backgroundColor: theme.surfaceSecondary }]}>
            <Text style={[styles.fieldHintsTitle, { color: theme.textSecondary }]}>
              {showEnglish ? 'Fields to fill in:' : 'In te vullen velden:'}
            </Text>
            {exercise.formFields!.map(f => (
              <Text key={f.id} style={[styles.fieldHintItem, { color: theme.textSecondary }]}>
                • {showEnglish ? f.labelEnglish : f.label}
              </Text>
            ))}
          </View>
        </View>
      ) : (
        // Article / general text
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {showEnglish ? 'Write your text (min. 3 sentences):' : 'Schrijf uw tekst (min. 3 zinnen):'}
          </Text>
          <TextInput
            style={[
              styles.articleInput,
              { backgroundColor: theme.surfaceSecondary, color: theme.text, borderColor: feedback ? (feedback.overallPass ? theme.success + '60' : theme.danger + '60') : theme.border },
            ]}
            placeholder={showEnglish ? 'Write at least 3 complete sentences...' : 'Schrijf minimaal 3 hele zinnen...'}
            placeholderTextColor={theme.textSecondary}
            value={userAnswer}
            onChangeText={text => { setUserAnswer(text); if (feedback) setFeedback(null); }}
            multiline
            textAlignVertical="top"
            autoCapitalize="sentences"
            autoCorrect={false}
            editable={!isEvaluating}
          />
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.actionRow}>
        <Pressable
          style={[
            styles.evaluateBtn,
            { backgroundColor: typeColor },
            (!userAnswer.trim() || isEvaluating) && styles.btnDisabled,
          ]}
          onPress={handleEvaluate}
          disabled={!userAnswer.trim() || isEvaluating}
        >
          {isEvaluating ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <BrainCircuit size={18} color="white" />
              <Text style={styles.evaluateBtnText}>
                {showEnglish ? 'Check with AI' : 'Controleer met AI'}
              </Text>
            </>
          )}
        </Pressable>
        {(userAnswer.length > 0 || feedback) && (
          <Pressable style={[styles.resetBtn, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]} onPress={handleReset}>
            <RotateCcw size={18} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Show sample toggle */}
      {!feedback && (
        <Pressable
          style={[styles.showSampleBtn, { borderColor: theme.border }]}
          onPress={() => setShowSampleInPractice(v => !v)}
        >
          <BookOpen size={15} color={theme.textSecondary} />
          <Text style={[styles.showSampleText, { color: theme.textSecondary }]}>
            {showSampleInPractice
              ? (showEnglish ? 'Hide example answer' : 'Verberg voorbeeldantwoord')
              : (showEnglish ? 'Show example answer' : 'Toon voorbeeldantwoord')}
          </Text>
          {showSampleInPractice ? <ChevronUp size={15} color={theme.textSecondary} /> : <ChevronDown size={15} color={theme.textSecondary} />}
        </Pressable>
      )}

      {showSampleInPractice && !feedback && (
        <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {showEnglish ? 'Example answer:' : 'Voorbeeldantwoord:'}
          </Text>
          <View style={[styles.articleBox, { backgroundColor: theme.surfaceSecondary }]}>
            <Text style={[styles.articleText, { color: theme.text }]}>
              {showEnglish ? exercise.sampleAnswerEnglish : exercise.sampleAnswer}
            </Text>
          </View>
        </View>
      )}

      {/* Feedback */}
      {feedback && (
        <FeedbackDisplay feedback={feedback} theme={theme} showEnglish={showEnglish} />
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Stack.Screen
        options={{
          title: exercise.title,
          headerRight: () => (
            <Pressable
              onPress={() => setShowEnglish(v => !v)}
              style={[styles.translateBtn, { backgroundColor: showEnglish ? typeColor + '20' : theme.surfaceSecondary }]}
            >
              <Globe size={14} color={showEnglish ? typeColor : theme.textSecondary} />
              <Text style={[styles.translateBtnText, { color: showEnglish ? typeColor : theme.textSecondary }]}>
                {showEnglish ? 'EN' : 'NL'}
              </Text>
            </Pressable>
          ),
        }}
      />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Exercise header */}
        <View style={[styles.exerciseHeader, { backgroundColor: typeColor }]}>
          <View style={styles.exerciseHeaderIconRow}>
            <TypeIcon type={exercise.type} color="white" size={22} />
            <View style={[styles.examBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Text style={styles.examBadgeText}>Exam {exercise.examNumber}</Text>
            </View>
          </View>
          <Text style={styles.exerciseHeaderTitle}>{exercise.title}</Text>
          {showEnglish && (
            <Text style={styles.exerciseHeaderSubtitle}>{exercise.titleEnglish}</Text>
          )}
        </View>

        {/* Tab selector */}
        <View style={[styles.tabBar, { backgroundColor: theme.cardBackground, borderBottomColor: theme.border }]}>
          {(['example', 'practice'] as TabMode[]).map(tab => (
            <Pressable
              key={tab}
              style={[
                styles.tabItem,
                activeTab === tab && [styles.tabItemActive, { borderBottomColor: typeColor }],
              ]}
              onPress={() => {
                setActiveTab(tab);
                if (tab === 'practice') handleReset();
              }}
            >
              {tab === 'example' ? (
                <BookOpen size={16} color={activeTab === tab ? typeColor : theme.textSecondary} />
              ) : (
                <PenLine size={16} color={activeTab === tab ? typeColor : theme.textSecondary} />
              )}
              <Text
                style={[
                  styles.tabLabel,
                  { color: activeTab === tab ? typeColor : theme.textSecondary },
                  activeTab === tab && { fontWeight: FontWeight.semibold },
                ]}
              >
                {tab === 'example'
                  ? (showEnglish ? 'Example' : 'Voorbeeld')
                  : (showEnglish ? 'Practice' : 'Oefenen')}
              </Text>
            </Pressable>
          ))}
        </View>

        {activeTab === 'example' ? renderExampleTab() : renderPracticeTab()}

        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function extractEmailBody(sampleAnswer: string): string {
  // Remove the greeting line and closing lines to get just the body
  const lines = sampleAnswer.split('\n');
  if (lines.length < 3) return sampleAnswer;
  // First line is greeting, last 2 lines are closing + name
  const bodyLines = lines.slice(1, lines.length - 2);
  return bodyLines.join('\n').trim();
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  translateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    marginRight: 4,
  },
  translateBtnText: {
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.semibold,
  },

  exerciseHeader: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  exerciseHeaderIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  examBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  examBadgeText: {
    fontSize: FontSize.caption,
    color: 'white',
    fontWeight: FontWeight.semibold,
  },
  exerciseHeaderTitle: {
    fontSize: FontSize.title2,
    fontWeight: FontWeight.bold,
    color: 'white',
  },
  exerciseHeaderSubtitle: {
    fontSize: FontSize.subhead,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },

  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomWidth: 2,
  },
  tabLabel: {
    fontSize: FontSize.subhead,
  },

  tabContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },

  contextCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  contextLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contextText: {
    fontSize: FontSize.subhead,
    lineHeight: 22,
  },
  bulletListSmall: {
    marginTop: Spacing.sm,
    gap: 4,
  },

  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  cardTitle: {
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
  },

  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  bulletDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: FontSize.subhead,
    lineHeight: 22,
  },
  bulletTextSmall: {
    flex: 1,
    fontSize: FontSize.footnote,
    lineHeight: 20,
  },

  sampleBodyText: {
    fontSize: FontSize.subhead,
    lineHeight: 24,
  },

  articleBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  articleText: {
    fontSize: FontSize.subhead,
    lineHeight: 26,
  },

  translationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: Spacing.sm,
  },
  translationToggleText: {
    fontSize: FontSize.footnote,
  },
  translationBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    gap: 6,
  },
  translationLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  translationText: {
    fontSize: FontSize.footnote,
    lineHeight: 20,
    fontStyle: 'italic',
  },

  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  criteriaNum: {
    fontSize: FontSize.footnote,
    fontWeight: FontWeight.bold,
    width: 18,
  },
  criteriaText: {
    flex: 1,
    fontSize: FontSize.subhead,
    lineHeight: 22,
  },

  // Practice tab
  bodyInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.subhead,
    minHeight: 150,
    lineHeight: 24,
  },
  formTextArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.subhead,
    minHeight: 200,
    lineHeight: 24,
    margin: Spacing.md,
  },
  articleInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.subhead,
    minHeight: 180,
    lineHeight: 24,
  },
  fieldHintsBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: 4,
  },
  fieldHintsTitle: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  fieldHintItem: {
    fontSize: FontSize.footnote,
    lineHeight: 20,
  },

  actionRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  evaluateBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  btnDisabled: { opacity: 0.45 },
  evaluateBtnText: {
    color: 'white',
    fontSize: FontSize.subhead,
    fontWeight: FontWeight.semibold,
  },
  resetBtn: {
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },

  showSampleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  showSampleText: {
    flex: 1,
    fontSize: FontSize.footnote,
    textAlign: 'center',
  },
});
