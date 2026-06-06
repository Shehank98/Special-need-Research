// Feature flag driven by the student's research group. The SAME activities run
// for both groups — only the experience differs, never the measurement.
//
//   intervention -> gamified, instant feedback, guided tracing
//   control      -> plain: no gamification, no instant feedback, plain writing
//   (no group)   -> legacy/demo students keep the full rich experience
export function experienceFor(user) {
  const group = user?.study_group;
  if (group === 'control') {
    return { group, gamified: false, instantFeedback: false, tracing: false };
  }
  if (group === 'intervention') {
    return { group, gamified: true, instantFeedback: true, tracing: true };
  }
  // Legacy/demo (no assigned group): rich experience, but tracing is an
  // intervention-only research feature so it stays off.
  return { group: null, gamified: true, instantFeedback: true, tracing: false };
}
