import { FileText, Music, Paperclip, Image, Clapperboard, TypeIcon } from "lucide-react-native";
export var AutoFileIcon = function (props) {
    var filename = props.filename;
    var fileExt = filename === null || filename === void 0 ? void 0 : filename.toLowerCase().split(".").pop();
    switch (fileExt) {
        case "pdf":
            return <FileText {...props}/>;
            break;
        case "odt":
            return <TypeIcon {...props}/>;
            break;
        case "doc":
            return <TypeIcon {...props}/>;
            break;
        case "docx":
            return <TypeIcon {...props}/>;
            break;
        case "mp3":
            return <Music {...props}/>;
            break;
        case "mp4":
            return <Clapperboard {...props}/>;
            break;
        case "wav":
            return <Music {...props}/>;
            break;
        case "png":
            return <Image {...props}/>;
            break;
        case "jpg":
            return <Image {...props}/>;
            break;
        default:
            return <Paperclip {...props}/>;
            break;
    }
};
