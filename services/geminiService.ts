
import { GoogleGenAI, Type, Schema, Modality } from "@google/genai";
import { MedicalResponse, ReferenceResponse, Medication, AppMode, AppError, UserPersona, EncyclopediaResponse, ImageGenerationResponse, VideoGenerationResponse } from "../types";

// --- SYSTEME DE CACHE ---
const responseCache = new Map<string, any>();

// --- SCHEMAS ---
const singleMedicationSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    dci: { type: Type.STRING, description: "La molécule active" },
    type: { type: Type.STRING, description: "Classe pharma" },
    duration: { type: Type.STRING },
    brands: {
      type: Type.ARRAY,
      description: "3 spécialités commerciales au Maroc triées par prix croissant",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          price: { type: Type.STRING, description: "Prix avec devise (ex: 45.00 DH)" },
          priceSource: { type: Type.STRING, description: "Source du prix (ex: PPM Officine)" },
          lastVerified: { type: Type.STRING, description: "Date de vérification (ex: 01/2025)" }
        },
        required: ["name", "price", "priceSource", "lastVerified"]
      }
    },
    dosageAdult: { type: Type.STRING },
    dosageChild: { type: Type.STRING },
    contraindications: { type: Type.ARRAY, items: { type: Type.STRING } },
    sideEffects: { type: Type.ARRAY, items: { type: Type.STRING } },
    instructions: { type: Type.STRING },
  },
  required: ["dci", "type", "duration", "brands", "dosageAdult", "dosageChild", "contraindications", "sideEffects", "instructions"],
};

const prescriptionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    pathology: { type: Type.STRING },
    severity: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
    medications: {
      type: Type.ARRAY,
      items: singleMedicationSchema
    },
    analyses: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          reason: { type: Type.STRING },
        },
        required: ["name", "reason"],
      },
    },
    advice: { type: Type.ARRAY, items: { type: Type.STRING } },
    clinicalReasoning: { type: Type.STRING, description: "Explication clinique et raisonnement médical (surtout pour mode Étudiant)" },
  },
  required: ["pathology", "medications", "analyses", "advice", "severity"],
};

const referenceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ["reference"] },
    query: { type: Type.STRING },
    category: { type: Type.STRING, enum: ["Molecule", "Class"] },
    description: { type: Type.STRING },
    results: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          dci: { type: Type.STRING, description: "Dénomination Commune Internationale" },
          brandNames: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Liste des noms commerciaux au Maroc" 
          },
          forms: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
          },
          indications: { type: Type.STRING },
          priceRange: { type: Type.STRING }
        },
        required: ["dci", "brandNames", "forms", "indications"]
      }
    }
  },
  required: ["type", "query", "category", "description", "results"]
};

const encyclopediaSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ["encyclopedia"] },
    name: { type: Type.STRING },
    definition: { type: Type.STRING },
    symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
    diagnosis: {
      type: Type.OBJECT,
      properties: {
        criteria: { type: Type.ARRAY, items: { type: Type.STRING } },
        exams: { type: Type.ARRAY, items: { type: Type.STRING } }
      },
      required: ["criteria", "exams"]
    },
    management: { type: Type.STRING, description: "Prise en charge globale et recommandations" },
    medications: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Liste des molécules indiquées" },
    contraindications: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Contre-indications majeures" },
    duration: { type: Type.STRING, description: "Durée typique d'évolution" },
    emergencySigns: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Quand consulter en urgence" },
    referencesMaroc: { type: Type.STRING, description: "Références ou guidelines marocaines si existantes" },
    scientificLinks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          url: { type: Type.STRING }
        },
        required: ["title", "url"]
      }
    }
  },
  required: ["type", "name", "definition", "symptoms", "diagnosis", "management", "medications", "contraindications", "duration", "emergencySigns"]
};

