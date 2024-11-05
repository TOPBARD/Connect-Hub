import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { User } from "../../../shared/interface/User";
import postApi from "../../../api/posts/Posts";

const CreatePost = () => {
  const [text, setText] = useState<string>("");
  const [img, setImg] = useState<string | null>(null);
  const imgRef = useRef<HTMLInputElement | null>(null);

  // Fetch authenticated user data
  const { data: authUser } = useQuery<User>({ queryKey: ["authUser"] });

  const { createPost, isError, isPending } = postApi();

  // Handle post creation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPost({ text, img });
    setText("");
    setImg(null);
  };

  // Handle image file selection
  const handleImgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        setImg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex p-4 items-start gap-4 border-b border-gray-700">
      {/* User avatar */}
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img src={authUser?.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>
      {/* Post creation form */}
      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <textarea
          className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800"
          placeholder="What is happening?!"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {img && (
          <div className="relative w-72 mx-auto">
            {/* Close button to remove image preview */}
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => {
                setImg("");
                if (imgRef.current) {
                  imgRef.current.value = "";
                }
              }}
            />
            <img
              src={img as string}
              className="w-full mx-auto h-72 object-contain rounded"
            />
          </div>
        )}

        {/* Action buttons and input for image upload */}
        <div className="flex justify-between border-t py-2 border-t-gray-700">
          <div className="flex gap-1 items-center">
            <CiImageOn
              className="fill-primary w-6 h-6 cursor-pointer"
              onClick={() => imgRef?.current?.click()}
            />
            <BsEmojiSmileFill className="fill-primary w-5 h-5 cursor-pointer" />
          </div>
          <input
            type="file"
            hidden
            accept="image/*"
            ref={imgRef}
            onChange={handleImgChange}
          />
          <button className="btn btn-primary rounded-full btn-sm text-white px-4">
            {/* Show loading or post text */}
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>
        {/* Error message */}
        {isError && <div className="text-red-500">Something went wrong</div>}
      </form>
    </div>
  );
};
export default CreatePost;
