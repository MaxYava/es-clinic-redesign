import CareDossier from "./dossier";

export const metadata = {
  title: "Семейное медицинское досье — ЕС Клиника",
  description: "Интерактивное сравнение сопровождения семьи с ЕС Клиникой и без неё.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CareDossier />;
}
