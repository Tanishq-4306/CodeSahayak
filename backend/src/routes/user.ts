import { Router } from 'express';
import { authenticate, requireRole, type AuthRequest } from '../middleware/auth.js';
import prisma from '../lib/prisma.js';

const router = Router();

// GET /api/user/dashboard - Student dashboard data
router.get('/dashboard', authenticate, requireRole(['STUDENT']), async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // Get user progress
    const progress = await prisma.progress.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    // Get recent submissions
    const submissions = await prisma.submission.findMany({
      where: { studentId: userId },
      include: {
        assignment: {
          select: {
            title: true,
            subject: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      take: 5,
    });

    // Get user stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        streak: true,
        xp: true,
        level: true,
        lastActive: true,
        isPro: true,
      },
    });

    // Calculate stats
    const totalConcepts = progress.length;
    const masteredConcepts = progress.filter(p => p.masteryLevel >= 80).length;
    const totalAttempts = progress.reduce((sum, p) => sum + p.attempts, 0);

    res.json({
      user,
      stats: {
        totalConcepts,
        masteredConcepts,
        totalAttempts,
        averageMastery: totalConcepts > 0
          ? Math.round(progress.reduce((sum, p) => sum + p.masteryLevel, 0) / totalConcepts)
          : 0,
      },
      progress,
      recentSubmissions: submissions,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// GET /api/user/teacher-dashboard - Teacher dashboard data
router.get('/teacher-dashboard', authenticate, requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const teacherId = req.user!.userId;

    // Get teacher's assignments
    const assignments = await prisma.assignment.findMany({
      where: { teacherId },
      include: {
        _count: {
          select: { submissions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Get submission stats
    const submissions = await prisma.submission.findMany({
      where: {
        assignment: { teacherId },
      },
      select: {
        status: true,
        score: true,
      },
    });

    const totalSubmissions = submissions.length;
    const pendingSubmissions = submissions.filter(s => s.status === 'PENDING').length;
    const reviewedSubmissions = submissions.filter(s => s.status === 'REVIEWED').length;
    const averageScore = totalSubmissions > 0
      ? Math.round(submissions.reduce((sum, s) => sum + (s.score || 0), 0) / totalSubmissions)
      : 0;

    // Get unique students
    const uniqueStudents = await prisma.submission.groupBy({
      by: ['studentId'],
      where: {
        assignment: { teacherId },
      },
    });

    res.json({
      assignments,
      stats: {
        totalAssignments: assignments.length,
        totalSubmissions,
        pendingSubmissions,
        reviewedSubmissions,
        averageScore,
        uniqueStudents: uniqueStudents.length,
      },
    });
  } catch (error) {
    console.error('Teacher dashboard error:', error);
    res.status(500).json({ error: 'Failed to get teacher dashboard data' });
  }
});

// GET /api/user/progress/:concept
router.get('/progress/:concept', authenticate, async (req: AuthRequest, res) => {
  try {
    const { concept } = req.params;
    const userId = req.user!.userId;

    const progress = await prisma.progress.findUnique({
      where: {
        userId_concept_language: {
          userId,
          concept,
          language: req.query.language as string || 'en',
        },
      },
    });

    res.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

// POST /api/user/progress
router.post('/progress', authenticate, async (req: AuthRequest, res) => {
  try {
    const { concept, language, masteryLevel, isCorrect } = req.body;
    const userId = req.user!.userId;

    const progress = await prisma.progress.upsert({
      where: {
        userId_concept_language: {
          userId,
          concept,
          language,
        },
      },
      update: {
        masteryLevel: Math.min(100, masteryLevel),
        attempts: { increment: 1 },
        correctAttempts: isCorrect ? { increment: 1 } : undefined,
        lastAttemptAt: new Date(),
      },
      create: {
        userId,
        concept,
        language,
        masteryLevel: Math.min(100, masteryLevel),
        attempts: 1,
        correctAttempts: isCorrect ? 1 : 0,
        lastAttemptAt: new Date(),
      },
    });

    // Update user XP
    const xpGain = isCorrect ? 10 : 2;
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpGain },
      },
    });

    res.json({ progress, xpGain });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

export default router;
