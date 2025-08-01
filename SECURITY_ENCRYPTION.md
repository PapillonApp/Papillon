# Papillon Code Security

This repository has been secured using advanced encryption to prevent unauthorized AI scraping and code analysis.

## 🔒 Security Status

**ALL source files have been encrypted into a single secure bundle**. The entire codebase (444 files) has been compressed and encrypted using AES-256-CBC encryption. The source code is now completely unreadable without the decryption key.

## 🔑 Decryption for Development

To decrypt the code for development purposes:

```bash
./decrypt.sh
```

This will:
- Decrypt the entire source bundle
- Extract all 444 source files to their original locations
- Allow normal development workflow

You can then:
- Build the application with `npm run build`
- Start development server with `npm start`
- Run tests with `npm test`
- Use your IDE normally

## 🔐 Re-encryption for Security

After making changes, encrypt the code again:

```bash
./encrypt_all.sh
```

This will:
- Bundle all source files into a single archive
- Encrypt the entire archive with AES-256-CBC
- Remove ALL original readable files
- Create `papillon_encrypted.dat` containing the encrypted codebase

## ⚠️ Important Notes

1. **Single Bundle Encryption**: Unlike individual file encryption, this creates ONE encrypted file containing the entire codebase
2. **Complete Code Protection**: ALL TypeScript, JavaScript, and JSON files are bundled and encrypted
3. **Development Workflow**: Always decrypt before development, encrypt after committing changes
4. **Team Coordination**: All team members need access to these scripts for development
5. **Backup Safety**: The encryption process removes ALL source files. Ensure changes are committed first

## 🛡️ Security Benefits

- **Maximum AI Scraping Protection**: Single encrypted bundle is impossible for AI to parse
- **Complete Source Code Obfuscation**: No readable code structure or logic visible
- **Reversible**: Easy to decrypt for legitimate development work
- **Automated**: Simple scripts handle the complete encryption/decryption process
- **Bundle Integrity**: Single file easier to manage and secure

## 📁 Encrypted Content

The `papillon_encrypted.dat` bundle contains:
- **444 source files** including:
  - All `.ts` and `.tsx` files (TypeScript/React components)
  - All `.js` and `.jsx` files (JavaScript files)
  - All `.json` configuration and asset files
  - iOS and Android configuration files

## 🔐 Current Status

✅ **FULLY ENCRYPTED** - All source code is now unreadable  
📦 **Single Bundle** - 444 files compressed into `papillon_encrypted.dat`  
🛡️ **AI-Proof** - Completely protected from automated scraping  
🔑 **Reversible** - Use `./decrypt.sh` to restore for development