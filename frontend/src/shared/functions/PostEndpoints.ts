import { FEEDTYPE } from "../enums/Feed";

// Determine the appropriate API endpoint based on the feed type
export const getPostEndpoint = (
  feedType: FEEDTYPE,
  username?: string,
  userId?: string
) => {
  switch (feedType) {
    case FEEDTYPE.ALL:
      return `${process.env.BACKEND_URL}/api/posts/all`;
    case FEEDTYPE.FOLLOWING:
      return `${process.env.BACKEND_URL}/api/posts/followers`;
    case FEEDTYPE.PERSONAL:
      return `${process.env.BACKEND_URL}/api/posts/user/${username}`;
    case FEEDTYPE.LIKED:
      return `${process.env.BACKEND_URL}/api/posts/liked/${userId}`;
    default:
      return `${process.env.BACKEND_URL}/api/posts/all`;
  }
};
