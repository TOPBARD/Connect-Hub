import { useState, ChangeEvent } from "react";
import toast from "react-hot-toast";

interface PreviewImgHook {
  handleImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  imgUrl: string | null;
  setImgUrl: React.Dispatch<React.SetStateAction<string | null>>;
}

const usePreviewImg = (): PreviewImgHook => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImgUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Invalid file type");
      setImgUrl(null);
    }
  };

  return { handleImageChange, imgUrl, setImgUrl };
};

export default usePreviewImg;
