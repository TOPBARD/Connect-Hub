import { useState } from "react";

import AllPosts from "../../components/posts/all-posts/Posts";
import CreatePost from "../../components/posts/create-post/CreatePost";
import { FEEDTYPE } from "../../shared/enums/Feed";

const HomePage = () => {
  // Manage feed type state: "all" or "following"
  const [feedType, setFeedType] = useState<FEEDTYPE>(FEEDTYPE.ALL);

  return (
    <>
      {/* Main container */}
      <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen">
        {/* Header with feed selection */}
        <div className="flex w-full border-b border-gray-700">
          <div
            className={
              "flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
            }
            onClick={() => setFeedType(FEEDTYPE.ALL)}
          >
            All
            {/* Active indicator for "All" */}
            {feedType === FEEDTYPE.ALL && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
            )}
          </div>
          <div
            className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
            onClick={() => setFeedType(FEEDTYPE.FOLLOWING)}
          >
            Following
            {/* Active indicator for "Following" */}
            {feedType === FEEDTYPE.FOLLOWING && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
            )}
          </div>
        </div>

        {/* Create Post Input Section */}
        <CreatePost />

        {/* Posts display based on selected feed type */}
        <AllPosts feedType={feedType} />
      </div>
    </>
  );
};
export default HomePage;
