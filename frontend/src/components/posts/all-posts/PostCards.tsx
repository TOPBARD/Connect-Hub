import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { User } from "../../../shared/interface/User";
import { formatPostDate } from "../../../shared/functions/DataFormatter";
import LoadingSpinner from "../../../shared/loading-spinner/LoadingSpinner";
import { PostComment, Posts } from "../../../shared/interface/Post";
import postActionApi from "../../../api/posts/posts.action";

const Post = ({ post }: { post: Posts }) => {
  // State management.
  const [comment, setComment] = useState("");

  // Auth user data.
  const { data: authUser } = useQuery<User>({
    queryKey: ["authUser"],
  });

  // Fetch data from post.
  const postOwner = post.user;
  const postId = post._id;
  const isLiked = post?.likes?.includes(authUser?._id as string);
  const isMyPost = authUser?._id === post?.user?._id;
  const formattedDate = formatPostDate(post.createdAt);

  // Fetch post actions from API.
  const {
    deletePost,
    commentPost,
    likePost,
    isLiking,
    isCommenting,
    isDeleting,
  } = postActionApi(post);

  // Delete post
  const handleDeletePost = () => {
    deletePost(post._id);
  };

  // Comment post
  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCommenting) return;
    commentPost({ postId, comment });
    setComment("");
  };

  // Like post
  const handleLikePost = () => {
    if (isLiking) return;
    likePost(post._id);
  };

  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        {/* Avatar and Post Owner Information */}
        <div className="avatar">
          <Link
            to={`/profile/${postOwner?.username}`}
            className="w-8 rounded-full overflow-hidden"
          >
            <img src={postOwner?.profileImg || "/avatar-placeholder.png"} />
          </Link>
        </div>

        {/* Post Content */}
        <div className="flex flex-col flex-1">
          {/* Header Section: Post Owner, Date, Delete Icon */}
          <div className="flex gap-2 items-center">
            <Link to={`/profile/${postOwner?.username}`} className="font-bold">
              {postOwner?.name}
            </Link>
            <span className="text-gray-700 flex gap-1 text-sm">
              <Link to={`/profile/${postOwner?.username}`}>
                @{postOwner?.username}
              </Link>
              <span>·</span>
              <span>{formattedDate}</span>
            </span>
            {isMyPost && (
              <span className="flex justify-end flex-1">
                {!isDeleting && (
                  <FaTrash
                    className="cursor-pointer hover:text-red-500"
                    onClick={handleDeletePost}
                  />
                )}

                {isDeleting && <LoadingSpinner size="sm" />}
              </span>
            )}
          </div>

          {/* Post Text and Image */}
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post?.text}</span>
            {post?.img && (
              <img
                src={post.img}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt=""
              />
            )}
          </div>

          {/* Action Icons: Comment, Repost, Like, Bookmark */}
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() => {
                  const modal = document.getElementById(
                    "comments_modal" + post._id
                  );
                  if (modal && modal instanceof HTMLDialogElement) {
                    modal.showModal();
                  }
                }}
              >
                <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post?.comments?.length}
                </span>
              </div>

              {/* Comment Modal */}
              <dialog
                id={`comments_modal${post._id}`}
                className="modal border-none outline-none"
              >
                <div className="modal-box rounded border border-gray-600">
                  <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                  <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                    {post?.comments?.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No comments yet 🤔 Be the first one 😉
                      </p>
                    )}
                    {post?.comments?.map((comment: PostComment) => (
                      <div key={comment._id} className="flex gap-2 items-start">
                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img
                              src={
                                comment?.user?.profileImg ||
                                "/avatar-placeholder.png"
                              }
                            />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">
                              {comment.user.name}
                            </span>
                            <span className="text-gray-700 text-sm">
                              @{comment.user.username}
                            </span>
                          </div>
                          <div className="text-sm">{comment.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <form
                    className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
                    onSubmit={handlePostComment}
                  >
                    <textarea
                      className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
                      placeholder="Add a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button className="btn btn-primary rounded-full btn-sm text-white px-4">
                      {isCommenting ? <LoadingSpinner size="md" /> : "Post"}
                    </button>
                  </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>

              {/* Like Button */}
              <div className="flex gap-1 items-center group cursor-pointer">
                <BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">
                  0
                </span>
              </div>
              <div
                className="flex gap-1 items-center group cursor-pointer"
                onClick={handleLikePost}
              >
                {isLiking && <LoadingSpinner size="sm" />}
                {!isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
                )}
                {isLiked && !isLiking && (
                  <FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
                )}

                <span
                  className={`text-sm  group-hover:text-pink-500 ${
                    isLiked ? "text-pink-500" : "text-slate-500"
                  }`}
                >
                  {post?.likes?.length}
                </span>
              </div>
            </div>

            {/* Bookmark Icon */}
            <div className="flex w-1/3 justify-end gap-2 items-center">
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Post;
