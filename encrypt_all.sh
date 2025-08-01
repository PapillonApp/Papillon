#!/bin/bash

# Papillon Complete Code Encryption Script
# Encrypts ALL source files into a single encrypted archive

echo "🔐 Starting complete Papillon code encryption..."

# Create temporary directory for bundling
TEMP_DIR="/tmp/papillon_bundle_$$"
mkdir -p "$TEMP_DIR"

# Define encryption key
ENCRYPTION_KEY="PAPILLON_SECURITY_BUNDLE_2024"

echo "📦 Bundling all source files..."

# Create list of files to encrypt
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" \) \
    ! -path "./node_modules/*" \
    ! -path "./.git/*" \
    ! -path "./android/app/build/*" \
    ! -path "./ios/build/*" \
    ! -name "package-lock.json" > "$TEMP_DIR/file_list.txt"

echo "📁 Found $(wc -l < "$TEMP_DIR/file_list.txt") files to encrypt"

# Create archive with all source files
echo "🗜️  Creating source archive..."
tar -czf "$TEMP_DIR/papillon_source.tar.gz" -T "$TEMP_DIR/file_list.txt"

# Encrypt the archive
echo "🔒 Encrypting source archive..."
openssl enc -aes-256-cbc -salt -in "$TEMP_DIR/papillon_source.tar.gz" -out "papillon_encrypted.dat" -pass pass:"$ENCRYPTION_KEY"

if [ $? -eq 0 ]; then
    echo "✅ Archive encrypted successfully!"
    
    # Remove original source files
    echo "🗑️  Removing original source files..."
    while IFS= read -r file; do
        if [ -f "$file" ]; then
            rm "$file"
            echo "   Removed: $file"
        fi
    done < "$TEMP_DIR/file_list.txt"
    
    # Create encryption status marker
    echo "$(date): All source files encrypted into papillon_encrypted.dat" > .encryption_bundle_status
    
    echo ""
    echo "🔐 Complete encryption successful!"
    echo "📦 All source files have been encrypted into: papillon_encrypted.dat"
    echo "🗑️  Original source files have been removed"
    echo "💾 Total encrypted: $(wc -l < "$TEMP_DIR/file_list.txt") files"
    echo ""
    echo "ℹ️  To decrypt for development, run: ./decrypt.sh"
    
else
    echo "❌ Encryption failed!"
    exit 1
fi

# Cleanup
rm -rf "$TEMP_DIR"