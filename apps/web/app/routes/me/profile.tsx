import {
  Camera,
  MapPin,
  BriefcaseIcon,
  ClockIcon,
  GlobeIcon,
  DollarSignIcon,
  EyeIcon,
  LinkIcon,
  CheckCircleIcon,
  UserIcon,
} from 'lucide-react';
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
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
            <UserIcon className="w-10 h-10 text-gray-400" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
              Complete Your Profile
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Set up your profile to start receiving interview requests from recruiters. This will help you showcase your expertise and set your interview rate.
            </p>
          </div>
          <Button size="lg" asChild>
            <Link to="/me/profile-edit">Create Profile</Link>
          </Button>
        </div>
      </div>
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
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-8">
      {/* Header */}
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

      {/* Profile Info */}
      <div className="space-y-8">
        <div className="flex items-start gap-6">
          <div className="relative flex-shrink-0">
            <Avatar className="w-20 h-20 border-2 border-gray-100 dark:border-gray-800 rounded-full">
              <AvatarImage
                src="https://media.licdn.com/dms/image/v2/C4E03AQHe_FQ5_2rBfQ/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1643380984309?e=1742428800&v=beta&t=Vb9pviEeko_74rKChMBRyy3O5EvtmYg9DqT41iPZhPw"
                alt={profile.name}
              />
              <AvatarFallback>{profile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <Button
              variant="secondary"
              size="icon"
              className="absolute -bottom-1 -right-1 h-7 w-7 bg-white dark:bg-gray-900 rounded-full shadow-md"
              aria-label="Change Profile Picture"
            >
              <Camera className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="flex-grow space-y-4">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {profile.name}
              </h2>
              <div className="flex flex-wrap gap-3 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-1.5">
                  <BriefcaseIcon className="w-4 h-4 text-gray-400" />
                  <span>{profile.role}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{profile.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span>{profile.yearsOfExperience} years of experience</span>
                </div>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-1.5 rounded-md text-sm">
              <DollarSignIcon className="w-4 h-4" />
              <span className="font-medium">${profile.interviewRate}</span>
              <span className="text-green-600 dark:text-green-500">per interview</span>
            </div>
          </div>
        </div>

        {/* Publication Status */}
        {profile.isPublished ? (
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold">Public Profile</h3>
                  <Badge variant="default" className="gap-1">
                    <CheckCircleIcon className="w-3 h-3" />
                    Live
                  </Badge>
                </div>
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

            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-md">
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
          </div>
        ) : (
          <div className="border-t pt-6">
            <div className="max-w-2xl">
              <div className="space-y-3">
                <h3 className="text-base font-semibold">Ready to Start?</h3>
                <p className="text-sm text-gray-500">
                  Publishing your profile will make it visible to recruiters. Make sure all your information is up to date.
                </p>
                <Form method="post">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isPublishing}
                  >
                    {isPublishing ? 'Publishing...' : 'Publish Profile'}
                  </Button>
                </Form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
