import { Form, redirect, type ActionFunctionArgs, type LoaderFunctionArgs, useLoaderData } from 'react-router';
import { z } from 'zod';

import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { getSession } from '~/lib/sessions.server';
import * as profileService from '~/services/profile.server';

const updateProfileSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  yearsOfExperience: z.coerce.number().min(1),
  location: z.string().min(1),
  interviewRate: z.coerce.number().min(1),
  interviewRateCurrency: z.enum(['USD', 'EUR', 'GBP']),
});

type UpdateProfile = z.infer<typeof updateProfileSchema>;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  if (!userId) {
    return redirect('/auth/magic-link');
  }

  const profile = await profileService.getProfileByUserId(userId);
  return { profile };
};

export async function action({ request }: ActionFunctionArgs) {
  const session = await getSession(request.headers.get('Cookie'));
  if (!session) {
    return redirect('/login');
  }

  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  console.log(data);

  const validatedData = updateProfileSchema.safeParse(data);
  if (!validatedData.success) {
    return Response.json({ errors: validatedData.error.flatten().fieldErrors }, { status: 400 });
  }

  await profileService.updateProfile(
    session.get('userId') as string,
    validatedData.data as UpdateProfile
  );

  return redirect('/me');
}

export default function EditProfile() {
  const { profile } = useLoaderData<typeof loader>();

  return (
    <div className="grow flex flex-col space-y-10">
      <h2 className="font-semibold">Edit profile</h2>
      <Form method="patch" className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={profile?.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" name="role" defaultValue={profile?.role} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearsOfExperience">Years of experience</Label>
            <Input id="yearsOfExperience" name="yearsOfExperience" defaultValue={profile?.yearsOfExperience} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" name="location" defaultValue={profile?.location} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interviewRate">Interview rate</Label>
            <Input id="interviewRate" name="interviewRate" defaultValue={profile?.interviewRate} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interviewRateCurrency">Rate currency</Label>
            <Input id="interviewRateCurrency" name="interviewRateCurrency" defaultValue={profile?.interviewRateCurrency} />
          </div>
        </div>
        <Button type="submit" className="w-full">
          Save profile
        </Button>
      </Form>
    </div>
  );
}
