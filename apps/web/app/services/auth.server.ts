import type { UserRole } from '@prisma/client';
import prisma from '~/lib/prisma.server';

const generateToken = async (userId: string): Promise<string> => {
  return userId;
};

const sendMagicLink = async (email: string, role: UserRole): Promise<string> => {
  let user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    const newUser = await prisma.$transaction(async (prisma) => {
      const createdUser = await prisma.user.create({
        data: {
          email,
          role: role,
        },
      });

      const profile = await prisma.profile.create({
        data: {
          userId: createdUser.id,
          name: '',
          role: '',
          yearsOfExperience: 0,
          location: '',
          interviewRate: 0,
          interviewRateCurrency: '',
          publishedAt: null,
          publishedLink: null,
          isPublished: false,
        },
      });

      return createdUser;
    });

    user = newUser;
  }

  const token = await generateToken(user.id);

  return token;
};

export { sendMagicLink };
