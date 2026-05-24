import { assertSafeString } from './inputGuards';

export interface VehicleQueryParams {
  marca: string;
  modelo: string;
  versao: string;
}

const BRAND_REGEX = /^[A-Za-zÀ-ÿ0-9\s-]{1,50}$/;
const MODEL_REGEX = /^[A-Za-zÀ-ÿ0-9\s-]{1,80}$/;
const VERSION_REGEX = /^\d{4}$/;

export function normalizeVehicleParams(
  params: Partial<VehicleQueryParams>
): { valid: boolean; data?: VehicleQueryParams; error?: string } {
  const marca = params.marca?.trim();
  const modelo = params.modelo?.trim();
  const versao = params.versao?.trim();

  if (!marca || !modelo || !versao) {
    return { valid: false, error: 'marca, modelo e versão são obrigatórios' };
  }

  for (const value of [marca, modelo, versao]) {
    const check = assertSafeString(value, 80);
    if (!check.safe) return { valid: false, error: check.reason };
  }

  if (!BRAND_REGEX.test(marca)) {
    return { valid: false, error: 'Formato de marca inválido' };
  }
  if (!MODEL_REGEX.test(modelo)) {
    return { valid: false, error: 'Formato de modelo inválido' };
  }
  if (!VERSION_REGEX.test(versao)) {
    return { valid: false, error: 'Versão deve ser um ano com 4 dígitos' };
  }

  return {
    valid: true,
    data: {
      marca: marca.replace(/\s+/g, ' '),
      modelo: modelo.replace(/\s+/g, ' '),
      versao,
    },
  };
}

export function buildVehicleQueryString(params: VehicleQueryParams): string {
  const q = new URLSearchParams({
    marca: params.marca,
    modelo: params.modelo,
    versao: params.versao,
  });
  return q.toString();
}
