import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, FileText, AlertTriangle } from 'lucide-react';

export type LegalDocumentType = 'privacy' | 'terms' | 'disclaimer' | null;

interface LegalModalProps {
  type: LegalDocumentType;
  onClose: () => void;
  lang: 'fr' | 'en';
}

const content = {
  fr: {
    privacy: {
      title: "Politique de Confidentialité",
      icon: Shield,
      paragraphs: [
        "Chez AsphaltVision, la protection de vos données personnelles est notre priorité absolue. Cette politique décrit la manière dont nous recueillons, utilisons et protégeons vos données.",
        "Images téléversées : Toutes les images que vous téléversez pour effectuer des simulations sont traitées de manière temporaire via l'API sécurisée de Google Gemini. Nous ne conservons ni ne revendons aucune de vos images sur nos serveurs.",
        "Fichiers temporaires : Les calculs et traitements s'effectuent en mémoire tampon pour générer la simulation d'asphalte et vous afficher le résultat sous forme de comparaison. Une fois la session close, ces données temporaires sont supprimées.",
        "Statistiques anonymes : Nous pouvons utiliser des outils de statistiques de navigation pour analyser l'expérience utilisateur globale, sans jamais recueillir d'informations nominatives ou personnelles sans votre accord préalable."
      ]
    },
    terms: {
      title: "Conditions d'Utilisation",
      icon: FileText,
      paragraphs: [
        "En accédant et en utilisant AsphaltVision, vous acceptez pleinement les présentes conditions d'utilisation.",
        "Utilisation autorisée : AsphaltVision est mis à disposition pour un usage de visualisation préalable à des travaux d'asphalte. Vous êtes seul responsable du contenu que vous téléversez.",
        "Propriété des reproductions : Les simulations générées par l'IA sont fournies à titre indicatif et restent la propriété intellectuelle de l'utilisateur pour son propre usage personnel ou promotionnel légitime.",
        "Limites d'utilisation : Les essais gratuits sont limités par appareil. Toute tentative de contournement des quotas de sécurité ou de piratage des API entraînera la suspension immédiate du droit d'accès au service."
      ]
    },
    disclaimer: {
      title: "Clause d'Exclusion de Garantie et de Résultats",
      icon: AlertTriangle,
      paragraphs: [
        "Cette application utilise une intelligence artificielle générative de pointe (Google Gemini) pour simuler l'application d'un scellant d'asphalte sur une entrée de garage.",
        "Avertissement de rendu non-contractuel : Le rendu visuel proposé par AsphaltVision est une simulation purement indicative générée par ordinateur. Il ne constitue en aucun cas une promesse ou un engagement de résultat artistique ou technique réel.",
        "Différences de la réalité : Les projets de réfection d'asphalte réels dépendent d'une multitude de facteurs (qualité du bitume préexistant, état des fissures, température extérieure, et type de produit de scellement utilisé par l'entrepreneur) que l'IA ne peut ni prédire ni reproduire parfaitement.",
        "Responsabilité limitée : Quantumapp et AsphaltVision ne sauraient être tenus pour responsables de tout écart entre la simulation visuelle en ligne et le travail de scellement effectivement réalisé par un tiers sur votre entrée de garage."
      ]
    }
  },
  en: {
    privacy: {
      title: "Privacy Policy",
      icon: Shield,
      paragraphs: [
        "At AsphaltVision, protecting your personal data is our top priority. This policy outlines how we collect, use, and safe-keep your data.",
        "Uploaded Images: All images uploaded for simulations are processed temporarily using the secure Google Gemini API. We do not store or sell your images on our servers.",
        "Temporary Files: Processing takes place in a buffered memory to serve the comparison slider. Once your session ends, these temporary visual files are deleted.",
        "Anonymous Metrics: We may use standard analytics tools to analyze global user patterns, without ever collection personally identifiable information without your consent."
      ]
    },
    terms: {
      title: "Terms of Use",
      icon: FileText,
      paragraphs: [
        "By accessing and using AsphaltVision, you fully accept and agree to follow these Terms of Use.",
        "Permitted Use: AsphaltVision is provided to help you pre-visualize asphalt projects. You carry full responsibility for any content or photos you upload.",
        "Artwork & Rights: AI simulations are provided as indicative drafts and may be used by the user for personal reference or standard commercial promotion.",
        "Access Quirks: Free trials are limited per user. Any attempt to bypass free tier quotas or crack API endpoints will result in immediate suspension of access."
      ]
    },
    disclaimer: {
      title: "Disclaimer of Warranty and Results",
      icon: AlertTriangle,
      paragraphs: [
        "This application leverages advanced generative Artificial Intelligence (Google Gemini) to simulate asphalt driveway sealant adjustments.",
        "Non-Binding Render Notice: Every visualization provided from AsphaltVision is an indicative, machine-assisted simulation. It does not constitute a legal or technical contract guaranteeing identical results.",
        "Physical Adjustments: Real-world driveway sealing depends on several physical factors (underlying asphalt condition, crack depth, moisture, and chemical compound properties) which cannot be perfectly predicted by a neural model.",
        "Limitation of Liability: Quantumapp and AsphaltVision shall not be held liable for any discrepancy between the on-screen digital simulation and services completed by physical contractors on-site."
      ]
    }
  }
};

export function LegalModal({ type, onClose, lang }: LegalModalProps) {
  if (!type) return null;

  const doc = content[lang][type];
  const Icon = doc.icon;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal content box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative max-w-2xl w-full bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl z-10 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/5 bg-zinc-950/50">
            <div className="flex items-center space-x-3 text-emerald-400">
              <Icon className="w-6 h-6 shrink-0" />
              <h2 className="text-xl font-bold font-display text-white">{doc.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 md:p-8 overflow-y-auto space-y-4 text-zinc-300 text-sm leading-relaxed max-h-[60vh]">
            {doc.paragraphs.map((p, index) => (
              <p key={index} className="border-l-2 border-emerald-500/30 pl-4 py-1 hover:border-emerald-400/60 transition-colors">
                {p}
              </p>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/5 bg-zinc-950/30 flex justify-end">
            <button
              onClick={onClose}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-all active:scale-95"
            >
              {lang === 'fr' ? 'Fermer' : 'Close'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
