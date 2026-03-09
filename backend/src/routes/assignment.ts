import { Router } from 'express';
import { z } from 'zod';
import prisma from '../lib/prisma.js';
import { authenticate, requireRole, type AuthRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/assignments - Get all assignments (for students) or teacher's assignments
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    let assignments;
    if (user?.role === 'TEACHER' || user?.role === 'ADMIN') {
      assignments = await prisma.assignment.findMany({
        where: { teacherId: userId },
        include: {
          _count: { select: { submissions: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      // For students, get active assignments with their submissions
      assignments = await prisma.assignment.findMany({
        where: { isActive: true },
        include: {
          submissions: {
            where: { studentId: userId },
            select: {
              id: true,
              status: true,
              score: true,
              submittedAt: true,
            },
          },
          teacher: {
            select: { name: true, institution: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json({ assignments });
  } catch (error) {
    console.error('Get assignments error:', error);
    res.status(500).json({ error: 'Failed to get assignments' });
  }
});

// POST /api/assignments - Create new assignment (teachers only)
router.post('/', authenticate, requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const schema = z.object({
      title: z.string().min(3),
      description: z.string(),
      syllabus: z.string(),
      subject: z.string(),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
      dueDate: z.string().datetime().optional(),
      starterCode: z.string().optional(),
      testCases: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const assignment = await prisma.assignment.create({
      data: {
        ...data,
        teacherId: req.user!.userId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
      },
    });

    res.status(201).json({ assignment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Create assignment error:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// GET /api/assignments/:id - Get assignment details
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        teacher: {
          select: { name: true, institution: true },
        },
        submissions: {
          where: { studentId: userId },
        },
      },
    });

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    res.json({ assignment });
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ error: 'Failed to get assignment' });
  }
});

// POST /api/assignments/:id/submit - Submit assignment
router.post('/:id/submit', authenticate, requireRole(['STUDENT']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const schema = z.object({
      code: z.string(),
      language: z.string(),
      timeSpent: z.number().default(0),
    });

    const { code, language, timeSpent } = schema.parse(req.body);
    const studentId = req.user!.userId;

    // Check if assignment exists and is active
    const assignment = await prisma.assignment.findUnique({
      where: { id, isActive: true },
    });

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found or inactive' });
      return;
    }

    // Create or update submission
    const submission = await prisma.submission.upsert({
      where: {
        // Use a unique constraint - need to handle this properly
        id: (await prisma.submission.findFirst({
          where: { assignmentId: id, studentId },
          select: { id: true },
        }))?.id || 'new',
      },
      update: {
        code,
        language,
        timeSpent,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
      create: {
        assignmentId: id,
        studentId,
        code,
        language,
        timeSpent,
        status: 'SUBMITTED',
      },
    });

    res.status(201).json({ submission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Submit assignment error:', error);
    res.status(500).json({ error: 'Failed to submit assignment' });
  }
});

// GET /api/assignments/:id/submissions - Get all submissions for an assignment (teacher only)
router.get('/:id/submissions', authenticate, requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user!.userId;

    // Verify assignment belongs to teacher
    const assignment = await prisma.assignment.findFirst({
      where: { id, teacherId },
    });

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    const submissions = await prisma.submission.findMany({
      where: { assignmentId: id },
      include: {
        student: {
          select: { name: true, email: true, institution: true },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

// PUT /api/assignments/:id/submissions/:submissionId/review - Review submission
router.put('/:id/submissions/:submissionId/review', authenticate, requireRole(['TEACHER', 'ADMIN']), async (req: AuthRequest, res) => {
  try {
    const { id, submissionId } = req.params;
    const schema = z.object({
      score: z.number().min(0).max(100),
      feedback: z.string(),
      status: z.enum(['REVIEWED', 'PASSED', 'FAILED']),
    });

    const { score, feedback, status } = schema.parse(req.body);
    const teacherId = req.user!.userId;

    // Verify assignment belongs to teacher
    const assignment = await prisma.assignment.findFirst({
      where: { id, teacherId },
    });

    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found' });
      return;
    }

    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score,
        feedback,
        status,
        reviewedAt: new Date(),
      },
    });

    res.json({ submission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation error', details: error.errors });
      return;
    }
    console.error('Review submission error:', error);
    res.status(500).json({ error: 'Failed to review submission' });
  }
});

export default router;
