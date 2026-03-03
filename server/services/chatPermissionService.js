/**
 * chatPermissionService.js
 * Validates whether a sender is allowed to message a receiver.
 * sender / receiver: User mongoose documents with { role, department }
 */

exports.canSendMessage = (sender, receiver) => {
  const sr = sender.role;
  const rr = receiver.role;

  // Welfare can message anyone
  if (sr === 'welfare') return { allowed: true };

  // Students can message their assigned mentor or welfare members
  if (sr === 'student') {
    if (rr === 'welfare') return { allowed: true };
    if (rr === 'mentor') {
      if (sender.department === receiver.department) return { allowed: true };
      return { allowed: false, reason: 'Students can only message mentors in their own department.' };
    }
    return { allowed: false, reason: 'Students cannot message other students.' };
  }

  // Mentors can message their department students or welfare
  if (sr === 'mentor') {
    if (rr === 'welfare') return { allowed: true };
    if (rr === 'student') {
      if (sender.department === receiver.department) return { allowed: true };
      return { allowed: false, reason: 'Mentors can only message students in their own department.' };
    }
    return { allowed: false, reason: 'Mentors cannot message other mentors.' };
  }

  return { allowed: false, reason: 'Unauthorized messaging attempt.' };
};
