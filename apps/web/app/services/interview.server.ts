import prisma from '~/lib/prisma.server';

interface CreateInterviewParams {
  candidateId: string;
  recruiterId: string;
}

const createInterview = async ({ candidateId, recruiterId }: CreateInterviewParams) => {
  // First verify both users exist
  const [candidate, recruiter] = await Promise.all([
    prisma.user.findUnique({ where: { id: candidateId } }),
    prisma.user.findUnique({ where: { id: recruiterId } })
  ]);

  if (!candidate) {
    throw new Error(`Candidate with ID ${candidateId} not found`);
  }

  if (!recruiter) {
    throw new Error(`Recruiter with ID ${recruiterId} not found`);
  }

  // Create the interview only if both users exist
  const interview = await prisma.interview.create({
    data: {
      candidateId,
      recruiterId,
    },
    include: {
      candidate: true,
      recruiter: true,
    },
  });

  return interview;
};

const getInterviewById = async (id: string) => {
  const interview = await prisma.interview.findUnique({
    where: { id },
    include: {
      candidate: true,
      recruiter: true,
    },
  });
  return interview;
};

export { createInterview, getInterviewById };
export type { CreateInterviewParams };