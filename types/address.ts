/**
 * Address-related type definitions
 */

/**
 * ViaCEP API response type
 * Used for fetching Brazilian postal code (CEP) address information
 */
export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

