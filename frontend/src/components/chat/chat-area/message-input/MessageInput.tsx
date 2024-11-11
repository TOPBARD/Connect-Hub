import messageActionApi from "@/api/message/message.action";
import { useSelectConversation } from "@/hooks/useSelectConversation";
import LoadingSpinner from "@/shared/loading-spinner/LoadingSpinner";
import { useRef, useState } from "react";
import { FaImage, FaPlus, FaSmile } from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { IoClose } from "react-icons/io5";

const MessageInput = () => {
  const [openImageUpload, setOpenImageUpload] = useState(false);
  const [text, setText] = useState<string>("");
  const [img, setImg] = useState<string>("");
  const imgRef = useRef<HTMLInputElement | null>(null);

  const { participantId } = useSelectConversation();
  const { sendMessageMutation, isPending } = messageActionApi(participantId);

  const handleUploadImageOpen = () => {
    setOpenImageUpload((preve) => !preve);
  };

  // Handle post creation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const messageData = { text, img };
    sendMessageMutation(messageData);
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
    <div className="relative bg-chat-header">
      {img && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-white flex justify-center items-center rounded-lg overflow-hidden p-2 z-20">
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
      <section className="h-16 flex items-center px-1">
        <div className="flex">
          <button className="flex justify-center items-center w-11 h-11 ml-1 rounded-full text-white hover:text-primary">
            <FaSmile size={25} />
          </button>
          <button
            onClick={handleUploadImageOpen}
            className="flex justify-center items-center w-11 h-11 ml-1 rounded-full text-white hover:text-primary"
          >
            <FaPlus size={25} />
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
          <div className="w-full m-2">
            <input
              type="text"
              placeholder="Type here message..."
              className="py-1 px-7 outline-none w-full h-full rounded-full bg-chat-placeholder"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <button className="text-white hover:text-primary mr-1">
            {isPending ? <LoadingSpinner /> : <IoMdSend size={28} />}
          </button>
        </form>
      </section>
    </div>
  );
};

export default MessageInput;
