// app/termosdeuso.tsx
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Platform, Pressable, Text } from "react-native";

const pdfPath = "/termosdeuso.pdf"; // coloque o arquivo em /public/termosdeuso.pdf

export default function TermosDeUso() {
  const openPdfNative = async () => {
    try {
      await WebBrowser.openBrowserAsync(pdfPath);
    } catch (e) {
      console.warn("Falha ao abrir PDF:", e);
    }
  };

  return (
    <ThemedView style={{ flex: 1, padding: 16, gap: 16 }}>
      <ThemedText type="title">Termos de Uso</ThemedText>

      {/* 1) Link interno para a página de termos (rota) */}
      <Link href="./termosdeuso" style={{ textDecorationLine: "underline" }}>
        Ver página de Termos
      </Link>

      {/* 2) Botão para abrir o PDF em outra aba (web) / navegador (native) */}
      {Platform.OS === "web" ? (
        <a
          href={pdfPath}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "underline" }}
        >
          Abrir PDF em outra aba
        </a>
      ) : (
        <Pressable onPress={openPdfNative}>
          <Text style={{ textDecorationLine: "underline" }}>
            Abrir PDF no navegador
          </Text>
        </Pressable>
      )}

      {/* (Opcional) Embed do PDF no web */}
      {Platform.OS === "web" && (
        <iframe
          src={pdfPath}
          style={{ width: "100%", height: "80vh", border: "none" }}
          title="Termos de Uso"
        />
      )}
    </ThemedView>
  );
}
