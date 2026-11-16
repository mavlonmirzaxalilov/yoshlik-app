import Savatcha from "@/components/Savatcha";
import { Sarlavha, Tana } from "@/components/ui";

export default function SavatSahifasi() {
  return (
    <>
      <Sarlavha sarlavha="Savat" />
      <Tana>
        <Savatcha />
      </Tana>
    </>
  );
}
