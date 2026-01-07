#!/usr/bin/env node
/**
 * LOTOLINK - Admin Hash Generator
 * 
 * Uso:
 *   node scripts/generate-admin-hash.js <código_o_password>
 * 
 * Ejemplos:
 *   node scripts/generate-admin-hash.js LOT20041227
 *   node scripts/generate-admin-hash.js MiPasswordSeguro123
 * 
 * El hash generado debe copiarse a .env.production
 */

const crypto = require('crypto');

const BCRYPT_ROUNDS = 12;

// Bcrypt hash generation function
async function generateBcryptHash(plainText, rounds) {
  try {
    const bcrypt = require('bcrypt');
    return await bcrypt.hash(plainText, rounds);
  } catch (error) {
    console.log('\n⚠️  NOTA: Este script requiere bcrypt instalado.');
    console.log('   Ejecuta: npm install bcrypt --save\n');
    console.log('❌ bcrypt no está disponible. Instalando...\n');
    throw new Error('Por favor instala bcrypt primero: npm install bcrypt');
  }
}

async function generateHash(plainText) {
  console.log('\n🔐 LOTOLINK - Generador de Hash Seguro\n');
  console.log('='.repeat(60));
  
  if (!plainText) {
    console.log('\n⚠️  Uso: node scripts/generate-admin-hash.js <texto>\n');
    console.log('Ejemplos:');
    console.log('  node scripts/generate-admin-hash.js LOT20041227');
    console.log('  node scripts/generate-admin-hash.js MiPasswordAdmin\n');
    process.exit(1);
  }
  
  console.log(`\n📝 Texto a hashear: ${plainText.substring(0, 3)}${'*'.repeat(plainText.length - 3)}`);
  console.log(`🔢 Rounds de bcrypt: ${BCRYPT_ROUNDS}`);
  
  try {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash(plainText, BCRYPT_ROUNDS);
    
    console.log('\n✅ Hash generado exitosamente:\n');
    console.log('─'.repeat(60));
    console.log(hash);
    console.log('─'.repeat(60));
    
    console.log('\n📋 Copia este hash a tu archivo .env.production');
    console.log('\n⚠️  IMPORTANTE:');
    console.log('   - NUNCA compartas el texto original');
    console.log('   - NUNCA commitees el hash al repositorio');
    console.log('   - Guarda el texto original en un lugar seguro\n');
    
    // Verificar que el hash funciona
    const isValid = await bcrypt.compare(plainText, hash);
    console.log(`🧪 Verificación: ${isValid ? '✅ Hash válido' : '❌ Error en hash'}\n`);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\n💡 Solución: npm install bcrypt\n');
    process.exit(1);
  }
}

async function generateJWTSecret() {
  console.log('\n🔑 Generando JWT Secret (64 bytes):\n');
  const secret = crypto.randomBytes(64).toString('hex');
  console.log('─'.repeat(60));
  console.log(secret);
  console.log('─'.repeat(60));
  console.log('\n📋 Usa esto para JWT_SECRET en .env.production\n');
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === '--jwt' || args[0] === '-j') {
    await generateJWTSecret();
  } else if (args[0] === '--all' || args[0] === '-a') {
    console.log('\n🚀 Generando TODOS los secretos necesarios...\n');
    
    try {
      const bcrypt = require('bcrypt');
      
      // JWT Secrets
      console.log('1️⃣ JWT_SECRET:');
      console.log(crypto.randomBytes(64).toString('hex'));
      
      console.log('\n2️⃣ JWT_REFRESH_SECRET:');
      console.log(crypto.randomBytes(64).toString('hex'));
      
      console.log('\n3️⃣ SESSION_SECRET:');
      console.log(crypto.randomBytes(32).toString('hex'));
      
      // Admin hashes - note: these are example codes, replace with your actual codes
      console.log('\n4️⃣ Hash de ejemplo para código admin:');
      console.log('   Genera tu propio hash con: node scripts/generate-admin-hash.js <TU_CODIGO>');
      console.log(await bcrypt.hash('CODIGO_EJEMPLO_CAMBIAR', BCRYPT_ROUNDS));
      
      console.log('\n5️⃣ Hash de ejemplo para código admin secundario:');
      console.log('   Genera tu propio hash con: node scripts/generate-admin-hash.js <TU_CODIGO>');
      console.log(await bcrypt.hash('CODIGO_EJEMPLO_2_CAMBIAR', BCRYPT_ROUNDS));
      
      console.log('\n✅ Todos los secretos generados. Cópialos a .env.production');
      console.log('\n⚠️  IMPORTANTE: Los hashes de ejemplo DEBEN ser reemplazados con tus códigos reales\n');
    } catch (error) {
      console.error('\n❌ Error:', error.message);
      console.log('\n💡 Solución: npm install bcrypt\n');
      process.exit(1);
    }
  } else {
    await generateHash(args[0]);
  }
}

main().catch(console.error);
