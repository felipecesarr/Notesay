import type { Language } from "../store/language-store";

// Translations for copywriting only (titles, descriptions, buttons)
// Demo content (chat messages, vocabulary words, book excerpts) stays in English
export const translations: Record<Language, {
  // Hero
  hero: {
    tabs: {
      youtube: { label: string; headline: string; description: string };
      pdf: { label: string; headline: string; description: string };
      chat: { label: string; headline: string; description: string };
      highlight: { label: string; headline: string; description: string };
      flashcards: { label: string; headline: string; description: string };
    };
  };
  // Header
  header: {
    features: string;
    skills: string;
    pricing: string;
    faq: string;
    getStarted: string;
    login: string;
  };
  // FAQ Page
  faq: {
    title: string;
    subtitle: string;
    questions: {
      q1: { question: string; answer: string };
      q2: { question: string; answer: string };
      q3: { question: string; answer: string };
      q4: { question: string; answer: string };
      q5: { question: string; answer: string };
      q6: { question: string; answer: string };
      q7: { question: string; answer: string };
      q8: { question: string; answer: string };
      q9: { question: string; answer: string };
      q10: { question: string; answer: string };
    };
  };
  // ChatModesSection
  chatModes: {
    title: string;
    description: string;
  };
  // PricingSection
  pricing: {
    title: string;
    description: string;
    unlimitedAccess: string;
    zeroLimits: string;
    features: string[];
    firstYearDiscount: string;
    save20: string;
    revealCode: string;
    monthlyMembership: string;
    month: string;
    offApplied: string;
    startNow: string;
    securePayment: string;
  };
  // SkillsAndInterviewSection
  skills: {
    title: string;
    description: string;
  };
  // SpacedRepetitionSection
  spacedRepetition: {
    badge: string;
    title: string;
    description: string;
    problemTitle: string;
    problems: string[];
    solution1Title: string;
    solution1Desc: string;
    solution2Title: string;
    solution2Desc: string;
    solution3Title: string;
    solution3Desc: string;
    stats: { stat: string; label: string }[];
  };
  // ReadAloudSection
  readAloud: {
    badge: string;
    title: string;
  };
  // Footer
  footer: {
    allRightsReserved: string;
  };
}> = {
  // ============== ENGLISH ==============
  en: {
    hero: {
      tabs: {
        youtube: {
          label: "YouTube",
          headline: "Learn English from any video",
          description: "Paste any YouTube link and instantly get interactive vocabulary, AI explanations, and personalized practice exercises from the content you already love watching.",
        },
        pdf: {
          label: "PDF Study",
          headline: "Turn any PDF into a lesson",
          description: "Upload books, articles, or documents. Get instant summaries, key vocabulary, and interactive practice questions tailored to your level.",
        },
        chat: {
          label: "Chat about source",
          headline: "Your AI tutor, always ready",
          description: "Ask questions about any word, phrase, or concept. Get instant explanations, examples in context, and grammar breakdowns tailored to your level.",
        },
        highlight: {
          label: "Highlight Words",
          headline: "Instant AI-powered definitions",
          description: "Highlight any word or phrase to get meanings, synonyms, antonyms, and usage examples. Save to flashcards with one click.",
        },
        flashcards: {
          label: "Flashcards",
          headline: "Vocabulary that actually sticks",
          description: "Every word you highlight becomes a smart flashcard. Spaced repetition ensures you remember vocabulary long-term, not just for a test.",
        },
      },
    },
    header: {
      features: "Features",
      skills: "Skills",
      pricing: "Pricing",
      faq: "FAQ",
      getStarted: "Get Started",
      login: "Login",
    },
    faq: {
      title: "Frequently Asked Questions",
      subtitle: "Everything you need to know about Notesay AI",
      questions: {
        q1: {
          question: "What is Notesay AI?",
          answer: "Notesay AI is an intelligent language learning platform that uses artificial intelligence to help you learn English through interactive conversations, YouTube videos, PDFs, and smart flashcards with spaced repetition.",
        },
        q2: {
          question: "How does the AI tutor work?",
          answer: "Our AI tutor adapts to your learning level and goals. It provides real-time pronunciation feedback, grammar corrections, and personalized explanations. You can choose different conversation modes like casual chat, job interview practice, or debate.",
        },
        q3: {
          question: "What languages are supported?",
          answer: "Currently, Notesay AI focuses on helping users learn English. The interface is available in English, Portuguese, Spanish, Italian, French, and German.",
        },
        q4: {
          question: "How does spaced repetition work?",
          answer: "Our spaced repetition system tracks which words you need to practice and naturally incorporates them into your conversations. Instead of boring flashcard drills, you learn vocabulary in real context through conversations with your AI tutor.",
        },
        q5: {
          question: "What content formats are supported?",
          answer: "You can learn from YouTube videos by pasting any link to get interactive vocabulary and exercises. You can also upload PDF documents like books, articles, or study materials to turn them into personalized lessons.",
        },
        q6: {
          question: "How does the flashcard system work?",
          answer: "When you highlight any word or phrase, it automatically becomes a smart flashcard. The system uses spaced repetition algorithms to show you words at optimal intervals, ensuring long-term retention rather than short-term memorization.",
        },
        q7: {
          question: "How much does it cost?",
          answer: "Notesay AI offers a monthly subscription with unlimited access to all features including AI conversations, YouTube lessons, PDF study, and flashcards. New users can get 20% off their first year with our special discount code.",
        },
        q8: {
          question: "How do I cancel my subscription?",
          answer: "You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period. We process all payments securely through Stripe.",
        },
        q9: {
          question: "Is my data secure?",
          answer: "Yes, we take data security seriously. Your personal information and learning data are encrypted and stored securely. We never share your data with third parties. Payments are processed through Stripe with industry-standard encryption.",
        },
        q10: {
          question: "How can I contact support?",
          answer: "If you have any questions or need assistance, you can reach our support team through the settings menu in the app. We aim to respond to all inquiries within 24 hours.",
        },
      },
    },
    chatModes: {
      title: "A personalized AI tutor for every vibe",
      description: "Whether you need to practice for a job interview, learn casual slang, or just want a friendly chat, your AI tutor adapts to your goals.",
    },
    pricing: {
      title: "Invest in yourself",
      description: "Get unlimited access to your personal AI language coach.",
      unlimitedAccess: "Unlimited Access.",
      zeroLimits: "Zero Limits.",
      features: [
        "Unlimited AI Conversation",
        "Real-time Pronunciation Fixes",
        "Unlimited YouTube Lessons",
        "Advanced Vocabulary Tracking",
        "All Persona Modes (YC, Debate)",
        "Priority Support",
      ],
      firstYearDiscount: "First Year Discount",
      save20: "Save 20% on your first year",
      revealCode: "Reveal Code",
      monthlyMembership: "Monthly Membership",
      month: "/month",
      offApplied: "20% OFF applied",
      startNow: "Start Now",
      securePayment: "Secure payment via Stripe. Cancel anytime.",
    },
    skills: {
      title: "Master any skill.",
      description: "Choose a persona and start talking. No setup required.",
    },
    spacedRepetition: {
      badge: "Smart Vocabulary Revival",
      title: "Spaced repetition that doesn't feel like studying",
      description: "Traditional flashcards are boring. Our AI naturally weaves your vocabulary into conversations, so you practice words in real context—without even trying.",
      problemTitle: "The problem with flashcards",
      problems: [
        "Memorizing definitions is tedious and boring",
        "You forget words because you never use them",
        "Knowing a definition ≠ knowing how to use it",
      ],
      solution1Title: "AI tracks what you need to practice",
      solution1Desc: "Our system knows which words are overdue, which you've never used in conversation, and which need more context practice.",
      solution2Title: "Words appear naturally in chat",
      solution2Desc: "When you chat with your AI tutor, it naturally uses your vocabulary words in context—so you see real usage, not just definitions.",
      solution3Title: "Practice without thinking about it",
      solution3Desc: "Every conversation reinforces your vocabulary. No boring review sessions—just natural practice that actually sticks.",
      stats: [
        { stat: "3x", label: "Better retention than flashcards alone" },
        { stat: "0", label: "Boring review sessions needed" },
        { stat: "100%", label: "Natural context exposure" },
        { stat: "∞", label: "Conversations to practice in" },
      ],
    },
    readAloud: {
      badge: "For Language Learners",
      title: "Start speaking from day one",
    },
    footer: {
      allRightsReserved: "All rights reserved.",
    },
  },

  // ============== PORTUGUESE ==============
  pt: {
    hero: {
      tabs: {
        youtube: {
          label: "YouTube",
          headline: "Aprenda inglês com qualquer vídeo",
          description: "Cole qualquer link do YouTube e obtenha instantaneamente vocabulário interativo, explicações com IA e exercícios personalizados do conteúdo que você já adora assistir.",
        },
        pdf: {
          label: "Estudo de PDF",
          headline: "Transforme qualquer PDF em aula",
          description: "Envie livros, artigos ou documentos. Obtenha resumos instantâneos, vocabulário chave e questões interativas adaptadas ao seu nível.",
        },
        chat: {
          label: "Chat sobre o conteúdo",
          headline: "Seu tutor de IA, sempre pronto",
          description: "Faça perguntas sobre qualquer palavra, frase ou conceito. Obtenha explicações instantâneas, exemplos em contexto e análises gramaticais adaptadas ao seu nível.",
        },
        highlight: {
          label: "Destacar Palavras",
          headline: "Definições instantâneas com IA",
          description: "Destaque qualquer palavra ou frase para obter significados, sinônimos, antônimos e exemplos de uso. Salve em flashcards com um clique.",
        },
        flashcards: {
          label: "Flashcards",
          headline: "Vocabulário que realmente fixa",
          description: "Cada palavra que você destaca se torna um flashcard inteligente. A repetição espaçada garante que você lembre o vocabulário a longo prazo, não apenas para uma prova.",
        },
      },
    },
    header: {
      features: "Recursos",
      skills: "Habilidades",
      pricing: "Preços",
      faq: "FAQ",
      getStarted: "Começar",
      login: "Entrar",
    },
    faq: {
      title: "Perguntas Frequentes",
      subtitle: "Tudo o que você precisa saber sobre o Notesay AI",
      questions: {
        q1: {
          question: "O que é o Notesay AI?",
          answer: "Notesay AI é uma plataforma inteligente de aprendizado de idiomas que usa inteligência artificial para ajudá-lo a aprender inglês através de conversas interativas, vídeos do YouTube, PDFs e flashcards inteligentes com repetição espaçada.",
        },
        q2: {
          question: "Como funciona o tutor de IA?",
          answer: "Nosso tutor de IA se adapta ao seu nível de aprendizado e objetivos. Ele fornece feedback de pronúncia em tempo real, correções gramaticais e explicações personalizadas. Você pode escolher diferentes modos de conversa como bate-papo casual, prática de entrevista de emprego ou debate.",
        },
        q3: {
          question: "Quais idiomas são suportados?",
          answer: "Atualmente, o Notesay AI foca em ajudar usuários a aprender inglês. A interface está disponível em inglês, português, espanhol, italiano, francês e alemão.",
        },
        q4: {
          question: "Como funciona a repetição espaçada?",
          answer: "Nosso sistema de repetição espaçada rastreia quais palavras você precisa praticar e as incorpora naturalmente em suas conversas. Em vez de exercícios chatos de flashcards, você aprende vocabulário em contexto real através de conversas com seu tutor de IA.",
        },
        q5: {
          question: "Quais formatos de conteúdo são suportados?",
          answer: "Você pode aprender com vídeos do YouTube colando qualquer link para obter vocabulário interativo e exercícios. Você também pode enviar documentos PDF como livros, artigos ou materiais de estudo para transformá-los em lições personalizadas.",
        },
        q6: {
          question: "Como funciona o sistema de flashcards?",
          answer: "Quando você destaca qualquer palavra ou frase, ela automaticamente se torna um flashcard inteligente. O sistema usa algoritmos de repetição espaçada para mostrar palavras em intervalos ideais, garantindo retenção a longo prazo em vez de memorização de curto prazo.",
        },
        q7: {
          question: "Quanto custa?",
          answer: "O Notesay AI oferece uma assinatura mensal com acesso ilimitado a todos os recursos, incluindo conversas com IA, aulas do YouTube, estudo de PDF e flashcards. Novos usuários podem obter 20% de desconto no primeiro ano com nosso código de desconto especial.",
        },
        q8: {
          question: "Como cancelo minha assinatura?",
          answer: "Você pode cancelar sua assinatura a qualquer momento nas configurações da sua conta. Seu acesso continuará até o final do seu período de faturamento atual. Processamos todos os pagamentos com segurança através do Stripe.",
        },
        q9: {
          question: "Meus dados estão seguros?",
          answer: "Sim, levamos a segurança dos dados a sério. Suas informações pessoais e dados de aprendizado são criptografados e armazenados com segurança. Nunca compartilhamos seus dados com terceiros. Os pagamentos são processados através do Stripe com criptografia padrão da indústria.",
        },
        q10: {
          question: "Como posso entrar em contato com o suporte?",
          answer: "Se você tiver alguma dúvida ou precisar de assistência, você pode entrar em contato com nossa equipe de suporte através do menu de configurações no aplicativo. Nosso objetivo é responder a todas as consultas em até 24 horas.",
        },
      },
    },
    chatModes: {
      title: "Um tutor de IA personalizado para cada momento",
      description: "Seja para praticar para uma entrevista de emprego, aprender gírias ou apenas bater um papo, seu tutor de IA se adapta aos seus objetivos.",
    },
    pricing: {
      title: "Invista em você",
      description: "Acesso ilimitado ao seu coach pessoal de idiomas com IA.",
      unlimitedAccess: "Acesso Ilimitado.",
      zeroLimits: "Sem Limites.",
      features: [
        "Conversas Ilimitadas com IA",
        "Correções de Pronúncia em Tempo Real",
        "Aulas com YouTube Ilimitadas",
        "Rastreamento Avançado de Vocabulário",
        "Todos os Modos de Persona (YC, Debate)",
        "Suporte Prioritário",
      ],
      firstYearDiscount: "Desconto do Primeiro Ano",
      save20: "Economize 20% no primeiro ano",
      revealCode: "Revelar Código",
      monthlyMembership: "Assinatura Mensal",
      month: "/mês",
      offApplied: "20% OFF aplicado",
      startNow: "Começar Agora",
      securePayment: "Pagamento seguro via Stripe. Cancele quando quiser.",
    },
    skills: {
      title: "Domine qualquer habilidade.",
      description: "Escolha uma persona e comece a conversar. Sem configuração necessária.",
    },
    spacedRepetition: {
      badge: "Revisão Inteligente de Vocabulário",
      title: "Repetição espaçada que não parece estudo",
      description: "Flashcards tradicionais são entediantes. Nossa IA naturalmente incorpora seu vocabulário nas conversas, para você praticar palavras em contexto real—sem nem perceber.",
      problemTitle: "O problema com flashcards",
      problems: [
        "Memorizar definições é tedioso e chato",
        "Você esquece palavras porque nunca as usa",
        "Saber uma definição ≠ saber como usar",
      ],
      solution1Title: "IA rastreia o que você precisa praticar",
      solution1Desc: "Nosso sistema sabe quais palavras estão atrasadas, quais você nunca usou em conversas e quais precisam de mais prática contextual.",
      solution2Title: "Palavras aparecem naturalmente no chat",
      solution2Desc: "Quando você conversa com seu tutor de IA, ele usa naturalmente suas palavras de vocabulário em contexto—você vê uso real, não apenas definições.",
      solution3Title: "Pratique sem pensar nisso",
      solution3Desc: "Cada conversa reforça seu vocabulário. Sem sessões de revisão chatas—apenas prática natural que realmente funciona.",
      stats: [
        { stat: "3x", label: "Melhor retenção que só flashcards" },
        { stat: "0", label: "Sessões de revisão chatas necessárias" },
        { stat: "100%", label: "Exposição a contexto natural" },
        { stat: "∞", label: "Conversas para praticar" },
      ],
    },
    readAloud: {
      badge: "Para Estudantes de Idiomas",
      title: "Comece a falar desde o primeiro dia",
    },
    footer: {
      allRightsReserved: "Todos os direitos reservados.",
    },
  },

  // ============== SPANISH ==============
  es: {
    hero: {
      tabs: {
        youtube: {
          label: "YouTube",
          headline: "Aprende inglés con cualquier video",
          description: "Pega cualquier enlace de YouTube y obtén instantáneamente vocabulario interactivo, explicaciones con IA y ejercicios personalizados del contenido que ya te encanta ver.",
        },
        pdf: {
          label: "Estudio PDF",
          headline: "Convierte cualquier PDF en lección",
          description: "Sube libros, artículos o documentos. Obtén resúmenes instantáneos, vocabulario clave y preguntas interactivas adaptadas a tu nivel.",
        },
        chat: {
          label: "Chat sobre el contenido",
          headline: "Tu tutor de IA, siempre listo",
          description: "Haz preguntas sobre cualquier palabra, frase o concepto. Obtén explicaciones instantáneas, ejemplos en contexto y análisis gramaticales adaptados a tu nivel.",
        },
        highlight: {
          label: "Destacar Palabras",
          headline: "Definiciones instantáneas con IA",
          description: "Destaca cualquier palabra o frase para obtener significados, sinónimos, antónimos y ejemplos de uso. Guarda en flashcards con un clic.",
        },
        flashcards: {
          label: "Flashcards",
          headline: "Vocabulario que realmente se queda",
          description: "Cada palabra que destacas se convierte en una flashcard inteligente. La repetición espaciada asegura que recuerdes el vocabulario a largo plazo, no solo para un examen.",
        },
      },
    },
    header: {
      features: "Características",
      skills: "Habilidades",
      pricing: "Precios",
      faq: "FAQ",
      getStarted: "Empezar",
      login: "Iniciar Sesión",
    },
    faq: {
      title: "Preguntas Frecuentes",
      subtitle: "Todo lo que necesitas saber sobre Notesay AI",
      questions: {
        q1: {
          question: "¿Qué es Notesay AI?",
          answer: "Notesay AI es una plataforma inteligente de aprendizaje de idiomas que utiliza inteligencia artificial para ayudarte a aprender inglés a través de conversaciones interactivas, videos de YouTube, PDFs y flashcards inteligentes con repetición espaciada.",
        },
        q2: {
          question: "¿Cómo funciona el tutor de IA?",
          answer: "Nuestro tutor de IA se adapta a tu nivel de aprendizaje y objetivos. Proporciona retroalimentación de pronunciación en tiempo real, correcciones gramaticales y explicaciones personalizadas. Puedes elegir diferentes modos de conversación como chat casual, práctica de entrevista de trabajo o debate.",
        },
        q3: {
          question: "¿Qué idiomas están soportados?",
          answer: "Actualmente, Notesay AI se enfoca en ayudar a los usuarios a aprender inglés. La interfaz está disponible en inglés, portugués, español, italiano, francés y alemán.",
        },
        q4: {
          question: "¿Cómo funciona la repetición espaciada?",
          answer: "Nuestro sistema de repetición espaciada rastrea qué palabras necesitas practicar y las incorpora naturalmente en tus conversaciones. En lugar de ejercicios aburridos de flashcards, aprendes vocabulario en contexto real a través de conversaciones con tu tutor de IA.",
        },
        q5: {
          question: "¿Qué formatos de contenido son soportados?",
          answer: "Puedes aprender de videos de YouTube pegando cualquier enlace para obtener vocabulario interactivo y ejercicios. También puedes subir documentos PDF como libros, artículos o materiales de estudio para convertirlos en lecciones personalizadas.",
        },
        q6: {
          question: "¿Cómo funciona el sistema de flashcards?",
          answer: "Cuando destacas cualquier palabra o frase, automáticamente se convierte en una flashcard inteligente. El sistema usa algoritmos de repetición espaciada para mostrarte palabras en intervalos óptimos, asegurando retención a largo plazo en lugar de memorización a corto plazo.",
        },
        q7: {
          question: "¿Cuánto cuesta?",
          answer: "Notesay AI ofrece una suscripción mensual con acceso ilimitado a todas las funciones, incluyendo conversaciones con IA, lecciones de YouTube, estudio de PDF y flashcards. Los nuevos usuarios pueden obtener 20% de descuento en su primer año con nuestro código de descuento especial.",
        },
        q8: {
          question: "¿Cómo cancelo mi suscripción?",
          answer: "Puedes cancelar tu suscripción en cualquier momento desde la configuración de tu cuenta. Tu acceso continuará hasta el final de tu período de facturación actual. Procesamos todos los pagos de forma segura a través de Stripe.",
        },
        q9: {
          question: "¿Mis datos están seguros?",
          answer: "Sí, tomamos la seguridad de datos en serio. Tu información personal y datos de aprendizaje están encriptados y almacenados de forma segura. Nunca compartimos tus datos con terceros. Los pagos se procesan a través de Stripe con encriptación estándar de la industria.",
        },
        q10: {
          question: "¿Cómo puedo contactar al soporte?",
          answer: "Si tienes alguna pregunta o necesitas asistencia, puedes contactar a nuestro equipo de soporte a través del menú de configuración en la aplicación. Nuestro objetivo es responder a todas las consultas en un plazo de 24 horas.",
        },
      },
    },
    chatModes: {
      title: "Un tutor de IA personalizado para cada momento",
      description: "Ya sea para practicar para una entrevista de trabajo, aprender jerga o simplemente charlar, tu tutor de IA se adapta a tus objetivos.",
    },
    pricing: {
      title: "Invierte en ti mismo",
      description: "Acceso ilimitado a tu coach personal de idiomas con IA.",
      unlimitedAccess: "Acceso Ilimitado.",
      zeroLimits: "Sin Límites.",
      features: [
        "Conversaciones Ilimitadas con IA",
        "Correcciones de Pronunciación en Tiempo Real",
        "Lecciones de YouTube Ilimitadas",
        "Seguimiento Avanzado de Vocabulario",
        "Todos los Modos de Persona (YC, Debate)",
        "Soporte Prioritario",
      ],
      firstYearDiscount: "Descuento del Primer Año",
      save20: "Ahorra 20% en tu primer año",
      revealCode: "Revelar Código",
      monthlyMembership: "Membresía Mensual",
      month: "/mes",
      offApplied: "20% OFF aplicado",
      startNow: "Empezar Ahora",
      securePayment: "Pago seguro vía Stripe. Cancela cuando quieras.",
    },
    skills: {
      title: "Domina cualquier habilidad.",
      description: "Elige una persona y comienza a hablar. Sin configuración necesaria.",
    },
    spacedRepetition: {
      badge: "Revisión Inteligente de Vocabulario",
      title: "Repetición espaciada que no se siente como estudio",
      description: "Las flashcards tradicionales son aburridas. Nuestra IA incorpora naturalmente tu vocabulario en las conversaciones, para que practiques palabras en contexto real—sin siquiera intentarlo.",
      problemTitle: "El problema con las flashcards",
      problems: [
        "Memorizar definiciones es tedioso y aburrido",
        "Olvidas palabras porque nunca las usas",
        "Saber una definición ≠ saber cómo usarla",
      ],
      solution1Title: "La IA rastrea lo que necesitas practicar",
      solution1Desc: "Nuestro sistema sabe qué palabras están atrasadas, cuáles nunca has usado en conversaciones y cuáles necesitan más práctica contextual.",
      solution2Title: "Las palabras aparecen naturalmente en el chat",
      solution2Desc: "Cuando chateas con tu tutor de IA, usa naturalmente tus palabras de vocabulario en contexto—ves uso real, no solo definiciones.",
      solution3Title: "Practica sin pensar en ello",
      solution3Desc: "Cada conversación refuerza tu vocabulario. Sin sesiones de revisión aburridas—solo práctica natural que realmente funciona.",
      stats: [
        { stat: "3x", label: "Mejor retención que solo flashcards" },
        { stat: "0", label: "Sesiones de revisión aburridas necesarias" },
        { stat: "100%", label: "Exposición a contexto natural" },
        { stat: "∞", label: "Conversaciones para practicar" },
      ],
    },
    readAloud: {
      badge: "Para Estudiantes de Idiomas",
      title: "Empieza a hablar desde el primer día",
    },
    footer: {
      allRightsReserved: "Todos los derechos reservados.",
    },
  },

  // ============== ITALIAN ==============
  it: {
    hero: {
      tabs: {
        youtube: {
          label: "YouTube",
          headline: "Impara l'inglese da qualsiasi video",
          description: "Incolla qualsiasi link di YouTube e ottieni istantaneamente vocabolario interattivo, spiegazioni con IA ed esercizi personalizzati dai contenuti che ami già guardare.",
        },
        pdf: {
          label: "Studio PDF",
          headline: "Trasforma ogni PDF in una lezione",
          description: "Carica libri, articoli o documenti. Ottieni riassunti istantanei, vocabolario chiave e domande interattive adatte al tuo livello.",
        },
        chat: {
          label: "Chat sul contenuto",
          headline: "Il tuo tutor IA, sempre pronto",
          description: "Fai domande su qualsiasi parola, frase o concetto. Ottieni spiegazioni istantanee, esempi nel contesto e analisi grammaticali adattate al tuo livello.",
        },
        highlight: {
          label: "Evidenzia Parole",
          headline: "Definizioni istantanee con IA",
          description: "Evidenzia qualsiasi parola o frase per ottenere significati, sinonimi, contrari ed esempi d'uso. Salva nelle flashcard con un clic.",
        },
        flashcards: {
          label: "Flashcard",
          headline: "Vocabolario che resta davvero",
          description: "Ogni parola che evidenzi diventa una flashcard intelligente. La ripetizione spaziata assicura che ricordi il vocabolario a lungo termine, non solo per un test.",
        },
      },
    },
    header: {
      features: "Funzionalità",
      skills: "Competenze",
      pricing: "Prezzi",
      faq: "FAQ",
      getStarted: "Inizia",
      login: "Accedi",
    },
    faq: {
      title: "Domande Frequenti",
      subtitle: "Tutto quello che devi sapere su Notesay AI",
      questions: {
        q1: {
          question: "Cos'è Notesay AI?",
          answer: "Notesay AI è una piattaforma intelligente per l'apprendimento delle lingue che utilizza l'intelligenza artificiale per aiutarti a imparare l'inglese attraverso conversazioni interattive, video di YouTube, PDF e flashcard intelligenti con ripetizione spaziata.",
        },
        q2: {
          question: "Come funziona il tutor IA?",
          answer: "Il nostro tutor IA si adatta al tuo livello di apprendimento e ai tuoi obiettivi. Fornisce feedback sulla pronuncia in tempo reale, correzioni grammaticali e spiegazioni personalizzate. Puoi scegliere diverse modalità di conversazione come chat casuale, pratica per colloqui di lavoro o dibattito.",
        },
        q3: {
          question: "Quali lingue sono supportate?",
          answer: "Attualmente, Notesay AI si concentra nell'aiutare gli utenti a imparare l'inglese. L'interfaccia è disponibile in inglese, portoghese, spagnolo, italiano, francese e tedesco.",
        },
        q4: {
          question: "Come funziona la ripetizione spaziata?",
          answer: "Il nostro sistema di ripetizione spaziata tiene traccia delle parole che devi praticare e le incorpora naturalmente nelle tue conversazioni. Invece di esercizi noiosi con flashcard, impari il vocabolario in un contesto reale attraverso conversazioni con il tuo tutor IA.",
        },
        q5: {
          question: "Quali formati di contenuto sono supportati?",
          answer: "Puoi imparare dai video di YouTube incollando qualsiasi link per ottenere vocabolario interattivo ed esercizi. Puoi anche caricare documenti PDF come libri, articoli o materiali di studio per trasformarli in lezioni personalizzate.",
        },
        q6: {
          question: "Come funziona il sistema di flashcard?",
          answer: "Quando evidenzi qualsiasi parola o frase, diventa automaticamente una flashcard intelligente. Il sistema utilizza algoritmi di ripetizione spaziata per mostrarti le parole a intervalli ottimali, garantendo una ritenzione a lungo termine invece di una memorizzazione a breve termine.",
        },
        q7: {
          question: "Quanto costa?",
          answer: "Notesay AI offre un abbonamento mensile con accesso illimitato a tutte le funzionalità, incluse conversazioni IA, lezioni YouTube, studio PDF e flashcard. I nuovi utenti possono ottenere il 20% di sconto sul primo anno con il nostro codice sconto speciale.",
        },
        q8: {
          question: "Come cancello il mio abbonamento?",
          answer: "Puoi cancellare il tuo abbonamento in qualsiasi momento dalle impostazioni del tuo account. Il tuo accesso continuerà fino alla fine del periodo di fatturazione corrente. Elaboriamo tutti i pagamenti in modo sicuro tramite Stripe.",
        },
        q9: {
          question: "I miei dati sono al sicuro?",
          answer: "Sì, prendiamo la sicurezza dei dati molto seriamente. Le tue informazioni personali e i dati di apprendimento sono crittografati e archiviati in modo sicuro. Non condividiamo mai i tuoi dati con terze parti. I pagamenti vengono elaborati tramite Stripe con crittografia standard del settore.",
        },
        q10: {
          question: "Come posso contattare il supporto?",
          answer: "Se hai domande o hai bisogno di assistenza, puoi contattare il nostro team di supporto attraverso il menu delle impostazioni nell'app. Il nostro obiettivo è rispondere a tutte le richieste entro 24 ore.",
        },
      },
    },
    chatModes: {
      title: "Un tutor IA personalizzato per ogni momento",
      description: "Che tu debba prepararti per un colloquio, imparare lo slang o semplicemente chiacchierare, il tuo tutor IA si adatta ai tuoi obiettivi.",
    },
    pricing: {
      title: "Investi in te stesso",
      description: "Accesso illimitato al tuo coach personale di lingue con IA.",
      unlimitedAccess: "Accesso Illimitato.",
      zeroLimits: "Zero Limiti.",
      features: [
        "Conversazioni Illimitate con IA",
        "Correzioni di Pronuncia in Tempo Reale",
        "Lezioni YouTube Illimitate",
        "Tracciamento Avanzato del Vocabolario",
        "Tutte le Modalità Persona (YC, Dibattito)",
        "Supporto Prioritario",
      ],
      firstYearDiscount: "Sconto Primo Anno",
      save20: "Risparmia il 20% sul primo anno",
      revealCode: "Rivela Codice",
      monthlyMembership: "Abbonamento Mensile",
      month: "/mese",
      offApplied: "20% OFF applicato",
      startNow: "Inizia Ora",
      securePayment: "Pagamento sicuro via Stripe. Cancella quando vuoi.",
    },
    skills: {
      title: "Padroneggia qualsiasi competenza.",
      description: "Scegli una persona e inizia a parlare. Nessuna configurazione necessaria.",
    },
    spacedRepetition: {
      badge: "Revisione Intelligente del Vocabolario",
      title: "Ripetizione spaziata che non sembra studio",
      description: "Le flashcard tradizionali sono noiose. La nostra IA incorpora naturalmente il tuo vocabolario nelle conversazioni, così pratichi le parole in contesto reale—senza nemmeno provarci.",
      problemTitle: "Il problema con le flashcard",
      problems: [
        "Memorizzare definizioni è noioso e tedioso",
        "Dimentichi le parole perché non le usi mai",
        "Conoscere una definizione ≠ sapere come usarla",
      ],
      solution1Title: "L'IA traccia ciò che devi praticare",
      solution1Desc: "Il nostro sistema sa quali parole sono in ritardo, quali non hai mai usato in conversazione e quali hanno bisogno di più pratica contestuale.",
      solution2Title: "Le parole appaiono naturalmente nella chat",
      solution2Desc: "Quando chatti con il tuo tutor IA, usa naturalmente le tue parole di vocabolario in contesto—vedi l'uso reale, non solo definizioni.",
      solution3Title: "Pratica senza pensarci",
      solution3Desc: "Ogni conversazione rinforza il tuo vocabolario. Niente sessioni di revisione noiose—solo pratica naturale che funziona davvero.",
      stats: [
        { stat: "3x", label: "Ritenzione migliore delle sole flashcard" },
        { stat: "0", label: "Sessioni di revisione noiose necessarie" },
        { stat: "100%", label: "Esposizione a contesto naturale" },
        { stat: "∞", label: "Conversazioni per praticare" },
      ],
    },
    readAloud: {
      badge: "Per Studenti di Lingue",
      title: "Inizia a parlare dal primo giorno",
    },
    footer: {
      allRightsReserved: "Tutti i diritti riservati.",
    },
  },

  // ============== FRENCH ==============
  fr: {
    hero: {
      tabs: {
        youtube: {
          label: "YouTube",
          headline: "Apprenez l'anglais avec n'importe quelle vidéo",
          description: "Collez n'importe quel lien YouTube et obtenez instantanément du vocabulaire interactif, des explications IA et des exercices personnalisés à partir du contenu que vous aimez déjà regarder.",
        },
        pdf: {
          label: "Étude PDF",
          headline: "Transformez tout PDF en leçon",
          description: "Téléchargez des livres, articles ou documents. Obtenez des résumés, du vocabulaire clé et des questions interactives adaptées à votre niveau.",
        },
        chat: {
          label: "Chat sur le contenu",
          headline: "Votre tuteur IA, toujours prêt",
          description: "Posez des questions sur n'importe quel mot, phrase ou concept. Obtenez des explications instantanées, des exemples en contexte et des analyses grammaticales adaptées à votre niveau.",
        },
        highlight: {
          label: "Surligner des Mots",
          headline: "Définitions instantanées avec IA",
          description: "Surlignez n'importe quel mot ou phrase pour obtenir des significations, synonymes, antonymes et exemples d'utilisation. Enregistrez dans les flashcards en un clic.",
        },
        flashcards: {
          label: "Flashcards",
          headline: "Du vocabulaire qui reste vraiment",
          description: "Chaque mot que vous surlignez devient une flashcard intelligente. La répétition espacée garantit que vous vous souvenez du vocabulaire à long terme, pas seulement pour un test.",
        },
      },
    },
    header: {
      features: "Fonctionnalités",
      skills: "Compétences",
      pricing: "Tarifs",
      faq: "FAQ",
      getStarted: "Commencer",
      login: "Connexion",
    },
    faq: {
      title: "Questions Fréquentes",
      subtitle: "Tout ce que vous devez savoir sur Notesay AI",
      questions: {
        q1: {
          question: "Qu'est-ce que Notesay AI ?",
          answer: "Notesay AI est une plateforme intelligente d'apprentissage des langues qui utilise l'intelligence artificielle pour vous aider à apprendre l'anglais grâce à des conversations interactives, des vidéos YouTube, des PDFs et des flashcards intelligentes avec répétition espacée.",
        },
        q2: {
          question: "Comment fonctionne le tuteur IA ?",
          answer: "Notre tuteur IA s'adapte à votre niveau d'apprentissage et à vos objectifs. Il fournit des retours sur la prononciation en temps réel, des corrections grammaticales et des explications personnalisées. Vous pouvez choisir différents modes de conversation comme le chat décontracté, la pratique d'entretien d'embauche ou le débat.",
        },
        q3: {
          question: "Quelles langues sont prises en charge ?",
          answer: "Actuellement, Notesay AI se concentre sur l'aide aux utilisateurs pour apprendre l'anglais. L'interface est disponible en anglais, portugais, espagnol, italien, français et allemand.",
        },
        q4: {
          question: "Comment fonctionne la répétition espacée ?",
          answer: "Notre système de répétition espacée suit les mots que vous devez pratiquer et les intègre naturellement dans vos conversations. Au lieu d'exercices ennuyeux avec des flashcards, vous apprenez le vocabulaire dans un contexte réel à travers des conversations avec votre tuteur IA.",
        },
        q5: {
          question: "Quels formats de contenu sont pris en charge ?",
          answer: "Vous pouvez apprendre à partir de vidéos YouTube en collant n'importe quel lien pour obtenir du vocabulaire interactif et des exercices. Vous pouvez également télécharger des documents PDF comme des livres, des articles ou des supports d'étude pour les transformer en leçons personnalisées.",
        },
        q6: {
          question: "Comment fonctionne le système de flashcards ?",
          answer: "Lorsque vous surlignez un mot ou une phrase, il devient automatiquement une flashcard intelligente. Le système utilise des algorithmes de répétition espacée pour vous montrer les mots à des intervalles optimaux, assurant une rétention à long terme plutôt qu'une mémorisation à court terme.",
        },
        q7: {
          question: "Combien ça coûte ?",
          answer: "Notesay AI propose un abonnement mensuel avec un accès illimité à toutes les fonctionnalités, y compris les conversations IA, les leçons YouTube, l'étude PDF et les flashcards. Les nouveaux utilisateurs peuvent bénéficier de 20% de réduction sur leur première année avec notre code de réduction spécial.",
        },
        q8: {
          question: "Comment annuler mon abonnement ?",
          answer: "Vous pouvez annuler votre abonnement à tout moment depuis les paramètres de votre compte. Votre accès continuera jusqu'à la fin de votre période de facturation actuelle. Nous traitons tous les paiements de manière sécurisée via Stripe.",
        },
        q9: {
          question: "Mes données sont-elles sécurisées ?",
          answer: "Oui, nous prenons la sécurité des données très au sérieux. Vos informations personnelles et vos données d'apprentissage sont chiffrées et stockées de manière sécurisée. Nous ne partageons jamais vos données avec des tiers. Les paiements sont traités via Stripe avec un chiffrement aux normes de l'industrie.",
        },
        q10: {
          question: "Comment contacter le support ?",
          answer: "Si vous avez des questions ou avez besoin d'aide, vous pouvez contacter notre équipe de support via le menu des paramètres dans l'application. Notre objectif est de répondre à toutes les demandes dans les 24 heures.",
        },
      },
    },
    chatModes: {
      title: "Un tuteur IA personnalisé pour chaque moment",
      description: "Que vous ayez besoin de vous préparer pour un entretien, d'apprendre l'argot ou simplement de discuter, votre tuteur IA s'adapte à vos objectifs.",
    },
    pricing: {
      title: "Investissez en vous-même",
      description: "Accès illimité à votre coach personnel de langues avec IA.",
      unlimitedAccess: "Accès Illimité.",
      zeroLimits: "Zéro Limites.",
      features: [
        "Conversations Illimitées avec IA",
        "Corrections de Prononciation en Temps Réel",
        "Leçons YouTube Illimitées",
        "Suivi Avancé du Vocabulaire",
        "Tous les Modes Persona (YC, Débat)",
        "Support Prioritaire",
      ],
      firstYearDiscount: "Réduction Première Année",
      save20: "Économisez 20% la première année",
      revealCode: "Révéler le Code",
      monthlyMembership: "Abonnement Mensuel",
      month: "/mois",
      offApplied: "20% de réduction appliquée",
      startNow: "Commencer Maintenant",
      securePayment: "Paiement sécurisé via Stripe. Annulez à tout moment.",
    },
    skills: {
      title: "Maîtrisez n'importe quelle compétence.",
      description: "Choisissez une persona et commencez à parler. Aucune configuration requise.",
    },
    spacedRepetition: {
      badge: "Révision Intelligente du Vocabulaire",
      title: "La répétition espacée qui ne ressemble pas à des études",
      description: "Les flashcards traditionnelles sont ennuyeuses. Notre IA intègre naturellement votre vocabulaire dans les conversations, pour que vous pratiquiez les mots en contexte réel—sans même essayer.",
      problemTitle: "Le problème avec les flashcards",
      problems: [
        "Mémoriser des définitions est ennuyeux et fastidieux",
        "Vous oubliez les mots parce que vous ne les utilisez jamais",
        "Connaître une définition ≠ savoir comment l'utiliser",
      ],
      solution1Title: "L'IA suit ce que vous devez pratiquer",
      solution1Desc: "Notre système sait quels mots sont en retard, lesquels vous n'avez jamais utilisés en conversation et lesquels ont besoin de plus de pratique contextuelle.",
      solution2Title: "Les mots apparaissent naturellement dans le chat",
      solution2Desc: "Quand vous chattez avec votre tuteur IA, il utilise naturellement vos mots de vocabulaire en contexte—vous voyez l'usage réel, pas seulement des définitions.",
      solution3Title: "Pratiquez sans y penser",
      solution3Desc: "Chaque conversation renforce votre vocabulaire. Pas de sessions de révision ennuyeuses—juste une pratique naturelle qui fonctionne vraiment.",
      stats: [
        { stat: "3x", label: "Meilleure rétention que les flashcards seules" },
        { stat: "0", label: "Sessions de révision ennuyeuses nécessaires" },
        { stat: "100%", label: "Exposition au contexte naturel" },
        { stat: "∞", label: "Conversations pour pratiquer" },
      ],
    },
    readAloud: {
      badge: "Pour les Apprenants de Langues",
      title: "Commencez à parler dès le premier jour",
    },
    footer: {
      allRightsReserved: "Tous droits réservés.",
    },
  },

  // ============== GERMAN ==============
  de: {
    hero: {
      tabs: {
        youtube: {
          label: "YouTube",
          headline: "Lerne Englisch mit jedem Video",
          description: "Füge einen beliebigen YouTube-Link ein und erhalte sofort interaktives Vokabular, KI-Erklärungen und personalisierte Übungen aus den Inhalten, die du bereits gerne anschaust.",
        },
        pdf: {
          label: "PDF-Studium",
          headline: "Verwandle jedes PDF in eine Lektion",
          description: "Lade Bücher, Artikel oder Dokumente hoch. Erhalte sofortige Zusammenfassungen, Schlüsselvokabular und interaktive Übungsfragen.",
        },
        chat: {
          label: "Chat über den Inhalt",
          headline: "Dein KI-Tutor, immer bereit",
          description: "Stelle Fragen zu jedem Wort, Satz oder Konzept. Erhalte sofortige Erklärungen, Beispiele im Kontext und Grammatikanalysen, die auf dein Niveau zugeschnitten sind.",
        },
        highlight: {
          label: "Wörter Markieren",
          headline: "Sofortige KI-gestützte Definitionen",
          description: "Markiere jedes Wort oder jeden Satz, um Bedeutungen, Synonyme, Antonyme und Verwendungsbeispiele zu erhalten. Mit einem Klick in Karteikarten speichern.",
        },
        flashcards: {
          label: "Karteikarten",
          headline: "Vokabular, das wirklich hängen bleibt",
          description: "Jedes Wort, das du markierst, wird zu einer intelligenten Karteikarte. Spaced Repetition stellt sicher, dass du Vokabeln langfristig behältst, nicht nur für einen Test.",
        },
      },
    },
    header: {
      features: "Funktionen",
      skills: "Fähigkeiten",
      pricing: "Preise",
      faq: "FAQ",
      getStarted: "Starten",
      login: "Anmelden",
    },
    faq: {
      title: "Häufig gestellte Fragen",
      subtitle: "Alles, was Sie über Notesay AI wissen müssen",
      questions: {
        q1: {
          question: "Was ist Notesay AI?",
          answer: "Notesay AI ist eine intelligente Sprachlernplattform, die künstliche Intelligenz nutzt, um Ihnen beim Englischlernen durch interaktive Gespräche, YouTube-Videos, PDFs und intelligente Karteikarten mit verteiltem Lernen zu helfen.",
        },
        q2: {
          question: "Wie funktioniert der KI-Tutor?",
          answer: "Unser KI-Tutor passt sich Ihrem Lernniveau und Ihren Zielen an. Er bietet Echtzeit-Aussprache-Feedback, Grammatikkorrekturen und personalisierte Erklärungen. Sie können verschiedene Gesprächsmodi wählen wie lockere Unterhaltung, Vorstellungsgespräch-Übung oder Debatte.",
        },
        q3: {
          question: "Welche Sprachen werden unterstützt?",
          answer: "Derzeit konzentriert sich Notesay AI darauf, Benutzern beim Englischlernen zu helfen. Die Benutzeroberfläche ist auf Englisch, Portugiesisch, Spanisch, Italienisch, Französisch und Deutsch verfügbar.",
        },
        q4: {
          question: "Wie funktioniert verteiltes Lernen?",
          answer: "Unser System für verteiltes Lernen verfolgt, welche Wörter Sie üben müssen, und integriert sie natürlich in Ihre Gespräche. Statt langweiliger Karteikarten-Übungen lernen Sie Vokabeln im echten Kontext durch Gespräche mit Ihrem KI-Tutor.",
        },
        q5: {
          question: "Welche Inhaltsformate werden unterstützt?",
          answer: "Sie können von YouTube-Videos lernen, indem Sie einen beliebigen Link einfügen, um interaktives Vokabular und Übungen zu erhalten. Sie können auch PDF-Dokumente wie Bücher, Artikel oder Lernmaterialien hochladen, um sie in personalisierte Lektionen umzuwandeln.",
        },
        q6: {
          question: "Wie funktioniert das Karteikarten-System?",
          answer: "Wenn Sie ein Wort oder eine Phrase markieren, wird es automatisch zu einer intelligenten Karteikarte. Das System verwendet Algorithmen für verteiltes Lernen, um Ihnen Wörter in optimalen Abständen zu zeigen und eine langfristige Erinnerung statt kurzfristiges Auswendiglernen zu gewährleisten.",
        },
        q7: {
          question: "Wie viel kostet es?",
          answer: "Notesay AI bietet ein monatliches Abonnement mit unbegrenztem Zugang zu allen Funktionen, einschließlich KI-Gesprächen, YouTube-Lektionen, PDF-Studium und Karteikarten. Neue Benutzer können mit unserem speziellen Rabattcode 20% auf ihr erstes Jahr sparen.",
        },
        q8: {
          question: "Wie kündige ich mein Abonnement?",
          answer: "Sie können Ihr Abonnement jederzeit in Ihren Kontoeinstellungen kündigen. Ihr Zugang bleibt bis zum Ende Ihres aktuellen Abrechnungszeitraums bestehen. Wir verarbeiten alle Zahlungen sicher über Stripe.",
        },
        q9: {
          question: "Sind meine Daten sicher?",
          answer: "Ja, wir nehmen Datensicherheit sehr ernst. Ihre persönlichen Informationen und Lerndaten sind verschlüsselt und sicher gespeichert. Wir teilen Ihre Daten niemals mit Dritten. Zahlungen werden über Stripe mit branchenüblicher Verschlüsselung verarbeitet.",
        },
        q10: {
          question: "Wie kann ich den Support kontaktieren?",
          answer: "Wenn Sie Fragen haben oder Hilfe benötigen, können Sie unser Support-Team über das Einstellungsmenü in der App kontaktieren. Unser Ziel ist es, alle Anfragen innerhalb von 24 Stunden zu beantworten.",
        },
      },
    },
    chatModes: {
      title: "Ein personalisierter KI-Tutor für jeden Moment",
      description: "Ob du für ein Vorstellungsgespräch üben, Slang lernen oder einfach nur plaudern willst, dein KI-Tutor passt sich deinen Zielen an.",
    },
    pricing: {
      title: "Investiere in dich selbst",
      description: "Unbegrenzter Zugang zu deinem persönlichen KI-Sprachcoach.",
      unlimitedAccess: "Unbegrenzter Zugang.",
      zeroLimits: "Keine Limits.",
      features: [
        "Unbegrenzte KI-Gespräche",
        "Echtzeit-Aussprachekorrektur",
        "Unbegrenzte YouTube-Lektionen",
        "Fortgeschrittenes Vokabel-Tracking",
        "Alle Persona-Modi (YC, Debatte)",
        "Prioritäts-Support",
      ],
      firstYearDiscount: "Erstes Jahr Rabatt",
      save20: "Spare 20% im ersten Jahr",
      revealCode: "Code anzeigen",
      monthlyMembership: "Monatliche Mitgliedschaft",
      month: "/Monat",
      offApplied: "20% Rabatt angewendet",
      startNow: "Jetzt Starten",
      securePayment: "Sichere Zahlung via Stripe. Jederzeit kündbar.",
    },
    skills: {
      title: "Beherrsche jede Fähigkeit.",
      description: "Wähle eine Persona und beginne zu sprechen. Keine Einrichtung erforderlich.",
    },
    spacedRepetition: {
      badge: "Intelligente Vokabel-Wiederholung",
      title: "Spaced Repetition, die sich nicht wie Lernen anfühlt",
      description: "Traditionelle Karteikarten sind langweilig. Unsere KI webt dein Vokabular natürlich in Gespräche ein, sodass du Wörter im echten Kontext übst—ohne es zu versuchen.",
      problemTitle: "Das Problem mit Karteikarten",
      problems: [
        "Definitionen auswendig lernen ist mühsam und langweilig",
        "Du vergisst Wörter, weil du sie nie benutzt",
        "Eine Definition kennen ≠ wissen, wie man sie benutzt",
      ],
      solution1Title: "KI verfolgt, was du üben musst",
      solution1Desc: "Unser System weiß, welche Wörter überfällig sind, welche du nie in Gesprächen benutzt hast und welche mehr Kontext-Übung brauchen.",
      solution2Title: "Wörter erscheinen natürlich im Chat",
      solution2Desc: "Wenn du mit deinem KI-Tutor chattest, verwendet er natürlich deine Vokabeln im Kontext—du siehst echte Verwendung, nicht nur Definitionen.",
      solution3Title: "Übe, ohne darüber nachzudenken",
      solution3Desc: "Jedes Gespräch verstärkt dein Vokabular. Keine langweiligen Wiederholungen—nur natürliche Übung, die wirklich haftet.",
      stats: [
        { stat: "3x", label: "Besseres Behalten als nur Karteikarten" },
        { stat: "0", label: "Langweilige Wiederholungen nötig" },
        { stat: "100%", label: "Natürliche Kontext-Exposition" },
        { stat: "∞", label: "Gespräche zum Üben" },
      ],
    },
    readAloud: {
      badge: "Für Sprachenlerner",
      title: "Beginne vom ersten Tag an zu sprechen",
    },
    footer: {
      allRightsReserved: "Alle Rechte vorbehalten.",
    },
  },
};
