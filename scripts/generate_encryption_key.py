#!/usr/bin/env python3
"""
Generate encryption keys for roster data
IMPORTANT: Run this once and store the key securely!
"""

from cryptography.fernet import Fernet
import os

def generate_key():
    """Generate a new Fernet encryption key"""
    key = Fernet.generate_key()
    return key.decode()

def save_key_to_env(key):
    """Save key to .env file"""
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')

    # Check if .env exists
    if os.path.exists(env_path):
        print("⚠️  .env file already exists")
        response = input("Do you want to update the ROSTER_ENCRYPTION_KEY? (y/n): ")
        if response.lower() != 'y':
            return False

    # Read existing .env or create new
    lines = []
    key_updated = False

    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                if line.startswith('ROSTER_ENCRYPTION_KEY='):
                    lines.append(f'ROSTER_ENCRYPTION_KEY={key}\n')
                    key_updated = True
                else:
                    lines.append(line)

    # Add key if not updated
    if not key_updated:
        lines.append(f'\n# Generated encryption key (DO NOT COMMIT!)\n')
        lines.append(f'ROSTER_ENCRYPTION_KEY={key}\n')

    # Write back
    with open(env_path, 'w') as f:
        f.writelines(lines)

    return True

def main():
    print("🔐 Fraternity Base - Encryption Key Generator")
    print("=" * 50)

    # Generate key
    key = generate_key()

    print("\n✅ Generated new encryption key:")
    print(f"\n{key}\n")

    print("⚠️  IMPORTANT SECURITY NOTES:")
    print("1. Store this key securely (AWS KMS, environment variable, or secrets manager)")
    print("2. NEVER commit this key to version control")
    print("3. Back up this key - losing it means losing access to all encrypted data")
    print("4. Use different keys for development, staging, and production")

    # Offer to save to .env
    print("\n" + "=" * 50)
    save_to_env = input("\nSave to .env file? (y/n): ")

    if save_to_env.lower() == 'y':
        if save_key_to_env(key):
            print("✅ Key saved to .env file")
            print("⚠️  Remember to add .env to .gitignore!")
        else:
            print("❌ Key not saved")

    print("\n📋 To use this key manually, add to your .env file:")
    print(f"ROSTER_ENCRYPTION_KEY={key}")

    print("\n🔐 For production, consider using AWS KMS:")
    print("1. Create KMS key in AWS Console")
    print("2. Use boto3 to encrypt/decrypt instead of local key")
    print("3. Grant your application IAM role access to the KMS key")

if __name__ == "__main__":
    main()