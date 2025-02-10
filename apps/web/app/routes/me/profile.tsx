import { Camera, MapPin } from 'lucide-react';
import {
  type ActionFunctionArgs,
  Form,
  Link,
  type LoaderFunctionArgs,
  redirect,
  useLoaderData,
} from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { getSession } from '~/lib/sessions.server';
import * as profileService from '~/services/profile.server';

import type { Route } from './+types/profile';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Pavel Fokin - Software Engineer' },
    { name: 'description', content: 'Pavel Fokin - Software Engineer' },
  ];
}

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

  await profileService.publishProfile(session.get('userId') as string);

  return null;
}

const Profile = () => {
  const { profile } = useLoaderData<typeof loader>();

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="grow flex flex-col space-y-10">
      <div className="flex flex-row items-center justify-between">
        <h2 className="font-semibold">Profile</h2>
        <Button size="lg" variant="outline" asChild>
          <Link to="/me/edit-profile">Edit profile</Link>
        </Button>
      </div>
      <div className="flex flex-col items-center space-y-4">
        <div className=" relative">
          <Avatar className="w-28 h-28 shadow-lg">
            <AvatarImage src="https://media.licdn.com/dms/image/v2/C4E03AQHe_FQ5_2rBfQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1643380984309?e=1742428800&v=beta&t=Vb9pviEeko_74rKChMBRyy3O5EvtmYg9DqT41iPZhPw" />
            <AvatarFallback>PF</AvatarFallback>
          </Avatar>
          <Button
            variant="secondary"
            size="icon"
            className="absolute bottom-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full shadow-md"
            aria-label="Change Profile Picture"
          >
            <Camera className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-center space-y-3">
        <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
          {profile.name}
        </h1>
        <p className="text-md sm:text-lg text-gray-700 dark:text-gray-300">
          {profile.role}
        </p>
        <p className="flex items-center text-md sm:text-lg text-gray-700 dark:text-gray-300">
          <MapPin className="w-5 h-5 inline-block mr-2" /> {profile.location}
        </p>
        <p
          className={
            'flex items-center text-md sm:text-lg text-gray-700 dark:text-gray-300'
          }
        >
          {profile.yearsOfExperience} YoE | ${profile.interviewRate} per
          interview
        </p>
      </div>
      <div className="flex flex-row items-center justify-center space-x-3">
        <Form method="post" action="/me" className="w-full">
          <Button size="lg" className="w-full" type="submit">
            Publish profile
          </Button>
        </Form>
      </div>
      <div className="flex flex-col items-center space-y-3">
        {profile.isPublished && (
          <>
            <p className="text-md sm:text-lg text-gray-700 dark:text-gray-300">
              Published at {profile.publishedAt?.toLocaleDateString()}
            </p>
            <p className="text-md sm:text-lg text-gray-700 dark:text-gray-300">
              <Link
                className="hover:underline"
                to={`/@${profile.publishedLink}`}
                target="_blank"
              >
                {profile.publishedLink}
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
