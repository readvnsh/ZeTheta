# LendSwift — Architecture Documentation

> **Version:** 1.0 · **Last Updated:** June 2026  
> A deep-dive into the four core engineering systems powering the LendSwift multi-step loan application.

---

## Table of Contents

1. [Wizard State Machine](#1-wizard-state-machine)
2. [Dynamic Schema Factory](#2-dynamic-schema-factory)
3. [Web Crypto Auto-Save Pipeline](#3-web-crypto-auto-save-pipeline)
4. [Client-Side Image Compression Pipeline](#4-client-side-image-compression-pipeline)

---

## 1. Wizard State Machine

### Overview

The application is architected as an **8-step linear wizard** powered by a single Zustand global store (`src/store/formStore.ts`). Each step component is a fully independent, self-contained form that reads from and writes to this shared store. Navigation between steps is managed through the `step` integer field, which is the single source of truth for which component is rendered.

### Store Shape

```typescript
interface FormState {
  step: number;              // Active wizard step (1–8)
  step1Data: Step1FormData | null;
  step2Data: Step2FormData | null;
  // ... step3Data through step7Data
  isPanVerified: boolean;
  isAadhaarVerified: boolean;
  spouseFieldsRequired: boolean;
  isDraftLoaded: boolean;
}
```

### Step Routing — `setStep`

Forward navigation is protected by a **400ms cooldown guard** to prevent double-increments on rapid button clicks:

```typescript
setStep: (step) => {
  const current = get().step;
  if (current === step) return;                          // no-op on same step
  const now = Date.now();
  if (step > current && now - lastStepChange < 400) {   // debounce guard
    return;
  }
  lastStepChange = now;
  set({ step });
},
```

The `MainLayout` component renders the active step component based on this value:

```
step === 1  →  <Step1LoanDetails />
step === 2  →  <Step2PersonalInfo />
...
step === 6  →  conditionally rendered (see below)
step === 8  →  <Step8Review />
```

### Conditional Step 6 — Dynamic Co-Applicant Gate

Step 6 (Co-Applicant) does not always appear. Its visibility is computed at runtime by the `isStep6Required()` selector:

```typescript
isStep6Required: () => {
  const s1 = get().step1Data;
  if (!s1) return false;
  const { loanType, loanAmount } = s1;
  if (loanType === 'Home') return true;                         // Always required
  if (loanType === 'Personal' && amount > 500_000) return true; // > ₹5 Lakh
  if (loanType === 'Business' && amount > 2_000_000) return true; // > ₹20 Lakh
  return false;
},
```

When Step 5 is submitted, `MainLayout` checks `isStep6Required()` and either routes to Step 6 or skips directly to Step 7. If the user later returns to Step 1 and changes the loan type/amount in a way that invalidates the Step 6 requirement, the store automatically **purges Step 6 data**:

```typescript
// In setStep1Data:
if (!get().isStep6Required()) {
  set({ step6Data: null });
}
```

### Cross-Step Cascading State Invalidation

When the user modifies upstream data, the store automatically invalidates downstream state to prevent stale data from reaching the Step 8 review:

| Upstream Change | Downstream Invalidation |
|---|---|
| `loanType` changed | Step 5 cleared if `SALARIED + Business loan` |
| `loanType` changed | Step 3 PAN cleared if entity code no longer valid |
| `loanType` changed | Step 7 `businessReg` / `propertyDocs` conditionally nulled |
| `employmentType` changed | Step 7 `salarySlips` / `itr` / `businessReg` conditionally nulled |
| `maritalStatus` changed | Step 6 `relationship` auto-set to `"Spouse"` or reset |

---

## 2. Dynamic Schema Factory

### Overview

Form validation is handled by Zod schemas (`src/schemas/`). Rather than using fixed, static schemas, all schemas for Steps 2, 3, 5, 6, and 8 are generated at runtime by the **Schema Factory** (`src/utils/schemaFactory.ts`). This allows validation rules to adapt to the applicant's current data without any conditional logic inside form components.

### Core Dispatch — `generateSchema`

```typescript
export const generateSchema = (currentStep: number, formData: any): z.ZodType<any> => {
  const loanType    = formData.step1Data?.loanType     ?? 'Personal';
  const maritalStatus = formData.step2Data?.maritalStatus ?? 'Single';

  switch (currentStep) {
    case 2: return getStep2Schema(loanType);           // Adjusts income thresholds
    case 3: return getStep3Schema(loanType);           // Adjusts PAN entity code rules
    case 5: return generateStep5Schema(loanType);      // Blocks SALARIED on Business loan
    case 6: return generateStep6Schema(maritalStatus); // Locks relationship to "Spouse"
    case 8: return generateStep8Schema(formData);      // Validates age + tenure ≤ 65
    default: return step1Schema;                       // Static schema
  }
};
```

### Pattern: `superRefine` for Cross-Field Rules

Each generated schema uses Zod's `superRefine` to attach cross-field validation that cannot be expressed in a single field's schema:

#### Step 5 — Business Loan × SALARIED Guard
```typescript
export const generateStep5Schema = (loanType: string) => (
  step5Schema.superRefine((data, ctx) => {
    if (loanType === 'Business' && data.employmentType === 'SALARIED') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['employmentType'],
        message: 'Salaried employees are not eligible for Business Loans.',
      });
    }
  })
);
```

#### Step 6 — Marital Status × Relationship Lock
```typescript
export const generateStep6Schema = (maritalStatus: string) => (
  step6Schema.superRefine((data, ctx) => {
    if (maritalStatus === 'Married' && data.relationship !== 'Spouse') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['relationship'],
        message: 'Relationship must be Spouse for married applicants.',
      });
    }
  })
);
```

#### Step 8 — Age + Tenure ≤ 65 Years Rule
```typescript
export const generateStep8Schema = (formData: any) => (
  step8Schema.superRefine((data, ctx) => {
    const age = computeAge(formData.step2Data?.dob);
    const tenureYears = (formData.step1Data?.loanTenure ?? 0) / 12;
    if (age + tenureYears > 65) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['consent1'],
        message: 'Combined age and loan tenure cannot exceed 65 years.',
      });
    }
  })
);
```

### Integration with React Hook Form

Each step component calls `zodResolver(generateSchema(currentStep, storeState))` inside `useForm()`, ensuring that every form render uses the most up-to-date schema derived from the current store state:

```typescript
// Inside a step component:
const schema = generateSchema(step, { step1Data, step2Data, ... });
const { handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

---

## 3. Web Crypto Auto-Save Pipeline

### Overview

LendSwift implements client-side draft persistence using the **Web Crypto API** (AES-256-GCM) to encrypt form data before writing it to `localStorage`. This ensures that even if a user's device or browser storage is inspected, no PII is exposed in plaintext.

### Encryption Layer — `src/utils/encryption.ts`

The encryption uses a two-step process:

**1. Key Derivation (SHA-256 → AES-256-GCM)**
```typescript
const getCryptoKey = async (secret: string): Promise<CryptoKey> => {
  const rawSecret = new TextEncoder().encode(secret);
  const hash = await crypto.subtle.digest('SHA-256', rawSecret);   // 256-bit key material
  return crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
};
```

**2. Encryption (12-byte random IV, GCM authenticated)**
```typescript
export const encryptData = async (plainText: string, secret: string) => {
  const key = await getCryptoKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));   // Fresh IV per save
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);

  // Prepend IV to ciphertext and Base64-encode the combined array
  const combined = new Uint8Array([...iv, ...new Uint8Array(cipherBuffer)]);
  return btoa(String.fromCharCode(...combined));
};
```

Each save operation generates a **fresh 12-byte random IV**, making each encrypted blob unique — even for identical payloads. The IV is prepended to the ciphertext so that `decryptData` can slice it out without any additional storage.

### Auto-Save Triggers — `src/hooks/useAutoSave.ts`

The `useAutoSave` hook registers two save triggers:

| Trigger | Description |
|---|---|
| **Interval (30s)** | `setInterval(saveDraft, 30000)` — periodic background save |
| **Field blur** | Saves immediately on `INPUT` or `SELECT` blur — captures every field exit |

```typescript
useEffect(() => {
  const interval = setInterval(saveDraft, 30000);

  const handleBlur = (e: FocusEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || 'SELECT') {
      saveDraft();
    }
  };
  window.addEventListener('blur', handleBlur, true);

  return () => {
    clearInterval(interval);
    window.removeEventListener('blur', handleBlur, true);
  };
}, []);
```

### Draft Envelope Format

Each encrypted save is wrapped in a metadata envelope before being written to `localStorage`:

```json
{
  "version": "1.0",
  "timestamp": "2026-06-15T10:30:00.000Z",
  "step": 4,
  "loanType": "Home",
  "payload": "<AES-256-GCM base64 ciphertext>"
}
```

Drafts are keyed by loan type: `lendswift_draft_Personal`, `lendswift_draft_Home`, `lendswift_draft_Business`.

### 72-Hour TTL Hydration Lifecycle — `src/hooks/useFormPersistence.ts`

On page load, `useFormPersistence` checks all three draft keys for a valid, non-expired draft:

```typescript
const diff = Date.now() - new Date(wrapper.timestamp).getTime();
const TTL = 72 * 60 * 60 * 1000; // 72 hours in milliseconds

