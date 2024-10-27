import { FEEDTYPE } from "../enums/Feed";

// Determine the appropriate API endpoint based on the feed type
export const getPostEndpoint = (
  feedType: FEEDTYPE,
  username?: string,
  userId?: string
) => {
  switch (feedType) {
    case FEEDTYPE.ALL:
      return "/api/posts/all";
    case FEEDTYPE.FOLLOWING:
      return "/api/posts/followers";
    case FEEDTYPE.PERSONAL:
      return `/api/posts/user/${username}`;
    case FEEDTYPE.LIKED:
      return `/api/posts/liked/${userId}`;
    default:
      return "/api/posts/all";
  }
};
