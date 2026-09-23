import ConceptGallery from "./concept-gallery";

export const metadata = {
  title: "Концепции управления здоровьем — ЕС Клиника",
  description: "Локальные варианты интерактивного сравнения для ЕС Клиники.",
  robots: { index: false, follow: false },
};

export default function CareConceptsPage() {
  return <ConceptGallery />;
}
