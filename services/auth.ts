/**
 * Authentication service
 * Separates business logic from UI components following SOLID principles
 */

import { auth, db } from '@/lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  updateProfile,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  type ActionCodeSettings,
  type User,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { logger } from '@/utils';
import { 
  emailSchema, 
  passwordSchema, 
  cpfSchema, 
  phoneSchema,
  userNameSchema,
  validate,
  safeValidate,
} from '@/utils/validation';
import { formatAddress } from '@/utils/address';
import { z } from 'zod';
import { cepSchema } from '@/utils/validation';

/**
 * Registration input schema
 */
export const registrationSchema = z.object({
  name: userNameSchema,
  email: emailSchema,
  password: passwordSchema,
  cpf: cpfSchema.optional(),
  phone: phoneSchema.optional(),
  address: z.object({
    cep: cepSchema.optional(),
    street: z.string().min(1, 'Logradouro é obrigatório').optional(),
    number: z.string().min(1, 'Número é obrigatório').optional(),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, 'Bairro é obrigatório').optional(),
    city: z.string().min(1, 'Cidade é obrigatória').optional(),
    state: z.string().length(2, 'UF deve ter 2 caracteres').optional(),
  }).optional(),
}).refine(
  (data) => {
    // If address is partially filled, all required fields must be present
    if (data.address) {
      const { street, number, neighborhood, city, state } = data.address;
      const hasSomeFields = !!(street || number || neighborhood || city || state);
      const hasAllRequired = !!(street && number && neighborhood && city && state);
      return !hasSomeFields || hasAllRequired;
    }
    return true;
  },
  {
    message: 'Se informar endereço, preencha todos os campos obrigatórios',
    path: ['address'],
  }
);

export type RegistrationInput = z.infer<typeof registrationSchema>;

/**
 * Registration result
 */
