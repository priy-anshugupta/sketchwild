import { z } from 'zod';
import { categoryIds, categoryById, intents } from './catalog';
export const promptVersion = 'second-look-1.0';
export const feedbackSchema = z.object({
  schemaVersion: z.literal('1'),
  subjectCategory: z.enum(categoryIds),
  status: z.enum(['coach', 'retake_subject', 'retake_sketch', 'uncertain']),
  feature: z.enum(['outline', 'edge', 'veins', 'tip_base', 'proportion', 'texture', 'overlap', 'branching', 'negative_space', 'planes', 'shadow', 'depth', 'none']),
  referenceEvidence: z.string().max(350),
  sketchEvidence: z.string().max(350),
  invitation: z.string().min(1).max(400),
  uncertainty: z.string().max(300),
}).superRefine((value, context) => {
  const allowed: readonly string[] = categoryById(value.subjectCategory).features;
  if (value.feature !== 'none' && !allowed.includes(value.feature)) context.addIssue({ code: 'custom', message: 'Feature does not apply to this subject', path: ['feature'] });
  if (value.status === 'coach' && (!value.referenceEvidence.trim() || !value.sketchEvidence.trim() || value.feature === 'none')) context.addIssue({ code: 'custom', message: 'Coaching requires evidence from both pictures and an applicable feature' });
});
export type Feedback = z.infer<typeof feedbackSchema>;
export type Analysis = Feedback & { meta: { source: 'live_ai' | 'example'; model: string; promptVersion: string; elapsedMs: number; createdAt: string; requestId: string } };
export const requestSchema = z.object({ category: z.enum(categoryIds), intent: z.enum(intents), });
export type Capabilities = { provider: 'ollama' | 'hosted' | 'disabled'; configured: boolean; model: string; notice: string; timeoutMs: number; reason?: string; readiness: 'experimental'; demoVideoUrl?: string; };
export type Session = {
  id: string; parentId?: string; createdAt: string; updatedAt: string;
  category: CategoryId; minutes: number; intent: typeof intents[number];
  missionId?: string; outdoorConfirmed?: boolean;
  stage: 'draw' | 'photos' | 'feedback' | 'reflect'; status: 'draft' | 'completed';
  subject?: Blob; sketch?: Blob; second?: Blob;
  feedback?: Analysis; reflection: string; rating?: 'helpful' | 'unclear' | 'inaccurate'; title: string;
};
import type { CategoryId } from './catalog';
