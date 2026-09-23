import CarePlanPreview from "./preview";

export const metadata = {
  title: "Персональный медицинский план — ЕС Клиника",
  description: "Локальный прототип интерактивного семейного медицинского плана.",
  robots: { index: false, follow: false },
};

export default function CarePlanPage() {
  return <CarePlanPreview />;
}
