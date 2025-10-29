// app/termosdeuso.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import * as Linking from "expo-linking";
import { Platform, TouchableOpacity } from "react-native";
import { Spacing } from "@/constants/spacing";

/**
 * Dica: defina sua URL pública do site no app.config ou .env:
 * EXPO_PUBLIC_SITE_URL=https://upperreggae.web.app
 * Assim, você tem uma URL ABSOLUTA para o PDF no app nativo também.
 */
const SITE_URL = process.env.EXPO_PUBLIC_SITE_URL ?? "https://upperreggae.web.app";
const pdfPath = "/termosdeuso.pdf";
const pdfUrlAbsolute = `${SITE_URL}${pdfPath}`;

export default function TermsScreen() {
  // Web: usar HTML nativo pra poder usar 'vh' e <a>
  if (Platform.OS === "web") {
    return (
      <div style={{ padding: Spacing.sm }}>
        <h1 style={{ margin: 0 }}>Termos de Uso</h1>

        <div style={{ marginTop: 12, height: "80vh" }}>
          <iframe
            src={pdfPath} // no hosting, o arquivo está disponível como asset estático
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Termos de Uso"
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <a href={pdfPath} target="_blank" rel="noreferrer">
            Baixar PDF
          </a>
        </div>
      </div>
    );
  }

  // Nativo: usar Linking.openURL com URL ABSOLUTA
  const openPdf = () => Linking.openURL(pdfUrlAbsolute);

  return (
    <ThemedView style={{ flex: 1, padding: Spacing.sm }}>
      <ThemedText type="title">Termos de Uso</ThemedText>
      <ThemedText style={{ marginTop: 8 }}>
        Você pode abrir o PDF dos Termos de Uso abaixo.
      </ThemedText>

      <TouchableOpacity onPress={openPdf} style={{ marginTop: 12 }}>
        <ThemedText style={{ textDecorationLine: "underline" }}>
          Abrir / Baixar PDF
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
