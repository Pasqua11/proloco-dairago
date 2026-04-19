const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function signToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

async function login(req, res, next) {
  try {
    const { username, password } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username obbligatorio' });
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ username }, { email: username }], isActive: true },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ error: 'Utente non trovato' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Password attuale e nuova obbligatorie' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'La nuova password deve essere di almeno 8 caratteri' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(401).json({ error: 'Password attuale non corretta' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { passwordHash } });
    res.json({ message: 'Password aggiornata con successo' });
  } catch (err) {
    next(err);
  }
}

module.exports = { login, me, changePassword };
