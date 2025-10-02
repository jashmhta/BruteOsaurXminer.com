import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Load .env like the server does
ROOT_DIR = Path(__file__).resolve().parent.parent if Path(__file__).resolve().parent.name == "backend" else Path(__file__).resolve().parent
load_dotenv(ROOT_DIR / ".env" if (ROOT_DIR / ".env").exists() else ".env")

async def find_and_remove_duplicates():
    mongo_url = os.environ["MONGO_URL"]
    db_name = os.environ["DB_NAME"]
    
    print(f'Connecting to: {db_name}')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print('\n=== Finding duplicates in wallet_validations_zero ===')
    
    # Find duplicates
    pipeline = [
        {'$group': {
            '_id': {'secret': '$secret', 'chain': '$chain'}, 
            'count': {'$sum': 1}, 
            'docs': {'$push': {'id': '$id', 'user_id': '$user_id', 'created_at': '$created_at'}}
        }},
        {'$match': {'count': {'$gt': 1}}},
        {'$sort': {'count': -1}}
    ]
    
    duplicates = await db.wallet_validations_zero.aggregate(pipeline).to_list(None)
    
    if not duplicates:
        print('No duplicates found in wallet_validations_zero')
    else:
        print(f'Found {len(duplicates)} duplicate secret/chain combinations in wallet_validations_zero')
        
        for dup in duplicates:
            secret = dup['_id']['secret']
            chain = dup['_id']['chain']
            count = dup['count']
            docs = dup['docs']
            
            print(f'\nDuplicate: chain={chain}, count={count}')
            print(f'  Secret (first 30 chars): {secret[:30]}...')
            
            # Sort by created_at to keep the oldest one
            docs_sorted = sorted(docs, key=lambda x: x['created_at'])
            keep_doc = docs_sorted[0]
            remove_docs = docs_sorted[1:]
            
            print(f'  Keeping: id={keep_doc["id"]}, user_id={keep_doc["user_id"]}, created_at={keep_doc["created_at"]}')
            
            for doc in remove_docs:
                print(f'  Removing: id={doc["id"]}, user_id={doc["user_id"]}, created_at={doc["created_at"]}')
                result = await db.wallet_validations_zero.delete_one({'id': doc['id']})
                print(f'    Deleted: {result.deleted_count} document(s)')
    
    # Check wallet_validations too
    print('\n=== Finding duplicates in wallet_validations ===')
    duplicates = await db.wallet_validations.aggregate(pipeline).to_list(None)
    
    if not duplicates:
        print('No duplicates found in wallet_validations')
    else:
        print(f'Found {len(duplicates)} duplicate secret/chain combinations in wallet_validations')
        
        for dup in duplicates:
            secret = dup['_id']['secret']
            chain = dup['_id']['chain']
            count = dup['count']
            docs = dup['docs']
            
            print(f'\nDuplicate: chain={chain}, count={count}')
            print(f'  Secret (first 30 chars): {secret[:30]}...')
            
            docs_sorted = sorted(docs, key=lambda x: x['created_at'])
            keep_doc = docs_sorted[0]
            remove_docs = docs_sorted[1:]
            
            print(f'  Keeping: id={keep_doc["id"]}, user_id={keep_doc["user_id"]}, created_at={keep_doc["created_at"]}')
            
            for doc in remove_docs:
                print(f'  Removing: id={doc["id"]}, user_id={doc["user_id"]}, created_at={doc["created_at"]}')
                result = await db.wallet_validations.delete_one({'id': doc['id']})
                print(f'    Deleted: {result.deleted_count} document(s)')
    
    client.close()
    print('\n=== Cleanup complete ===')

if __name__ == '__main__':
    asyncio.run(find_and_remove_duplicates())
