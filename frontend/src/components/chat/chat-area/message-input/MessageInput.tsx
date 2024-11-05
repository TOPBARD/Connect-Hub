import conversationApi from "@/api/chat/Chat";
import { useSelectConversation } from "@/hooks/useSelectConversation";
import LoadingSpinner from "@/shared/loading-spinner/LoadingSpinner";
import { useRef, useState } from "react";
import { FaImage, FaPlus } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { IoClose } from "react-icons/io5";

const MessageInput = () => {
  const [openImageUpload, setOpenImageUpload] = useState(false);
  const [text, setText] = useState<string>("");
  const [img, setImg] = useState<string>("");
  const imgRef = useRef<HTMLInputElement | null>(null);

  const { participantId } = useSelectConversation();
  const { sendMessageMutation, isPending } = conversationApi(participantId);

  const handleUploadImageOpen = () => {
    setOpenImageUpload((preve) => !preve);
  };

  // Handle post creation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessageMutation({ text, img });
    setOpenImageUpload(false);
    setText("");
    setImg("");
  };

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
    <div className="relative">
      {img && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-slate-700 bg-opacity-30 flex justify-center items-center rounded-lg overflow-hidden p-2 z-20">
          <div
            className="absolute top-2 right-2 cursor-pointer hover:text-red-600"
            onClick={() => {
              setImg("");
              if (imgRef.current) {
                imgRef.current.value = "";
              }
            }}
          >
            <IoClose size={30} onClick={() => setOpenImageUpload(false)} />
          </div>
          <img
            src={img}
            alt="uploadImage"
            className="max-w-sm max-h-64 m-2 object-contain"
          />
        </div>
      )}
      <section className="h-16 flex items-center px-4">
        <div className="relative ">
          <button
            onClick={handleUploadImageOpen}
            className="flex justify-center items-center w-11 h-11 rounded-full hover:bg-primary hover:text-white"
          >
            <FaPlus size={20} />
          </button>

          {/**video and image */}
          {openImageUpload && (
            <div className="bg-gray-800 shadow rounded absolute bottom-14 w-36 p-2">
              <form onClick={() => imgRef?.current?.click()}>
                <label
                  htmlFor="uploadImage"
                  className="flex items-center p-2 hover:bg-gray-700 px-3 gap-3 cursor-pointer"
                >
                  <div className="text-primary">
                    <FaImage size={20} />
                  </div>
                  <p>Image</p>
                </label>

                <input
                  type="file"
                  hidden
                  accept="image/*"
                  ref={imgRef}
                  onChange={handleImgChange}
                />
              </form>
            </div>
          )}
        </div>

        {/**input box */}
        <form className="h-full w-full flex gap-2" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Type here message..."
            className="py-1 px-4 outline-none w-full h-full"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="text-primary hover:text-secondary">
            {isPending ? <LoadingSpinner /> : <IoMdSend size={28} />}
          </button>
        </form>
      </section>
    </div>
  );
};

export default MessageInput;
