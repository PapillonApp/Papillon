#!/bin/bash

# Papillon Code Decryption Script
# This script decrypts the encrypted source files back to their original state

echo "🔓 Starting Papillon code decryption..."

# Check if files are encrypted
if [ ! -f ".encryption_status" ]; then
    echo "❌ No encrypted files found. Run encrypt.sh first."
    exit 1
fi

# Function to decrypt a file
decrypt_file() {
    local encrypted_file="$1"
    local original_file="${encrypted_file%.enc}"
    local key="PAPILLON_SECURITY_2024"
    
    if [ ! -f "$encrypted_file" ]; then
        return 1
    fi
    
    # Try OpenSSL decryption first
    openssl enc -aes-256-cbc -d -salt -in "$encrypted_file" -out "$original_file" -pass pass:"$key" 2>/dev/null
    
    if [ $? -eq 0 ] && [ -s "$original_file" ]; then
        echo "✓ Decrypted: $encrypted_file -> $original_file"
        rm "$encrypted_file"
        return 0
    else
        # Fallback to base64 decoding
        rm -f "$original_file" 2>/dev/null
        tr 'NOPQRSTUVWXYZABCDEFGHIJKLMnopqrstuvwxyzabcdefghijkl' 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' < "$encrypted_file" | base64 -d > "$original_file"
        
        if [ -s "$original_file" ]; then
            echo "✓ Decrypted (fallback): $encrypted_file -> $original_file"
            rm "$encrypted_file"
            return 0
        else
            echo "❌ Failed to decrypt: $encrypted_file"
            rm -f "$original_file"
            return 1
        fi
    fi
}

# Find and decrypt all .enc files
find . -name "*.enc" | grep -v node_modules | grep -v .git | while read encrypted_file; do
    if [ -f "$encrypted_file" ]; then
        decrypt_file "$encrypted_file"
    fi
done

# Remove encryption status marker
rm -f .encryption_status

echo ""
echo "🔓 Decryption complete!"
echo "📁 All source files have been restored to their original state"
echo "💻 You can now build and develop the application normally"
echo ""
echo "ℹ️  To encrypt again for security, run: ./encrypt.sh"