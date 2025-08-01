#!/bin/bash

# Papillon Complete Code Decryption Script
# This script decrypts the single encrypted archive back to original source files

echo "🔓 Starting Papillon code decryption..."

# Check if encrypted bundle exists
if [ ! -f "papillon_encrypted.dat" ]; then
    echo "❌ No encrypted bundle found. Run encrypt_all.sh first."
    exit 1
fi

if [ ! -f ".encryption_bundle_status" ]; then
    echo "❌ No encryption status found. Bundle may be corrupted."
    exit 1
fi

# Create temporary directory for decryption
TEMP_DIR="/tmp/papillon_decrypt_$$"
mkdir -p "$TEMP_DIR"

# Define encryption key
ENCRYPTION_KEY="PAPILLON_SECURITY_BUNDLE_2024"

echo "🔓 Decrypting source archive..."

# Decrypt the archive
openssl enc -aes-256-cbc -d -salt -in "papillon_encrypted.dat" -out "$TEMP_DIR/papillon_source.tar.gz" -pass pass:"$ENCRYPTION_KEY"

if [ $? -eq 0 ] && [ -s "$TEMP_DIR/papillon_source.tar.gz" ]; then
    echo "✅ Archive decrypted successfully!"
    
    # Extract the archive
    echo "📦 Extracting source files..."
    tar -xzf "$TEMP_DIR/papillon_source.tar.gz"
    
    if [ $? -eq 0 ]; then
        echo "✅ Source files extracted successfully!"
        
        # Count restored files
        RESTORED_COUNT=$(find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" \) ! -path "./node_modules/*" ! -path "./.git/*" | wc -l)
        
        # Remove encryption artifacts
        rm -f "papillon_encrypted.dat"
        rm -f ".encryption_bundle_status"
        
        echo ""
        echo "🔓 Decryption complete!"
        echo "📁 Restored $RESTORED_COUNT source files"
        echo "💻 You can now build and develop the application normally"
        echo ""
        echo "ℹ️  To encrypt again for security, run: ./encrypt_all.sh"
        
    else
        echo "❌ Failed to extract archive!"
        exit 1
    fi
    
else
    echo "❌ Failed to decrypt archive!"
    exit 1
fi

# Cleanup
rm -rf "$TEMP_DIR"