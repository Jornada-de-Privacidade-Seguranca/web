import { ApiRequestError, apiRequest } from "@services/httpClient";
import { env } from "@shared/config/env";
import type { AuthenticatedUser } from "@features/auth/auth.types";
import type {
  ProfileActivity,
  ProfileData,
  ProfileUpdatePayload,
} from "@features/profile/profile.types";

const EMPTY_ACTIVITY: ProfileActivity = {
  completedJourneys: 0,
  inProgressJourneys: 0,
  averageByDomain: {
    privacy: 0,
    security: 0,
    combined: 0,
  },
};

function createDevelopmentProfile(user: AuthenticatedUser): ProfileData {
  return {
    user: {
      name: user.name,
      organization: "",
      email: user.email,
      employeeCode: "",
      department: "",
    },
    activity: EMPTY_ACTIVITY,
  };
}

export async function getUserProfile(
  authenticatedUser: AuthenticatedUser,
): Promise<ProfileData> {
  try {
    return await apiRequest<ProfileData>(
      "/profile",
      {},
      "profile.fetch.failed",
    );
  } catch (error: unknown) {
    if (
      env.isDev &&
      error instanceof ApiRequestError &&
      error.status === undefined
    ) {
      return createDevelopmentProfile(authenticatedUser);
    }
    throw error;
  }
}

export async function updateUserProfile(
  authenticatedUser: AuthenticatedUser,
  currentProfile: ProfileData,
  payload: ProfileUpdatePayload,
): Promise<ProfileData> {
  try {
    return await apiRequest<ProfileData>(
      "/profile",
      { method: "put", data: payload, withCsrf: true },
      "profile.update.failed",
    );
  } catch (error: unknown) {
    if (
      env.isDev &&
      error instanceof ApiRequestError &&
      error.status === undefined
    ) {
      return {
        ...currentProfile,
        user: { ...currentProfile.user, ...payload },
      };
    }
    throw error;
  }
}
