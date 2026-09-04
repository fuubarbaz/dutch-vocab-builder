/**
 * Getting usable JSON back out of a 2B on-device model.
 *
 * Every prompt asks for JSON only, and the model mostly complies — but it will
 * occasionally wrap the object in a markdown fence or add a friendly sentence
 * either side. This pulls the object out regardless.
 */
export function extractJsonObject(raw: string): any | null {
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
