import { Camera, MapPin, BriefcaseIcon, ClockIcon, GlobeIcon, DollarSignIcon, EyeIcon, LinkIcon } from 'lucide-react';
import {
  type ActionFunctionArgs,
  Form,
  Link,
  type LoaderFunctionArgs,
  redirect,
  useLoaderData,
  useNavigation,
} from 'react-router';

import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { getSession } from '~/lib/sessions.server';
import * as profileService from '~/services/profile.server';
import { cn } from '~/lib/utils';

import type { Route } from './+types/profile';

export function meta({ data }: Route.MetaArgs) {
  if (!data?.profile) {
    return [
      { title: 'Profile - Fair Interviews' },
      { name: 'description', content: 'Complete your profile to start receiving interview requests' },
    ];
  }

  return [
    { title: `${data.profile.name} - ${data.profile.role}` },
    { name: 'description', content: `${data.profile.name} - ${data.profile.role} with ${data.profile.yearsOfExperience} years of experience` },
  ];
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request.headers.get('Cookie'));
  const userId = session.get('userId');
  if (!userId) {
    return redirect('/auth/login');
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
  const navigation = useNavigation();
  const isPublishing = navigation.state === 'submitting';

  if (!profile) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Set up your profile to start receiving interview requests from recruiters
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <Button size="lg" asChild>
            <Link to="/me/profile-edit">Create Profile</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const profileStatus = profile.isPublished ? (
    <Badge variant="default" className="gap-1">
      <GlobeIcon className="w-3 h-3" />
      Published
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1">
      <EyeIcon className="w-3 h-3" />
      Draft
    </Badge>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your public profile and interview preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profileStatus}
          <Button variant="outline" asChild>
            <Link to="/me/profile-edit">
              Edit Profile
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative flex-shrink-0">
              <Avatar className="w-32 h-32 rounded-full border-4 border-background shadow-xl">
                <AvatarImage
                  src="https://media.licdn.com/dms/image/v2/C4E03AQHe_FQ5_2rBfQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1643380984309?e=1742428800&v=beta&t=Vb9pviEeko_74rKChMBRyy3O5EvtmYg9DqT41iPZhPw"
                  alt={profile.name}
                />
                <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <Button
                variant="secondary"
                size="icon"
                className="absolute bottom-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-full shadow-md"
                aria-label="Change Profile Picture"
              >
                <Camera className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-grow space-y-6">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {profile.name}
                </h2>
                <div className="flex flex-wrap gap-3 text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <BriefcaseIcon className="w-4 h-4" />
                    <span>{profile.role}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="w-4 h-4" />
                    <span>{profile.yearsOfExperience} years of experience</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <DollarSignIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="font-medium">${profile.interviewRate}</span>
                  <span className="text-gray-600 dark:text-gray-400">per interview</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        {profile.isPublished ? (
          <CardFooter className="border-t mt-6 flex-col items-stretch gap-4">
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Public Profile Link</p>
                <p className="text-sm text-gray-500">
                  Published on {new Date(profile.publishedAt!).toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild className="gap-2">
                <Link to={`/@${profile.publishedLink}`}>
                  <EyeIcon className="w-4 h-4" />
                  View Public Profile
                </Link>
              </Button>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <LinkIcon className="w-4 h-4 text-gray-400" />
              <code className="text-sm flex-grow font-mono">
                fairinterviews.dev/@{profile.publishedLink}
              </code>
              <Button variant="ghost" size="sm" onClick={() => {
                navigator.clipboard.writeText(`fairinterviews.dev/@${profile.publishedLink}`);
              }}>
                Copy
              </Button>
            </div>
          </CardFooter>
        ) : (
          <CardFooter className="border-t mt-6">
            <Form method="post" className="w-full pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isPublishing}
              >
                {isPublishing ? 'Publishing...' : 'Publish Profile'}
              </Button>
            </Form>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default Profile;
