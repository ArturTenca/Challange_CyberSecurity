const crypto = require('crypto');
const config = require('../config');
const { secureLog } = require('./logger');

const challenges = new Map();
const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function generateOtp() {
  return String(crypto.randomInt(100000, 999999));
}

function createChallenge(userId, email) {
  const id = crypto.randomUUID();
  const code = generateOtp();
  const expiresAt = Date.now() + CHALLENGE_TTL_MS;

  challenges.set(id, {
    userId,
    email,
    code,
    expiresAt,
    attempts: 0,
  });

  if (config.nodeEnv !== 'production') {
    secureLog('info', '2fa_code_issued', {
      challengeId: id,
      email: '[redacted]',
      devCode: code,
    });
  }

  return { challengeId: id, expiresAt, devCode: config.nodeEnv !== 'production' ? code : undefined };
}

function verifyChallenge(challengeId, code) {
  const challenge = challenges.get(challengeId);
  if (!challenge) {
    return { ok: false, reason: 'CHALLENGE_NOT_FOUND' };
  }

  if (Date.now() > challenge.expiresAt) {
    challenges.delete(challengeId);
    return { ok: false, reason: 'CHALLENGE_EXPIRED' };
  }

  challenge.attempts += 1;
  if (challenge.attempts > MAX_ATTEMPTS) {
    challenges.delete(challengeId);
    return { ok: false, reason: 'TOO_MANY_ATTEMPTS' };
  }

  if (challenge.code !== String(code).trim()) {
    return { ok: false, reason: 'INVALID_CODE' };
  }

  challenges.delete(challengeId);
  return { ok: true, userId: challenge.userId, email: challenge.email };
}

module.exports = { createChallenge, verifyChallenge };
