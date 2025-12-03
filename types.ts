
export interface BrandRecommendation {
  name: string;
  price: string;
  priceSource?: string; // ex: "PPM Officine", "Base Médicament"
  lastVerified?: string; // ex: "Jan 2025"
}

export interface Medication {
  dci: string; // Dénomination Commune Internationale (ex: Amoxicilline)
  type: string; // e.g., Antibiotique
  duration: string;
  brands: BrandRecommendation[]; // 3 recommandations commerciales
  selectedBrandIndex?: number; // Index de la marque choisie par l'utilisateur (0, 1, 2) ou undefined (DCI)
  dosageAdult: string;
  dosageChild: string;
  selectedDosage?: 'adult' | 'child'; // Choix de la posologie active
  contraindications: string[];
  sideEffects: string[];
  instructions: string; // Instructions générales
}

export interface Analysis {
  name: string;
  reason: string;
}

export interface MedicalResponse {
  pathology: string;
  medications: Medication[];
  analyses: Analysis[];
  advice: string[];
  severity: 'Low' | 'Medium' | 'High';
  // Added for Student Mode
  clinicalReasoning?: string; 
}

// History Type
export interface SavedPrescription {
  id: string;
  timestamp: number;
  dateStr: string;
  patientName: string;
  data: MedicalResponse;
}

// Doctor Profile Type
export interface DoctorProfile {
  name: string;
  specialty: string;
  address: string; // City + Country or Full Address
  phone?: string;
  email?: string;
}

// Nouveaux types pour la recherche Molécule / Classe
export interface DrugReference {
  dci: string;
  brandNames: string[]; // Liste des noms commerciaux au Maroc
  forms: string[]; // Comprimé, Sirop, Injectable...
  priceRange?: string; // Information optionnelle sur le prix
  indications: string;
}

export interface ReferenceResponse {
  type: 'reference';
  query: string;
  category: 'Molecule' | 'Class';
  description: string; // Brève description de la molécule ou classe
  results: DrugReference[];
}

// Nouveau type pour l'Encyclopédie des Pathologies
export interface EncyclopediaResponse {
  type: 'encyclopedia';
  name: string;
  definition: string;
  symptoms: string[];
  diagnosis: {
    criteria: string[];
    exams: string[];
  };
  management: string; // Prise en charge
  medications: string[];
  contraindications: string[]; // Majeures
  duration: string; // Évolution typique
  emergencySigns: string[];
  referencesMaroc?: string;
  scientificLinks: { title: string; url: string }[];
}

export interface ImageGenerationResponse {
  type: 'image_generation';
  prompt: string;
  imageUrl: string;
}

export interface VideoGenerationResponse {
  type: 'video_generation';
  prompt: string;
  videoUrl: string;
}

export type AppMode = 'pathology' | 'molecule' | 'class' | 'add_medication' | 'encyclopedia' | 'image_generation' | 'video_generation';

export type UserPersona = 'doctor' | 'student' | 'emergency' | 'pediatric' | 'generalist' | 'specialist';

// Error Handling Types
export type ErrorCode = 'API_KEY_MISSING' | 'INVALID_API_KEY' | 'QUOTA_EXCEEDED' | 'NETWORK_ERROR' | 'PARSING_ERROR' | 'SERVER_ERROR' | 'UNKNOWN_ERROR';

export interface AppError {
  code: ErrorCode;
  title: string;
  message: string;
  hint?: string;
}
