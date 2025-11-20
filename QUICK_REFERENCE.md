# 🎯 Supabase Connection - Quick Reference Card

## ⚡ Correct Connection String

```
postgresql://postgres.hbsdjlaogfdcjlghjuct:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres?sslmode=require
```

## 🔑 Connection Parameters

```
Host:     aws-0-us-east-1.pooler.supabase.com  ← NOTE: aws-0, not aws-1!
Port:     5432                                  ← Supabase pooler port
Database: postgres
User:     postgres.hbsdjlaogfdcjlghjuct
Password: (your-password)
SSL Mode: require                               ← MANDATORY for Supabase
```

## 🚀 Quick Setup

### Windows

```powershell
.\setup_supabase_connection.ps1
```

### Linux/Mac

```bash
./setup_supabase_connection.sh
```

## 🧪 Test Connection

```bash
python utilities/test_supabase_connection.py
```

## 📌 Environment Variables

```bash
DB_HOST=aws-0-us-east-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.hbsdjlaogfdcjlghjuct
DB_PASSWORD=your-password
DB_SSLMODE=require
```

## ✅ Checklist

- [ ] Host is aws-**0**-us-east-1 (not aws-1)
- [ ] Port is 5432 (not 6543)
- [ ] SSL mode is "require"
- [ ] Username includes project ID
- [ ] Password has no extra spaces
- [ ] Test script passes

## 🔥 Common Mistakes

❌ `aws-1-us-east-1` → ✅ `aws-0-us-east-1`  
❌ Port `6543` → ✅ Port `5432`  
❌ No SSL → ✅ `sslmode=require`  
❌ User `postgres` → ✅ `postgres.hbsdjlaogfdcjlghjuct`

## 📚 Full Documentation

- `README_SUPABASE_CONNECTION.md` - Complete overview
- `SUPABASE_CONNECTION_GUIDE.md` - Detailed guide
- `SUPABASE_CONNECTION_FIXED.md` - What was fixed

---

**Status**: ✅ All components configured and tested  
**Security**: ✅ SSL encrypted, no hardcoded passwords  
**Ready**: ✅ Development and production ready
