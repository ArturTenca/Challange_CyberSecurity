const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');
const { users, refreshTokens } = require('../data/store');
const config = require('../config');
const { signAccessToken, signRefreshToken } = require('../middleware/auth');
const { validateBody } = require('../middleware/validateInput');
const { recordAudit } = require('../services/auditLog');
const {
  trackFailedAuth,
  clearFailedAuth,
  trackAnomaly,
} = require('../services/securityMonitor');
const { createChallenge, verifyChallenge } = require('../services/twoFactor');

const router = express.Router();

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(6).max(128),
});

const verify2faSchema = z.object({
  challengeId: z.string().uuid(),
  code: z.string().regex(/^\d{6}$/),
});

function issueTokens(user, res) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  refreshTokens.set(refreshToken, {
    userId: user.id,
    createdAt: Date.now(),
  });

  res.json({
    accessToken,
    refreshToken,
    expiresIn: 900,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
  });
}

router.post('/login', validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validated;
    const ip = req.ip;
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      trackFailedAuth(email, ip);
      return res.status(401).json({
        error: 'Credenciais inválidas',
        code: 'INVALID_CREDENTIALS',
      });
    }

    clearFailedAuth(email, ip);

    const challenge = createChallenge(user.id, user.email);

    recordAudit({
      action: '2fa_challenge_issued',
      actor: user.id,
      role: user.role,
      ip,
    });

    res.json({
      requires2FA: true,
      challengeId: challenge.challengeId,
      expiresAt: challenge.expiresAt,
      message: 'Código de verificação enviado (simulado para demonstração).',
      ...(challenge.devCode && { devCode: challenge.devCode }),
    });
  } catch (err) {
    next(err);
  }
});

router.post('/verify-2fa', validateBody(verify2faSchema), (req, res) => {
  const { challengeId, code } = req.validated;
  const result = verifyChallenge(challengeId, code);

  if (!result.ok) {
    trackAnomaly('2fa_verification_failed', { reason: result.reason });
    const messages = {
      CHALLENGE_NOT_FOUND: 'Sessão de verificação inválida. Faça login novamente.',
      CHALLENGE_EXPIRED: 'Código expirado. Faça login novamente.',
      TOO_MANY_ATTEMPTS: 'Muitas tentativas. Faça login novamente.',
      INVALID_CODE: 'Código incorreto.',
    };
    return res.status(401).json({
      error: messages[result.reason] || 'Verificação falhou',
      code: result.reason,
    });
  }

  const user = users.find((u) => u.id === result.userId);
  if (!user) {
    return res.status(401).json({
      error: 'Usuário não encontrado',
      code: 'USER_NOT_FOUND',
    });
  }

  recordAudit({
    action: 'user_login_2fa_success',
    actor: user.id,
    role: user.role,
  });

  issueTokens(user, res);
});

const refreshSchema = z.object({
  refreshToken: z.string().min(20).max(2048),
});

router.post('/refresh', validateBody(refreshSchema), (req, res, next) => {
  try {
    const { refreshToken } = req.validated;
    const stored = refreshTokens.get(refreshToken);
    if (!stored) {
      return res.status(401).json({
        error: 'Refresh token inválido',
        code: 'INVALID_REFRESH',
      });
    }

    const payload = jwt.verify(refreshToken, config.jwtRefreshSecret, {
      algorithms: ['HS256'],
    });
    const user = users.find((u) => u.id === payload.sub);
    if (!user) {
      return res.status(401).json({
        error: 'Usuário não encontrado',
        code: 'INVALID_REFRESH',
      });
    }

    refreshTokens.delete(refreshToken);
    const newAccess = signAccessToken(user);
    const newRefresh = signRefreshToken(user);
    refreshTokens.set(newRefresh, {
      userId: user.id,
      createdAt: Date.now(),
    });

    res.json({
      accessToken: newAccess,
      refreshToken: newRefresh,
      expiresIn: 900,
    });
  } catch {
    return res.status(401).json({
      error: 'Refresh token expirado',
      code: 'INVALID_REFRESH',
    });
  }
});

router.post('/logout', (req, res) => {
  const token = req.body?.refreshToken;
  if (token) refreshTokens.delete(token);
  res.json({ success: true });
});

module.exports = router;
