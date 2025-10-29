/**
 * Address parsing and formatting utilities
 */

/**
 * Parse a formatted address string into structured components
 * Format: "Street, Number, Complement?, Neighborhood, City-State CEP?"
 */
export function parseAddress(addressString: string | null | undefined): {
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
} {
  if (!addressString) {
    return {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      cep: '',
    };
  }

  // Try to parse structured address format
  // Format: "Street, Number, Complement?, Neighborhood, City-State CEP?"
  const parts = addressString.split(',').map(p => p.trim());
  
  if (parts.length >= 4) {
    // Assume format: Street, Number, Neighborhood, City-State
    const street = parts[0] || '';
    const number = parts[1] || '';
    
    // Check if there's a complement (usually 3rd part if length > 4)
    let complement = '';
    let neighborhood = '';
    let cityState = '';
    
    if (parts.length === 4) {
      // No complement: Street, Number, Neighborhood, City-State
      neighborhood = parts[2] || '';
      cityState = parts[3] || '';
    } else if (parts.length === 5) {
      // Has complement: Street, Number, Complement, Neighborhood, City-State
      complement = parts[2] || '';
      neighborhood = parts[3] || '';
      cityState = parts[4] || '';
    }
    
    // Parse City-State CEP
    const cityStateMatch = cityState.match(/^(.+?)-([A-Z]{2})(?:\s+(\d{5}-?\d{3}))?$/);
    const city = cityStateMatch?.[1]?.trim() || '';
    const state = cityStateMatch?.[2]?.trim() || '';
    const cep = cityStateMatch?.[3]?.replace(/\D/g, '') || '';
    
    return {
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      cep,
    };
  }

  // If parsing fails, return empty with original string as street
  return {
    street: addressString,
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    cep: '',
  };
}

/**
 * Format structured address components into a single string
 */
export function formatAddress(data: {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  cep?: string;
}): string {
  const parts: string[] = [];
  
  if (data.street) parts.push(data.street);
  if (data.number) {
    parts.push(data.number);
    if (data.complement) parts.push(data.complement);
  }
  if (data.neighborhood) parts.push(data.neighborhood);
  
  let cityState = data.city || '';
  if (data.state) {
    cityState = cityState ? `${cityState}-${data.state.toUpperCase()}` : data.state.toUpperCase();
  }
  if (cityState) {
    if (data.cep) {
      const cepFormatted = data.cep.replace(/(\d{5})(\d{3})/, '$1-$2');
      parts.push(`${cityState} ${cepFormatted}`);
    } else {
      parts.push(cityState);
    }
  }
  
  return parts.join(', ');
}