export type RegistrationResult =
  | {
      success: true;
      uid: string;
      email: string;
      hasPhone?: boolean;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

/**
 * Register a new user
 */
export async function registerUser(input: RegistrationInput, options?: { strictCPF?: boolean }): Promise<RegistrationResult> {
  try {
    // Validate input
    const validation = safeValidate(registrationSchema, input);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.errors.errors.forEach((err) => {
        const path = err.path.join('.');
        if (path) {
          fieldErrors[path] = err.message;
        }
      });
      return {
        success: false,
        error: 'Dados inválidos. Verifique os campos.',
        fieldErrors,
      };
    }

    const validated = validation.data;

    // Validate CPF if required and provided
    if (options?.strictCPF && validated.cpf) {
      const cpfResult = safeValidate(cpfSchema, validated.cpf);
      if (!cpfResult.success) {
        return {
          success: false,
          error: cpfResult.errors.errors[0]?.message ?? 'CPF inválido',
          fieldErrors: { cpf: cpfResult.errors.errors[0]?.message ?? 'CPF inválido' },
        };
      }
    }

    // Validate and format phone
    let phoneClean: string | null = null;
    if (validated.phone) {
      const phoneResult = safeValidate(phoneSchema, validated.phone);
      if (!phoneResult.success) {
        return {
          success: false,
          error: phoneResult.errors.errors[0]?.message ?? 'Telefone inválido',
          fieldErrors: { phone: phoneResult.errors.errors[0]?.message ?? 'Telefone inválido' },
        };
      }
      phoneClean = phoneResult.data;
    }

    // Format address if provided
    let formattedAddress: string | null = null;
    if (validated.address) {
      const addr = validated.address;
      formattedAddress = formatAddress({
        street: addr.street || '',
        number: addr.number || '',
        complement: addr.complement,
        neighborhood: addr.neighborhood || '',
        city: addr.city || '',
        state: addr.state?.toUpperCase() || '',
        cep: addr.cep,
      });
    }

    logger.debug('Creating user in Auth');
    const cred = await createUserWithEmailAndPassword(auth, validated.email, validated.password);

    // Update display name
    try {
      await updateProfile(cred.user, { displayName: validated.name });
    } catch (err) {
      logger.warn('Failed to update profile', { error: err });
    }

    // Send email verification
    logger.debug('Sending email verification');
    try {
      await sendEmailVerification(cred.user);
    } catch (err) {
      logger.warn('Failed to send email verification', { error: err });
    }

    // Create Firestore profile
    logger.debug('Writing Firestore profile');
    const cpfNum = validated.cpf ? validated.cpf.replace(/\D/g, '') : null;
    
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      name: validated.name,
      cpf: options?.strictCPF && cpfNum ? cpfNum : (cpfNum || null),
      phone: phoneClean,
      address: formattedAddress,
      email: validated.email,
      photoURL: cred.user.photoURL ?? null,
      role: 'free',
      emailVerified: cred.user.emailVerified ?? false,
      phoneVerified: false,
      ratingAvg: 5,
      ratingCount: 0,
      strikes: 0,
      blockedAt: null,
      publicItemsCount: 0,
      dailyLoanCount: 0,
      dailyLoanDate: null,
      points: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      onboardingSeenAt: null,
      termsAcceptedAt: null,
    }, { merge: true });

    logger.info('Registration completed successfully', { uid: cred.user.uid });
    
    return {
      success: true,
      uid: cred.user.uid,
      email: cred.user.email!,
      hasPhone: !!phoneClean,
    };
  } catch (error: unknown) {
    logger.error('Registration failed', error);
    
    const err = error as { code?: string; message?: string };
    const code = err?.code ?? '';
    
    let errorMessage = 'Não foi possível criar a conta. Tente novamente.';
    if (code === 'auth/email-already-in-use') {
      errorMessage = 'E-mail já está em uso.';
    } else if (code === 'auth/invalid-email') {
      errorMessage = 'E-mail inválido.';
    } else if (code === 'auth/weak-password') {
      errorMessage = 'Senha muito fraca (mín. 6 caracteres).';
    } else if (code === 'auth/network-request-failed') {
      errorMessage = 'Falha de rede. Verifique sua conexão.';
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Login input schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Senha é obrigatória'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Login result
 */
export type LoginResult =
  | {
      success: true;
      user: User;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

/**
 * Sign in user
 */
export async function loginUser(input: LoginInput): Promise<LoginResult> {
  try {
    // Validate input
    const validation = safeValidate(loginSchema, input);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.errors.errors.forEach((err) => {
        const path = err.path.join('.');
        if (path) {
          fieldErrors[path] = err.message;
        }
      });
      return {
        success: false,
        error: 'Dados inválidos. Verifique os campos.',
        fieldErrors,
      };
    }

    const validated = validation.data;

    const userCredential = await signInWithEmailAndPassword(
      auth, 
      validated.email, 
      validated.password
    );

    return {
      success: true,
      user: userCredential.user,
    };
  } catch (error: unknown) {
    logger.error('Login failed', error);
    
    const err = error as { code?: string; message?: string };
    const code = err?.code ?? '';
    
    let errorMessage = 'Não foi possível entrar. Verifique suas credenciais.';
    if (code === 'auth/invalid-email') {
      errorMessage = 'E-mail inválido.';
    } else if (code === 'auth/user-disabled') {
      errorMessage = 'Usuário desativado.';
    } else if (code === 'auth/user-not-found') {
      errorMessage = 'Usuário não encontrado.';
    } else if (code === 'auth/wrong-password') {
      errorMessage = 'Senha incorreta.';
    } else if (code === 'auth/network-request-failed') {
      errorMessage = 'Falha de rede. Verifique sua conexão.';
    } else if (code === 'auth/too-many-requests') {
      errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
    }
    
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Reset password input schema
 */
export const resetPasswordSchema = z.object({
  email: emailSchema,
  actionCodeSettings: z.custom<ActionCodeSettings>().optional(),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/**
 * Reset password result
 */
export type ResetPasswordResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
      fieldErrors?: Record<string, string>;
    };

/**
 * Send password reset email
 */
export async function resetPassword(input: ResetPasswordInput): Promise<ResetPasswordResult> {
  try {
    // Validate input
    const validation = safeValidate(resetPasswordSchema, input);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.errors.errors.forEach((err) => {
        const path = err.path.join('.');
        if (path) {
          fieldErrors[path] = err.message;
        }
      });
      return {
        success: false,
        error: 'E-mail inválido.',
        fieldErrors,
      };
    }

    const validated = validation.data;

    try {
      await sendPasswordResetEmail(auth, validated.email, validated.actionCodeSettings);
      return { success: true };
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      const code = err?.code ?? '';
      
      // Try fallback without actionCodeSettings if there's a URI error
      if (
        code === 'auth/unauthorized-continue-uri' ||
        code === 'auth/invalid-continue-uri' ||
        code === 'auth/missing-continue-uri'
      ) {
        try {
          await sendPasswordResetEmail(auth, validated.email);
          return { success: true };
        } catch (fallbackError: unknown) {
          const fallbackErr = fallbackError as { message?: string };
          return {
            success: false,
            error: fallbackErr?.message ?? 'Não foi possível enviar o e-mail. Tente novamente.',
          };
        }
      }
      
      let errorMessage = 'Não foi possível enviar o e-mail. Tente novamente.';
      if (code === 'auth/invalid-email') {
        errorMessage = 'E-mail inválido.';
      } else if (code === 'auth/network-request-failed') {
        errorMessage = 'Falha de rede. Verifique sua conexão.';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  } catch (error: unknown) {
    logger.error('Password reset failed', error);
    return {
      success: false,
      error: 'Não foi possível enviar o e-mail. Tente novamente.',
    };
  }
}

