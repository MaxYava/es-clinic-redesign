import PreciseIsland from "./precise-island";

export const metadata = {
  title: "Остров с высеченной табличкой — ЕС Клиника",
  description: "Локальный вариант с двумя сгенерированными состояниями парящего острова.",
  robots: { index: false, follow: false },
};

export default function IslandLabV2Page() {
  return <PreciseIsland />;
}
