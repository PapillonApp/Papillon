import PapillonLoading from "@/components/Global/PapillonLoading";
import { usePapillonTheme as useTheme } from "@/utils/ui/theme";

const LessonsLoading = () => {
  const colors = useTheme().colors;

  return (
    <PapillonLoading
      title="Chargement de l'emploi du temps"
    />
  );
};

export default LessonsLoading;
