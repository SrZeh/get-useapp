// app/politica-de-privacidade.tsx
import React from 'react';
import { ScrollView, View, StyleSheet, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, BorderRadius } from '@/constants/spacing';
import { useThemeColors } from '@/utils';

export default function PrivacyPolicyScreen() {
  const colors = useThemeColors();

  // Web: usar HTML nativo para melhor renderização
  if (Platform.OS === 'web') {
    return (
      <div style={{ 
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
        backgroundColor: colors.isDark ? '#0f1012' : '#ffffff'
      }}>
        <div style={{ 
          padding: Spacing.md, 
          maxWidth: '900px', 
          margin: '0 auto',
          lineHeight: 1.6,
          color: colors.isDark ? '#eaeaea' : '#1a1a1a',
          minHeight: '100%'
        }}>
          <h1 style={{ 
            color: colors.brand.dark,
            marginBottom: Spacing.xs,
            fontSize: '2rem'
          }}>
            Política de Privacidade
          </h1>
          <p style={{ 
            opacity: 0.8, 
            fontSize: '14px',
            marginBottom: Spacing.lg
          }}>
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>

          <PrivacyContent />
        </div>
      </div>
    );
  }

  // Native: usar componentes React Native com ScrollView
  return (
    <ThemedView style={{ flex: 1 }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={true}
      >
        <ThemedText type="large-title" style={[styles.title, { color: colors.brand.dark }]}>
          Política de Privacidade
        </ThemedText>
        <ThemedText style={[styles.lastUpdate, { color: colors.text.secondary }]}>
          Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </ThemedText>

        <PrivacyContentNative colors={colors} />
      </ScrollView>
    </ThemedView>
  );
}

function PrivacyContent() {
  return (
    <div style={{ textAlign: 'left' }}>
      <Section 
        title="1. Introdução"
        content={`Esta Política de Privacidade descreve como o Get & Use ("nós", "nosso" ou "aplicativo") coleta, usa, armazena e protege os dados pessoais dos usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

Ao utilizar nosso aplicativo, você concorda com as práticas descritas nesta política. Estamos comprometidos em proteger sua privacidade e garantir a segurança de seus dados pessoais.`}
      />

      <Section
        title="2. Dados Coletados"
        content={`Coletamos os seguintes dados pessoais para fornecer nossos serviços:

• Dados de Identificação: nome completo, CPF (opcional), foto de perfil
• Dados de Contato: endereço de e-mail, número de telefone
• Dados de Localização: endereço completo (CEP, rua, número, complemento, bairro, cidade, estado)
• Dados de Autenticação: credenciais de login (armazenadas de forma segura)
• Dados de Uso: histórico de transações, avaliações e classificações
• Dados Técnicos: endereço IP, informações do dispositivo, logs de acesso

Alguns dados são obrigatórios para uso do aplicativo (nome, e-mail), enquanto outros são opcionais (CPF, telefone, endereço completo).`}
      />

      <Section
        title="3. Finalidade da Coleta"
        content={`Utilizamos seus dados pessoais para as seguintes finalidades:

• Prestação de serviços: permitir que você alugue ou ofereça itens na plataforma
• Autenticação e segurança: verificar sua identidade e proteger sua conta
• Comunicação: enviar notificações sobre transações, mensagens e atualizações
• Personalização: melhorar sua experiência no aplicativo
• Análise e melhoria: entender como o aplicativo é usado para aprimorar nossos serviços
• Cumprimento legal: atender obrigações legais e regulatórias
• Prevenção de fraudes: detectar e prevenir atividades fraudulentas`}
      />

      <Section
        title="4. Armazenamento e Processamento de Dados"
        content={`Utilizamos o Firebase (Google Cloud Platform) como nosso provedor de Backend as a Service (BaaS) para armazenar e processar seus dados pessoais.

O Firebase oferece:
• Armazenamento seguro em servidores localizados em data centers com certificações internacionais (ISO 27001, SOC 2)
• Criptografia em trânsito e em repouso
• Controles rigorosos de acesso e auditorias regulares
• Conformidade com padrões internacionais de segurança e privacidade

Seus dados podem ser transferidos e armazenados em servidores localizados fora do Brasil, mas sempre em conformidade com a LGPD e com as garantias adequadas de proteção de dados.`}
      />

      <Section
        title="5. Compartilhamento de Dados"
        content={`Seus dados pessoais podem ser compartilhados apenas nas seguintes situações:

• Com outros usuários da plataforma: informações básicas do perfil (nome, foto, avaliações) são visíveis para facilitar transações
• Com prestadores de serviços: utilizamos serviços terceirizados como Firebase, Stripe (pagamentos) e provedores de hospedagem, todos com contratos que garantem proteção adequada dos dados
• Por obrigação legal: quando exigido por lei, ordem judicial ou autoridade competente
• Com seu consentimento: em outras situações, apenas com seu consentimento expresso

Não vendemos, alugamos ou comercializamos seus dados pessoais para terceiros para fins de marketing.`}
      />

      <Section
        title="6. Direitos dos Titulares de Dados (LGPD)"
        content={`Conforme a LGPD, você possui os seguintes direitos:

• Acesso: solicitar informações sobre quais dados coletamos e como são utilizados
• Correção: solicitar a correção de dados incompletos, inexatos ou desatualizados
• Exclusão: solicitar a exclusão de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD
• Portabilidade: solicitar a portabilidade de seus dados para outro prestador de serviço
• Revogação do consentimento: revogar seu consentimento a qualquer momento
• Oposição: opor-se ao tratamento de dados em determinadas situações
• Informação: obter informações sobre entidades públicas e privadas com as quais compartilhamos dados
• Revisão de decisões automatizadas: revisar decisões tomadas unicamente com base em tratamento automatizado de dados

Para exercer seus direitos, entre em contato através do e-mail: contato@getuseapp.com`}
      />

      <Section
        title="7. Segurança dos Dados"
        content={`Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais:

• Criptografia: dados sensíveis são criptografados em trânsito (HTTPS/TLS) e em repouso
• Controles de acesso: acesso restrito aos dados apenas para funcionários autorizados
• Autenticação segura: utilização de Firebase Authentication com métodos seguros de autenticação
• Monitoramento: sistemas de monitoramento e detecção de atividades suspeitas
• Backup e recuperação: procedimentos regulares de backup para garantir continuidade dos serviços
• Atualizações de segurança: manutenção regular de sistemas e aplicação de patches de segurança

No entanto, nenhum método de transmissão ou armazenamento eletrônico é 100% seguro. Embora nos esforcemos para proteger seus dados, não podemos garantir segurança absoluta.`}
      />

      <Section
        title="8. Retenção de Dados"
        content={`Mantemos seus dados pessoais apenas pelo tempo necessário para:

• Cumprir as finalidades para as quais foram coletados
• Atender obrigações legais, contábeis e fiscais
• Resolver disputas e fazer cumprir nossos acordos

Geralmente, mantemos dados de contas ativas enquanto você utilizar nosso serviço. Dados de contas excluídas podem ser mantidos por até 90 dias para fins de recuperação e segurança, após os quais serão excluídos permanentemente, exceto quando a retenção for exigida por lei.

Avaliações e dados de transações podem ser mantidos por períodos mais longos para fins históricos e estatísticos, sempre de forma anonimizada quando possível.`}
      />

      <Section
        title="9. Cookies e Tecnologias Similares"
        content={`Em nossa versão web, utilizamos tecnologias como cookies e armazenamento local para:

• Manter sua sessão de usuário
• Lembrar suas preferências e configurações
• Melhorar a performance do aplicativo
• Analisar o uso do aplicativo (análises anonimizadas)

Você pode gerenciar suas preferências de cookies através das configurações do seu navegador. No entanto, desabilitar cookies pode afetar o funcionamento de algumas funcionalidades do aplicativo.`}
      />

      <Section
        title="10. Dados de Menores"
        content={`Nosso serviço é destinado a pessoas com 18 anos ou mais. Não coletamos intencionalmente dados pessoais de menores de idade.

Se tomarmos conhecimento de que coletamos dados de um menor sem o consentimento dos pais ou responsáveis, tomaremos medidas para excluir essas informações de nossos servidores imediatamente.

Se você é pai ou responsável e acredita que seu filho forneceu dados pessoais através de nosso aplicativo, entre em contato conosco.`}
      />

      <Section
        title="11. Alterações nesta Política"
        content={`Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas ou por outros motivos operacionais, legais ou regulatórios.

Quando houver alterações significativas, notificaremos você através de:
• Notificação no aplicativo
• E-mail para o endereço cadastrado
• Aviso destacado em nossa página inicial

A data da última atualização está indicada no início desta política. Recomendamos que você revise esta política periodicamente para se manter informado sobre como protegemos seus dados.`}
      />

      <Section
        title="12. Encarregado de Proteção de Dados (DPO)"
        content={`Em conformidade com a LGPD, designamos um Encarregado de Proteção de Dados (DPO) responsável por receber comunicações dos titulares e da Autoridade Nacional de Proteção de Dados (ANPD).

Para questões relacionadas à proteção de dados pessoais, você pode entrar em contato:
• E-mail: contato@getuseapp.com
• Assunto: Proteção de Dados / LGPD

Responderemos sua solicitação no prazo legal de até 15 (quinze) dias, conforme estabelecido pela LGPD.`}
      />

      <Section
        title="13. Base Legal para Tratamento"
        content={`O tratamento dos seus dados pessoais é realizado com base nas seguintes hipóteses legais previstas na LGPD:

• Execução de contrato: para prestação dos serviços solicitados
• Consentimento: para funcionalidades opcionais e comunicações de marketing
• Cumprimento de obrigação legal: para atender exigências legais e regulatórias
• Proteção da vida: quando necessário para proteger a vida ou segurança física do titular
• Legítimo interesse: para melhorar nossos serviços e prevenir fraudes (sempre respeitando seus direitos)

Você pode revogar seu consentimento a qualquer momento, o que não afetará a legalidade do tratamento anterior.`}
      />

      <Section
        title="14. Consentimento e Aceitação"
        content={`Ao criar uma conta e utilizar nosso aplicativo, você declara que:

• Leu e compreendeu esta Política de Privacidade
• Concorda com o tratamento de seus dados pessoais conforme descrito
• Autoriza o compartilhamento de dados necessário para prestação dos serviços
• Está ciente de seus direitos conforme a LGPD

Se não concordar com esta política, não utilize nosso aplicativo. O uso continuado após alterações nesta política constitui aceitação das modificações.`}
      />

      <Section
        title="15. Contato"
        content={`Para exercer seus direitos, tirar dúvidas ou fazer reclamações sobre o tratamento de seus dados pessoais, entre em contato:

• E-mail: contato@getuseapp.com
• Através do aplicativo: Central de Ajuda no menu de suporte

Estamos comprometidos em responder suas solicitações de forma rápida e adequada, sempre em conformidade com a LGPD e demais normas aplicáveis.`}
      />

      <div style={{ marginTop: Spacing.xl, paddingTop: Spacing.lg, borderTop: '1px solid rgba(150, 255, 154, 0.2)' }}>
        <p style={{ fontSize: '14px', opacity: 0.8, textAlign: 'center' }}>
          Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
        </p>
      </div>
    </div>
  );
}

function PrivacyContentNative({ colors }: { colors: ReturnType<typeof useThemeColors> }) {
  return (
    <View style={{ gap: Spacing.lg }}>
      <SectionNative
        title="1. Introdução"
        content={`Esta Política de Privacidade descreve como o Get & Use ("nós", "nosso" ou "aplicativo") coleta, usa, armazena e protege os dados pessoais dos usuários, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

Ao utilizar nosso aplicativo, você concorda com as práticas descritas nesta política. Estamos comprometidos em proteger sua privacidade e garantir a segurança de seus dados pessoais.`}
        colors={colors}
      />

      <SectionNative
        title="2. Dados Coletados"
        content={`Coletamos os seguintes dados pessoais para fornecer nossos serviços:

• Dados de Identificação: nome completo, CPF (opcional), foto de perfil
• Dados de Contato: endereço de e-mail, número de telefone
• Dados de Localização: endereço completo (CEP, rua, número, complemento, bairro, cidade, estado)
• Dados de Autenticação: credenciais de login (armazenadas de forma segura)
• Dados de Uso: histórico de transações, avaliações e classificações
• Dados Técnicos: endereço IP, informações do dispositivo, logs de acesso

Alguns dados são obrigatórios para uso do aplicativo (nome, e-mail), enquanto outros são opcionais (CPF, telefone, endereço completo).`}
        colors={colors}
      />

      <SectionNative
        title="3. Finalidade da Coleta"
        content={`Utilizamos seus dados pessoais para as seguintes finalidades:

• Prestação de serviços: permitir que você alugue ou ofereça itens na plataforma
• Autenticação e segurança: verificar sua identidade e proteger sua conta
• Comunicação: enviar notificações sobre transações, mensagens e atualizações
• Personalização: melhorar sua experiência no aplicativo
• Análise e melhoria: entender como o aplicativo é usado para aprimorar nossos serviços
• Cumprimento legal: atender obrigações legais e regulatórias
• Prevenção de fraudes: detectar e prevenir atividades fraudulentas`}
        colors={colors}
      />

      <SectionNative
        title="4. Armazenamento e Processamento de Dados"
        content={`Utilizamos o Firebase (Google Cloud Platform) como nosso provedor de Backend as a Service (BaaS) para armazenar e processar seus dados pessoais.

O Firebase oferece:
• Armazenamento seguro em servidores localizados em data centers com certificações internacionais (ISO 27001, SOC 2)
• Criptografia em trânsito e em repouso
• Controles rigorosos de acesso e auditorias regulares
• Conformidade com padrões internacionais de segurança e privacidade

Seus dados podem ser transferidos e armazenados em servidores localizados fora do Brasil, mas sempre em conformidade com a LGPD e com as garantias adequadas de proteção de dados.`}
        colors={colors}
      />

      <SectionNative
        title="5. Compartilhamento de Dados"
        content={`Seus dados pessoais podem ser compartilhados apenas nas seguintes situações:

• Com outros usuários da plataforma: informações básicas do perfil (nome, foto, avaliações) são visíveis para facilitar transações
• Com prestadores de serviços: utilizamos serviços terceirizados como Firebase, Stripe (pagamentos) e provedores de hospedagem, todos com contratos que garantem proteção adequada dos dados
• Por obrigação legal: quando exigido por lei, ordem judicial ou autoridade competente
• Com seu consentimento: em outras situações, apenas com seu consentimento expresso

Não vendemos, alugamos ou comercializamos seus dados pessoais para terceiros para fins de marketing.`}
        colors={colors}
      />

      <SectionNative
        title="6. Direitos dos Titulares de Dados (LGPD)"
        content={`Conforme a LGPD, você possui os seguintes direitos:

• Acesso: solicitar informações sobre quais dados coletamos e como são utilizados
• Correção: solicitar a correção de dados incompletos, inexatos ou desatualizados
• Exclusão: solicitar a exclusão de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD
• Portabilidade: solicitar a portabilidade de seus dados para outro prestador de serviço
• Revogação do consentimento: revogar seu consentimento a qualquer momento
• Oposição: opor-se ao tratamento de dados em determinadas situações
• Informação: obter informações sobre entidades públicas e privadas com as quais compartilhamos dados
• Revisão de decisões automatizadas: revisar decisões tomadas unicamente com base em tratamento automatizado de dados

Para exercer seus direitos, entre em contato através do e-mail: contato@getuseapp.com`}
        colors={colors}
      />

      <SectionNative
        title="7. Segurança dos Dados"
        content={`Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais:

• Criptografia: dados sensíveis são criptografados em trânsito (HTTPS/TLS) e em repouso
• Controles de acesso: acesso restrito aos dados apenas para funcionários autorizados
• Autenticação segura: utilização de Firebase Authentication com métodos seguros de autenticação
• Monitoramento: sistemas de monitoramento e detecção de atividades suspeitas
• Backup e recuperação: procedimentos regulares de backup para garantir continuidade dos serviços
• Atualizações de segurança: manutenção regular de sistemas e aplicação de patches de segurança

No entanto, nenhum método de transmissão ou armazenamento eletrônico é 100% seguro. Embora nos esforcemos para proteger seus dados, não podemos garantir segurança absoluta.`}
        colors={colors}
      />

      <SectionNative
        title="8. Retenção de Dados"
        content={`Mantemos seus dados pessoais apenas pelo tempo necessário para:

• Cumprir as finalidades para as quais foram coletados
• Atender obrigações legais, contábeis e fiscais
• Resolver disputas e fazer cumprir nossos acordos

Geralmente, mantemos dados de contas ativas enquanto você utilizar nosso serviço. Dados de contas excluídas podem ser mantidos por até 90 dias para fins de recuperação e segurança, após os quais serão excluídos permanentemente, exceto quando a retenção for exigida por lei.

Avaliações e dados de transações podem ser mantidos por períodos mais longos para fins históricos e estatísticos, sempre de forma anonimizada quando possível.`}
        colors={colors}
      />

      <SectionNative
        title="9. Cookies e Tecnologias Similares"
        content={`Em nossa versão web, utilizamos tecnologias como cookies e armazenamento local para:

• Manter sua sessão de usuário
• Lembrar suas preferências e configurações
• Melhorar a performance do aplicativo
• Analisar o uso do aplicativo (análises anonimizadas)

Você pode gerenciar suas preferências de cookies através das configurações do seu navegador. No entanto, desabilitar cookies pode afetar o funcionamento de algumas funcionalidades do aplicativo.`}
        colors={colors}
      />

      <SectionNative
        title="10. Dados de Menores"
        content={`Nosso serviço é destinado a pessoas com 18 anos ou mais. Não coletamos intencionalmente dados pessoais de menores de idade.

Se tomarmos conhecimento de que coletamos dados de um menor sem o consentimento dos pais ou responsáveis, tomaremos medidas para excluir essas informações de nossos servidores imediatamente.

Se você é pai ou responsável e acredita que seu filho forneceu dados pessoais através de nosso aplicativo, entre em contato conosco.`}
        colors={colors}
      />

      <SectionNative
        title="11. Alterações nesta Política"
        content={`Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças em nossas práticas ou por outros motivos operacionais, legais ou regulatórios.

Quando houver alterações significativas, notificaremos você através de:
• Notificação no aplicativo
• E-mail para o endereço cadastrado
• Aviso destacado em nossa página inicial

A data da última atualização está indicada no início desta política. Recomendamos que você revise esta política periodicamente para se manter informado sobre como protegemos seus dados.`}
        colors={colors}
      />

      <SectionNative
        title="12. Encarregado de Proteção de Dados (DPO)"
        content={`Em conformidade com a LGPD, designamos um Encarregado de Proteção de Dados (DPO) responsável por receber comunicações dos titulares e da Autoridade Nacional de Proteção de Dados (ANPD).

Para questões relacionadas à proteção de dados pessoais, você pode entrar em contato:
• E-mail: contato@getuseapp.com
• Assunto: Proteção de Dados / LGPD

Responderemos sua solicitação no prazo legal de até 15 (quinze) dias, conforme estabelecido pela LGPD.`}
        colors={colors}
      />

      <SectionNative
        title="13. Base Legal para Tratamento"
        content={`O tratamento dos seus dados pessoais é realizado com base nas seguintes hipóteses legais previstas na LGPD:

• Execução de contrato: para prestação dos serviços solicitados
• Consentimento: para funcionalidades opcionais e comunicações de marketing
• Cumprimento de obrigação legal: para atender exigências legais e regulatórias
• Proteção da vida: quando necessário para proteger a vida ou segurança física do titular
• Legítimo interesse: para melhorar nossos serviços e prevenir fraudes (sempre respeitando seus direitos)

Você pode revogar seu consentimento a qualquer momento, o que não afetará a legalidade do tratamento anterior.`}
        colors={colors}
      />

      <SectionNative
        title="14. Consentimento e Aceitação"
        content={`Ao criar uma conta e utilizar nosso aplicativo, você declara que:

• Leu e compreendeu esta Política de Privacidade
• Concorda com o tratamento de seus dados pessoais conforme descrito
• Autoriza o compartilhamento de dados necessário para prestação dos serviços
• Está ciente de seus direitos conforme a LGPD

Se não concordar com esta política, não utilize nosso aplicativo. O uso continuado após alterações nesta política constitui aceitação das modificações.`}
        colors={colors}
      />

      <SectionNative
        title="15. Contato"
        content={`Para exercer seus direitos, tirar dúvidas ou fazer reclamações sobre o tratamento de seus dados pessoais, entre em contato:

• E-mail: contato@getuseapp.com
• Através do aplicativo: Central de Ajuda no menu de suporte

Estamos comprometidos em responder suas solicitações de forma rápida e adequada, sempre em conformidade com a LGPD e demais normas aplicáveis.`}
        colors={colors}
      />

      <View style={[styles.footer, { borderTopColor: 'rgba(150, 255, 154, 0.2)' }]}>
        <ThemedText style={[styles.footerText, { color: colors.text.secondary }]}>
          Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
        </ThemedText>
      </View>
    </View>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div style={{ marginBottom: Spacing.xl }}>
      <h2 style={{ 
        fontSize: '1.4rem',
        fontWeight: '700',
        marginBottom: Spacing.sm,
        color: '#08af0e'
      }}>
        {title}
      </h2>
      <p style={{ 
        fontSize: '16px',
        lineHeight: 1.8,
        whiteSpace: 'pre-line',
        margin: 0
      }}>
        {content}
      </p>
    </div>
  );
}

function SectionNative({ 
  title, 
  content, 
  colors 
}: { 
  title: string; 
  content: string; 
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View style={{ marginBottom: Spacing.xl }}>
      <ThemedText 
        type="title" 
        style={[styles.sectionTitle, { color: colors.brand.dark }]}
      >
        {title}
      </ThemedText>
      <ThemedText style={[styles.sectionContent, { color: colors.text.primary }]}>
        {content}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  title: {
    marginBottom: Spacing.xs,
    fontWeight: '700',
  },
  lastUpdate: {
    fontSize: 14,
    marginBottom: Spacing.lg,
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
});

