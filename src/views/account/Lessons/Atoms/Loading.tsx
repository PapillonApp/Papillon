import PapillonLoading from "@/components/Global/PapillonLoading";
import { useTheme } from "@react-navigation/native";

const LessonsLoading = () => {
  const colors = useTheme().colors;

  return (
    <PapillonLoading
      title="Chargement de l'emploi du temps"
    />
  );
};

export default LessonsLoading;
