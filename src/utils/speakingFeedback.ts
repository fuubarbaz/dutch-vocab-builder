/**
 * Shared parsing for the A2 speaking exam's AI output.
 *
 * Both the written practice tasks and the photo tasks use the same feedback shape,
 * so the screens render one component and this file owns the fragile part: getting
 * usable JSON out of a 2B model that has been asked politely not to add prose.
 */

export interface SpeakingFeedback {
  summary: string;
  checkpoints: Array<{ criterion: string; met: boolean; explanation: string }>;
  languageNotes: string;
  improvedAnswer: string;
}

export interface PictureTask {
  context: string;
  question: string;
  checkpoints: string[];
}

/** Pulls the outermost {...} out of a reply that may be fenced or wrapped in chatter. */
function extractObject(raw: string): any | null {
  const cleaned = raw.replace(/```[a-z]*/gi, '').replace(/```/g, '');
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const parsed = JSON.parse(match[0]);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function parseSpeakingFeedback(raw: string): SpeakingFeedback | null {
  const parsed = extractObject(raw);
  if (!parsed) return null;
  return {
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    checkpoints: Array.isArray(parsed.checkpoints)
      ? parsed.checkpoints.filter((c: any) => c && typeof c.criterion === 'string')
      : [],
    languageNotes: typeof parsed.languageNotes === 'string' ? parsed.languageNotes : '',
    improvedAnswer: typeof parsed.improvedAnswer === 'string' ? parsed.improvedAnswer : '',
  };
}

/**
 * Returns null unless there is a real question to ask — a task with no question is
 * worse than no task, because the learner is left staring at a photo with nothing
 * to answer.
 */
export function parsePictureTask(raw: string): PictureTask | null {
  const parsed = extractObject(raw);
  if (!parsed) return null;

  const question = typeof parsed.question === 'string' ? parsed.question.trim() : '';
  if (!question) return null;

  const checkpoints = Array.isArray(parsed.checkpoints)
    ? parsed.checkpoints.filter((c: any): c is string => typeof c === 'string' && c.trim().length > 0)
    : [];

  return {
    context: typeof parsed.context === 'string' ? parsed.context.trim() : '',
    question,
    // The reviewer needs something to mark against if the model skipped these.
    checkpoints: checkpoints.length > 0
      ? checkpoints
      : ['Er wordt verteld wat er op de foto te zien is', 'Er wordt iets over uzelf verteld'],
  };
}
