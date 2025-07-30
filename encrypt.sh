#!/bin/bash

# Papillon Code Encryption Script
# This script encrypts TypeScript, JavaScript and related source files to make them unreadable

echo "🔒 Starting Papillon code encryption..."

# Create backup directory if it doesn't exist
mkdir -p .encrypted_backup

# Function to encrypt a file
encrypt_file() {
    local file="$1"
    local encrypted_file="${file}.enc"
    
    # Simple encryption: base64 encode + XOR with key
    local key="PAPILLON_SECURITY_2024"
    
    # Create encrypted version
    openssl enc -aes-256-cbc -salt -in "$file" -out "$encrypted_file" -pass pass:"$key" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✓ Encrypted: $file -> $encrypted_file"
        # Remove original file
        rm "$file"
        return 0
    else
        # Fallback to base64 if openssl fails
        base64 < "$file" | tr 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' 'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijkl' > "$encrypted_file"
        echo "✓ Encrypted (fallback): $file -> $encrypted_file"
        rm "$file"
        return 0
    fi
}

# Find and encrypt all TypeScript, JavaScript, and TSX files
find . -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v .git | grep -v .encrypted_backup | while read file; do
    if [ -f "$file" ]; then
        encrypt_file "$file"
    fi
done

# Encrypt specific config files
config_files=("app.config.ts" "babel.config.js" "metro.config.js" "react-native.config.js" "eslint.config.js")
for config_file in "${config_files[@]}"; do
    if [ -f "$config_file" ]; then
        encrypt_file "$config_file"
    fi
done

echo ""
echo "🔐 Encryption complete!"
echo "📁 All source files have been encrypted with .enc extension"
echo "🔑 Use decrypt.sh to restore original files for development"
echo ""
echo "⚠️  WARNING: Keep decrypt.sh and the encryption key secure!"
echo "   Original files have been removed - only encrypted versions remain"

# Create a marker file to indicate encryption status
echo "ENCRYPTED_$(date +%Y%m%d_%H%M%S)" > .encryption_status