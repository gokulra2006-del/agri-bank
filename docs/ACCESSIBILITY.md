# AgriSahay Multilingual Accessibility & Rural Interface Guidelines

---

## 1. Principles of Rural Inclusive Design
Digital banking platforms built for smallholder farmers must accommodate varying literacy levels, low-end Android mobile hardware, and diverse regional dialects. AgriSahay implements a comprehensive accessibility suite adhering to WCAG 2.1 AA standards adapted for Indian agrarian contexts.

---

## 2. Indic Typography & Complex Script Rendering
Indic scripts (Devanagari, Kannada, Tamil, Telugu, Bengali, Malayalam, Gujarati, Gurmukhi) feature complex conjunct characters (aksharas) and vertical vowel signs (matras).

### Typography Rules
1. **Vertical Headroom:** All text containers enforce a minimum line height of `1.6` to prevent top or bottom matra clipping.
2. **Text Scaling:** Supports 3 user-selectable font scales:
   - Normal ($100\%$ / $14\text{px}$ base)
   - Large ($112\%$ / $16\text{px}$ base)
   - Extra Large ($125\%$ / $18\text{px}$ base)
3. **No Character Truncation:** Buttons and labels avoid CSS `overflow: hidden` on text spans to prevent chopping off Indic conjuncts.
4. **360px Mobile Viewport Validation:** All layouts are tested on a $360\text{px}$ viewport width corresponding to budget Android handsets common in rural field operations.

---

## 3. Web Speech API (speechSynthesis) Integration

### 3.1 Architecture
The audio read-aloud functionality is built entirely using the native browser Web Speech API (`window.speechSynthesis`). It requires **zero external cloud speech APIs, zero API keys, and zero network transmission of voice data**.

### 3.2 BCP-47 Language Tag Mapping
| Interface Locale | Language Name | BCP-47 Speech Tag |
| :--- | :--- | :--- |
| `en` | English | `en-IN` |
| `hi` | हिन्दी (Hindi) | `hi-IN` |
| `kn` | ಕನ್ನಡ (Kannada) | `kn-IN` |
| `ta` | தமிழ் (Tamil) | `ta-IN` |
| `te` | తెలుగు (Telugu) | `te-IN` |
| `mr` | मराठी (Marathi) | `mr-IN` |
| `bn` | বাংলা (Bengali) | `bn-IN` |
| `ml` | മലയാളം (Malayalam) | `ml-IN` |
| `gu` | ગુજરાતી (Gujarati) | `gu-IN` |
| `pa` | ਪੰਜਾਬੀ (Punjabi) | `pa-IN` |

### 3.3 Speech Modulation
- **Rate:** Scaled to $0.95\times$ normal cadence for enhanced rural clarity.
- **Graceful Fallback:** When a specific Indian language voice is absent in the user's host OS, the engine gracefully alerts the user with visual text explanations without breaking the interface.

---

## 4. Rural Banking Simplified Analogies

Complex financial jargon often creates anxiety among rural borrowers. AgriSahay incorporates one-click "Explain this term" audio-visual tooltips using relatable agrarian analogies:

| Financial Concept | Formal Banking Term | Relatable Rural Analogy |
| :--- | :--- | :--- |
| **Principal** | Principal Amount | *“The original seed capital borrowed for the crop season, before interest or charges.”* |
| **Interest** | Interest Charge | *“The small seasonal rental fee for using bank funds, e.g. ₹7 per year for every ₹100.”* |
| **Moratorium** | Moratorium / Grace Period | *“A breathing space where the bank pauses payment collection until harvest Mandi realization.”* |
| **Hypothecation** | Crop Hypothecation | *“Pledging the seasonal crop harvest rather than putting your ancestral land at risk.”* |
| **PMFBY Claim** | Insurance Intimation | *“Submitting damage notification within 72 hours of flood/drought so surveyors inspect and issue relief.”* |
| **Consent** | Digital Consent (DPDP) | *“Your written permission for the bank to check your land records, ensuring your privacy is respected.”* |

---

## 5. Low-Bandwidth & High-Contrast Mode
1. **Low-Bandwidth Mode:** Suppresses heavy card borders and decorative illustrations, caching static dictionaries locally in memory.
2. **High-Contrast Theme:** Provides a high-contrast dark background (`#0f172a`) with high-luminance text for outdoor sunlight readability on the field.
