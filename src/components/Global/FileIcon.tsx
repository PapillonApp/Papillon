import { FileText, FileType, FileType2, Music, Paperclip, Image, Clapperboard, TypeIcon } from "lucide-react-native";

export const AutoFileIcon = (props: any) => {
  const { filename } = props;
  const fileExt = filename?.toLowerCase().split(".").pop();

  switch (fileExt) {
    case "pdf":
      return <FileText {...props} />;
      break;
    case "odt":
      return <TypeIcon {...props} />;
      break;
    case "doc":
      return <TypeIcon {...props} />;
      break;
    case "docx":
      return <TypeIcon {...props} />;
      break;
    case "mp3":
      return <Music {...props} />;
      break;
    case "mp4":
      return <Clapperboard {...props} />;
      break;
    case "wav":
      return <Music {...props} />;
      break;
    case "png":
      return <Image {...props} />;
      break;
    case "jpg":
      return <Image {...props} />;
      break;
    default:
      return <Paperclip {...props} />;
      break;
  }
};