// --- HELPER GESTION ERREURS ---
const handleGeminiError = (error: any): never => {
  console.error("Gemini API Error Detail:", error);

  // Tentative d'extraction du message d'erreur imbriqué (format Google)
  let detailedMessage = error.message || '';
  if (error.error && error.error.message) {
    detailedMessage = error.error.message;
  } else if (typeof error === 'string') {
    detailedMessage = error;
  }

  let appError: AppError = {
    code: 'UNKNOWN_ERROR',
    title: 'Erreur inattendue',
    message: detailedMessage || 'Une erreur technique est survenue.',
    hint: 'Veuillez réessayer.'
  };

  const msg = detailedMessage.toLowerCase();
  const status = error.status || error.error?.code;

  // 1. Permissions / Clé API (403)
  if (msg.includes('api key') || msg.includes('permission') || status === 403) {
    appError = {
      code: 'INVALID_API_KEY',
      title: 'Accès Refusé (Permission)',
      message: 'Votre clé API est valide mais n\'a pas la permission d\'accéder au modèle ou à l\'API Generative Language.',
      hint: 'Vérifiez la configuration de votre projet Google Cloud et activez l\'API.'
    };
  } 
  // 2. Requête Invalide (400)
  else if (status === 400 || msg.includes('invalid argument')) {
    appError = {
      code: 'UNKNOWN_ERROR',
      title: 'Requête Invalide',
      message: 'Le format de la requête a été rejeté par Google.',
      hint: 'Si vous avez envoyé une image/vidéo, le format n\'est peut-être pas supporté.'
    };
  }
  // 3. Quota & Limites
  else if (status === 429 || msg.includes('quota') || msg.includes('exhausted') || msg.includes('too many requests')) {
    appError = {
      code: 'QUOTA_EXCEEDED',
      title: 'Limite atteinte',
      message: 'Le quota de requêtes gratuites de Google Gemini est dépassé pour l\'instant.',
      hint: 'Réessayez dans quelques minutes ou changez de clé.'
    };
  } 
  // 4. Erreurs Réseau (Offline, DNS, Fetch fail)
  else if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
    appError = {
      code: 'NETWORK_ERROR',
      title: 'Erreur de Connexion',
      message: 'Impossible de joindre les serveurs Google. Vérifiez votre connexion internet.',
      hint: 'Vérifiez votre Wi-Fi / 4G.'
    };
  } 
  // 5. Erreurs Serveur (5xx)
  else if (status >= 500) {
    appError = {
      code: 'SERVER_ERROR',
      title: 'Erreur Serveur (Google)',
      message: 'Le service Google Gemini rencontre des problèmes temporaires.',
      hint: 'Réessayez plus tard.'
    };
  } 
  // 6. Erreurs de Parsing (JSON invalide)
  else if (error instanceof SyntaxError || msg.includes('json') || msg.includes('parse')) {
    appError = {
      code: 'PARSING_ERROR',
      title: 'Erreur de Format',
      message: 'L\'IA a généré une réponse mal structurée difficile à lire.',
      hint: 'Reformulez votre demande plus simplement.'
    };
  } 
  // 7. Sécurité (Safety Filters)
  else if (msg.includes('safety') || msg.includes('blocked') || msg.includes('harmful')) {
    appError = {
      code: 'UNKNOWN_ERROR',
      title: 'Contenu Bloqué',
      message: 'La demande a été bloquée par les filtres de sécurité de l\'IA (Contenu potentiellement sensible).',
      hint: 'Reformulez de manière plus formelle et médicale.'
    };
  }

  throw appError;
};

// --- FONCTIONS GENERATION ---

