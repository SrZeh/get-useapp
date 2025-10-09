// app/termosdeuso.tsx
import { Platform, ScrollView, View, Text, TouchableOpacity } from "react-native";
import { Linking } from "react-native";

const PDF_URL = "/termosdeuso.pdf";

export default function TermosDeUsoScreen() {
  const openPdf = () => Linking.openURL(PDF_URL);

  if (Platform.OS === "web") {
    return (
      <View style={{ flex: 1, padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 24, fontWeight: "700" }}>Termos de Uso</Text>
        <Text>Última atualização: 09/10/2025</Text>
        <View style={{ height: 12 }} />
        <View
          // iframe só existe no web; react-native-web renderiza elemento "iframe" via any
          // @ts-ignore
          style={{ width: "100%", height: "80vh", borderWidth: 1, borderColor: "#ddd", borderRadius: 8, overflow: "hidden" }}
        >
          {
            // @ts-ignore
            <iframe src={PDF_URL} style={{ width: "100%", height: "100%", border: "none" }} title="Termos de Uso (PDF)" />
          }
        </View>

        <View style={{ height: 8 }} />
        <a href={PDF_URL} target="_blank" rel="noreferrer">
          Baixar PDF
        </a>
      </View>
    );
  }

  // Mobile: resumo + botão para abrir o PDF
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Termos de Uso</Text>
      <Text>Última atualização: 09/10/2025</Text>

      <Text style={{ marginTop: 8 }}>
        Esta página reúne Termos de Uso, Política de Privacidade (LGPD), Pagamentos (Stripe) e
        Políticas específicas (Itens proibidos, avaliações, cancelamentos, taxas).
      </Text>
      <Text>
        A versão completa está no PDF. Ao usar o app, você concorda com estes termos e políticas.
        Dúvidas: contato@upperminds.com.br.
      </Text>

      <TouchableOpacity
        onPress={openPdf}
        style={{
          marginTop: 16,
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#ccc",
          alignSelf: "flex-start",
        }}
      >
        <Text style={{ textDecorationLine: "underline" }}>Abrir Termos (PDF)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
