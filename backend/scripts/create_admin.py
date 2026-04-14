import boto3
import hashlib
import os

def create_admin():
    print("=== Configuración de Cuenta de Administrador ===")
    username = input("Ingresa el nombre de usuario (ej: admin): ")
    password = input("Ingresa la contraseña: ")
    
    if not username or not password:
        print("Error: Usuario y contraseña son obligatorios.")
        return

    # Generar un hash seguro con scrypt (nativo de python hashlib) y un salt aleatorio
    print("Generando hash de seguridad...")
    salt = os.urandom(16)
    key = hashlib.scrypt(password.encode('utf-8'), salt=salt, n=16384, r=8, p=1, maxmem=33554432, dklen=32)
    stored_hash = f"{salt.hex()}:{key.hex()}"

    print(f"Conectando a AWS DynamoDB (Tabla: hzcode-admin)...")
    try:
        dynamodb = boto3.resource('dynamodb')
        table = dynamodb.Table('hzcode-admin')
        
        table.put_item(
            Item={
                'username': username,
                'password_hash': stored_hash
            }
        )
        print(f"\n¡Éxito! El administrador '{username}' ha sido inyectado de forma segura en la base de datos.")
        print("El hash no puede ser revertido en caso de que alguien obtenga acceso a la tabla DynamoDB.")
    except Exception as e:
        print(f"\nError al guardar en DynamoDB. Asegúrate de que AWS CLI está configurado y tienes permisos: {e}")

if __name__ == '__main__':
    create_admin()