export const generateImage = async (prompt: string, aspectRatio: string = "1:1"): Promise<ImageGenerationResponse> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw { message: "API key missing", status: 403 };

    const ai = new GoogleGenAI({ apiKey });
    
    // Ajout d'instruction spécifique pour le style médical
    const medicalPrompt = `Medical Illustration, high quality, detailed anatomy, professional medical diagram style: ${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: medicalPrompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any, 
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64EncodeString: string = part.inlineData.data;
        const imageUrl = `data:image/png;base64,${base64EncodeString}`;
        return {
          type: 'image_generation',
          prompt,
          imageUrl
        };
      }
    }
    
    throw new Error("No image generated found in response");
  } catch (error: any) {
    handleGeminiError(error);
  }
};

export const generateVideo = async (prompt: string, imageBase64?: string, aspectRatio: string = '16:9'): Promise<VideoGenerationResponse> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw { message: "API key missing", status: 403 };

    const ai = new GoogleGenAI({ apiKey });
    
    let operation;
    const config = {
      numberOfVideos: 1,
      resolution: '1080p' as any,
      aspectRatio: aspectRatio as any
    };

    if (imageBase64) {
      const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
          imageBytes: cleanBase64,
          mimeType: 'image/png' // Assuming PNG/JPEG, API converts
        },
        config: config
      });
    } else {
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: config
      });
    }

    // Polling for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5s
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("No video URI returned");

    // Fetch the video content
    const videoResponse = await fetch(`${downloadLink}&key=${apiKey}`);
    if (!videoResponse.ok) throw new Error("Failed to download video content");
    
    const blob = await videoResponse.blob();
    const videoUrl = URL.createObjectURL(blob);

    return {
      type: 'video_generation',
      prompt,
      videoUrl
    };

  } catch (error: any) {
    handleGeminiError(error);
  }
};

export const generateSpeech = async (text: string, language: string = 'Français'): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw { message: "API key missing", status: 403 };

    const ai = new GoogleGenAI({ apiKey });
    const voiceName = 'Puck'; 

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");

    return `data:audio/mp3;base64,${base64Audio}`;
  } catch (error: any) {
    handleGeminiError(error);
  }
};


export const generateContent = async (
  input: string, 
  mode: AppMode, 
  persona: UserPersona = 'doctor',
  imageBase64?: string,
  videoBase64?: string,
  language: string = 'Français',
  aspectRatio: string = '1:1'
): Promise<MedicalResponse | ReferenceResponse | Medication | EncyclopediaResponse | ImageGenerationResponse | VideoGenerationResponse> => {
  
  if (mode === 'image_generation') {
    return generateImage(input, aspectRatio);
  }

  if (mode === 'video_generation') {
    return generateVideo(input, imageBase64, aspectRatio);
  }

  // 1. Récupération de la clé API
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw {
      code: 'API_KEY_MISSING',
      title: 'Clé API manquante',
      message: 'Une clé API est requise pour utiliser cette application.',
      hint: 'Veuillez configurer la variable d\'environnement API_KEY.'
    } as AppError;
  }

  const ai = new GoogleGenAI({ apiKey });

  // 2. Cache (skip if media is present)
  const cacheKey = `${mode}:${persona}:${language}:${input.trim().toLowerCase()}`;
  if (!imageBase64 && !videoBase64 && responseCache.has(cacheKey)) {
    console.log("Réponse récupérée du cache (instantané)");
    return responseCache.get(cacheKey)!;
  }

  try {
    let schema: Schema;
    // --- MODEL SELECTION STRATEGY ---
    
    // Default: Fast response
    let modelName = "gemini-2.5-flash-lite"; 
    let config: any = {
      responseMimeType: "application/json",
      temperature: 0.2,
    };

    // Specialist / Complex Mode: Use Thinking Model
    if (persona === 'specialist' || mode === 'encyclopedia') {
      modelName = "gemini-3-pro-preview";
      config.thinkingConfig = { thinkingBudget: 32768 }; // Max thinking
      // Note: responseMimeType is compatible with thinking? 
      // Documentation says Thinking Config is available for 2.5 series, but prompt asked for Gemini 3 Pro for Thinking.
      // Assuming 3 Pro Preview supports thinking or using the prompt's explicit instruction.
      // Correction from prompt: "Thinking Config is only available for the Gemini 2.5 series models."
      // BUT Prompt "Think more when needed" says: "You MUST use the gemini-3-pro-preview model and set thinkingBudget to 32768"
      // I will follow the explicit instruction in the feature card over the general guidelines if they conflict for this specific feature.
    } 
    // Visual analysis requires Pro models
    else if (imageBase64 || videoBase64) {
      modelName = "gemini-3-pro-preview";
    } 
    // Standard text tasks stay on Flash Lite for speed

    // Construction du Prompt Système
    const baseSystemPrompt = `
    Tu es OrdoMaroc AI, un assistant médical expert pour le Maroc.
    
    Tu t’adresses à un public composé de : médecins confirmés, internes, étudiants en médecine.
    Tu dois générer des réponses médicales claires, cohérentes, professionnelles, avec un niveau de sécurité flexible.
    
    🔥 1. RÔLE ET MISSION
    Produire des réponses structurées et lisibles adaptées au contexte clinique fourni.
    Le cas échéant, compléter les données manquantes de manière logique, plausible et sécurisée.
    Personnaliser la posologie selon : âge, poids, contexte, pathologie, niveau d’urgence (si infos disponibles).
    
    🔥 2. LANGUE OBLIGATOIRE
    Tu dois impérativement produire le contenu médical (conseils, posologie, raisonnement) en : ${language}.
    
    🔥 3. MODE ACTUEL : ${persona.toUpperCase()}
    
    Comportement selon le mode :
    - Mode "MÉDECIN / INTERNE" (doctor/generalist) : Direct, Prescription claire, Peu d’explications.
    - Mode "ÉTUDIANT" (student) : Explications supplémentaires dans le champ 'clinicalReasoning', Justification clinique courte, Notes pédagogiques.
    - Mode "URGENCE" (emergency) : Formulation concise, Priorité aux traitements immédiats, Ajout automatique de signes d’alerte.
    - Mode "PÉDIATRIE" (pediatric) : Posologies adaptées au poids/âge. Si données absentes → estimation plausible. Avertissement léger si zone sensible.
    - Mode "SPÉCIALISTE" (specialist) : Niveau plus avancé, Prescription adaptée à la spécialité.
    
    🔥 4. CONTEXTE ET FORMAT DE SORTIE (JSON)
    Tu dois IMPÉRATIVEMENT répondre au format JSON respectant le schéma fourni.
    Ne produis pas de texte Markdown en dehors du JSON.
    
    Si une IMAGE ou une VIDEO est fournie :
    - Analyse le média (symptôme clinique, boîte de médicament, mouvement, examen).
    - Identifie la pathologie, le médicament ou le signe clinique.
    - Adapte la réponse JSON (Ordonnance pour pathologie, Monographie pour médicament).

    🔥 5. SÉCURITÉ FLEXIBLE
    - Complète intelligemment les informations manquantes.
    - Propose des posologies standards si le contexte est incomplet.
    - Précise toujours (dans les remarques ou conseils) : « À adapter selon l’examen clinique réel. »
    
    🔥 6. DATA SOURCE
    - Utilise la base de médicaments du Maroc (DMP, PPM Officine).
    - Privilégie les noms commerciaux existants au Maroc.
    `;

    if (mode === 'pathology') {
      schema = prescriptionSchema;
    } else if (mode === 'add_medication') {
      schema = singleMedicationSchema;
    } else if (mode === 'encyclopedia') {
      schema = encyclopediaSchema;
    } else {
      schema = referenceSchema;
    }

    config.responseSchema = schema;
    config.systemInstruction = baseSystemPrompt;

    // Prepare content parts
    const parts: any[] = [];
    
    if (imageBase64) {
      // Clean base64 string if it contains metadata
      const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
      parts.push({
        inlineData: {
          mimeType: 'image/jpeg', // Assuming jpeg/png
          data: cleanBase64
        }
      });
      parts.push({
        text: `Analyse cette image. ${input ? `Contexte supplémentaire: ${input}. ` : ''} De quoi s'agit-il ?`
      });
    } else if (videoBase64) {
      const cleanBase64 = videoBase64.includes(',') ? videoBase64.split(',')[1] : videoBase64;
      parts.push({
        inlineData: {
          mimeType: 'video/mp4',
          data: cleanBase64
        }
      });
      parts.push({
        text: `Analyse cette vidéo. ${input ? `Contexte supplémentaire: ${input}. ` : ''} Identifie les signes cliniques, les mouvements ou les objets pertinents.`
      });
    } else {
      if (mode === 'encyclopedia') {
        parts.push({ 
          text: `Génère une fiche encyclopédique détaillée pour la pathologie suivante : "${input}". 
          Respecte le schéma JSON fourni (définition, symptômes, diagnostic, prise en charge, liens articles scientifiques pertinents...). 
          Inclus des références spécifiques au Maroc si applicable.` 
        });
      } else {
        parts.push({ text: input });
      }
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: config,
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("EMPTY_RESPONSE");

    const result = JSON.parse(jsonText);
    
    // Post-processing: Set default selectedDosage based on Persona
    if (mode === 'pathology' && result.medications) {
      result.medications.forEach((med: any) => {
        med.selectedDosage = persona === 'pediatric' ? 'child' : 'adult';
      });
    }

    // Only cache text-only requests
    if (!imageBase64 && !videoBase64) {
      responseCache.set(cacheKey, result);
    }

    return result;

  } catch (error: any) {
    handleGeminiError(error);
  }
};