if (diff < TTL) {
  // Offer resume modal to user
  setShowModal(true);
} else {
  // Stale draft — purge silently
  localStorage.removeItem(key);
}
```

If the user chooses to resume, the payload is decrypted and each step's data is **individually re-validated** against the current Zod schema before being hydrated into the Zustand store. This prevents stale or schema-mismatched data from corrupting the current session:

```typescript
const check = step1Schema.safeParse(parsed.step1Data);
if (!check.success) throw new Error('Step 1 validation failed');
storeState.setStep1Data(parsed.step1Data); // Only set if valid
```

If any step fails re-validation (e.g., schema changed between sessions), the entire draft is discarded and the user starts fresh — preventing silent data corruption.

---

## 4. Client-Side Image Compression Pipeline

### Overview

All image uploads (Passport Photo, Aadhaar scans) pass through an HTML5 Canvas-based recursive compression pipeline before being stored in the form state. This prevents oversized files from being submitted and provides an in-browser "Compressed: X MB (was Y MB)" feedback indicator.

### Algorithm — `src/utils/imageCompression.ts`

The pipeline executes in four stages:

**Stage 1: Type Guard**
```typescript
if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
  return file; // PDFs pass through untouched
}
```

**Stage 2: Proportional Rescaling (max 1200px)**
```typescript
const maxDim = 1200;
if (width > maxDim || height > maxDim) {
  if (width > height) {
    height = Math.round((height * maxDim) / width);
    width = maxDim;
  } else {
    width = Math.round((width * maxDim) / height);
    height = maxDim;
  }
}
```
This preserves the aspect ratio while capping the longest edge at 1200px.

**Stage 3: Canvas Render**
```typescript
const canvas = document.createElement('canvas');
canvas.width = width; canvas.height = height;
ctx.drawImage(img, 0, 0, width, height);
```

**Stage 4: Recursive Quality Reduction**
```typescript
const tryCompress = (quality: number) => {
  canvas.toBlob((blob) => {
    if (blob.size > maxSize && quality > 0.35) {
      tryCompress(quality - 0.1);     // Reduce quality by 10% and retry
    } else {
      resolve(new File([blob], file.name, { type: 'image/jpeg' }));
    }
  }, 'image/jpeg', quality);
};

