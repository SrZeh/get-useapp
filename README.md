# GetAndUseApp 🚀

<div align="center">

**A modern peer-to-peer item rental platform built with React Native and Expo**

**Uma plataforma moderna de aluguel de itens peer-to-peer construída com React Native e Expo**

</div>

---

<details>
<summary><strong>🇧🇷 Português (PT-BR)</strong></summary>

## 📋 Sobre o Projeto

GetAndUseApp é uma plataforma mobile e web que conecta pessoas interessadas em alugar e oferecer itens diversos (ferramentas, veículos, livros, eletrônicos, etc.) em um marketplace peer-to-peer. O aplicativo facilita todo o processo de aluguel, desde a descoberta de itens até o pagamento e gerenciamento de transações.

---

## ✨ Funcionalidades

- 🔍 **Busca e Descoberta**: Explore itens disponíveis para aluguel por categoria
- 📸 **Gestão de Itens**: Crie, edite e remova seus itens com fotos e detalhes
- 💬 **Chat Integrado**: Sistema de mensagens em tempo real para comunicação entre locatário e locador
- 💳 **Pagamentos**: Integração com Stripe para processamento seguro de pagamentos
- 📱 **Multiplataforma**: Funciona nativamente em iOS, Android e Web
- 🌓 **Dark Mode**: Suporte completo a modo claro e escuro
- 🎨 **Design Moderno**: Interface seguindo o design system iOS 26 Liquid Glass
- ✉️ **Verificação**: Sistema de verificação de email e telefone
- ⭐ **Avaliações**: Sistema de reviews e avaliações de transações
- 🔔 **Notificações**: Acompanhamento de transações e mensagens

---

## 🛠️ Tecnologias

