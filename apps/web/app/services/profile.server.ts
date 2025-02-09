import prisma from '~/lib/prisma.server';

type RateCurrency = 'USD' | 'EUR' | 'GBP';

interface UpdateProfile {
  name: string;
  role: string;
  yearsOfExperience: number;
  location: string;
  interviewRate: number;
  interviewRateCurrency: RateCurrency;
}

const getProfileByUserId = async (userId: string) => {
  const profile = await prisma.profile.findUnique({
    where: { userId },
  });
  return profile;
};

const getProfileByPublishedLink = async (link: string) => {
  const profile = await prisma.profile.findFirst({
    where: {
      AND: [
        { publishedLink: link },
        { isPublished: true }
      ]
    }
  });
  return profile;
};

const updateProfile = async (userId: string, profile: UpdateProfile) => {
  const updatedProfile = await prisma.profile.update({
    where: { userId },
    data: profile,
  });
  return updatedProfile;
};

const publishProfile = async (userId: string) => {
  const profile = await getProfileByUserId(userId);
  if (!profile) {
    throw new Error(`Profile not found for userId: ${userId}`);
  }

  const randomId = Array.from({ length: 6 }, () => Math.random().toString(36)[2]).join('');
  const nameSlug = profile.name.toLowerCase().replace(/\s+/g, '-');
  const publishedLink = `${nameSlug}-${randomId}`;

  const publishedProfile = await prisma.profile.update({
    where: { userId },
    data: {
      isPublished: true,
      publishedAt: new Date(),
      publishedLink,
    },
  });

  return publishedProfile;
};

export {
  getProfileByPublishedLink,
  getProfileByUserId,
  updateProfile,
  publishProfile,
};
export type { UpdateProfile };
