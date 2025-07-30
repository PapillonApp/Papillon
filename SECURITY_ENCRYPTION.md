# Papillon Code Security

This repository has been secured using encryption to prevent unauthorized AI scraping and code analysis.

## 🔒 Security Status

All TypeScript, JavaScript, and configuration files have been encrypted using AES-256-CBC encryption with a project-specific key. The source code is now unreadable without the decryption key.

## 🔑 Decryption for Development

To decrypt the code for development purposes:

```bash
./decrypt.sh
```

This will restore all source files to their original state, allowing you to:
- Build the application with `npm run build`
- Start development server with `npm start`
- Run tests with `npm test`
- Use your IDE normally

## 🔐 Re-encryption for Security

After making changes, encrypt the code again:

```bash
./encrypt.sh
```

This will:
- Encrypt all TypeScript, JavaScript, and config files
- Replace them with `.enc` versions
- Remove the original readable files
- Make the code unreadable to AI scrapers and unauthorized access

## ⚠️ Important Notes

1. **Keep Scripts Secure**: The `encrypt.sh` and `decrypt.sh` scripts contain the encryption logic. Keep them secure.
2. **Development Workflow**: Always decrypt before development, encrypt after committing changes.
3. **Backup**: The encryption process removes original files. Ensure your changes are committed before encrypting.
4. **Team Coordination**: All team members need access to these scripts for development.

## 🛡️ Security Benefits

- **AI Scraping Protection**: Encrypted files are unreadable to AI crawlers and scrapers
- **Source Code Protection**: Code structure and logic are obfuscated
- **Reversible**: Easy to decrypt for legitimate development work
- **Automated**: Simple scripts handle the encryption/decryption process

## 📁 Affected Files

The encryption process affects:
- All `.ts` and `.tsx` files (TypeScript/React components)
- All `.js` and `.jsx` files (JavaScript files)
- Configuration files (`app.config.ts`, `babel.config.js`, etc.)

Documentation, assets, and build configuration remain unencrypted for normal operation.