**Frontend:**
- [Expo](https://expo.dev) SDK ~54.0.10
- [React Native](https://reactnative.dev) 0.81.4
- [React](https://react.dev) 19.1.0
- [TypeScript](https://www.typescriptlang.org) (strict mode)
- [Expo Router](https://docs.expo.dev/router/introduction) (file-based routing)
- [NativeWind](https://nativewind.dev) v4 (Tailwind CSS para React Native)

**Backend & Serviços:**
- [Firebase](https://firebase.google.com) (Firestore, Authentication, Storage, Functions)
- [Stripe](https://stripe.com) (pagamentos)
- Firebase Cloud Functions (serverless)

**Ferramentas de Desenvolvimento:**
- ESLint
- TypeScript strict mode
- React Native Reanimated
- Expo Image

---

## 🏗️ Arquitetura

O projeto segue os princípios **SOLID** e boas práticas de código limpo:

- **Single Responsibility**: Cada componente, hook ou serviço tem uma responsabilidade única
- **Separation of Concerns**: Separação clara entre UI, lógica de negócio e serviços
- **Custom Hooks**: Lógica reutilizável extraída em hooks personalizados
- **Context API**: Gerenciamento de estado global com React Context
- **TypeScript Strict**: Type safety completo em todo o projeto

---

## 🚀 Começando

### Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Conta no Firebase (para backend)
- Conta no Stripe (para pagamentos)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/get-useapp.git
cd get-useapp
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` com suas credenciais do Firebase
   - Configure as variáveis do Stripe

4. Inicie o servidor de desenvolvimento:
```bash
npm start
# ou
npx expo start
```

5. Escaneie o QR code com o Expo Go (mobile) ou pressione `w` para web

---

## 📱 Scripts Disponíveis

```bash
npm start          # Inicia o servidor Expo
npm run android    # Abre no emulador Android
npm run ios        # Abre no simulador iOS
npm run web        # Abre no navegador web
npm run build:web  # Build para produção web
npm run deploy:web # Deploy para Firebase Hosting
npm run lint       # Executa o linter
```

---

## 📂 Estrutura do Projeto

```
/app                  # Expo Router - file-based routing
  /(auth)            # Telas de autenticação
  index.tsx          # Tela inicial (Vitrine)
  items.tsx          # Meus itens
  transactions.tsx   # Transações
  /item              # Gestão de itens
  /transaction       # Fluxo de transações
  /profile           # Perfil do usuário
  /chat              # Sistema de chat

/components          # Componentes compartilhados
  /ui               # Componentes de UI reutilizáveis
  /onboarding       # Componentes de onboarding
  /coachmarks       # Sistema de coachmarks

/hooks              # Custom React hooks
/lib                # Bibliotecas core (Firebase, auth)
/providers          # React Context providers
/services           # Lógica de negócio e APIs
/utils              # Funções utilitárias
/types              # Definições TypeScript
/constants          # Constantes da aplicação
/functions          # Firebase Cloud Functions
```

---

## 🎨 Design System

O projeto utiliza o **iOS 26 Liquid Glass Design System**, um sistema de design moderno que enfatiza:

- **Glassmorphism**: Efeitos de vidro e blur para criar hierarquia visual
- **Animações Fluidas**: Transições suaves (inferiores a 400ms)
- **Modo Escuro/Claro**: Suporte completo com transições adaptáveis
- **Cor da Marca**: `#96ff9a` (verde menta)

Para mais detalhes, consulte [`design-system.md`](./design-system.md)

---

## 🔐 Segurança

- Autenticação através do Firebase Auth
- Validação de dados no cliente e servidor
- Firestore Security Rules configuradas
- Uso de `expo-secure-store` para dados sensíveis
- Validação de pagamentos através do Stripe

---

## 🧪 Desenvolvimento

O projeto segue padrões rigorosos de código:

- TypeScript strict mode habilitado
- ESLint configurado para garantir qualidade de código
- Convenções de nomenclatura consistentes
- Componentes abaixo de 200 linhas quando possível
- Máximo de 3 níveis de aninhamento

---

## 📄 Licença

Este projeto é privado e proprietário. Todos os direitos reservados.

---

## 👥 Contribuidores

Desenvolvido com ❤️ pela equipe UpperMinds

---

## 📞 Suporte

Para dúvidas ou suporte, abra uma issue no repositório.

</details>

<details>
<summary><strong>🇺🇸 English (EN)</strong></summary>

## 📋 About the Project

GetAndUseApp is a mobile and web platform that connects people interested in renting and offering various items (tools, vehicles, books, electronics, etc.) in a peer-to-peer marketplace. The application facilitates the entire rental process, from item discovery to payment and transaction management.

---

## ✨ Features

- 🔍 **Search & Discovery**: Explore available items for rent by category
- 📸 **Item Management**: Create, edit, and remove your items with photos and details
- 💬 **Integrated Chat**: Real-time messaging system for communication between renter and owner
- 💳 **Payments**: Stripe integration for secure payment processing
- 📱 **Cross-Platform**: Works natively on iOS, Android, and Web
- 🌓 **Dark Mode**: Full support for light and dark modes
- 🎨 **Modern Design**: Interface following iOS 26 Liquid Glass design system
- ✉️ **Verification**: Email and phone verification system
- ⭐ **Reviews**: Review and rating system for transactions
- 🔔 **Notifications**: Transaction and message tracking

---

## 🛠️ Technologies

**Frontend:**
- [Expo](https://expo.dev) SDK ~54.0.10
- [React Native](https://reactnative.dev) 0.81.4
- [React](https://react.dev) 19.1.0
- [TypeScript](https://www.typescriptlang.org) (strict mode)
- [Expo Router](https://docs.expo.dev/router/introduction) (file-based routing)
- [NativeWind](https://nativewind.dev) v4 (Tailwind CSS for React Native)

**Backend & Services:**
- [Firebase](https://firebase.google.com) (Firestore, Authentication, Storage, Functions)
- [Stripe](https://stripe.com) (payments)
- Firebase Cloud Functions (serverless)

**Development Tools:**
- ESLint
- TypeScript strict mode
- React Native Reanimated
- Expo Image

---

## 🏗️ Architecture

The project follows **SOLID** principles and clean code best practices:

- **Single Responsibility**: Each component, hook, or service has a single responsibility
- **Separation of Concerns**: Clear separation between UI, business logic, and services
- **Custom Hooks**: Reusable logic extracted into custom hooks
- **Context API**: Global state management with React Context
- **TypeScript Strict**: Full type safety throughout the project

---

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Firebase account (for backend)
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/get-useapp.git
cd get-useapp
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Create a `.env` file with your Firebase credentials
   - Set up Stripe variables

4. Start the development server:
```bash
npm start
# or
npx expo start
```

5. Scan the QR code with Expo Go (mobile) or press `w` for web

---

## 📱 Available Scripts

```bash
npm start          # Start Expo server
npm run android    # Open in Android emulator
npm run ios        # Open in iOS simulator
npm run web        # Open in web browser
npm run build:web  # Build for web production
npm run deploy:web # Deploy to Firebase Hosting
npm run lint       # Run linter
```

---

## 📂 Project Structure

```
/app                  # Expo Router - file-based routing
  /(auth)            # Authentication screens
  index.tsx          # Home screen (Vitrine)
  items.tsx          # My items
  transactions.tsx   # Transactions
  /item              # Item management
  /transaction       # Transaction flow
  /profile           # User profile
  /chat              # Chat system

/components          # Shared components
  /ui               # Reusable UI components
  /onboarding       # Onboarding components
  /coachmarks       # Coachmark system

/hooks              # Custom React hooks
/lib                # Core libraries (Firebase, auth)
/providers          # React Context providers
/services           # Business logic and APIs
/utils              # Utility functions
/types              # TypeScript definitions
/constants          # App constants
/functions          # Firebase Cloud Functions
```

---

## 🎨 Design System

The project uses the **iOS 26 Liquid Glass Design System**, a modern design system that emphasizes:

- **Glassmorphism**: Glass effects and blur to create visual hierarchy
- **Fluid Animations**: Smooth transitions (under 400ms)
- **Dark/Light Mode**: Full support with adaptive transitions
- **Brand Color**: `#96ff9a` (mint green)

For more details, see [`design-system.md`](./design-system.md)

---

## 🔐 Security

- Authentication through Firebase Auth
- Data validation on client and server
- Firestore Security Rules configured
- Use of `expo-secure-store` for sensitive data
- Payment validation through Stripe

---

## 🧪 Development

The project follows strict code standards:

- TypeScript strict mode enabled
- ESLint configured to ensure code quality
- Consistent naming conventions
- Components under 200 lines when possible
- Maximum 3 levels of nesting

---

## 📄 License

This project is private and proprietary. All rights reserved.

---

## 👥 Contributors

Developed with ❤️ by the UpperMinds team

---

## 📞 Support

For questions or support, please open an issue in the repository.

</details>

---

<div align="center">

**GetAndUseApp** - Facilitando o compartilhamento de recursos 🎯

**GetAndUseApp** - Facilitating resource sharing 🎯

</div>
