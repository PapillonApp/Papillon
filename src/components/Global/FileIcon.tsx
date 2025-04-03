import { FileText, Music, Paperclip, Image, Clapperboard, TypeIcon } from "lucide-react-native";

export const AutoFileIcon = (props: any) => {
  const { filename } = props;
  const fileExt = filename?.toLowerCase().split(".").pop();

  switch (fileExt) {
    case "pdf":
      return <FileText {...props} />;
    case "odt":
      return <TypeIcon {...props} />;
    case "doc":
      return <TypeIcon {...props} />;
    case "docx":
      return <TypeIcon {...props} />;
    case "mp3":
      return <Music {...props} />;
    case "mp4":
      return <Clapperboard {...props} />;
    case "wav":
      return <Music {...props} />;
    case "png":
      return <Image {...props} />;
    case "jpg":
      return <Image {...props} />;
    default:
      return <Paperclip {...props} />;
  }
};
