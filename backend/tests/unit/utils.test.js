import { describe, expect, it } from 'vitest';
import { normalizeKey, slugify } from '../../src/utils/normalize.js';
import { decrypt, encrypt } from '../../src/utils/crypto.js';
import { passwordProblems } from '../../src/utils/passwordPolicy.js';
import { buildMessage } from '../../src/services/notificationService.js';

describe('normalización', () => {
  it('ignora mayúsculas, acentos y espacios repetidos', () => {
    expect(normalizeKey('  Papel   HIGIÉNICO. ')).toBe('papel higienico');
    expect(normalizeKey('Cúter')).toBe(normalizeKey('cuter'));
  });

  it('genera slugs estables', () => {
    expect(slugify('Papelería y oficina')).toBe('papeleria-y-oficina');
  });
});

describe('cifrado de credenciales', () => {
  it('cifra y descifra sin exponer el texto plano', () => {
    const payload = encrypt('secreto-super-largo-123');
    expect(payload).not.toContain('secreto');
    expect(decrypt(payload)).toBe('secreto-super-largo-123');
  });
});

describe('política de contraseñas', () => {
  it('rechaza contraseñas débiles', () => {
    expect(passwordProblems('corta', 'admin').length).toBeGreaterThan(0);
    expect(passwordProblems('AdminSegura#2026', 'admin')).toContain('no contener el nombre de usuario');
  });

  it('acepta contraseñas fuertes', () => {
    expect(passwordProblems('Gimnasio#Seguro2026', 'fanny')).toEqual([]);
  });
});

describe('mensaje de WhatsApp', () => {
  it('construye el texto con categorías, adicionales y total', () => {
    const text = buildMessage({
      folio: 'SOL-20261021-0001',
      requesterName: 'Ana López',
      branchName: 'Satélite',
      date: '21/10/2026',
      categories: [{ name: 'Higiene personal', materials: ['Papel higiénico'] }],
      customMaterials: ['Cinta canela'],
      totalMaterials: 2
    });
    expect(text).toContain('Folio: SOL-20261021-0001');
    expect(text).toContain('- Papel higiénico');
    expect(text).toContain('Material adicional:');
    expect(text).toContain('Total de materiales diferentes: 2.');
  });
});