tryCompress(0.7); // Start at 70% quality
```

| Iteration | Quality | Trigger |
|-----------|---------|---------|
| 1 | 0.70 | Initial attempt |
| 2 | 0.60 | Still > maxSize |
| 3 | 0.50 | Still > maxSize |
| 4 | 0.40 | Still > maxSize |
| 5 | 0.35 | Final floor — always resolves |

The recursion terminates when either (a) the compressed blob fits within `maxSize` or (b) quality reaches the floor of `0.35`. This prevents an infinite recursion while still trying up to 4 quality reductions.

### Integration with `FileUpload`

The `FileUpload` component invokes the pipeline on `onDrop` for image files only, shows a loading state, and passes the resulting compressed `File` object to React Hook Form:

```typescript
const onDrop = async (acceptedFiles, fileRejections) => {
  if (file.type === 'image/jpeg' || file.type === 'image/png') {
    setIsCompressing(true);
    const compressed = await compressImage(file, maxSizeInBytes);
    onFileSelect(compressed); // ← Compressed File passed to RHF Controller
    setIsCompressing(false);
  } else {
    onFileSelect(file); // ← PDFs passed through directly
  }
};
```

The component also tracks `originalSize` alongside `value.size` to render the "Compressed: 1.2 MB (was 4.7 MB)" feedback label.

---

## Component Tree

```
App.tsx
└── MainLayout.tsx          (Zustand consumer, wizard chrome, footer nav)
    ├── Step1LoanDetails    (Loan type, amount, tenure, purpose)
    ├── Step2PersonalInfo   (Name, DOB, gender, contact)
    ├── Step3KYC            (PAN + Aadhaar OTP verification)
    ├── Step4Address        (Current + permanent address, PIN lookup)
    ├── Step5Employment     (Employment type sub-forms: Salaried/Self/Business)
    ├── Step6CoApplicant    (Conditional — Home / high-value loans)
    ├── Step7Documents      (File uploads + signature pad)
    └── Step8Review         (Read-only summary, consent checkboxes, submit)
```

## Data Flow Diagram

```
User Input → React Hook Form → zodResolver(generateSchema(step, storeState))
                                        ↓ (on valid submit)
                               useFormStore.setStepNData(data)
                                        ↓
                               useAutoSave → encryptData → localStorage
                                        ↓
                               MainLayout.setStep(step + 1)
```
