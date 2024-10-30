import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { User } from "../../../shared/interface/User";
import { formatPostDate } from "../../../shared/functions/DataFormatter";
import LoadingSpinner from "../../../shared/loading-spinner/LoadingSpinner";
import { PostComment, Posts } from "../../../shared/interface/Post";

const Post = ({ post }: { post: Posts }) => {
  const queryClient = useQueryClient();
  const { data: authUser } = useQuery<User>({
    queryKey: ["authUser"],
  });
  const [comment, setComment] = useState("");
  const postOwner = post.user;
  const isLiked = post?.likes?.includes(authUser?._id as string);
  const isMyPost = authUser?._id === post?.user?._id;
  const formattedDate = formatPostDate(post.createdAt);

  // Mutation to delete a post
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: async () => {
      try {
        const deletePostData = await axios.delete(`/api/posts/${post._id}`);
        return deletePostData.data;
      } catch (error) {
        throw new Error();
      }
    },
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // Mutation to like a post
  const { mutate: likePost, isPending: isLiking } = useMutation({
    mutationFn: async () => {
      try {
        const likePostData = await axios.post(`/api/posts/like/${post._id}`);
        return likePostData.data;
      } catch (error) {
        throw new Error();
      }
    },
    onSuccess: (updatedLikes) => {
      toast.success("Post liked successfully!!");
      queryClient.setQueryData(["posts"], (oldData: Posts[]) => {
        return oldData.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: updatedLikes };
          }
          return p;
        });
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Mutation to comment on a post
  const { mutate: commentPost, isPending: isCommenting } = useMutation({
    mutationFn: async () => {
      try {
        const commentPostData = await axios.post(
          `/api/posts/comment/${post._id}`,
          { text: comment }
        );
        return commentPostData.data;
      } catch (error) {
        throw new Error();
      }
    },
    onSuccess: () => {
      toast.success("Comment posted successfully");
      setComment("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleDeletePost = () => {
    deletePost();
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCommenting) return;
    commentPost();
  };

  const handleLikePost = () => {
    if (isLiking) return;
    likePost();
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